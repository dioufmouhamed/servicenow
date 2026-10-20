#!/usr/bin/env python3
"""Étape 8 : Service Portal « Waluu » (/transferts) — thème, header, widgets, pages, portail."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "tools"))
import sn

APP = "f17d5cef93fb8310668230018bba10a9"
P = "x_2218203_ptrans"
SRC = os.path.join(HERE, "..", "src", "portal")
ROLES = f"{P}.admin,{P}.regulateur,{P}.coordinateur,{P}.demandeur"

WIDGETS = {  # id: nom
    "tp-accueil-hero": "Waluu · Accueil (bandeau)",
    "tp-a-traiter": "Waluu · À traiter",
    "tp-mes-demandes": "Waluu · Mes demandes",
    "tp-capacite": "Waluu · Capacité",
    "tp-arrivees": "Waluu · Arrivées attendues",
    "tp-demande": "Waluu · Parcours d'une demande",
    "tp-liste": "Waluu · Liste des demandes",
    "tp-regulation": "Waluu · Tableau de régulation",
    "tp-carte": "Waluu · Carte des hôpitaux",
    "tp-missions": "Waluu · Mes missions (ambulancier)",
}

# Bibliothèque cartographique (dépendance de widget OOTB) : Leaflet, fonds OpenStreetMap
LEAFLET_JS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"
LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"

# page: (titre, conteneurs) ; conteneur = (largeur, classe, colonnes) ; colonne = (taille md, [widgets])
PAGES = {
    "tp_accueil": ("Waluu · Accueil", [
        ("container-fluid", "tp-c-hero", [(12, ["tp-accueil-hero"])]),
        ("container", "", [(8, ["tp-a-traiter", "tp-mes-demandes"]), (4, ["tp-capacite", "tp-arrivees"])]),
    ]),
    "tp_demande": ("Waluu · Demande", [("container", "", [(12, ["tp-demande"])])]),
    "tp_demandes": ("Waluu · Demandes", [("container", "", [(12, ["tp-liste"])])]),
    "tp_regulation": ("Waluu · Régulation", [("container-fluid", "tp-c-reg", [(12, ["tp-regulation"])])]),
    "tp_carte": ("Waluu · Carte", [("container", "", [(12, ["tp-carte"])])]),
    "tp_missions": ("Waluu · Mes missions", [("container", "", [(12, ["tp-missions"])])]),
}

# Pages ouvertes aussi aux ambulanciers : « Mes missions », et l'accueil (redirigé vers les missions par l'en-tête)
ROLES_AMBULANCIER = {"tp_missions", "tp_accueil"}


def src(*parts):
    with open(os.path.join(SRC, *parts), encoding="utf-8") as f:
        return f.read()


def scoped(b):
    b["sys_scope"] = APP
    return b


def widget_body(wid, name, table="sp_widget"):
    d = os.path.join("widgets", wid)
    return scoped({"id": wid, "name": name, "template": src(d, "template.html"), "css": src(d, "style.scss"),
                   "client_script": src(d, "client.js"), "script": src(d, "server.js"), "controller_as": "c",
                   "public": "false", "category": "custom"})


def vider_page(page_id):
    for cont in sn.get("sp_container", f"sp_page={page_id}", "sys_id", 50):
        for row in sn.get("sp_row", f"sp_container={cont['sys_id']}", "sys_id", 50):
            for col in sn.get("sp_column", f"sp_row={row['sys_id']}", "sys_id", 50):
                for inst in sn.get("sp_instance", f"sp_column={col['sys_id']}", "sys_id", 50):
                    sn.delete("sp_instance", inst["sys_id"])
                sn.delete("sp_column", col["sys_id"])
            sn.delete("sp_row", row["sys_id"])
        sn.delete("sp_container", cont["sys_id"])


def main():
    # Thème : feuille de style partagée + police Lato + header
    css = sn.upsert("sp_css", "name=Waluu", scoped({"name": "Waluu", "css": src("theme.scss")}))["sys_id"]
    # Le nom d'une inclusion locale est recopié depuis la feuille sp_css : la clé est donc la feuille, pas le nom
    inc_css = sn.upsert("sp_css_include", f"source=local^sp_css={css}", scoped({
        "source": "local", "sp_css": css}))["sys_id"]
    inc_font = sn.upsert("sp_css_include", "name=Waluu - police Lato", scoped({
        "name": "Waluu - police Lato", "source": "url",
        "url": "https://fonts.googleapis.com/css2?family=Lato:wght@400;700;900&display=swap"}))["sys_id"]
    header = sn.upsert("sp_header_footer", "id=tp-header", widget_body("tp-header", "Waluu · En-tête"))["sys_id"]
    theme = sn.upsert("sp_theme", "name=Waluu", scoped({
        "name": "Waluu", "header": header, "navbar_fixed": "false",
        "css_variables": "$brand-primary: #0B5D57;\n$brand-success: #1F5130;\n$brand-warning: #E39B2D;\n$brand-danger: #8E1F16;\n"
                         "$text-color: #1E2B2E;\n$body-bg: #F3F6F6;\n$font-family-sans-serif: Lato, \"Helvetica Neue\", Arial, sans-serif;\n"
                         "$border-radius-base: 10px;\n"}))["sys_id"]
    for i, inc in enumerate([inc_font, inc_css]):
        sn.ensure("m2m_sp_theme_css_include", f"sp_theme={theme}^sp_css_include={inc}",
                  scoped({"sp_theme": theme, "sp_css_include": inc, "order": str((i + 1) * 100)}))
    print("thème + header ok")

    wid = {}
    for w, name in WIDGETS.items():
        wid[w] = sn.upsert("sp_widget", f"id={w}", widget_body(w, name))["sys_id"]
    print("widgets :", len(wid))

    dep = sn.upsert("sp_dependency", "name=Leaflet 1.9.4", scoped({"name": "Leaflet 1.9.4", "page_load": "true"}))["sys_id"]
    js = sn.upsert("sp_js_include", f"url={LEAFLET_JS}", scoped({"display_name": "Leaflet 1.9.4", "source": "url", "url": LEAFLET_JS}))["sys_id"]
    css_l = sn.upsert("sp_css_include", f"url={LEAFLET_CSS}", scoped({"name": "Leaflet 1.9.4", "source": "url", "url": LEAFLET_CSS}))["sys_id"]
    sn.ensure("m2m_sp_dependency_js_include", f"sp_dependency={dep}^sp_js_include={js}", scoped({"sp_dependency": dep, "sp_js_include": js, "order": "100"}))
    sn.ensure("m2m_sp_dependency_css_include", f"sp_dependency={dep}^sp_css_include={css_l}", scoped({"sp_dependency": dep, "sp_css_include": css_l, "order": "100"}))
    for w in ("tp-carte", "tp-demande", "tp-missions"):
        sn.ensure("m2m_sp_widget_dependency", f"sp_widget={wid[w]}^sp_dependency={dep}", scoped({"sp_widget": wid[w], "sp_dependency": dep}))
    print("dépendance Leaflet ok")

    pages = {}
    for pid, (titre, conteneurs) in PAGES.items():
        roles = ROLES + (f",{P}.ambulancier" if pid in ROLES_AMBULANCIER else "")
        page = sn.upsert("sp_page", f"id={pid}", scoped({"id": pid, "title": titre, "public": "false", "roles": roles,
                                                       "css": ".tp-c-hero, .tp-c-reg { padding: 0; }"}))["sys_id"]
        pages[pid] = page
        vider_page(page)
        for ci, (largeur, classe, colonnes) in enumerate(conteneurs):
            cont = sn.post("sp_container", scoped({"sp_page": page, "order": str(ci), "width": largeur, "class_name": classe,
                                                   "name": f"{pid}-{ci}"}))["sys_id"]
            row = sn.post("sp_row", scoped({"sp_container": cont, "order": "0"}))["sys_id"]
            for co, (taille, widgets) in enumerate(colonnes):
                col = sn.post("sp_column", scoped({"sp_row": row, "order": str(co), "size": str(taille)}))["sys_id"]
                for wi, w in enumerate(widgets):
                    sn.post("sp_instance", scoped({"sp_column": col, "sp_widget": wid[w], "order": str(wi), "active": "true"}))
        print("page", pid)

    portal = sn.upsert("sp_portal", "url_suffix=transferts", scoped({
        "title": "Waluu", "url_suffix": "transferts", "homepage": pages["tp_accueil"], "theme": theme,
        "sc_catalog": "e0d08b13c3330100c8b837659bba8fb4", "hide_portal_name": "true"}))["sys_id"]
    print("portail /transferts ok", portal)


if __name__ == "__main__":
    main()
