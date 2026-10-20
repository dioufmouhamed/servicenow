#!/usr/bin/env python3
"""Étape 10 : délais de réponse et de prise en charge (définitions de SLA OOTB sur la demande).

Source de vérité des délais : la durée de chaque définition (modifiable par l'admin dans Service Level Management) ;
TransfertUtils.delaiMin() la lit pour la date limite de réponse, l'échéance d'arrivée et la fenêtre des tâches FSM.
Programmée : pas de SLA (réponse sous 24 h par défaut, pas de délai de prise en charge).
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "tools"))
import sn

APP = "f17d5cef93fb8310668230018bba10a9"
DEM = "x_2218203_ptrans_demande"

# nom, cible, urgence, durée (min), démarrage, arrêt, annulation
SLAS = [
    ("Transfert - réponse - vitale", "response", "1", 5,
     "state=10", "nb_acceptations>0^ORstate=4", "state=7"),
    ("Transfert - réponse - urgente", "response", "2", 15,
     "state=10", "nb_acceptations>0^ORstate=4", "state=7"),
    ("Transfert - prise en charge - vitale", "resolution", "1", 10,
     "stateIN20,30,40", "state=3", "state=7"),
    ("Transfert - prise en charge - urgente", "resolution", "2", 15,
     "stateIN20,30,40", "state=3", "state=7"),
]


def main():
    for nom, cible, urgence, minutes, debut, arret, annul in SLAS:
        sn.upsert("contract_sla", f"name={nom}", {
            "sys_scope": APP, "name": nom, "collection": DEM, "type": "SLA", "target": cible, "active": "true",
            "duration": f"1970-01-01 00:{minutes:02d}:00", "schedule_source": "no_schedule", "schedule": "",
            "timezone_source": "sla.timezone", "timezone": "GMT",
            "start_condition": f"urgence_transfert={urgence}^{debut}^EQ", "stop_condition": f"{arret}^EQ",
            "cancel_condition": f"{annul}^EQ", "when_to_cancel": "on_condition",
            "pause_condition": "", "when_to_resume": "on_condition", "retroactive": "false",
            "flow": "NULL", "workflow": ""})  # pas de flux SLA (le défaut OOTB notifie à 50/75/100 %)
        print("SLA", nom, minutes, "min")

    # Itinéraire routier à la retenue (option A) : service OSRM et coefficient de circulation appliqué à sa durée
    for nom, valeur, desc in [
        ("x_2218203_ptrans.itineraire.osrm_url", "https://router.project-osrm.org",
         "Service d'itinéraires OSRM (serveur public de démonstration ; en production, serveur hébergé)"),
        ("x_2218203_ptrans.itineraire.coefficient_circulation", "1.5",
         "Coefficient de circulation appliqué à la durée de conduite OSRM (durée sans trafic)")]:
        sn.upsert("sys_properties", f"name={nom}", {"sys_scope": APP, "name": nom, "value": valeur, "type": "string",
                                                    "description": desc})
        print("propriété", nom, "=", valeur)


if __name__ == "__main__":
    main()
