#!/usr/bin/env python3
"""Étape 1 : rôles, tables, champs et listes de choix de l'app Transfert Patients."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "tools"))
import sn

APP = "f17d5cef93fb8310668230018bba10a9"
P = "x_2218203_ptrans"

ROLES = {
    "admin": "Administre le référentiel (établissements, services, spécialités)",
    "regulateur": "Crée et publie les demandes de transfert, retient la destination",
    "coordinateur": "Gère la capacité de son établissement et répond aux demandes publiées",
    "demandeur": "Agent d'établissement : crée des demandes de transfert pour son établissement",
    "ambulancier": "Ambulancier : page « Mes missions » du portail (ses tâches de transport FSM)",
}

NIVEAUX = [("standard", "Hospitalisation conventionnelle"), ("continus", "Soins continus"),
           ("intensifs", "Soins intensifs"), ("reanimation", "Réanimation")]
MODES = [("ambulance", "Ambulance"), ("smur", "SMUR / soins avancés"), ("vsl", "Véhicule sanitaire léger"),
         ("helico", "Héliporté")]

# (nom court, libellé, super_class, numérotation)
TABLES = [
    ("specialite", "Spécialité", None, None),
    ("etablissement", "Établissement", None, None),
    ("service", "Service d'établissement", None, None),
    ("demande", "Demande de transfert", "task", "TRF"),
    ("reponse", "Réponse d'établissement", None, "REP"),
    ("relance", "Relance d'établissement", None, "RLC"),
    ("reservation", "Réservation d'asset", None, "RES"),
    ("regle_equipement", "Règle de disponibilité d'équipement", None, None),
]

# champ: (libellé, type, options)
FIELDS = {
    "specialite": [
        ("nom", "Nom", "string", {"max_length": 80, "display": True, "mandatory": True}),
        ("code", "Code", "string", {"max_length": 20}),
        ("description", "Description", "string", {"max_length": 1000}),
        ("active", "Active", "boolean", {"default_value": "true"}),
        # Valeurs proposées dans le formulaire de demande quand cette spécialité est choisie
        ("niveau_soins_defaut", "Niveau de soins par défaut", "choice", {"choices": NIVEAUX}),
        ("mode_transport_defaut", "Mode de transport par défaut", "choice", {"choices": MODES}),
        ("equipements_defaut", "Équipements requis par défaut", "glide_list", {"reference": "cmdb_model"}),
    ],
    "etablissement": [
        ("nom", "Nom", "string", {"max_length": 100, "display": True, "mandatory": True}),
        ("type_etablissement", "Type", "choice", {"choices": [
            ("chu", "Centre hospitalier universitaire"), ("ch", "Centre hospitalier"),
            ("clinique", "Clinique"), ("readaptation", "Centre de réadaptation"), ("ehpad", "EHPAD / soins de longue durée")]}),
        ("location", "Localisation", "reference", {"reference": "cmn_location", "mandatory": True}),
        ("code_etablissement", "Code établissement", "string", {"max_length": 20}),
        ("telephone_regulation", "Téléphone régulation", "string", {"max_length": 40}),
        ("coordinateur", "Coordinateur", "reference", {"reference": "sys_user"}),
        ("groupe_coordination", "Groupe de coordination", "reference", {"reference": "sys_user_group"}),
        ("capacite_totale", "Capacité totale (lits)", "integer", {"read_only": True, "default_value": "0"}),
        ("lits_disponibles", "Lits disponibles", "integer", {"read_only": True, "default_value": "0"}),
        ("accepte_transferts", "Accepte les transferts", "boolean", {"default_value": "true"}),
        ("active", "Actif", "boolean", {"default_value": "true"}),
    ],
    "service": [
        ("nom", "Nom", "string", {"max_length": 100, "display": True, "mandatory": True}),
        ("etablissement", "Établissement", "reference", {"reference": f"{P}_etablissement", "mandatory": True}),
        ("specialite", "Spécialité", "reference", {"reference": f"{P}_specialite", "mandatory": True}),
        ("lits_totaux", "Lits totaux", "integer", {"default_value": "0"}),
        ("lits_disponibles", "Lits disponibles", "integer", {"default_value": "0"}),
        ("responsable", "Responsable", "reference", {"reference": "sys_user"}),
        ("active", "Actif", "boolean", {"default_value": "true"}),
    ],
    "demande": [
        ("patient_reference", "Référence patient (pseudonymisée)", "string", {"max_length": 40, "mandatory": True}),
        ("patient_age", "Âge du patient", "integer", {}),
        ("patient_sexe", "Sexe", "choice", {"choices": [("f", "Femme"), ("m", "Homme"), ("x", "Non précisé")]}),
        ("etablissement_origine", "Établissement d'origine", "reference", {"reference": f"{P}_etablissement", "mandatory": True}),
        ("service_origine", "Service d'origine", "reference", {"reference": f"{P}_service"}),
        ("specialite_requise", "Spécialité requise", "reference", {"reference": f"{P}_specialite", "mandatory": True}),
        ("niveau_soins", "Niveau de soins", "choice", {"choices": NIVEAUX}),
        ("urgence_transfert", "Urgence du transfert", "choice", {"choices": [
            ("1", "Vitale (moins d’1 h)"), ("2", "Urgente (moins de 4 h)"), ("3", "Programmée")], "default_value": "3"}),
        ("mode_transport", "Mode de transport", "choice", {"choices": MODES, "default_value": "ambulance"}),
        ("mobilite", "Mobilité du patient", "choice", {"choices": [
            ("valide", "Valide"), ("fauteuil", "Fauteuil"), ("allonge", "Allongé")], "default_value": "allonge"}),
        ("equipements_requis", "Équipements requis", "glide_list", {"reference": "cmdb_model"}),
        ("date_souhaitee", "Date de transfert souhaitée", "glide_date_time", {}),
        ("telephone_contact", "Téléphone de contact", "string", {"max_length": 40}),
        ("date_limite_reponse", "Date limite de réponse", "glide_date_time", {}),
        ("etablissement_destination", "Établissement de destination", "reference", {"reference": f"{P}_etablissement", "read_only": True}),
        ("service_destination", "Service de destination", "reference", {"reference": f"{P}_service", "read_only": True}),
        ("reponse_retenue", "Réponse retenue", "reference", {"reference": f"{P}_reponse", "read_only": True}),
        ("work_order", "Ordre de transport (FSM)", "reference", {"reference": "wm_order", "read_only": True}),
        ("nb_eligibles", "Établissements sollicités", "integer", {"read_only": True, "default_value": "0"}),
        ("nb_acceptations", "Acceptations", "integer", {"read_only": True, "default_value": "0"}),
        ("demande_precedente", "Republication de", "reference", {"reference": f"{P}_demande", "read_only": True}),
        ("republication", "Republiée en", "reference", {"reference": f"{P}_demande", "read_only": True}),
        ("vehicule", "Véhicule affecté", "reference", {"reference": "alm_asset", "read_only": True}),
        # Délais (SLA « Transfert - réponse » et « Transfert - prise en charge ») : horodatages posés par TransfertUtils
        ("date_publication", "Publiée le", "glide_date_time", {"read_only": True}),
        ("date_premiere_acceptation", "Première acceptation le", "glide_date_time", {"read_only": True}),
        ("date_retenue", "Destination retenue le", "glide_date_time", {"read_only": True}),
        ("date_limite_arrivee", "Arrivée exigée avant", "glide_date_time", {"read_only": True}),
        ("date_arrivee", "Arrivé le", "glide_date_time", {"read_only": True}),
        # Itinéraire routier calculé à la retenue (OSRM, données OpenStreetMap) : tracé encodé (polyline), distance, durée
        ("itineraire", "Itinéraire (tracé encodé)", "string", {"max_length": 4000, "read_only": True}),
        ("distance_route_km", "Distance par la route (km)", "decimal", {"read_only": True}),
        ("duree_route_min", "Durée de route avec circulation (min)", "integer", {"read_only": True}),
    ],
    "reponse": [
        ("number", "Numéro", "string", {"max_length": 40, "display": True, "read_only": True,
                                         "default_value": "javascript:getNextObjNumberPadded();"}),
        ("demande", "Demande", "reference", {"reference": f"{P}_demande", "mandatory": True, "read_only": True}),
        ("etablissement", "Établissement", "reference", {"reference": f"{P}_etablissement", "mandatory": True, "read_only": True}),
        ("decision", "Décision", "choice", {"choices": [
            ("en_attente", "En attente"), ("acceptee", "Acceptée"), ("refusee", "Refusée"),
            ("retenue", "Retenue"), ("non_retenue", "Non retenue"), ("expiree", "Expirée")], "default_value": "en_attente"}),
        ("service_propose", "Service proposé", "reference", {"reference": f"{P}_service"}),
        ("motif_refus", "Motif de refus", "choice", {"choices": [
            ("pas_de_lit", "Pas de lit disponible"), ("specialite", "Spécialité indisponible"),
            ("equipement", "Équipement indisponible"), ("personnel", "Personnel insuffisant"), ("autre", "Autre")]}),
        ("commentaire", "Commentaire", "string", {"max_length": 1000}),
        ("heure_arrivee_possible", "Arrivée possible à partir de", "glide_date_time", {}),
        ("date_reponse", "Date de réponse", "glide_date_time", {"read_only": True}),
        ("repondu_par", "Répondu par", "reference", {"reference": "sys_user", "read_only": True}),
        # Calculés à la publication depuis les coordonnées GPS des localisations (origine → établissement sollicité)
        ("distance_km", "Distance depuis l'origine (km)", "decimal", {"read_only": True}),
        ("duree_route_min", "Durée de route estimée (min)", "integer", {"read_only": True}),
    ],
}

FIELDS["relance"] = [
    ("number", "Numéro", "string", {"max_length": 40, "display": True, "read_only": True,
                                     "default_value": "javascript:getNextObjNumberPadded();"}),
    ("demande", "Demande expirée", "reference", {"reference": f"{P}_demande", "mandatory": True, "read_only": True}),
    ("etablissement", "Établissement", "reference", {"reference": f"{P}_etablissement", "mandatory": True, "read_only": True}),
    ("service_propose", "Service disponible", "reference", {"reference": f"{P}_service"}),
    ("commentaire", "Commentaire", "string", {"max_length": 1000}),
    ("statut", "Statut", "choice", {"choices": [("envoyee", "Envoyée"), ("traitee", "Traitée")], "default_value": "envoyee"}),
    ("demande_par", "Demandée par", "reference", {"reference": "sys_user", "read_only": True}),
    ("date_relance", "Date de la relance", "glide_date_time", {"read_only": True}),
]

# Réservation d'un asset (équipement médical à destination ou véhicule sanitaire) pour une demande
FIELDS["reservation"] = [
    ("number", "Numéro", "string", {"max_length": 40, "display": True, "read_only": True,
                                     "default_value": "javascript:getNextObjNumberPadded();"}),
    ("asset", "Asset", "reference", {"reference": "alm_asset", "mandatory": True, "read_only": True}),
    ("type_reservation", "Type", "choice", {"choices": [("equipement", "Équipement médical"), ("vehicule", "Véhicule sanitaire")],
                                            "read_only": True}),
    ("demande", "Demande", "reference", {"reference": f"{P}_demande", "mandatory": True, "read_only": True}),
    ("etablissement", "Établissement", "reference", {"reference": f"{P}_etablissement", "read_only": True}),
    ("statut", "Statut", "choice", {"choices": [("active", "Active"), ("liberee", "Libérée")], "default_value": "active"}),
    ("date_debut", "Réservé le", "glide_date_time", {"read_only": True}),
    ("date_fin", "Libéré le", "glide_date_time", {"read_only": True}),
    ("motif_liberation", "Motif de libération", "string", {"max_length": 200, "read_only": True}),
]

# Nombre minimum d'unités DISPONIBLES (non réservées) d'un modèle pour qu'un établissement soit sollicité (défaut : 1)
FIELDS["regle_equipement"] = [
    ("modele", "Modèle d'équipement", "reference", {"reference": "cmdb_model", "mandatory": True, "display": True}),
    ("quantite_minimum", "Unités disponibles minimum", "integer", {"default_value": "1", "mandatory": True}),
    ("active", "Active", "boolean", {"default_value": "true"}),
]

# États de la demande (champ state hérité de task)
DEMANDE_STATES = [("1", "Brouillon", 10), ("10", "Publiée", 20), ("20", "Destination retenue", 30),
                  ("30", "Transport planifié", 40), ("40", "En transit", 50), ("3", "Arrivé - clôturée", 60),
                  ("4", "Expirée", 70), ("7", "Annulée", 80)]


def scoped(body):
    body["sys_scope"] = APP
    return body


def main():
    for r, desc in ROLES.items():
        sn.upsert("sys_user_role", f"name={P}.{r}", scoped({"name": f"{P}.{r}", "description": desc}))
    print("rôles ok")

    task_id = sn.get("sys_db_object", "name=task", "sys_id", 1)[0]["sys_id"]
    for short, label, sup, prefix in TABLES:
        name = f"{P}_{short}"
        body = scoped({"name": name, "label": label})
        if sup:
            body["super_class"] = task_id
        if not sn.get("sys_db_object", f"name={name}", "sys_id", 1):
            sn.post("sys_db_object", body)
        else:
            sn.upsert("sys_db_object", f"name={name}", {"label": label})
        if prefix:
            sn.upsert("sys_number", f"category={name}",
                      scoped({"category": name, "prefix": prefix, "number": "1000", "maximum_digits": "7"}))
        print("table", name)

    for short, fields in FIELDS.items():
        table = f"{P}_{short}"
        for el, label, typ, o in fields:
            body = scoped({"name": table, "element": el, "column_label": label,
                           "internal_type": "string" if typ == "choice" else typ,
                           "active": "true"})
            if typ == "choice":
                body["choice"] = "1"
                body["max_length"] = "40"
            for k in ("max_length", "reference", "default_value"):
                if k in o:
                    body[k] = str(o[k])
            for k in ("display", "mandatory", "read_only"):
                body[k] = "true" if o.get(k) else "false"
            sn.upsert("sys_dictionary", f"name={table}^element={el}", body)
            for i, (val, lab) in enumerate(o.get("choices", [])):
                sn.upsert("sys_choice", f"name={table}^element={el}^value={val}^language=fr",
                          scoped({"name": table, "element": el, "value": val, "label": lab,
                                  "sequence": str((i + 1) * 10), "language": "fr"}))
                sn.upsert("sys_choice", f"name={table}^element={el}^value={val}^language=en",
                          scoped({"name": table, "element": el, "value": val, "label": lab,
                                  "sequence": str((i + 1) * 10), "language": "en"}))
        print("champs", table)

    dem = f"{P}_demande"
    for val, lab, seq in DEMANDE_STATES:
        for lang in ("fr", "en"):
            sn.upsert("sys_choice", f"name={dem}^element=state^value={val}^language={lang}",
                      scoped({"name": dem, "element": "state", "value": val, "label": lab,
                              "sequence": str(seq), "language": lang}))
    # défaut état = Brouillon
    sn.upsert("sys_dictionary_override", f"name={dem}^element=state",
              scoped({"name": dem, "element": "state", "base_table": "task",
                      "default_value_override": "true", "default_value": "1"}))
    print("états ok")


if __name__ == "__main__":
    main()
