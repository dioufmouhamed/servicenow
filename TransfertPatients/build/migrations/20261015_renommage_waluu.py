#!/usr/bin/env python3
"""Migration du 15/10/2026 : le portail « Transferts patients » devient « Waluu » (portail uniquement ;
l'application, le menu, les e-mails et les scripts gardent le nom « Transfert Patients »).

Renomme EN PLACE (par sys_id) les enregistrements dont le nom est affiché, pour que les scripts de build
(qui utilisent désormais les nouveaux noms comme clés) les retrouvent sans créer de doublon.
Ne touche pas aux identifiants techniques (ids de widgets et de pages, adresse /transferts).
L'inclusion de styles locale prend automatiquement le nom de sa feuille sp_css.
Idempotent : relançable sans effet.
"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "tools"))
import sn

APP = "f17d5cef93fb8310668230018bba10a9"

# table, requête de l'ancien enregistrement, champ, nouvelle valeur
RENOMMAGES = [
    ("sp_portal", "url_suffix=transferts", "title", "Waluu"),
    ("sp_theme", "name=Transferts patients", "name", "Waluu"),
    ("sp_css", "name=Transferts patients", "name", "Waluu"),
    ("sp_css_include", "name=Transferts patients - police Lato", "name", "Waluu - police Lato"),
    ("sp_header_footer", "id=tp-header", "name", "Waluu · En-tête"),
]


def main():
    for table, q, champ, valeur in RENOMMAGES:
        recs = sn.get(table, q, "sys_id," + champ, 5)
        if len(recs) > 1:
            raise SystemExit(f"{table} : {len(recs)} enregistrements pour « {q} », renommage annulé pour éviter un doublon")
        if not recs:
            print(f"déjà fait ou absent : {table} ({q})")
            continue
        sn.patch(table, recs[0]["sys_id"], {champ: valeur})
        print(f"renommé : {table} → {valeur}")

    # Pages et widgets : préfixe « Transferts · » → « Waluu · »
    for table, champ, q in [("sp_page", "title", "idSTARTSWITHtp_"), ("sp_widget", "name", "idSTARTSWITHtp-")]:
        for r in sn.get(table, q + f"^{champ}STARTSWITHTransferts · ", "sys_id," + champ, 50):
            sn.patch(table, r["sys_id"], {champ: "Waluu · " + r[champ][len("Transferts · "):]})
            print(f"renommé : {table} {r[champ]}")


if __name__ == "__main__":
    main()
