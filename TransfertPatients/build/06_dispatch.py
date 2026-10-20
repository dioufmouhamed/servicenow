#!/usr/bin/env python3
"""Étape 6 : zones géographiques et groupes FSM OOTB (dispatch wm_dispatch + équipages wm_work) par zone.

Modèle FSM : un groupe couvre une zone via sys_group_covers_location (limit_by_location actif) ;
FSM remonte la hiérarchie cmn_location, la couverture est donc posée sur la région parente des établissements.
"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "tools"))
import sn

TYPE_DISPATCH = "59e22fb137032000158bbfc8bcbe5d52"   # wm_dispatch
TYPE_WORK = "87245e061b13200050fdfbcd2c0713cc"       # wm_work
TYPE_QUALIF = "98906fb137032000158bbfc8bcbe5d65"     # wm_qualification

# zone, établissements (nom du cmn_location), id court
# Véhicules sanitaires (alm_asset) stationnés dans chaque zone : modèle -> nombre par code de zone — FICTIF
VEHICULES = {
    "Ambulance de réanimation (SMUR)": {"plateau": 1, "fann": 2, "banlieue": 1},
    "Ambulance": {"plateau": 2, "fann": 2, "banlieue": 1},
    "Véhicule sanitaire léger (VSL)": {"plateau": 1, "fann": 1, "banlieue": 1},
}
SIGLE = {"Ambulance de réanimation (SMUR)": "SMUR", "Ambulance": "AMB", "Véhicule sanitaire léger (VSL)": "VSL"}

ZONES = [
    ("Dakar Plateau-Médina", ["Hôpital Principal de Dakar", "Clinique de la Madeleine", "Centre hospitalier Abass Ndao"], "plateau"),
    ("Fann-Grand Yoff", ["CHNU de Fann", "Hôpital d'Enfants Albert Royer", "Hôpital Général Idrissa Pouye"], "fann"),
    ("Pikine-Guédiawaye", ["Hôpital Dalal Jamm"], "banlieue"),
]


def role(name):
    return sn.get("sys_user_role", f"name={name}", "sys_id", 1)[0]["sys_id"]


def user(un, first, last):
    return sn.upsert("sys_user", f"user_name={un}", {
        "user_name": un, "first_name": first, "last_name": last, "email": f"{un}@example.com", "active": "true", "time_zone": "GMT"})["sys_id"]


def member(u, g):
    sn.ensure("sys_user_grmember", f"user={u}^group={g}", {"user": u, "group": g})


def group(name, typ, desc, manager=""):
    return sn.upsert("sys_user_group", f"name={name}", {
        "name": name, "type": typ, "description": desc, "active": "true", "manager": manager})["sys_id"]


def main():
    r_disp, r_agent, r_qualif = role("wm_dispatcher"), role("wm_agent"), role("wm_qualifier")
    france = sn.upsert("cmn_location", "name=Région de Dakar - zones de transfert", {"name": "Région de Dakar - zones de transfert", "country": "Senegal"})["sys_id"]

    for zone, etabs, code in ZONES:
        reg = sn.upsert("cmn_location", f"name=Zone {zone}", {"name": f"Zone {zone}", "parent": france, "country": "Senegal"})["sys_id"]
        for e in etabs:
            loc = sn.get("cmn_location", f"name={e}", "sys_id", 1)[0]["sys_id"]
            sn.patch("cmn_location", loc, {"parent": reg})

        disp_user = user(f"disp.{code}", "Dispatcher", zone)
        sn.ensure("sys_user_has_role", f"user={disp_user}^role={r_disp}", {"user": disp_user, "role": r_disp})
        disp = group(f"Dispatch transferts - {zone}", TYPE_DISPATCH,
                     f"Dispatch FSM des transports de patients — zone {zone}", disp_user)
        sn.ensure("sys_group_has_role", f"group={disp}^role={r_disp}", {"group": disp, "role": r_disp})
        member(disp_user, disp)

        work = group(f"Équipages ambulance - {zone}", TYPE_WORK,
                     f"Ambulanciers et équipages de transfert — zone {zone}", disp_user)
        sn.ensure("sys_group_has_role", f"group={work}^role={r_agent}", {"group": work, "role": r_agent})
        # Accès à la page « Mes missions » du portail Waluu (en attendant l'app mobile Field Service)
        r_amb = role("x_2218203_ptrans.ambulancier")
        sn.ensure("sys_group_has_role", f"group={work}^role={r_amb}", {"group": work, "role": r_amb})
        for i in (1, 2):
            amb = user(f"amb.{code}{i}", "Ambulancier", f"{zone} {i}")
            # Numéro de mobile FICTIF (démo) : bouton « Appeler » du suivi de transport
            sn.patch("sys_user", amb, {"mobile_phone": f"+221 77 000 {ZONES.index((zone, etabs, code)) + 1}{i} 00"})
            member(amb, work)

        for g in (disp, work):
            sn.ensure("sys_group_covers_location", f"group={g}^location={reg}", {"group": g, "location": reg})
        for modele, parzone in VEHICULES.items():
            mod = sn.upsert("cmdb_model", f"name={modele}", {"name": modele, "short_description": "Véhicule sanitaire (démo ambulances)"})["sys_id"]
            for n in range(1, parzone.get(code, 0) + 1):
                tag = f"VEH-{code.upper()}-{SIGLE[modele]}-{n}"
                sn.upsert("alm_asset", f"asset_tag={tag}", {
                    "asset_tag": tag, "display_name": f"{modele} {n} — zone {zone}", "model": mod,
                    "location": reg, "install_status": "1", "substatus": ""})
        print(f"zone {zone} : dispatch + équipages + véhicules, {len(etabs)} établissements couverts")

    # Équipages assignables partout : un équipage de zone dépose le patient dans une autre zone (tâche de remise).
    # FSM (dispatch_queue) n'accepte un groupe wm_work sur une tâche que s'il couvre sa localisation ET dépend
    # du groupe de dispatch de la tâche (sm_m2m_group_dependency).
    dispatchs = [x["sys_id"] for x in sn.get("sys_user_group", "nameSTARTSWITHDispatch transferts - ", "sys_id", 10)]
    equipages = [x["sys_id"] for x in sn.get("sys_user_group", "nameSTARTSWITHÉquipages ambulance - ", "sys_id", 10)]
    for e in equipages:
        sn.ensure("sys_group_covers_location", f"group={e}^location={france}", {"group": e, "location": france})
        for d in dispatchs:
            sn.ensure("sm_m2m_group_dependency", f"dispatch_group={d}^assignment_group={e}", {"dispatch_group": d, "assignment_group": e})
    print(f"dépendances dispatch → équipages : {len(dispatchs)} x {len(equipages)}")

    # Qualification : les régulateurs qualifient les ordres de transport (toute la région)
    q = group("Qualification transferts", TYPE_QUALIF, "Qualification des ordres de transport de patients")
    sn.ensure("sys_group_has_role", f"group={q}^role={r_qualif}", {"group": q, "role": r_qualif})
    sn.ensure("sys_group_covers_location", f"group={q}^location={france}", {"group": q, "location": france})
    member(sn.get("sys_user", "user_name=reg.demo", "sys_id", 1)[0]["sys_id"], q)
    print("groupe de qualification ok")


if __name__ == "__main__":
    main()
