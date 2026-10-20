#!/usr/bin/env python3
"""Étape 9 : scénarios de démonstration (données fictives) pour le portail — une demande par étape du processus.
Idempotent : un scénario déjà créé (même référence patient) n'est pas recréé."""
import os, sys, datetime
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "tools"))
import sn

P = "x_2218203_ptrans"
LIMITE = (datetime.datetime.utcnow() + datetime.timedelta(hours=24)).strftime("%Y-%m-%d %H:%M:%S")


def ids():
    etab = {e["code_etablissement"]: e["sys_id"] for e in sn.get(f"{P}_etablissement", "", "code_etablissement,sys_id")}
    spe = {s["code"]: s["sys_id"] for s in sn.get(f"{P}_specialite", "", "code,sys_id")}
    mod = {m["name"]: m["sys_id"] for m in sn.get("cmdb_model", "short_descriptionLIKEtransfert patients", "name,sys_id")}
    return etab, spe, mod


def demande(ref, corps):
    exist = sn.get(f"{P}_demande", f"patient_reference={ref}", "sys_id,number", 1)
    if exist:
        print("existe déjà :", exist[0]["number"], ref)
        return None
    d = sn.post(f"{P}_demande", dict(corps, patient_reference=ref, date_limite_reponse=LIMITE))
    d = sn.patch(f"{P}_demande", d["sys_id"], {"state": "10"})
    print("publiée :", d["number"], ref, "→", d["nb_eligibles"], "établissement(s)")
    return d


def reponse(dem, etab_id, corps):
    r = sn.get(f"{P}_reponse", f"demande={dem['sys_id']}^etablissement={etab_id}", "sys_id", 1)
    return sn.patch(f"{P}_reponse", r[0]["sys_id"], corps) if r else None


def main():
    etab, spe, mod = ids()
    moniteur = mod["Moniteur multiparamétrique"]

    # TRF0001013 (pédiatrie, Dalal Jamm) : prolonger la date limite pour la démo
    for d in sn.get(f"{P}_demande", "patient_reference=DEMO-001^state=10", "sys_id"):
        sn.patch(f"{P}_demande", d["sys_id"], {"date_limite_reponse": LIMITE})

    # 1. Publiée, en attente : néonatologie depuis l'Hôpital Principal (couveuse requise)
    demande("DEMO-NN-4471", {"patient_age": "0", "patient_sexe": "m", "etablissement_origine": etab["HPD"],
            "specialite_requise": spe["NEONAT"], "niveau_soins": "intensifs", "urgence_transfert": "2", "mode_transport": "smur",
            "mobilite": "allonge", "equipements_requis": ",".join([mod["Couveuse néonatale"], moniteur]),
            "telephone_contact": "+221 33 889 50 50", "description": "Nouveau-né de 2 jours, détresse respiratoire (données fictives)."})

    # 2. Deux acceptations à arbitrer : cardiologie depuis Abass Ndao
    d = demande("DEMO-CA-2208", {"patient_age": "64", "patient_sexe": "m", "etablissement_origine": etab["CHAN"],
                "specialite_requise": spe["CARDIO"], "niveau_soins": "continus", "urgence_transfert": "2",
                "mode_transport": "ambulance", "mobilite": "allonge", "equipements_requis": moniteur,
                "telephone_contact": "+221 33 849 78 00", "description": "Syndrome coronarien, surveillance continue (données fictives)."})
    if d:
        for code, commentaire in [("FANN", "Lit en soins continus, cardiologue de garde prévenu."),
                                  ("HPD", "Disponible rapidement, même zone que l'origine.")]:
            svc = sn.get(f"{P}_service", f"etablissement={etab[code]}^specialite={spe['CARDIO']}", "sys_id", 1)[0]["sys_id"]
            reponse(d, etab[code], {"decision": "acceptee", "service_propose": svc, "commentaire": commentaire})
        reponse(d, etab["CLIN-MAD"], {"decision": "refusee", "motif_refus": "personnel"})

    # 3. Destination retenue, transport FSM créé : réanimation depuis Idrissa Pouye vers Albert Royer
    d = demande("DEMO-RE-3902", {"patient_age": "1", "patient_sexe": "m", "etablissement_origine": etab["HOGIP"],
                "specialite_requise": spe["REA"], "niveau_soins": "reanimation", "urgence_transfert": "1",
                "mode_transport": "smur", "mobilite": "allonge",
                "equipements_requis": ",".join([mod["Respirateur de réanimation"], moniteur]),
                "telephone_contact": "+221 33 869 40 50", "description": "Bronchiolite sévère, besoin de ventilation (données fictives)."})
    if d:
        svc = sn.get(f"{P}_service", f"etablissement={etab['HEAR']}^specialite={spe['REA']}", "sys_id", 1)[0]["sys_id"]
        r = reponse(d, etab["HEAR"], {"decision": "acceptee", "service_propose": svc, "commentaire": "Box 3 prêt."})
        if r:
            sn.patch(f"{P}_reponse", r["sys_id"], {"decision": "retenue"})
            print("   destination retenue : Albert Royer, ordre de transport créé")


if __name__ == "__main__":
    main()
