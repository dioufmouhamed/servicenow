#!/usr/bin/env python3
"""Étape 5 : Fix Script des ACL (à lancer par un security_admin) et notifications e-mail."""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "tools"))
import sn

APP = "f17d5cef93fb8310668230018bba10a9"
P = "x_2218203_ptrans"
REP, DEM = f"{P}_reponse", f"{P}_demande"


def scoped(b):
    b["sys_scope"] = APP
    return b


LIEN = '<p><a href="${URI_REF}">Ouvrir ${number}</a></p>'
RESUME = ("<ul><li><b>Demande :</b> ${demande.number}</li><li><b>Origine :</b> ${demande.etablissement_origine}</li>"
          "<li><b>Spécialité :</b> ${demande.specialite_requise}</li><li><b>Niveau de soins :</b> ${demande.niveau_soins}</li>"
          "<li><b>Urgence :</b> ${demande.urgence_transfert}</li><li><b>Équipements :</b> ${demande.equipements_requis}</li>"
          "<li><b>Réponse attendue avant :</b> ${demande.date_limite_reponse}</li></ul>")

# nom, table, insert, update, condition, destinataires (champs), sujet, corps
NOTIFS = [
    ("Transfert - nouvelle demande à traiter", REP, True, False, "decision=en_attente",
     "etablissement.groupe_coordination,etablissement.coordinateur",
     "[Transfert] Nouvelle demande ${demande.number} — ${demande.specialite_requise}",
     "<p>Une demande de transfert a été publiée à votre établissement <b>${etablissement}</b>.</p>" + RESUME +
     "<p>Merci d'accepter (en indiquant le service) ou de refuser (avec un motif).</p>" + LIEN),
    ("Transfert - réponse d'un établissement", REP, False, True,
     "decisionVALCHANGES^decision=acceptee^ORdecision=refusee", "demande.opened_by",
     "[Transfert] ${demande.number} : ${etablissement} a ${decision}",
     "<p><b>${etablissement}</b> a répondu <b>${decision}</b> à la demande ${demande.number}.</p>"
     "<ul><li>Service proposé : ${service_propose}</li><li>Motif de refus : ${motif_refus}</li>"
     "<li>Commentaire : ${commentaire}</li></ul>" + LIEN),
    ("Transfert - destination confirmée", REP, False, True, "decisionVALCHANGES^decision=retenue",
     "etablissement.groupe_coordination,etablissement.coordinateur",
     "[Transfert] ${demande.number} confirmé vers ${etablissement}",
     "<p>Votre établissement a été retenu pour la demande <b>${demande.number}</b> "
     "(service ${service_propose}). Un lit a été réservé et le transport est en cours d'organisation.</p>" + RESUME + LIEN),
    ("Transfert - demande non retenue", REP, False, True, "decisionVALCHANGES^decision=non_retenue",
     "etablissement.groupe_coordination,etablissement.coordinateur",
     "[Transfert] ${demande.number} : un autre établissement a été retenu",
     "<p>La demande ${demande.number} a été attribuée à un autre établissement ou clôturée. "
     "Aucune action n'est requise. Merci pour votre réponse.</p>" + LIEN),
    ("Transfert - relance d'un établissement", f"{P}_relance", True, False, "statut=envoyee",
     "demande.opened_by,demande.etablissement_origine.groupe_coordination",
     "[Transfert] ${etablissement} demande la republication de ${demande.number}",
     "<p><b>${etablissement}</b> a manqué la demande ${demande.number}, expirée sans acceptation, et indique pouvoir "
     "accueillir le patient (service : ${service_propose}).</p><p>Message : ${commentaire}</p>"
     "<p>Ouvrez la demande et cliquez sur <b>Republier la demande</b> pour la publier à nouveau.</p>"
     '<p><a href="${URI_REF}">Ouvrir la relance</a></p>'),
    ("Transfert - demande expirée", DEM, False, True, "stateVALCHANGES^state=4", "opened_by",
     "[Transfert] ${number} expirée sans acceptation",
     "<p>La demande ${number} (${specialite_requise}) n'a reçu aucune acceptation avant la date limite.</p>"
     "<p>Vous pouvez élargir les critères (équipements, niveau de soins) et créer une nouvelle demande.</p>" + LIEN),
]


def main():
    with open(os.path.join(HERE, "..", "src", "fix_scripts", "creer_acls.js"), encoding="utf-8") as f:
        script = f.read()
    # Un script scopé ne peut pas créer d'ACL : le Fix Script est créé en scope global (il rattache les ACL à l'app).
    # L'API écrit dans l'« application courante » : on bascule temporairement la préférence sur global.
    user = sn.get("sys_user", f"user_name={sn.USER}", "sys_id", 1)[0]["sys_id"]
    pref = sn.get("sys_user_preference", f"user={user}^name=apps.current_app", "sys_id", 1)[0]["sys_id"]
    for old in sn.get("sys_script_fix", "name=Transfert Patients - créer les ACL", "sys_id", 5):
        sn.delete("sys_script_fix", old["sys_id"])
    sn.patch("sys_user_preference", pref, {"value": "global"})
    try:
        sn.post("sys_script_fix", {"name": "Transfert Patients - créer les ACL", "script": script, "record_for_rollback": "true",
                                   "description": "Scope global. À exécuter une fois en security_admin (Elevate role). Crée les ACL de l'application."})
    finally:
        sn.patch("sys_user_preference", pref, {"value": APP})
    print("fix script ACL ok")

    for name, table, ins, upd, cond, rcpt, subj, body in NOTIFS:
        sn.upsert("sysevent_email_action", f"name={name}^sys_scope={APP}", scoped({
            "name": name, "collection": table, "action_insert": str(ins).lower(), "action_update": str(upd).lower(),
            "condition": cond, "recipient_fields": rcpt, "subject": subj, "message_html": body,
            "generation_type": "engine", "type": "EMAIL", "content_type": "text/html", "active": "true",
            "send_self": "true", "weight": "0"}))
        print("notification", name)


if __name__ == "__main__":
    main()
