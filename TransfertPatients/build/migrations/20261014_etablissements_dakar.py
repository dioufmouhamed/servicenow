#!/usr/bin/env python3
"""Migration ponctuelle (2026-10-14) : établissements et zones démo France -> hôpitaux de Dakar.
Renomme les enregistrements existants (références conservées), puis 03 et 06 complètent les données."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
import sn

P = "x_2218203_ptrans"
ETABS = {  # ancien code: (nouveau code, ancien nom, nouveau nom)
    "CHU-CONF": ("FANN", "CHU Confluence", "CHNU de Fann"),
    "CH-ALPES": ("HPD", "Centre hospitalier des Alpes", "Hôpital Principal de Dakar"),
    "CH-NFOREZ": ("HEAR", "Hôpital Nord-Forez", "Hôpital d'Enfants Albert Royer"),
    "CLIN-LAC": ("CLIN-MAD", "Clinique du Lac", "Clinique de la Madeleine"),
    "SSR-TILL": ("CHAN", "Centre de réadaptation Les Tilleuls", "Centre hospitalier Abass Ndao"),
    "CH-BRESSE": ("DALJ", "CH Bresse-Dombes", "Hôpital Dalal Jamm"),
}
ZONES = {"Rhône": ("Dakar Plateau-Médina", "rhone", "plateau"), "Alpes": ("Fann-Grand Yoff", "alpes", "fann"),
         "Loire-Ain": ("Pikine-Guédiawaye", "loireain", "banlieue")}
USERS = {"coord.confluence": ("coord.fann", "Fann"), "coord.alpes": ("coord.principal", "Hôpital Principal"),
         "coord.nordforez": ("coord.albertroyer", "Albert Royer")}


def rename(table, query, body):
    for r in sn.get(table, query, "sys_id", 10):
        sn.patch(table, r["sys_id"], body)


for old, (new, old_nom, nom) in ETABS.items():
    rename(f"{P}_etablissement", f"code_etablissement={old}", {"code_etablissement": new, "nom": nom})
    rename("cmn_location", f"name={old_nom}", {"name": nom})
    rename("sys_user_group", f"name=Coordination - {old_nom}", {"name": f"Coordination - {nom}",
                                                                "description": f"Coordinateurs des transferts — {nom}"})
    for a in sn.get("alm_asset", f"asset_tagSTARTSWITH{old}-", "sys_id", 50):
        sn.delete("alm_asset", a["sys_id"])
rename("cmn_location", "name=France - zones de transfert", {"name": "Région de Dakar - zones de transfert", "country": "Senegal"})
for old, (new, oc, nc) in ZONES.items():
    rename("cmn_location", f"name=Zone {old}", {"name": f"Zone {new}", "country": "Senegal"})
    rename("sys_user_group", f"name=Dispatch transferts - {old}", {"name": f"Dispatch transferts - {new}",
           "description": f"Dispatch FSM des transports de patients — zone {new}"})
    rename("sys_user_group", f"name=Équipages ambulance - {old}", {"name": f"Équipages ambulance - {new}",
           "description": f"Ambulanciers et équipages de transfert — zone {new}"})
    rename("sys_user", f"user_name=disp.{oc}", {"user_name": f"disp.{nc}", "last_name": new, "email": f"disp.{nc}@example.com"})
    for i in (1, 2):
        rename("sys_user", f"user_name=amb.{oc}{i}", {"user_name": f"amb.{nc}{i}", "last_name": f"{new} {i}",
                                                      "email": f"amb.{nc}{i}@example.com"})
for old, (new, ln) in USERS.items():
    rename("sys_user", f"user_name={old}", {"user_name": new, "last_name": ln, "email": f"{new}@example.com"})
print("migration terminée")
