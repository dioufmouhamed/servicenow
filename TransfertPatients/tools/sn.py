#!/usr/bin/env python3
"""Mini client REST ServiceNow (lit ../../.env.servicenow).

Usage CLI :
  sn.py get    <table> [query] [fields]
  sn.py post   <table> '<json>'
  sn.py patch  <table> <sys_id> '<json>'
  sn.py delete <table> <sys_id>
"""
import base64, json, os, sys, time, urllib.parse, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def _env():
    env = {}
    with open(os.path.join(ROOT, ".env.servicenow")) as f:
        for line in f:
            if "=" in line and not line.startswith("#"):
                k, v = line.strip().split("=", 1)
                env[k] = v
    return env["SN_INSTANCE"].rstrip("/"), env["SN_USER"], env["SN_PASS"]


INSTANCE, USER, PASS = _env()
AUTH = "Basic " + base64.b64encode(f"{USER}:{PASS}".encode()).decode()


def call(method, path, body=None, params=None):
    url = INSTANCE + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method, headers={
        "Authorization": AUTH, "Accept": "application/json", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            txt = r.read().decode()
            return json.loads(txt) if txt else {}
    except urllib.error.HTTPError as e:
        raise SystemExit(f"HTTP {e.code} {method} {path}: {e.read().decode()[:800]}")


def get(table, query="", fields="", limit=100):
    p = {"sysparm_query": query, "sysparm_limit": limit}
    if fields:
        p["sysparm_fields"] = fields
    return call("GET", f"/api/now/table/{table}", params=p)["result"]


def post(table, body):
    return call("POST", f"/api/now/table/{table}", body)["result"]


def patch(table, sys_id, body):
    return call("PATCH", f"/api/now/table/{table}/{sys_id}", body)["result"]


def delete(table, sys_id):
    return call("DELETE", f"/api/now/table/{table}/{sys_id}")


def upsert(table, query, body):
    """Crée l'enregistrement s'il n'existe pas (query), sinon le met à jour."""
    found = get(table, query, "sys_id", 1)
    if found:
        return patch(table, found[0]["sys_id"], body)
    return post(table, body)


def ensure(table, query, body):
    """Crée l'enregistrement s'il n'existe pas, sans jamais le modifier (tables d'association)."""
    found = get(table, query, "sys_id", 1)
    return found[0] if found else post(table, body)


def run_script(body_js, scope="f17d5cef93fb8310668230018bba10a9"):
    """Exécute un script serveur (corps d'une fonction, `return` = résultat JSON) via une Scripted REST API
    temporaire, créée puis supprimée. Sert aux écritures que l'API Table refuse (ex. choix dynamiques)."""
    api = post("sys_ws_definition", {"name": "tmp_run_script", "service_id": "tmp_run_script", "active": "true", "sys_scope": scope})
    op = post("sys_ws_operation", {"web_service_definition": api["sys_id"], "name": "run", "http_method": "GET",
                                   "relative_path": "/run", "active": "true", "sys_scope": scope,
                                   "requires_authentication": "true", "requires_acl_authorization": "false",
                                   "operation_script": "(function process(request, response) { " + body_js + " })(request, response);"})
    try:
        base = get("sys_ws_definition", f"sys_id={api['sys_id']}", "base_uri", 1)[0]["base_uri"]
        # L'API vient d'être créée : l'instance peut mettre quelques secondes à l'enregistrer (HTTP 400)
        for essai in range(6):
            try:
                return call("GET", base + "/run")["result"]
            except SystemExit as e:
                if "HTTP 400" not in str(e) or essai == 5:
                    raise
                time.sleep(2)
    finally:
        delete("sys_ws_operation", op["sys_id"])
        delete("sys_ws_definition", api["sys_id"])


if __name__ == "__main__":
    cmd, args = sys.argv[1], sys.argv[2:]
    if cmd == "get":
        out = get(args[0], args[1] if len(args) > 1 else "", args[2] if len(args) > 2 else "")
    elif cmd == "post":
        out = post(args[0], json.loads(args[1]))
    elif cmd == "patch":
        out = patch(args[0], args[1], json.loads(args[2]))
    elif cmd == "delete":
        out = delete(args[0], args[1])
    else:
        raise SystemExit(__doc__)
    print(json.dumps(out, indent=2, ensure_ascii=False))
