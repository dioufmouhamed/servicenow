#!/usr/bin/env python3
"""Génère docs/Transfert_Patients_demo.pptx : démonstration du portail avec captures d'écran (python-pptx)."""
import os
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.util import Inches, Pt

HERE = os.path.dirname(os.path.abspath(__file__))
CAP = os.path.join(HERE, "captures")
OUT = os.path.join(HERE, "Transfert_Patients_demo.pptx")

TEAL, TEAL_D, MINT, AMBER = "0B5D57", "083F3B", "E4F1EE", "E39B2D"
INK, GREY, WHITE, LINE, AMB_BG = "1E2B2E", "5A6B6F", "FFFFFF", "C9D8D5", "FCF1DF"
HEAD, BODY = "Cambria", "Calibri"
RATIO = 408 / 800  # hauteur / largeur des captures

prs = Presentation()
prs.slide_width, prs.slide_height = Inches(13.333), Inches(7.5)
BLANK = prs.slide_layouts[6]


def rgb(h):
    return RGBColor.from_string(h)


def bg(slide, color):
    slide.background.fill.solid()
    slide.background.fill.fore_color.rgb = rgb(color)


def text(slide, x, y, w, h, paras, size=16, color=INK, font=BODY, bold=False, align=PP_ALIGN.LEFT,
         anchor=MSO_ANCHOR.TOP, spacing=6):
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    for i, p in enumerate(paras if isinstance(paras, list) else [paras]):
        t, o = (p, {}) if isinstance(p, str) else p
        para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        para.alignment = o.get("align", align)
        para.space_after = Pt(o.get("spacing", spacing))
        r = para.add_run()
        r.text = t
        r.font.size = Pt(o.get("size", size))
        r.font.bold = o.get("bold", bold)
        r.font.italic = o.get("italic", False)
        r.font.name = o.get("font", font)
        r.font.color.rgb = rgb(o.get("color", color))
    return tb


def box(slide, x, y, w, h, fill=WHITE, line=None, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.08):
    s = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    if shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        s.adjustments[0] = radius
    s.fill.solid()
    s.fill.fore_color.rgb = rgb(fill)
    if line:
        s.line.color.rgb = rgb(line)
        s.line.width = Pt(1)
    else:
        s.line.fill.background()
    s.shadow.inherit = False
    return s


def badge(slide, x, y, label, d=0.5, fill=TEAL, color=WHITE, size=16):
    c = box(slide, x, y, d, d, fill=fill, shape=MSO_SHAPE.OVAL)
    tf = c.text_frame
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.alignment = PP_ALIGN.CENTER
    r = p.add_run()
    r.text = label
    r.font.size, r.font.bold, r.font.name = Pt(size), True, BODY
    r.font.color.rgb = rgb(color)


def capture(slide, fichier, x, y, w, nom):
    h = w * RATIO
    pic = slide.shapes.add_picture(os.path.join(CAP, fichier), Inches(x), Inches(y), Inches(w), Inches(h))
    pic.line.color.rgb = rgb(LINE)
    pic.line.width = Pt(0.75)
    pic.name = nom
    return h


def content(title, kicker, acteur=None):
    s = prs.slides.add_slide(BLANK)
    bg(s, WHITE)
    text(s, 0.6, 0.38, 9, 0.3, kicker.upper(), size=12, color=TEAL, bold=True)
    text(s, 0.6, 0.66, 12.1, 0.9, title, size=30, font=HEAD, bold=True)
    if acteur:
        b = box(s, 10.2, 0.32, 2.5, 0.42, fill=MINT, radius=0.5)
        text(s, 10.2, 0.32, 2.5, 0.42, acteur, size=12, bold=True, color=TEAL_D, align=PP_ALIGN.CENTER,
             anchor=MSO_ANCHOR.MIDDLE)
    text(s, 12.2, 7.05, 0.6, 0.3, str(len(prs.slides)), size=10, color=GREY, align=PP_ALIGN.RIGHT)
    return s


def ecran(title, kicker, acteur, fichier, points, notes):
    """Une capture à gauche, 3 à 4 points à droite."""
    s = content(title, kicker, acteur)
    capture(s, fichier, 0.6, 1.85, 8.5, title)
    paras = []
    for i, (t, d) in enumerate(points):
        paras.append((t, {"bold": True, "size": 16, "color": TEAL_D, "spacing": 2}))
        paras.append((d, {"size": 14, "spacing": 14}))
    text(s, 9.5, 1.85, 3.25, 4.6, paras)
    s.notes_slide.notes_text_frame.text = notes
    return s


def duo(title, kicker, acteur, f1, l1, f2, l2, conclusion, notes):
    """Deux captures côte à côte avec légende, et une conclusion."""
    s = content(title, kicker, acteur)
    for i, (f, l) in enumerate([(f1, l1), (f2, l2)]):
        x = 0.6 + i * 6.2
        h = capture(s, f, x, 1.85, 5.9, l)
        badge(s, x, 1.85 + h + 0.2, str(i + 1), d=0.4, size=13)
        text(s, x + 0.55, 1.85 + h + 0.2, 5.3, 0.6, l, size=14, anchor=MSO_ANCHOR.MIDDLE)
    box(s, 0.6, 6.15, 12.1, 0.7, fill=MINT)
    text(s, 0.9, 6.15, 11.6, 0.7, conclusion, size=15, color=TEAL_D, anchor=MSO_ANCHOR.MIDDLE)
    s.notes_slide.notes_text_frame.text = notes
    return s


# 1 — Titre
s = prs.slides.add_slide(BLANK)
bg(s, TEAL_D)
badge(s, 0.8, 1.2, "▶", d=0.9, fill=AMBER, color=TEAL_D, size=28)
text(s, 0.8, 2.45, 11.5, 1.2, "Démonstration — Transfert Patients", size=48, font=HEAD, bold=True, color=WHITE)
text(s, 0.8, 3.6, 11.5, 1.0, "Un transfert de bout en bout sur le portail /transferts, vu par le coordinateur, "
     "le régulateur et l'agent d'établissement", size=22, color="CFE6E2")
text(s, 0.8, 5.9, 11.5, 0.8, ["Captures réelles · PDI dev408543 · 14 octobre 2026",
                              "Données de démonstration fictives (patients, capacités)"], size=14, color="9CC5BF")

# 2 — Scénario
s = content("Trois rôles, quatre demandes, un parcours complet", "Le scénario")
roles = [("Coordinateur", "Hôpital d'Enfants Albert Royer", "Consulte les demandes reçues, accepte TRF0001013, suit un patient attendu"),
         ("Régulateur", "Régulation de Dakar", "Compare les acceptations et retient la destination de TRF0001015 et TRF0001014"),
         ("Agent", "Hôpital Dalal Jamm", "Crée TRF0001017 avec un formulaire pré-rempli et des suggestions par spécialité")]
for i, (r, e, d) in enumerate(roles):
    x = 0.6 + i * 4.1
    box(s, x, 1.95, 3.8, 2.6, fill=MINT)
    badge(s, x + 0.3, 2.25, str(i + 1))
    text(s, x + 0.3, 2.95, 3.2, 0.4, r, size=20, font=HEAD, bold=True, color=TEAL_D)
    text(s, x + 0.3, 3.4, 3.2, 0.35, e, size=13, color=GREY)
    text(s, x + 0.3, 3.8, 3.2, 0.8, d, size=14)
rows = [("TRF0001017", "Réanimation", "Dalal Jamm → à retenir", "créée par l'agent pendant la démo"),
        ("TRF0001013", "Pédiatrie", "Dalal Jamm → Albert Royer", "accepté puis retenu pendant la démo"),
        ("TRF0001014", "Néonatologie", "Hôpital Principal → Idrissa Pouye", "retenu pendant la démo"),
        ("TRF0001015", "Cardiologie", "Abass Ndao → CHNU de Fann", "2 acceptations, Fann retenu"),
        ("TRF0001016", "Réanimation", "Idrissa Pouye → Albert Royer", "transport planifié (FSM)")]
tbl = s.shapes.add_table(len(rows) + 1, 4, Inches(0.6), Inches(4.75), Inches(12.1), Inches(2.2)).table
for c, w in enumerate([2.0, 2.2, 3.9, 4.0]):
    tbl.columns[c].width = Inches(w)
for r, row in enumerate([("Demande", "Spécialité", "Trajet", "Dans la démo")] + rows):
    for c, val in enumerate(row):
        cell = tbl.cell(r, c)
        cell.fill.solid()
        cell.fill.fore_color.rgb = rgb(TEAL if r == 0 else (MINT if r % 2 else WHITE))
        p = cell.text_frame.paragraphs[0]
        p.text = val
        p.runs[0].font.size, p.runs[0].font.name = Pt(13), BODY
        p.runs[0].font.bold = r == 0 or c == 0
        p.runs[0].font.color.rgb = rgb(WHITE if r == 0 else INK)

# 3 à 13 — Écrans
ecran("Le coordinateur voit d'un coup d'œil ce qui l'attend", "Accueil du portail", "Coordinateur", "01-accueil.jpg",
      [("2 demandes à traiter", "avec le délai de la plus urgente"), ("1 patient attendu", "TRF0001016, transport planifié"),
       ("9 lits disponibles", "sur 83, dans 3 services"), ("Temps réel", "les compteurs se mettent à jour seuls")],
      "Accueil de coord.albertroyer : bandeau d'indicateurs alimenté en temps réel par recordWatch.")
ecran("Il répond sans quitter l'accueil", "À traiter maintenant", "Coordinateur", "02-a-traiter.jpg",
      [("Besoin complet", "spécialité, niveau, patient, transport, équipements"),
       ("Service proposé", "liste des services avec leurs lits libres"),
       ("Accepter ou refuser", "le refus demande un motif")],
      "Carte TRF0001014 : néonatologie, couveuse requise. Le service proposé par défaut est celui qui a le plus de lits.")
ecran("Il tient ses lits à jour en un clic", "Capacité et arrivées", "Coordinateur", "03-capacite-arrivees.jpg",
      [("Boutons − et +", "par service, bornés entre 0 et le total"),
       ("Arrivées attendues", "TRF0001016 et l'état de ses 3 tâches FSM"),
       ("Visible par la régulation", "et utilisé pour cibler les publications")],
      "La réanimation d'Albert Royer est à 0 lit libre : le lit a été réservé pour TRF0001016.")
ecran("Chaque demande montre où elle en est", "Parcours d'une demande", "Coordinateur", "04-demande-etapes.jpg",
      [("6 étapes horodatées", "de Brouillon à Arrivé"), ("Échéance visible", "réponse attendue avant 19:49"),
       ("Besoin du patient", "référence pseudonymisée, aucune donnée nominative")],
      "TRF0001013, pédiatrie depuis Dalal Jamm, publiée à Albert Royer seul (seul établissement avec de la pédiatrie).")
duo("Accepter prend dix secondes", "Répondre depuis le portail", "Coordinateur",
    "05-reponse.jpg", "Service, heure d'arrivée possible et commentaire pour la régulation",
    "06-acceptation-envoyee.jpg", "Confirmation immédiate ; le parcours ajoute l'événement",
    "La régulation est notifiée tout de suite, et le coordinateur peut changer d'avis tant que la destination n'est pas retenue.",
    "Action réelle exécutée pendant la démo : acceptation de TRF0001013 par Albert Royer.")
ecran("Toutes les demandes, filtrées par ce qui compte", "Liste des demandes", "Coordinateur", "07-liste.jpg",
      [("Reçues, émises, historique", "un onglet par usage"), ("Filtres", "à traiter, vitale, urgente, programmée"),
       ("État de chaque réponse", "en attente, acceptée, retenue")],
      "L'acceptation de TRF0001013 apparaît aussitôt dans la colonne « Votre réponse ».")
duo("Le transport est suivi jusqu'à l'arrivée", "Transport Field Service", "Coordinateur",
    "08-transport-etapes.jpg", "TRF0001016 : destination retenue, transport planifié",
    "09-parcours-transport.jpg", "Ordre WO0010012 et dispatch de la zone Fann-Grand Yoff",
    "L'ordre de transport est un Work Order FSM standard : qualification, puis dispatch par la zone qui couvre l'origine.",
    "Le groupe de dispatch est renseigné automatiquement par Field Service selon la localisation.")
ecran("Le régulateur pilote toute la région", "Tableau de régulation", "Régulateur", "10-regulation.jpg",
      [("4 colonnes", "publiées, à arbitrer, transport, en transit"),
       ("Temps réel", "TRF0001013 est passée en « à arbitrer » dès l'acceptation"),
       ("Lits libres par spécialité", "95 lits libres sur 633 dans la région")],
      "Vue reg.demo juste après l'acceptation faite par le coordinateur.")
ecran("Il compare les acceptations avant de choisir", "Arbitrage", "Régulateur", "11-reponses-comparees.jpg",
      [("Côte à côte", "service, lits libres, heure d'arrivée, commentaire"),
       ("Refus motivés", "la Madeleine : personnel insuffisant"),
       ("Un bouton", "« Retenir cette destination », avec confirmation")],
      "TRF0001015, cardiologie : Fann et l'Hôpital Principal ont accepté. Fann est retenu pendant la démo.")
duo("Retenir réserve le lit et lance le transport", "Destination retenue", "Régulateur",
    "12-destination-retenue.jpg", "TRF0001014 : Idrissa Pouye retenu, transport planifié",
    "13-regulation-apres.jpg", "Tableau après : 4 transports planifiés, 92 lits libres",
    "Les autres établissements passent en « Non retenue » et sont notifiés ; l'ordre de transport FSM est créé.",
    "3 lits réservés au total pendant la démo (95 → 92).")
duo("L'agent ne saisit que l'essentiel", "Formulaire de demande", "Agent",
    "14-formulaire-prerempli.jpg", "Établissement d'origine et téléphone pré-remplis d'après le profil",
    "15-suggestions-specialite.jpg", "Spécialité choisie : niveau, transport et équipements proposés",
    "Les valeurs proposées sont configurées sur chaque spécialité par l'administrateur fonctionnel ; tout reste modifiable.",
    "agent.dalaljamm : Hôpital Dalal Jamm et +221 33 839 85 85 pré-remplis ; Réanimation → Réanimation, SMUR, respirateur et moniteur.")
ecran("La demande part aussitôt aux bons établissements", "Demande publiée", "Agent", "16-demande-agent-publiee.jpg",
      [("TRF0001017", "créée et publiée en un envoi"), ("2 établissements sollicités", "CHNU de Fann et Idrissa Pouye : lit de réanimation et respirateur disponibles"),
       ("Suivi en direct", "étapes, échéance, possibilité d'annuler")],
      "L'agent ne voit que ses propres demandes (ACL). Les autres hôpitaux n'ont pas de lit de réanimation libre ou pas de respirateur.")

# Constats
s = content("La démo a révélé trois défauts, tous corrigés", "Constats de la démonstration")
items = [("Corrigé", "Ordre de transport non relié pour un régulateur sans rôle FSM",
          "Une règle Field Service levait une exception. L'ordre est relié dès sa création et les transitions sont isolées. "
          "Vérifié en direct sur TRF0001014."),
         ("Corrigé", "ACL de l'application non créées",
          "Le Fix Script scopé ne pouvait pas créer d'ACL. Réécrit en scope global : 29 ACL créées, 0 échec ; "
          "accès vérifié pour chaque profil."),
         ("Corrigé", "Suggestions et vidage du service inactifs dans le formulaire",
          "La variable déclencheuse des scripts onChange n'était pas enregistrée par l'API. Écrite côté serveur ; "
          "vérifié en direct sur TRF0001017.")]
for i, (tag, t, d) in enumerate(items):
    y = 1.95 + i * 1.6
    box(s, 0.6, y, 12.1, 1.4, fill="F4F7F7")
    box(s, 0.9, y + 0.45, 1.6, 0.5, fill=TEAL, radius=0.5)
    text(s, 0.9, y + 0.45, 1.6, 0.5, tag, size=13, bold=True, color=WHITE, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    text(s, 2.8, y + 0.2, 9.6, 0.4, t, size=17, bold=True)
    text(s, 2.8, y + 0.62, 9.6, 0.75, d, size=14, color=GREY)

# 15 — Suite
s = prs.slides.add_slide(BLANK)
bg(s, TEAL_D)
text(s, 0.8, 1.0, 11.5, 1.0, "Prochaines étapes", size=40, font=HEAD, bold=True, color=WHITE)
for i, (t, d) in enumerate([("Libérer les lits", "Libération automatique en cas d'annulation, table de réservation"),
                            ("Fluidifier le transport", "Transport et remise en une tâche, compétences SMUR / ambulancier"),
                            ("Passer en workspace", "Back-office UI Builder réutilisant TransfertPortail")]):
    y = 2.5 + i * 1.3
    badge(s, 0.8, y, str(i + 1), fill=AMBER, color=TEAL_D)
    text(s, 1.6, y - 0.05, 10.5, 0.45, t, size=20, bold=True, color=WHITE)
    text(s, 1.6, y + 0.45, 10.5, 0.45, d, size=15, color="CFE6E2")

prs.save(OUT)
print("écrit :", OUT, "—", len(prs.slides), "diapositives")
