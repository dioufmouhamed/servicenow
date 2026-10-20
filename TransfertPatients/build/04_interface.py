#!/usr/bin/env python3
"""Étape 4 : formulaires, listes, listes associées, barre d'étapes et menu de l'application."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "tools"))
import sn

APP = "f17d5cef93fb8310668230018bba10a9"
P = "x_2218203_ptrans"
VIEW = "Default view"
ACTIVITY = "444ea5c6bf310100e628555b3f0739d6"  # formatter OOTB "Activities (filtered)"

T = lambda s: f"{P}_{s}"

# section ("" = principale) -> éléments ; "|" = début 2e colonne, "-" = fin des colonnes
FORMS = {
    T("specialite"): {"": ["nom", "code", "|", "active", "-", "description"],
                      "Valeurs proposées dans le formulaire de demande": ["niveau_soins_defaut", "|", "mode_transport_defaut",
                                                                          "-", "equipements_defaut"]},
    T("etablissement"): {
        "": ["nom", "type_etablissement", "code_etablissement", "location", "|",
             "accepte_transferts", "active", "capacite_totale", "lits_disponibles", "-"],
        "Coordination": ["coordinateur", "groupe_coordination", "|", "telephone_regulation", "-"],
    },
    T("service"): {"": ["nom", "etablissement", "specialite", "|", "lits_totaux", "lits_disponibles",
                        "responsable", "active", "-"]},
    T("demande"): {
        "": ["@process", "number", "etablissement_origine", "service_origine", "specialite_requise", "urgence_transfert", "|",
             "state", "opened_by", "telephone_contact", "opened_at", "date_souhaitee", "date_limite_reponse", "-",
             "short_description", "description", "@activity", "work_notes"],
        "Patient et besoins": ["patient_reference", "patient_age", "patient_sexe", "|",
                               "niveau_soins", "mode_transport", "mobilite", "-", "equipements_requis"],
        "Destination et transport": ["etablissement_destination", "service_destination", "reponse_retenue", "|",
                                     "work_order", "vehicule", "nb_eligibles", "nb_acceptations", "-",
                                     "demande_precedente", "|", "republication", "-"],
        "Délais": ["date_publication", "date_premiere_acceptation", "date_limite_reponse", "|",
                   "date_retenue", "date_limite_arrivee", "date_arrivee", "-"],
    },
    T("relance"): {"": ["number", "demande", "etablissement", "statut", "|", "service_propose", "demande_par",
                        "date_relance", "-", "commentaire"]},
    T("reservation"): {"": ["number", "asset", "type_reservation", "statut", "|", "demande", "etablissement",
                            "date_debut", "date_fin", "-", "motif_liberation"]},
    T("regle_equipement"): {"": ["modele", "|", "quantite_minimum", "active", "-"]},
    T("reponse"): {"": ["number", "demande", "etablissement", "decision", "|", "service_propose",
                        "heure_arrivee_possible", "distance_km", "duree_route_min", "date_reponse", "repondu_par", "-",
                        "motif_refus", "commentaire"]},
}

LISTS = {
    T("specialite"): ["nom", "code", "active"],
    T("etablissement"): ["nom", "type_etablissement", "location", "capacite_totale", "lits_disponibles",
                         "accepte_transferts", "groupe_coordination"],
    T("service"): ["etablissement", "nom", "specialite", "lits_totaux", "lits_disponibles", "active"],
    T("demande"): ["number", "state", "urgence_transfert", "etablissement_origine", "specialite_requise",
                   "niveau_soins", "nb_eligibles", "nb_acceptations", "etablissement_destination", "work_order", "opened_at"],
    T("relance"): ["number", "demande", "etablissement", "service_propose", "statut", "date_relance"],
    T("reservation"): ["number", "asset", "asset.model", "type_reservation", "demande", "etablissement", "statut",
                       "date_debut", "date_fin"],
    T("regle_equipement"): ["modele", "quantite_minimum", "active"],
    T("reponse"): ["number", "demande", "demande.urgence_transfert", "demande.specialite_requise", "etablissement",
                   "decision", "service_propose", "distance_km", "duree_route_min", "date_reponse"],
}

RELATED = {
    T("demande"): [f"{T('reponse')}.demande", "task_sla.task", f"{T('reservation')}.demande", f"{T('relance')}.demande"],
    T("etablissement"): [f"{T('service')}.etablissement", f"{T('reponse')}.etablissement", f"{T('reservation')}.etablissement"],
    T("specialite"): [f"{T('service')}.specialite"],
}

# Barre d'étapes (process flow) de la demande
PROCESS_FLOW = [("Brouillon", "state=1"), ("Publiée", "state=10"), ("Destination retenue", "state=20"),
                ("Transport planifié", "state=30"), ("En transit", "state=40"), ("Arrivé", "state=3")]

R_ADMIN, R_REG, R_COORD, R_DEM = f"{P}.admin", f"{P}.regulateur", f"{P}.coordinateur", f"{P}.demandeur"
ALL = ",".join([R_ADMIN, R_REG, R_COORD, R_DEM])
MES_ETABS = f"javascript:new {P}.TransfertUtils().mesEtablissements()"

# titre, type de lien, table, filtre, rôles, ordre, séparateur
MODULES = [
    ("Régulation", "SEPARATOR", "", "", f"{R_ADMIN},{R_REG}", 100),
    ("Nouvelle demande", "NEW", T("demande"), "", f"{R_ADMIN},{R_REG}", 110),
    ("Demandes en cours", "LIST", T("demande"), "active=true^ORDERBYDESCopened_at", f"{R_ADMIN},{R_REG}", 120),
    ("Demandes publiées", "LIST", T("demande"), "state=10^ORDERBYurgence_transfert", f"{R_ADMIN},{R_REG}", 130),
    ("Réponses reçues à traiter", "LIST", T("reponse"), "decision=acceptee^demande.state=10^ORDERBYdemande^ORDERBYdistance_km", f"{R_ADMIN},{R_REG}", 140),
    ("Toutes les demandes", "LIST", T("demande"), "ORDERBYDESCopened_at", f"{R_ADMIN},{R_REG}", 150),
    ("Mes demandes", "LIST", T("demande"), "opened_byDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORDERBYDESCopened_at",
     f"{R_ADMIN},{R_DEM},{R_COORD}", 180),
    ("Mon établissement", "SEPARATOR", "", "", f"{R_ADMIN},{R_COORD}", 200),
    ("Demandes reçues à traiter", "LIST", T("reponse"),
     f"decision=en_attente^demande.state=10^etablissementIN{MES_ETABS}^ORDERBYdemande.urgence_transfert", f"{R_ADMIN},{R_COORD}", 210),
    ("Mes réponses", "LIST", T("reponse"), f"etablissementIN{MES_ETABS}^ORDERBYDESCdate_reponse", f"{R_ADMIN},{R_COORD}", 220),
    ("Capacité de mes services", "LIST", T("service"), f"etablissementIN{MES_ETABS}^ORDERBYnom", f"{R_ADMIN},{R_COORD}", 230),
    ("Transport (FSM)", "SEPARATOR", "", "", f"{R_ADMIN},{R_REG}", 300),
    ("Ordres de transport", "LIST", "wm_order", "short_descriptionSTARTSWITHTransfert TRF^ORDERBYDESCopened_at", f"{R_ADMIN},{R_REG}", 310),
    ("Véhicules sanitaires", "LIST", "alm_asset", "model.short_descriptionLIKEVéhicule sanitaire^ORDERBYlocation^ORDERBYasset_tag", f"{R_ADMIN},{R_REG}", 320),
    ("Réservations en cours", "LIST", T("reservation"), "statut=active^ORDERBYDESCdate_debut", f"{R_ADMIN},{R_REG}", 330),
    ("Toutes les réservations", "LIST", T("reservation"), "ORDERBYDESCdate_debut", f"{R_ADMIN},{R_REG}", 340),
    ("Référentiel", "SEPARATOR", "", "", ALL, 400),
    ("Établissements", "LIST", T("etablissement"), "ORDERBYnom", ALL, 410),
    ("Services", "LIST", T("service"), "ORDERBYetablissement", ALL, 420),
    ("Spécialités", "LIST", T("specialite"), "ORDERBYnom", ALL, 430),
    ("Équipements médicaux", "LIST", "alm_asset", "model.short_descriptionLIKEtransfert patients^ORDERBYlocation", ALL, 440),
    ("Règles d'équipement", "LIST", T("regle_equipement"), "ORDERBYmodele", f"{R_ADMIN},{R_REG}", 450),
]


def scoped(b):
    b["sys_scope"] = APP
    return b


def build_form(table, sections):
    for i, (caption, elements) in enumerate(sections.items()):
        sec = sn.upsert("sys_ui_section", f"name={table}^view={VIEW}^caption={caption}",
                        scoped({"name": table, "view": VIEW, "caption": caption, "title": "true" if caption else "false",
                                "header": "false"}))["sys_id"]
        for old in sn.get("sys_ui_element", f"sys_ui_section={sec}", "sys_id", 200):
            sn.delete("sys_ui_element", old["sys_id"])
        for pos, el in enumerate(elements):
            body = scoped({"sys_ui_section": sec, "position": str(pos)})
            if el == "|":
                body.update({"element": ".split", "type": ".split"})
            elif el == "-":
                body.update({"element": ".end_split", "type": ".end_split"})
            elif el == "@activity":
                body.update({"element": "activity.xml", "type": "formatter", "sys_ui_formatter": ACTIVITY})
            elif el == "@process":
                fmt = sn.get("sys_ui_formatter", f"table={table}^formatter=process_flow.xml", "sys_id", 1)[0]["sys_id"]
                body.update({"element": "process_flow.xml", "type": "formatter", "sys_ui_formatter": fmt})
            else:
                body["element"] = el
            sn.post("sys_ui_element", body)
    form = sn.upsert("sys_ui_form", f"name={table}^view={VIEW}", scoped({"name": table, "view": VIEW}))["sys_id"]
    secs = sn.get("sys_ui_section", f"name={table}^view={VIEW}", "sys_id,caption", 20)
    order = list(sections.keys())
    for s in secs:
        if s["caption"] in order:
            sn.upsert("sys_ui_form_section", f"sys_ui_form={form}^sys_ui_section={s['sys_id']}",
                      scoped({"sys_ui_form": form, "sys_ui_section": s["sys_id"], "position": str(order.index(s["caption"]))}))


def build_list(table, cols):
    lst = sn.upsert("sys_ui_list", f"name={table}^view={VIEW}^parentISEMPTY^relationshipISEMPTY",
                    scoped({"name": table, "view": VIEW}))["sys_id"]
    for old in sn.get("sys_ui_list_element", f"list_id={lst}", "sys_id", 200):
        sn.delete("sys_ui_list_element", old["sys_id"])
    for pos, c in enumerate(cols):
        sn.post("sys_ui_list_element", scoped({"list_id": lst, "element": c, "position": str(pos)}))


def build_related(table, rels):
    rl = sn.upsert("sys_ui_related_list", f"name={table}^view={VIEW}", scoped({"name": table, "view": VIEW}))["sys_id"]
    for old in sn.get("sys_ui_related_list_entry", f"list_id={rl}", "sys_id", 50):
        sn.delete("sys_ui_related_list_entry", old["sys_id"])
    for pos, r in enumerate(rels):
        sn.post("sys_ui_related_list_entry", scoped({"list_id": rl, "related_list": r, "position": str(pos)}))


def main():
    dem = T("demande")
    sn.upsert("sys_ui_formatter", f"table={dem}^formatter=process_flow.xml",
              scoped({"name": "Process Flow", "table": dem, "formatter": "process_flow.xml", "type": "formatter", "active": "true"}))
    for i, (label, cond) in enumerate(PROCESS_FLOW):
        sn.upsert("sys_process_flow", f"table={dem}^label={label}",
                  scoped({"table": dem, "label": label, "condition": cond, "order": str((i + 1) * 100), "active": "true"}))
    print("barre d'étapes ok")

    for table, sections in FORMS.items():
        build_form(table, sections)
        print("formulaire", table)
    for table, cols in LISTS.items():
        build_list(table, cols)
    print("listes ok")
    for table, rels in RELATED.items():
        build_related(table, rels)
    print("listes associées ok")

    menu = sn.upsert("sys_app_application", f"title=Transfert Patients^sys_scope={APP}", scoped({
        "title": "Transfert Patients", "active": "true", "order": "100", "roles": ALL,
        "hint": "Transferts de patients entre établissements", "category": ""}))["sys_id"]
    for title, link, table, filt, roles, order in MODULES:
        body = scoped({"title": title, "application": menu, "link_type": link, "roles": roles,
                       "order": str(order), "active": "true"})
        if table:
            body["name"] = table
        if filt:
            body["filter"] = filt
        sn.upsert("sys_app_module", f"application={menu}^title={title}", body)
    print("menu ok :", len(MODULES), "modules")


if __name__ == "__main__":
    main()
