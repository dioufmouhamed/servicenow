#!/usr/bin/env python3
"""Étape 3 : données de démonstration (fictives) — spécialités, établissements, services, équipements, groupes, utilisateurs."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "tools"))
import sn

P = "x_2218203_ptrans"

SPECIALITES = [("CARDIO", "Cardiologie"), ("REA", "Réanimation"), ("NEURO", "Neurovasculaire (AVC)"),
               ("PED", "Pédiatrie"), ("NEONAT", "Néonatologie"), ("ORTHO", "Orthopédie / traumatologie"),
               ("BRUL", "Grands brûlés"), ("PSY", "Psychiatrie"), ("MED", "Médecine interne"),
               ("SSR", "Soins de suite et réadaptation")]

# Valeurs proposées dans le formulaire quand la spécialité est choisie : niveau, mode, équipements
SPE_DEFAUTS = {
    "CARDIO": ("continus", "ambulance", ["Moniteur multiparamétrique"]),
    "REA": ("reanimation", "smur", ["Respirateur de réanimation", "Moniteur multiparamétrique"]),
    "NEURO": ("intensifs", "smur", ["Scanner (TDM)", "Moniteur multiparamétrique"]),
    "PED": ("standard", "ambulance", []),
    "NEONAT": ("intensifs", "smur", ["Couveuse néonatale", "Moniteur multiparamétrique"]),
    "ORTHO": ("standard", "ambulance", []),
    "BRUL": ("intensifs", "smur", ["Moniteur multiparamétrique"]),
    "PSY": ("standard", "ambulance", []),
    "MED": ("standard", "ambulance", []),
    "SSR": ("standard", "vsl", []),
}

MODELES = ["Respirateur de réanimation", "Couveuse néonatale", "Scanner (TDM)", "IRM",
           "ECMO", "Moniteur multiparamétrique"]

# Unités disponibles minimum pour qu'un établissement soit sollicité (table regle_equipement ; 1 si absent)
REGLES = {"Respirateur de réanimation": 2, "Couveuse néonatale": 2, "Moniteur multiparamétrique": 2}

# Nombre d'unités par établissement et modèle (1 si non précisé) — FICTIF
QUANTITES = {
    "FANN": {"Respirateur de réanimation": 3, "Moniteur multiparamétrique": 4},
    "HPD": {"Respirateur de réanimation": 2, "Moniteur multiparamétrique": 3},
    "HEAR": {"Respirateur de réanimation": 2, "Couveuse néonatale": 3, "Moniteur multiparamétrique": 3},
    "HOGIP": {"Respirateur de réanimation": 2, "Couveuse néonatale": 2, "Moniteur multiparamétrique": 3},
    "CLIN-MAD": {"Couveuse néonatale": 1, "Moniteur multiparamétrique": 2},
    "CHAN": {"Moniteur multiparamétrique": 2},
    "DALJ": {"Respirateur de réanimation": 1, "Moniteur multiparamétrique": 2},
}

# nom, type, code, adresse, quartier/ville, téléphone (standard public), lat, lon, services [(code spé, total, dispo)], équipements
# Hôpitaux réels de Dakar ; capacités, services et équipements FICTIFS (démonstration).
ETABS = [
    ("CHNU de Fann", "chu", "FANN", "Avenue Cheikh Anta Diop", "Fann, Dakar", "+221 33 869 18 42", 14.6905, -17.4645,
     [("CARDIO", 40, 6), ("REA", 20, 2), ("NEURO", 25, 3), ("PSY", 30, 4), ("MED", 35, 5)],
     ["Respirateur de réanimation", "Scanner (TDM)", "IRM", "ECMO", "Moniteur multiparamétrique"]),
    ("Hôpital Principal de Dakar", "ch", "HPD", "1 avenue Nelson Mandela", "Plateau, Dakar", "+221 33 889 50 50", 14.6627, -17.4333,
     [("CARDIO", 25, 4), ("REA", 12, 0), ("ORTHO", 30, 7), ("MED", 40, 9), ("NEURO", 15, 2), ("BRUL", 10, 1)],
     ["Respirateur de réanimation", "Scanner (TDM)", "IRM", "Moniteur multiparamétrique"]),
    ("Hôpital d'Enfants Albert Royer", "ch", "HEAR", "Avenue Cheikh Anta Diop", "Fann - Point E, Dakar", "+221 33 859 47 47", 14.6918, -17.4628,
     [("PED", 60, 6), ("NEONAT", 15, 2), ("REA", 8, 1)],
     ["Respirateur de réanimation", "Couveuse néonatale", "Scanner (TDM)", "Moniteur multiparamétrique"]),
    ("Hôpital Général Idrissa Pouye", "ch", "HOGIP", "Route du Front de Terre", "Grand Yoff, Dakar", "+221 33 869 40 50", 14.7357, -17.4512,
     [("REA", 10, 3), ("NEONAT", 12, 2), ("MED", 35, 4), ("ORTHO", 20, 3)],
     ["Respirateur de réanimation", "Couveuse néonatale", "Scanner (TDM)", "Moniteur multiparamétrique"]),
    ("Clinique de la Madeleine", "clinique", "CLIN-MAD", "Avenue des Diambars", "Plateau, Dakar", "+221 33 889 94 70", 14.6680, -17.4380,
     [("ORTHO", 25, 6), ("CARDIO", 15, 2), ("NEONAT", 6, 1)],
     ["Scanner (TDM)", "Couveuse néonatale", "Moniteur multiparamétrique"]),
    ("Centre hospitalier Abass Ndao", "ch", "CHAN", "Avenue Cheikh Anta Diop", "Gueule Tapée, Dakar", "+221 33 849 78 00", 14.6845, -17.4530,
     [("MED", 40, 8), ("SSR", 30, 6)], ["Moniteur multiparamétrique"]),
    ("Hôpital Dalal Jamm", "ch", "DALJ", "Route des Niayes", "Guédiawaye", "+221 33 839 85 85", 14.7790, -17.3920,
     [("MED", 30, 2), ("PSY", 25, 5), ("REA", 8, 1), ("CARDIO", 12, 0)],
     ["Respirateur de réanimation", "Scanner (TDM)", "Moniteur multiparamétrique"]),
]

# user_name, prénom, nom, rôle, code établissement (coordinateur) ou None
USERS = [
    ("reg.demo", "Régulateur", "Démo", "regulateur", None),
    ("coord.fann", "Coordinateur", "Fann", "coordinateur", "FANN"),
    ("coord.principal", "Coordinateur", "Hôpital Principal", "coordinateur", "HPD"),
    ("coord.albertroyer", "Coordinateur", "Albert Royer", "coordinateur", "HEAR"),
    ("coord.dalaljamm", "Coordinateur", "Dalal Jamm", "coordinateur", "DALJ"),
    ("coord.idrissapouye", "Coordinateur", "Idrissa Pouye", "coordinateur", "HOGIP"),
    ("coord.madeleine", "Coordinateur", "Clinique de la Madeleine", "coordinateur", "CLIN-MAD"),
    ("coord.abassndao", "Coordinateur", "Abass Ndao", "coordinateur", "CHAN"),
]

# Agents d'établissement (rôle demandeur) : établissement déduit de la localisation, ou service dont ils sont responsables
AGENTS = [
    ("agent.dalaljamm", "Agent", "Dalal Jamm", "DALJ", None),
    ("inf.fann.cardio", "Infirmier", "Cardiologie Fann", "FANN", "CARDIO"),
    ("agent.albertroyer", "Agent", "Albert Royer", "HEAR", None),
    ("agent.principal", "Agent", "Hôpital Principal", "HPD", None),
    ("agent.idrissapouye", "Agent", "Idrissa Pouye", "HOGIP", None),
    ("agent.madeleine", "Agent", "Clinique de la Madeleine", "CLIN-MAD", None),
    ("agent.abassndao", "Agent", "Abass Ndao", "CHAN", None),
]


def main():
    spe = {}
    for code, nom in SPECIALITES:
        spe[code] = sn.upsert(f"{P}_specialite", f"code={code}", {"code": code, "nom": nom, "active": "true"})["sys_id"]
    print("spécialités", len(spe))

    modeles = {}
    for m in MODELES:
        modeles[m] = sn.upsert("cmdb_model", f"name={m}", {"name": m, "short_description": "Équipement médical (démo transfert patients)"})["sys_id"]
    print("modèles", len(modeles))
    for code, (niveau, mode, equip) in SPE_DEFAUTS.items():
        sn.patch(f"{P}_specialite", spe[code], {"niveau_soins_defaut": niveau, "mode_transport_defaut": mode,
                                                 "equipements_defaut": ",".join(modeles[m] for m in equip)})
    print("valeurs par défaut des spécialités ok")
    for m, q in REGLES.items():
        sn.upsert(f"{P}_regle_equipement", f"modele={modeles[m]}", {"modele": modeles[m], "quantite_minimum": str(q), "active": "true"})
    print("règles d'équipement ok")

    role_coord = sn.get("sys_user_role", f"name={P}.coordinateur", "sys_id", 1)[0]["sys_id"]
    role_dem = sn.get("sys_user_role", f"name={P}.demandeur", "sys_id", 1)[0]["sys_id"]
    etabs = {}
    for nom, typ, code, rue, ville, tel, lat, lon, services, equip in ETABS:
        loc = sn.upsert("cmn_location", f"name={nom}", {
            "name": nom, "street": rue, "city": ville, "zip": "", "country": "Senegal", "phone": tel,
            "latitude": str(lat), "longitude": str(lon)})["sys_id"]
        grp = sn.upsert("sys_user_group", f"name=Coordination - {nom}", {
            "name": f"Coordination - {nom}", "description": f"Coordinateurs des transferts — {nom}"})["sys_id"]
        sn.ensure("sys_group_has_role", f"group={grp}^role={role_coord}", {"group": grp, "role": role_coord})
        sn.ensure("sys_group_has_role", f"group={grp}^role={role_dem}", {"group": grp, "role": role_dem})
        etab = sn.upsert(f"{P}_etablissement", f"code_etablissement={code}", {
            "nom": nom, "type_etablissement": typ, "code_etablissement": code, "location": loc,
            "groupe_coordination": grp, "telephone_regulation": tel,
            "accepte_transferts": "true", "active": "true"})["sys_id"]
        etabs[code] = {"sys_id": etab, "group": grp, "location": loc}
        for spe_code, total, dispo in services:
            sn.upsert(f"{P}_service", f"etablissement={etab}^specialite={spe[spe_code]}", {
                "nom": dict(SPECIALITES)[spe_code], "etablissement": etab, "specialite": spe[spe_code],
                "lits_totaux": str(total), "lits_disponibles": str(dispo), "active": "true"})
        gardes = {spe[c] for c, _, _ in services}
        for old in sn.get(f"{P}_service", f"etablissement={etab}", "sys_id,specialite", 100):
            if old["specialite"]["value"] not in gardes:
                sn.delete(f"{P}_service", old["sys_id"])
        creer_equipements(code, nom, loc, equip, modeles)
        print("établissement", nom)

    creer_utilisateurs(etabs, spe, role_dem)


def creer_equipements(code, nom, loc, equip, modeles):
    """Assets (alm_asset) d'un établissement : QUANTITES unités par modèle, numéros d'inventaire CODE-MODE-n."""
    tags = set()
    for m in equip:
        for n in range(1, QUANTITES.get(code, {}).get(m, 1) + 1):
            tag = f"{code}-{m[:4].upper()}-{n}"
            tags.add(tag)
            sn.upsert("alm_asset", f"asset_tag={tag}", {
                "asset_tag": tag, "display_name": f"{m} — {nom}", "model": modeles[m],
                "location": loc, "install_status": "1", "substatus": ""})
    # Anciens numéros d'inventaire de démo devenus inutiles
    for a in sn.get("alm_asset", f"asset_tagSTARTSWITH{code}-^model.short_descriptionLIKEtransfert patients", "sys_id,asset_tag", 100):
        if a["asset_tag"] not in tags:
            sn.delete("alm_asset", a["sys_id"])


def equipements_seuls():
    """Règles et assets uniquement, sans toucher aux lits ni aux utilisateurs."""
    modeles = {m["name"]: m["sys_id"] for m in sn.get("cmdb_model", "short_descriptionLIKEtransfert patients", "name,sys_id", 50)}
    for m, q in REGLES.items():
        sn.upsert(f"{P}_regle_equipement", f"modele={modeles[m]}", {"modele": modeles[m], "quantite_minimum": str(q), "active": "true"})
    print("règles d'équipement ok")
    for nom, typ, code, *_rest, equip in ETABS:
        loc = sn.get("cmn_location", f"name={nom}", "sys_id", 1)[0]["sys_id"]
        creer_equipements(code, nom, loc, equip, modeles)
        print("équipements", nom, sum(QUANTITES.get(code, {}).get(m, 1) for m in equip))


def creer_utilisateurs(etabs, spe, role_dem):
    """Régulateur, coordinateurs (champ Coordinateur + groupe de coordination) et agents (localisation ou service)."""
    for un, fn, ln, role, code in USERS:
        u = sn.upsert("sys_user", f"user_name={un}", {
            "user_name": un, "first_name": fn, "last_name": ln, "email": f"{un}@example.com", "active": "true", "time_zone": "GMT"})["sys_id"]
        if role == "regulateur":
            r = sn.get("sys_user_role", f"name={P}.regulateur", "sys_id", 1)[0]["sys_id"]
            sn.ensure("sys_user_has_role", f"user={u}^role={r}", {"user": u, "role": r})
        if code:
            g = etabs[code]["group"]
            sn.ensure("sys_user_grmember", f"user={u}^group={g}", {"user": u, "group": g})
            sn.patch(f"{P}_etablissement", etabs[code]["sys_id"], {"coordinateur": u})
        print("utilisateur", un)


    for un, fn, ln, code, spe_code in AGENTS:
        u = sn.upsert("sys_user", f"user_name={un}", {
            "user_name": un, "first_name": fn, "last_name": ln, "email": f"{un}@example.com", "active": "true", "time_zone": "GMT",
            "location": etabs[code]["location"]})["sys_id"]
        sn.ensure("sys_user_has_role", f"user={u}^role={role_dem}", {"user": u, "role": role_dem})
        if spe_code:
            svc = sn.get(f"{P}_service", f"etablissement={etabs[code]['sys_id']}^specialite={spe[spe_code]}", "sys_id", 1)
            sn.patch(f"{P}_service", svc[0]["sys_id"], {"responsable": u})
        print("agent", un)


def utilisateurs_seuls():
    """Crée ou met à jour uniquement les utilisateurs, sans toucher aux lits ni aux équipements."""
    etabs = {}
    for e in sn.get(f"{P}_etablissement", "", "sys_id,code_etablissement,groupe_coordination,location", 50):
        etabs[e["code_etablissement"]] = {"sys_id": e["sys_id"], "group": e["groupe_coordination"]["value"],
                                          "location": e["location"]["value"]}
    spe = {x["code"]: x["sys_id"] for x in sn.get(f"{P}_specialite", "", "code,sys_id", 50)}
    role_dem = sn.get("sys_user_role", f"name={P}.demandeur", "sys_id", 1)[0]["sys_id"]
    creer_utilisateurs(etabs, spe, role_dem)


if __name__ == "__main__":
    if "--utilisateurs" in sys.argv:
        utilisateurs_seuls()
    elif "--equipements" in sys.argv:
        equipements_seuls()
    else:
        main()
