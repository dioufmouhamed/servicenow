#!/usr/bin/env python3
"""Étape 7 : Record Producer « Demande de transfert de patient » (Service Catalog + Service Portal)."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "tools"))
import sn

APP = "f17d5cef93fb8310668230018bba10a9"
P = "x_2218203_ptrans"
DEM = f"{P}_demande"
CATALOG = "e0d08b13c3330100c8b837659bba8fb4"  # Service Catalog
SRC = os.path.join(HERE, "..", "src", "record_producer")


def scoped(b):
    b["sys_scope"] = APP
    return b


def src(f):
    with open(os.path.join(SRC, f), encoding="utf-8") as fh:
        return fh.read()


# Types : 5 select box, 6 texte, 2 multiligne, 7 case à cocher, 8 référence, 10 date/heure,
#         21 list collector, 19 début de conteneur, 24 séparation, 20 fin de conteneur
CHOIX = lambda field: {"choice_table": DEM, "choice_field": field, "include_none": "true"}
VARIABLES = [
    # ordre, nom, libellé, type, obligatoire, mappé, options
    (100, "c_origine", "Origine et urgence", 19, False, False, {"layout": "2down", "display_title": "true"}),
    (110, "etablissement_origine", "Établissement d'origine", 8, True, True,
     {"reference": f"{P}_etablissement", "use_reference_qualifier": "simple",
      "reference_qual_condition": "active=true"}),
    (120, "service_origine", "Service d'origine", 8, False, True,
     {"reference": f"{P}_service", "use_reference_qualifier": "advanced",
      "reference_qual": "javascript:'active=true^etablissement=' + current.variables.etablissement_origine",
      "attributes": "ref_qual_elements=etablissement_origine",
      "help_text": "Sélectionnez d'abord l'établissement d'origine."}),
    (130, "s_origine", "", 24, False, False, {}),
    (140, "urgence_transfert", "Urgence du transfert", 5, True, True, CHOIX("urgence_transfert")),
    (150, "date_souhaitee", "Date de transfert souhaitée", 10, False, True,
     {"help_text": "Laisser vide pour « dès que possible »."}),
    (160, "telephone_contact", "Téléphone de contact", 6, True, True,
     {"help_text": "Numéro pour joindre le demandeur. Pré-rempli avec votre téléphone ou celui de la régulation."}),
    (190, "e_origine", "", 20, False, False, {}),

    (200, "c_patient", "Patient", 19, False, False, {"layout": "2down", "display_title": "true"}),
    (210, "patient_reference", "Référence patient (pseudonymisée)", 6, True, True,
     {"help_text": "Identifiant interne pseudonymisé. Ne saisissez ni nom ni numéro de sécurité sociale."}),
    (220, "patient_age", "Âge", 6, False, True, {}),
    (230, "s_patient", "", 24, False, False, {}),
    (240, "patient_sexe", "Sexe", 5, False, True, CHOIX("patient_sexe")),
    (250, "mobilite", "Mobilité du patient", 5, True, True, CHOIX("mobilite")),
    (290, "e_patient", "", 20, False, False, {}),

    (300, "c_besoin", "Besoin médical et transport", 19, False, False, {"layout": "2down", "display_title": "true"}),
    (310, "specialite_requise", "Spécialité requise", 8, True, True,
     {"reference": f"{P}_specialite", "use_reference_qualifier": "simple", "reference_qual_condition": "active=true"}),
    (320, "niveau_soins", "Niveau de soins", 5, True, True, CHOIX("niveau_soins")),
    (330, "s_besoin", "", 24, False, False, {}),
    (340, "mode_transport", "Mode de transport", 5, True, True, CHOIX("mode_transport")),
    (350, "equipements_requis", "Équipements requis à destination", 21, False, True,
     {"list_table": "cmdb_model", "use_reference_qualifier": "simple",
      "reference_qual_condition": "short_descriptionLIKEtransfert patients",
      "help_text": "Seuls les établissements disposant de tous ces équipements seront sollicités."}),
    (390, "e_besoin", "", 20, False, False, {}),

    (400, "description", "Motif du transfert et informations cliniques utiles", 2, True, True, {}),
    (500, "publier_immediatement", "Publier immédiatement aux établissements éligibles", 7, False, False,
     {"default_value": "true",
      "help_text": "Décochez pour enregistrer la demande en brouillon et la publier plus tard."}),
]


def main():
    cat = sn.upsert("sc_category", f"title=Transferts de patients^sc_catalog={CATALOG}", scoped({
        "title": "Transferts de patients", "sc_catalog": CATALOG, "active": "true",
        "description": "Demandes de transfert inter-établissements"}))["sys_id"]

    rp = sn.upsert("sc_cat_item_producer", f"name=Demande de transfert de patient^sys_scope={APP}", scoped({
        "name": "Demande de transfert de patient",
        "short_description": "Publier une demande de transfert vers les établissements disposant de la spécialité, "
                             "des lits et des équipements nécessaires.",
        "description": "<p>Décrivez le besoin du patient. La demande est publiée aux établissements <b>éligibles</b> "
                       "(spécialité, lit disponible, équipements requis) qui l'acceptent ou la refusent. "
                       "Vous retenez ensuite la destination et le transport est organisé via Field Service.</p>"
                       "<p><i>Utilisez uniquement une référence patient pseudonymisée.</i></p>",
        "table_name": DEM, "sc_catalogs": CATALOG, "category": cat, "active": "true",
        "script": src("script.js"), "post_insert_script": src("post_insert_script.js"),
        "can_cancel": "true", "no_quantity": "true", "no_cart": "true"}))["sys_id"]
    print("record producer", rp)

    for order, name, label, typ, mand, mapped, o in VARIABLES:
        body = scoped({"cat_item": rp, "name": name, "question_text": label, "type": str(typ),
                       "order": str(order), "mandatory": str(mand).lower(), "active": "true",
                       "map_to_field": str(mapped).lower()})
        if mapped:
            body["field"] = name
        body.update(o)
        sn.upsert("item_option_new", f"cat_item={rp}^name={name}", body)
    print("variables", len(VARIABLES))

    origine = sn.get("item_option_new", f"cat_item={rp}^name=etablissement_origine", "sys_id", 1)[0]["sys_id"]
    sn.upsert("catalog_script_client", f"cat_item={rp}^name=Vider le service si origine change", scoped({
        "name": "Vider le service si origine change", "cat_item": rp, "type": "onChange",
        "cat_variable": f"IO:{origine}", "ui_type": "10", "applies_catalog": "true", "active": "true",
        "script": src("client_onchange_origine.js")}))
    sn.upsert("catalog_script_client", f"cat_item={rp}^name=Pré-remplir selon le profil", scoped({
        "name": "Pré-remplir selon le profil", "cat_item": rp, "type": "onLoad",
        "ui_type": "10", "applies_catalog": "true", "active": "true",
        "script": src("client_onload_contexte.js")}))
    spe = sn.get("item_option_new", f"cat_item={rp}^name=specialite_requise", "sys_id", 1)[0]["sys_id"]
    sn.upsert("catalog_script_client", f"cat_item={rp}^name=Suggestions selon la spécialité", scoped({
        "name": "Suggestions selon la spécialité", "cat_item": rp, "type": "onChange",
        "cat_variable": f"IO:{spe}", "ui_type": "10", "applies_catalog": "true", "active": "true",
        "script": src("client_onchange_specialite.js")}))
    # cat_variable est une liste de choix dynamique que l'API Table refuse : écriture côté serveur
    print(sn.run_script(
        "var out = []; var c = new GlideRecord('catalog_script_client'); c.addQuery('cat_item', '" + rp + "'); "
        "c.addQuery('type', 'onChange'); c.query(); while (c.next()) { var v = c.name.indexOf('spécialité') > -1 ? "
        "'IO:" + spe + "' : 'IO:" + origine + "'; c.setValue('cat_variable', v); c.update(); "
        "out.push(c.getValue('name') + ' -> ' + c.getValue('cat_variable')); } return out;"))
    print("client scripts ok")

    # Disponibilité : régulateurs, agents d'établissement (demandeurs), coordinateurs, admins de l'app
    uc = sn.upsert("user_criteria", f"nameSTARTSWITHTransfert Patients - ^sys_scope={APP}", scoped({
        "name": "Transfert Patients - demandeurs", "active": "true",
        "role": ",".join(sn.get("sys_user_role", f"name={P}.{r}", "sys_id", 1)[0]["sys_id"]
                         for r in ("regulateur", "admin", "demandeur", "coordinateur"))}))["sys_id"]
    sn.upsert("sc_cat_item_user_criteria_mtom", f"sc_cat_item={rp}^user_criteria={uc}",
              scoped({"sc_cat_item": rp, "user_criteria": uc}))
    sn.upsert("sc_category_user_criteria_mtom", f"sc_category={cat}^user_criteria={uc}",
              scoped({"sc_category": cat, "user_criteria": uc}))
    print("disponibilité : régulateurs")

    # Lien depuis le menu de l'application
    menu = sn.get("sys_app_application", f"title=Transfert Patients^sys_scope={APP}", "sys_id", 1)[0]["sys_id"]
    sn.upsert("sys_app_module", f"application={menu}^title=Nouvelle demande (formulaire guidé)", scoped({
        "title": "Nouvelle demande (formulaire guidé)", "application": menu, "link_type": "DIRECT",
        "query": f"com.glideapp.servicecatalog_cat_item_view.do?v=1&sysparm_id={rp}",
        "roles": f"{P}.admin,{P}.regulateur,{P}.demandeur,{P}.coordinateur", "order": "105", "active": "true"}))
    print("module de menu ok")


if __name__ == "__main__":
    main()
