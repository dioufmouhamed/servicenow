#!/usr/bin/env python3
"""Étape 2 : Script Include, Business Rules, UI Actions, job planifié (scripts lus depuis src/)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "tools"))
import sn

APP = "f17d5cef93fb8310668230018bba10a9"
P = "x_2218203_ptrans"
SRC = os.path.join(HERE, "..", "src")


def src(path):
    with open(os.path.join(SRC, path), encoding="utf-8") as f:
        return f.read()


def scoped(body):
    body["sys_scope"] = APP
    return body


# nom, table, when, ordre, insert, update, delete, condition, fichier
BUSINESS_RULES = [
    ("Demande - validation", f"{P}_demande", "before", 100, True, True, False, "",
     "business_rules/demande_validation.js"),
    ("Demande - publication", f"{P}_demande", "before", 200, True, True, False,
     "current.state.changesTo(10)", "business_rules/demande_publication.js"),
    ("Demande - clôture des réponses", f"{P}_demande", "after", 100, False, True, False,
     "current.state.changesTo(7) || current.state.changesTo(4)", "business_rules/demande_annulation.js"),
    ("Demande - libération des réservations", f"{P}_demande", "after", 150, False, True, False,
     "current.state.changesTo(3) || current.state.changesTo(7) || current.state.changesTo(4)",
     "business_rules/demande_liberation.js"),
    ("Réponse - contrôle décision", f"{P}_reponse", "before", 100, False, True, False,
     "current.decision.changes()", "business_rules/reponse_decision.js"),
    ("Réponse - compteur acceptations", f"{P}_reponse", "after", 100, False, True, False,
     "current.decision.changes()", "business_rules/reponse_compteur.js"),
    ("Réponse - destination retenue", f"{P}_reponse", "after", 200, False, True, False,
     "current.decision.changesTo('retenue')", "business_rules/reponse_retenue.js"),
    ("Service - contrôle lits", f"{P}_service", "before", 100, True, True, False, "",
     "business_rules/service_validation.js"),
    ("Service - capacité établissement", f"{P}_service", "after", 100, True, True, True,
     "current.operation() == 'delete' || current.lits_totaux.changes() || current.lits_disponibles.changes() || current.active.changes() || current.etablissement.changes()",
     "business_rules/service_capacite.js"),
    ("Transfert patient - suivi ordre FSM", "wm_order", "after", 200, False, True, False,
     "current.state.changes()", "business_rules/wm_order_sync.js"),
]

U = f"new {P}.TransfertUtils()"
# nom, table, action_name, condition, fichier, ordre
UI_ACTIONS = [
    ("Publier", f"{P}_demande", "publier_demande",
     f"current.state == 1 && (gs.hasRole('{P}.regulateur') || current.opened_by == gs.getUserID())",
     "ui_actions/demande_publier.js", 100),
    ("Annuler la demande", f"{P}_demande", "annuler_demande",
     f"['1','10','20'].indexOf(current.getValue('state')) > -1 && (gs.hasRole('{P}.regulateur') || current.opened_by == gs.getUserID())",
     "ui_actions/demande_annuler.js", 900),
    ("Republier", f"{P}_demande", "republier_demande",
     f"current.state == 4 && current.republication.nil() && (gs.hasRole('{P}.regulateur') || current.opened_by == gs.getUserID())",
     "ui_actions/demande_republier.js", 150),
    ("Accepter", f"{P}_reponse", "accepter_reponse",
     f"current.decision == 'en_attente' && current.demande.state == 10 && ({U}.estCoordinateur(current.getValue('etablissement')) || gs.hasRole('{P}.admin'))",
     "ui_actions/reponse_accepter.js", 100),
    ("Refuser", f"{P}_reponse", "refuser_reponse",
     f"current.decision == 'en_attente' && current.demande.state == 10 && ({U}.estCoordinateur(current.getValue('etablissement')) || gs.hasRole('{P}.admin'))",
     "ui_actions/reponse_refuser.js", 200),
    ("Retenir cette destination", f"{P}_reponse", "retenir_reponse",
     f"current.decision == 'acceptee' && current.demande.state == 10 && gs.hasRole('{P}.regulateur')",
     "ui_actions/reponse_retenir.js", 300),
]


def main():
    sn.upsert("sys_script_include", f"name=TransfertUtils^sys_scope={APP}", scoped({
        "name": "TransfertUtils", "api_name": f"{P}.TransfertUtils", "active": "true",
        "access": "package_private", "client_callable": "false",
        "description": "Logique métier du transfert inter-établissements",
        "script": src("script_includes/TransfertUtils.js")}))
    sn.upsert("sys_script_include", f"name=TransfertAjax^sys_scope={APP}", scoped({
        "name": "TransfertAjax", "api_name": f"{P}.TransfertAjax", "active": "true",
        "access": "package_private", "client_callable": "true",
        "description": "GlideAjax du formulaire de demande (pré-remplissage)",
        "script": src("script_includes/TransfertAjax.js")}))
    sn.upsert("sys_script_include", f"name=TransfertPortail^sys_scope={APP}", scoped({
        "name": "TransfertPortail", "api_name": f"{P}.TransfertPortail", "active": "true",
        "access": "package_private", "client_callable": "false",
        "description": "Données et actions des widgets du portail Transferts",
        "script": src("script_includes/TransfertPortail.js")}))
    print("script include ok")

    for name, table, when, order, ins, upd, dele, cond, f in BUSINESS_RULES:
        sn.upsert("sys_script", f"name={name}^sys_scope={APP}", scoped({
            "name": name, "collection": table, "when": when, "order": str(order), "active": "true",
            "advanced": "true", "action_insert": str(ins).lower(), "action_update": str(upd).lower(),
            "action_delete": str(dele).lower(), "action_query": "false", "condition": cond, "script": src(f)}))
        print("BR", name)

    for name, table, an, cond, f, order in UI_ACTIONS:
        sn.upsert("sys_ui_action", f"action_name={an}^sys_scope={APP}", scoped({
            "name": name, "table": table, "action_name": an, "active": "true", "form_button": "true",
            "show_insert": "false", "show_update": "true", "condition": cond, "order": str(order),
            "script": src(f)}))
        print("UI action", name)

    sn.upsert("sysauto_script", f"name=Transfert patients - expiration des demandes^sys_scope={APP}", scoped({
        "name": "Transfert patients - expiration des demandes", "active": "true", "run_type": "periodically",
        "run_period": "1970-01-01 00:01:00", "script": src("scheduled_jobs/expiration_demandes.js")}))
    print("job ok")


if __name__ == "__main__":
    main()
