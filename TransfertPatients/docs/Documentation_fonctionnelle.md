# Transfert Patients — Documentation fonctionnelle

> Exporté de Claude Docs : https://claude.ai/code/artifact/95ad9612-7e74-4e51-8a6e-9200b92944bd

*Dernière mise à jour : 2026-10-15*

## Objet et périmètre

La solution permet à un établissement de santé de trouver en quelques minutes un établissement capable d'accueillir un patient, puis d'organiser son transport. Elle couvre les 7 hôpitaux de la région de Dakar chargés sur l'instance de démonstration.

**Ce que fait la solution**

- Un agent d'établissement décrit le besoin du patient dans un formulaire guidé, en grande partie pré-rempli.
- La demande est publiée uniquement aux établissements qui ont la spécialité, un lit libre et les équipements requis.
- Chaque établissement sollicité accepte ou refuse librement, depuis le portail.
- Le régulateur compare les acceptations et retient une destination : le lit, les équipements requis et un véhicule sanitaire sont réservés.
- Le transport est organisé et suivi avec Field Service Management (FSM), jusqu'à l'arrivée du patient.
- Les coordinateurs tiennent à jour les lits libres de leurs services ; tout le monde voit l'avancement en temps réel.
- Une demande expirée peut être republiée en un clic ; un établissement qui l'a manquée peut relancer le demandeur.

**Hors périmètre**

- Le dossier médical du patient : la demande ne porte qu'une référence pseudonymisée et le besoin clinique.
- La gestion nominative des lits (numéro de lit, chambre) : seuls des compteurs par service sont gérés.
- La facturation du transport et le suivi GPS des véhicules.

## Acteurs

| Acteur | Responsabilités | Canal |
| --- | --- | --- |
| Agent d'établissement (demandeur) | Crée la demande de transfert pour un patient de son établissement, la publie, la suit, peut l'annuler | Portail `/transferts`, formulaire guidé |
| Coordinateur d'établissement | Tient à jour les lits libres de ses services, accepte ou refuse les demandes publiées à son établissement, suit les patients attendus | Portail `/transferts` |
| Régulateur | Supervise toutes les demandes, retient la destination parmi les acceptations, annule si besoin | Page Régulation du portail, interface classique |
| Qualificateur FSM | Qualifie l'ordre de transport avant le dispatch | Field Service (interface standard) |
| Dispatcher FSM | Suit les tâches de transport, assignées automatiquement à un équipage, et les réaffecte si besoin | Field Service, Dispatcher Workspace |
| Ambulancier | Exécute la préparation, le transport et la remise du patient ; en attendant l'application mobile Field Service, depuis la page « Mes missions » du portail | Field Service, application mobile |
| Administrateur fonctionnel | Gère les établissements, services, spécialités et leurs valeurs par défaut, ainsi que les règles d'équipement | Interface classique |

Un agent ou un coordinateur est rattaché à son établissement de trois façons, dans cet ordre : il est responsable d'un service, il est coordinateur ou membre du groupe de coordination, ou sa localisation est celle de l'établissement.

### Utilisateurs de démonstration

Tous les utilisateurs sont des enregistrements de la table standard `sys_user` ; leur rôle métier vient de leurs rôles (`sys_user_has_role`), de leurs groupes (`sys_user_grmember`) et de leur rattachement à un établissement ou à un service.

| Utilisateur | Acteur | Rattachement | Rôle ServiceNow | Actions possibles |
| --- | --- | --- | --- | --- |
| `reg.demo` | Régulateur | Rôle direct ; groupe « Qualification transferts » | `x_2218203_ptrans.regulateur`, `wm_qualifier` | Voit toutes les demandes, retient la destination, crée, publie et annule, qualifie les ordres FSM |
| `coord.albertroyer`, `coord.fann`, `coord.principal` | Coordinateur | Champ `coordinateur` de l'établissement + groupe « Coordination - … » | `x_2218203_ptrans.coordinateur`, `x_2218203_ptrans.demandeur` (hérités du groupe) | Accepte ou refuse les demandes publiées à son établissement, ajuste les lits libres, suit les arrivées, crée des demandes |
| `agent.dalaljamm` | Agent d'établissement | Localisation `sys_user.location` = Dalal Jamm | `x_2218203_ptrans.demandeur` | Crée, publie, suit et annule ses propres demandes |
| `inf.fann.cardio` | Agent d'établissement | Responsable du service Cardiologie de Fann | `x_2218203_ptrans.demandeur` | Comme l'agent ; son service est pré-rempli |
| `disp.plateau`, `disp.fann`, `disp.banlieue` | Dispatcher FSM | Groupe « Dispatch transferts - zone » (`wm_dispatch`) | `wm_dispatcher` (hérité) | Affecte les tâches de sa zone à un équipage |
| `amb.plateau1`/`2`, `amb.fann1`/`2`, `amb.banlieue1`/`2` | Ambulancier | Groupe « Équipages ambulance - zone » (`wm_work`) | `wm_agent` (hérité) | Exécute préparation, transport et remise, y compris sur mobile |

Aucun utilisateur de démo n'a le rôle `x_2218203_ptrans.admin` ; les comptes administrateurs de l'instance le couvrent. Les utilisateurs de démo sont au fuseau GMT (heure de Dakar) et les ambulanciers ont un numéro de mobile fictif. Les utilisateurs de démo n'ont pas de mot de passe : on les teste avec *Impersonate*.

## Processus de bout en bout

Un transfert traverse quatre acteurs : l'agent publie, les établissements répondent, le régulateur choisit, Field Service transporte.

> *Schéma interactif « processus de transfert par acteur · 7 étapes » : voir la version en ligne du document.*

La demande ne part qu'aux établissements capables de soigner le patient ; le lit n'est réservé qu'au moment où le régulateur retient la destination.

## Cas d'usage détaillés

### UC1 — Créer et publier une demande

- **Acteur** : agent d'établissement, coordinateur ou régulateur.
- **Déclencheur** : un patient doit être transféré vers un autre établissement.

1. L'acteur clique sur « Nouvelle demande » dans le portail.
2. Le formulaire s'ouvre avec l'établissement d'origine, le service et le téléphone de contact déjà renseignés.
3. Il choisit la spécialité : le niveau de soins, le mode de transport et les équipements requis sont proposés automatiquement.
4. Il complète la référence patient, l'urgence, la mobilité et le motif, puis envoie.
5. La demande est publiée aux établissements éligibles (RG-01) ; leurs coordinateurs sont notifiés. Le portail ouvre ensuite le parcours de la demande.

- **Résultat** : demande « Publiée », une réponse « En attente » par établissement sollicité.
- **Exceptions** : aucun établissement éligible, la demande reste publiée sans réponse et une note l'indique ; case « Publier immédiatement » décochée, la demande reste en Brouillon.

### UC2 — Répondre à une demande

- **Acteur** : coordinateur d'un établissement sollicité.
- **Déclencheur** : notification « Nouvelle demande à traiter » ou carte dans « À traiter maintenant ».

1. Le coordinateur consulte le besoin et le délai restant.
2. Pour accepter, il choisit le service qui accueillera le patient et peut indiquer une heure d'arrivée possible et un commentaire.
3. Pour refuser, il choisit un motif.

- **Résultat** : réponse « Acceptée » ou « Refusée », horodatée ; le régulateur est notifié.
- **Exceptions** : service sans lit libre ou motif absent, la réponse est refusée avec un message (RG-05, RG-06). Une fois envoyée, la réponse est définitive (RG-07).

### UC3 — Retenir la destination

- **Acteur** : régulateur.

1. Le régulateur ouvre la demande depuis la colonne « Réponses à arbitrer ».
2. Il compare les acceptations : service proposé, lits libres, heure d'arrivée possible, commentaire.
3. Il clique sur « Retenir cette destination » et confirme.

- **Résultat** : un lit, une unité de chaque équipement requis et un véhicule sanitaire sont réservés, les autres établissements reçoivent « Non retenue », l'ordre de transport FSM est créé, la demande passe en « Transport planifié ».

### UC4 — Organiser et exécuter le transport

- **Acteurs** : qualificateur, dispatcher, ambulancier.

1. Le qualificateur qualifie l'ordre de transport.
2. Dès la destination retenue, la tâche de transport est assignée à un ambulancier de l'équipage de la zone du véhicule et planifiées à la suite (RG-23) ; le dispatcher peut les réaffecter.
3. L'équipage exécute la préparation, le transport et la remise, y compris sur mobile.

- **Résultat** : la demande passe « En transit » quand l'ordre démarre, puis « Arrivé - clôturée » quand il est terminé.

### UC5 — Tenir à jour la capacité

- **Acteur** : coordinateur.
- **Déroulement** : sur l'accueil du portail, il ajuste les lits libres de chaque service avec les boutons − et +.
- **Résultat** : la capacité de l'établissement est recalculée et utilisée pour les prochaines publications.

### UC6 — Suivre et annuler

- Le demandeur suit sa demande dans « Demandes → Émises » : étapes, parcours horodaté, transport.
- Il peut l'annuler en Brouillon, Publiée ou Destination retenue ; les réponses ouvertes sont clôturées.
- Sans acceptation avant la date limite, la demande expire automatiquement et le demandeur est notifié ; il peut alors la republier (UC7).

### UC7 — Republier ou relancer une demande expirée

- Acteurs : auteur de la demande ou régulateur ; coordinateur d'un établissement qui a manqué la demande.
- Sur une demande expirée, le panneau « Demande expirée » propose « Republier » : une nouvelle demande reprend les mêmes informations, avec une nouvelle date limite, et part aux établissements éligibles du moment (RG-21).
- Tant qu'elle n'est pas republiée, le coordinateur d'un établissement dont la réponse a expiré voit « Vous avez manqué cette demande ? » : il choisit un service disponible et un commentaire pour relancer le demandeur (RG-22).
- Résultat : la nouvelle demande est reliée à l'ancienne ; les relances reçues passent en « Traitée ».

## Règles de gestion

| N° | Règle |
| --- | --- |
| RG-01 | Un établissement est sollicité s'il est actif, accepte les transferts, n'est pas l'origine, a un service actif de la spécialité requise avec au moins 1 lit libre, et dispose, pour chaque équipement requis, du minimum d'unités libres fixé par les règles d'équipement (1 sans règle) : en service ou en stock, ni en réparation ni défectueuses, et non réservées pour un autre transfert. |
| RG-02 | Pour chaque établissement sollicité, le service proposé par défaut est celui de la spécialité qui a le plus de lits libres. |
| RG-03 | Délai de réponse (de la publication à la première acceptation) selon l'urgence : 5 min (vitale), 15 min (urgente), 24 h (programmée). Les délais vitale et urgente sont les SLA « Transfert - réponse », modifiables par l'administrateur. Une date saisie à la main est conservée. |
| RG-04 | Le formulaire pré-remplit l'établissement d'origine, le service et le téléphone d'après le profil ; le choix de la spécialité propose niveau de soins, mode de transport et équipements, configurés sur la spécialité. Tout reste modifiable. |
| RG-05 | Accepter exige un service de l'établissement qui a au moins 1 lit libre. |
| RG-06 | Refuser exige un motif : pas de lit, spécialité indisponible, équipement indisponible, personnel insuffisant, autre. |
| RG-07 | Une réponse envoyée (acceptée ou refusée) est définitive : l'établissement ne peut plus la changer. Seul le système la fait ensuite passer en Retenue, Non retenue ou Expirée. |
| RG-08 | Seul le régulateur retient une destination, uniquement parmi les réponses acceptées d'une demande publiée, et s'il reste un lit. |
| RG-09 | Retenir une destination réserve 1 lit (lits libres du service − 1), 1 unité de chaque équipement requis dans l'établissement retenu et un véhicule sanitaire (RG-18), passe les autres réponses ouvertes en « Non retenue » et crée l'ordre de transport. |
| RG-10 | L'ordre de transport comporte une seule tâche « Transport du patient », située à l'origine (l'équipage va chercher le patient puis le remet à destination) ; ses étapes Field Service horodatent le départ, l'arrivée sur place, la prise en charge et la remise (les ordres créés avant le 16/10/2026 gardent 3 tâches) ; sa priorité suit l'urgence. |
| RG-11 | L'ordre suit le circuit Field Service configuré (qualification sur l'instance) ; chaque tâche reçoit le groupe de dispatch de la zone qui couvre sa localisation. Ses tâches sont assignées directement (RG-23). |
| RG-12 | Ordre en cours : demande « En transit » ; ordre terminé : « Arrivé - clôturée » ; ordre annulé : alerte sur la demande. |
| RG-13 | Sans acceptation à la date limite, la demande passe en « Expirée » (contrôle toutes les minutes ; le SLA de réponse est alors en dépassement) et les réponses en attente en « Expirée ». |
| RG-14 | Annulation possible en Brouillon, Publiée ou Destination retenue, par le régulateur ou l'auteur ; les réponses ouvertes passent en « Non retenue ». Les équipements et le véhicule réservés sont libérés (RG-19) ; le lit déjà réservé n'est pas libéré automatiquement. |
| RG-15 | Les lits libres d'un service restent entre 0 et le nombre de lits totaux ; la capacité de l'établissement est la somme de ses services actifs. |
| RG-16 | Un coordinateur ne voit et ne traite que les demandes et réponses de ses établissements ; un demandeur voit ses propres demandes. |
| RG-17 | La demande ne contient qu'une référence patient pseudonymisée, jamais de nom ni de numéro de sécurité sociale. |
| RG-18 | Le véhicule dépend du mode de transport : SMUR → ambulance de réanimation (SMUR) ; ambulance → ambulance, sinon SMUR ; VSL → VSL, sinon ambulance ; héliporté → aucun. Il est cherché dans la zone de l'établissement d'origine, puis dans toute la région. Sans véhicule libre, l'ordre est créé et le dispatch l'affecte. |
| RG-19 | Les réservations d'équipements et de véhicule sont libérées automatiquement à l'arrivée du patient, à l'annulation ou à l'expiration de la demande, avec la date et le motif. |
| RG-20 | Une réservation ne change pas le statut de l'asset dans la gestion des actifs (il reste « En service ») : elle est tracée à part. Une unité réservée n'est plus comptée comme libre pour les autres demandes. |
| RG-21 | Une demande expirée peut être republiée une seule fois, par le régulateur ou son auteur : la nouvelle demande reprend les informations, reçoit une nouvelle date limite et est reliée à l'ancienne. |
| RG-22 | Tant qu'une demande expirée n'est pas republiée, un établissement dont la réponse a expiré peut relancer le demandeur en proposant un service ; l'auteur et la coordination d'origine sont notifiés. La republication clôt les relances. |
| RG-23 | La tâche de transport est assignée à l'équipage de la zone du véhicule réservé (sinon de l'établissement d'origine), et à son ambulancier qui a le moins de tâches en cours ; il va chercher le patient et le remet, y compris dans une autre zone. Elle est planifiée dans le délai de prise en charge (RG-26) ; en programmée, à partir de maintenant ou de la date souhaitée : 30 min de trajet vers l'origine, préparation 30 min, transport 1 h, remise 30 min. |
| RG-24 | Suivi du transport : le retard est l'écart entre la fin projetée de la tâche en cours (début réel + durée prévue) et sa fin prévue ; il décale l'arrivée estimée (fin prévue de la remise). Le téléphone de l'ambulancier et les notes des tâches ne sont visibles que du régulateur et des coordinateurs de l'origine et de la destination. |
| RG-25 | À la publication, chaque réponse reçoit la distance à vol d'oiseau entre l'établissement d'origine et l'établissement sollicité (coordonnées GPS des localisations) et une durée de route estimée (distance × 1,3 à 25 km/h, 5 min minimum). Le régulateur voit les réponses de la plus proche à la plus éloignée ; l'établissement accepté le plus proche est repéré. Le coordinateur voit la distance depuis l'origine sur la demande à traiter. |
| RG-26 | Délai de prise en charge, de la destination retenue à l'arrivée du patient : 10 min (vitale), 15 min (urgente) ; pas de délai en programmée (SLA « Transfert - prise en charge »). À la retenue, l'heure d'arrivée exigée est fixée et la tâche de transport reçoit la fenêtre retenue → arrivée exigée : départ immédiat, approche de l'ambulance = temps restant (2 min minimum), puis transport (durée de route) et remise (2 min). Avant de retenir, le régulateur voit si chaque établissement tient le délai (route + 4 min). Si le délai est intenable, les tâches suivent la durée réelle, une alerte est ajoutée à la demande et le SLA passe en dépassement. |
| RG-27 | Un minuteur suit la demande jusqu'à sa clôture : publiée sans acceptation → compte à rebours de réponse ; acceptée → durée de réponse figée et chrono de décision du régulateur ; retenue à en transit → compte à rebours jusqu'à l'arrivée exigée, puis retard compté en positif ; arrivée → bilan figé des deux délais (✓ ou ✗) ; expirée ou annulée → figé. Le minuteur passe au rouge sous 1 min. |
| RG-28 | À la retenue, l'itinéraire routier entre l'origine et la destination est calculé (service OSRM, routes OpenStreetMap) : tracé, distance par la route et durée de conduite multipliée par un coefficient de circulation (1,5, réglable). Cette durée devient celle de la tâche Transport. Si le service ne répond pas, la durée estimée à vol d'oiseau est conservée et la carte trace une ligne directe. La position de l'ambulance sur la carte est estimée d'après l'avancement de la tâche Transport. |
| RG-29 | L'ambulancier fait avancer sa mission depuis « Mes missions » ; chaque bouton applique une transition Field Service standard sur sa tâche : accepter (Accept), je pars (Start Travel), arrivé sur place (Check-In), patient pris en charge (Start Work), terminer (Close Complete, note obligatoire). Refus et clôture incomplète demandent un motif. Seul l'assigné peut agir. La clôture de la remise ferme l'ordre de transport et passe la demande en « Arrivé ». |

### Sélection des établissements sollicités

La sélection a lieu à la publication et applique RG-01 : un établissement n'est sollicité que s'il peut réellement accueillir le patient.

1. Il est actif et accepte les transferts.
2. Ce n'est pas l'établissement d'origine.
3. Il a un service actif de la spécialité requise avec au moins 1 lit libre.
4. Il dispose de chaque équipement requis en quantité suffisante : au moins le minimum d'unités libres fixé par la règle d'équipement du modèle (1 sans règle). Une unité compte si elle est située dans l'établissement, en service ou en stock, ni en réparation ni défectueuse, et non réservée pour un autre transfert.

Pour chaque établissement retenu, une réponse « En attente » est créée avec le service qui a le plus de lits libres, et sa coordination est notifiée.

**Exemple réel (démonstration du 14 octobre 2026)** : TRF0001017, réanimation avec respirateur et moniteur, depuis l'Hôpital Dalal Jamm.

| Établissement | Lit de réanimation libre | Respirateur | Résultat |
| --- | --- | --- | --- |
| CHNU de Fann | 2 | oui | Sollicité |
| Hôpital Général Idrissa Pouye | 3 | oui | Sollicité |
| Hôpital Principal de Dakar | 0 | oui | Exclu : pas de lit |
| Hôpital d'Enfants Albert Royer | 0 (réservé pour TRF0001016) | oui | Exclu : pas de lit |
| Hôpital Dalal Jamm | — | — | Exclu : origine |
| Clinique de la Madeleine, Abass Ndao | pas de service de réanimation | — | Exclu : spécialité |

La distance n'exclut aucun établissement : elle est calculée à la publication et affichée pour aider le choix (RG-25). Ne sont pas pris en compte aujourd'hui : le niveau de soins (un lit de la spécialité suffit), et une priorité par zone ; tous les établissements éligibles sont sollicités en même temps.

### Équipements et véhicules

Les équipements médicaux et les véhicules sanitaires sont des actifs standard de ServiceNow, gérés dans la gestion des actifs : chaque appareil a un modèle (respirateur, couveuse, ambulance…), un numéro d'inventaire, un statut et une localisation, celle de l'hôpital pour un équipement, celle de la zone pour un véhicule.

- **Règles d'équipement** : pour un modèle, le nombre minimum d'unités libres exigé. Démonstration : 2 respirateurs, 2 couveuses, 2 moniteurs.
- **Réservation** : au choix de la destination, une unité de chaque équipement requis et un véhicule sont réservés pour la demande, puis libérés à l'arrivée, à l'annulation ou à l'expiration.
- **Parc de démonstration** : 44 équipements dans les 7 hôpitaux et 12 véhicules (SMUR, ambulances, VSL) répartis dans les 3 zones.

**Exemple (test du 15 octobre 2026)** : réanimation vitale depuis Abass Ndao avec respirateur et moniteur. Fann (3 respirateurs) et Idrissa Pouye (2) sont sollicités ; Dalal Jamm, qui a un lit libre mais un seul respirateur, est exclu par la règle. Après le choix de Fann, le respirateur FANN-RESP-1, le moniteur FANN-MONI-1 et l'ambulance de réanimation VEH-PLATEAU-SMUR-1 de la zone d'origine sont réservés ; l'annulation les a tous libérés.

### Envoi de la demande et temps de trajet

Une fois les établissements choisis, la demande apparaît **instantanément** sur leur portail, dans « À traiter maintenant », avec le compte à rebours et la distance ; un email est aussi prévu pour la coordination (désactivé sur l'instance de démonstration). Tous les établissements retenus sont sollicités en même temps, sans ordre de priorité.

Le temps de trajet est estimé en trois temps :

- **à la publication**, à vol d'oiseau entre les deux hôpitaux (vitesse moyenne de 25 km/h en ville), pour comparer les établissements ;
- **à la retenue**, par le vrai itinéraire routier (OSRM, routes OpenStreetMap), corrigé d'un coefficient de circulation de 1,5 : c'est la durée prévue du transport ;
- **pendant le trajet**, par les heures réelles saisies par l'ambulancier (départ, sur place, prise en charge, remise), qui servent au bilan des délais.

Ne sont pas pris en compte dans le choix : la distance (affichée, elle n'exclut aucun établissement), la correspondance du niveau de soins, la disponibilité du personnel (appréciée par le coordinateur quand il répond) et l'historique des réponses.

## Écrans

Le portail `https://dev408543.service-now.com/transferts`, nommé « Waluu », est le point d'entrée de tous les acteurs métier ; il se met à jour en temps réel.

| Écran | Acteurs | Contenu | Actions |
| --- | --- | --- | --- |
| Accueil | coordinateur, agent | Indicateurs (à traiter, patients attendus, lits libres, demandes émises), cartes « À traiter maintenant » avec compte à rebours en temps réel, demandes émises avec barre d'étapes, capacité par service, arrivées attendues avec heure estimée et retard | Accepter, refuser, ajuster les lits, ouvrir une demande |
| Demandes | coordinateur, agent | Onglets Reçues, Émises, Historique ; filtres « à traiter » et urgence ; recherche | Répondre, voir |
| Parcours d'une demande | tous | Étapes, besoin du patient, parcours horodaté, panneau de réponse, bandeau de minuteur de l'étape (RG-27), carte « Trajet du patient » après la retenue (origine et destination seulement, itinéraire routier, ambulance en position estimée, lien Itinéraire ; RG-28), suivi du transport (arrivée estimée et retard, ambulancier à appeler, véhicule ; pour chaque tâche : horaires prévus et réels, étapes Field Service horodatées, asset, dernière note ; équipements réservés à destination), panneau « Demande expirée » (republier, relances), contact du demandeur ; pour le régulateur, toutes les réponses côte à côte, triées par distance, avec le repère « Le plus proche » | Répondre (une seule fois), publier, annuler, retenir une destination, republier, relancer |
| Régulation | régulateur | Indicateurs, tableau en 4 colonnes (publiées, à arbitrer, transport, en transit) avec compte à rebours sur les demandes publiées, lits libres de la région par spécialité | Ouvrir une demande, créer une demande |
| Formulaire « Demande de transfert de patient » | agent, coordinateur, régulateur | 3 sections : origine et urgence, patient, besoin médical et transport ; motif ; case « Publier immédiatement » | Envoyer |
| Interface classique (menu « Transfert Patients ») | régulateur, administrateur | Listes et formulaires des demandes, réponses, établissements, services, spécialités, équipements médicaux, véhicules sanitaires, réservations, règles d'équipement, relances, ordres de transport | Toutes les actions, référentiel |
| Field Service (standard) | qualificateur, dispatcher, ambulancier | Ordres de transport et tâches | Qualifier, affecter, exécuter |
| Carte | tous les utilisateurs du portail | Carte interactive de Dakar (OpenStreetMap) : les hôpitaux à leur position GPS, colorés selon les lits libres de la spécialité choisie (vert 2 et plus, orange 1, rouge complet, gris sans ce service ; toutes spécialités : 5 et plus, 1 à 4, complet) ; fiche au clic (adresse, téléphone, lits par service, équipements libres) ; liste des hôpitaux classée par disponibilité. Régulateur et coordinateurs : ambulances libres par zone et transferts en cours avec minuteur d'arrivée. Mise à jour en temps réel. | Filtrer par spécialité, afficher ou masquer ambulances et transferts, ouvrir une demande |
| Mes missions | ambulancier | Page mobile : missions de l'ambulancier (à accepter en tête), patient, carte du trajet et lien Itinéraire, étapes avec horaires, minuteur d'arrivée exigée, bilan du jour. Un ambulancier sans autre rôle ne voit que cette page. | Un bouton par étape (RG-29) : Accepter ou Refuser, Je pars, Arrivé sur place, Patient pris en charge, Terminer (note obligatoire), Clôturer incomplète |

## Notifications

| Notification | Déclencheur | Destinataires | Contenu |
| --- | --- | --- | --- |
| Nouvelle demande à traiter | Publication (réponse créée « En attente ») | Coordinateur et groupe de coordination de l'établissement sollicité | Origine, spécialité, niveau, urgence, équipements, date limite, lien |
| Réponse d'un établissement | Réponse acceptée ou refusée | Auteur de la demande | Établissement, décision, service proposé ou motif, commentaire |
| Destination confirmée | Réponse retenue | Coordination de l'établissement retenu | Lit réservé, transport en cours d'organisation |
| Demande non retenue | Autre établissement retenu ou demande annulée | Coordination des autres établissements sollicités | Information, aucune action requise |
| Demande expirée | Expiration sans acceptation | Auteur de la demande | Invitation à republier la demande |
| Relance d'un établissement | Un établissement qui a manqué une demande expirée relance le demandeur | Auteur de la demande et coordination de l'établissement d'origine | Établissement, service disponible, commentaire, lien pour republier |

## États et décisions

**Demande de transfert**

| État | Signification | Passe à |
| --- | --- | --- |
| Brouillon | Saisie en cours, non visible des établissements | Publiée, Annulée |
| Publiée | Envoyée aux établissements éligibles, réponses en cours | Destination retenue, Expirée, Annulée |
| Destination retenue | Lit réservé | Transport planifié (immédiat), Annulée |
| Transport planifié | Ordre FSM créé, tâches assignées à l'équipage | En transit |
| En transit | Ordre FSM en cours | Arrivé - clôturée |
| Arrivé - clôturée | Patient remis au service | — |
| Expirée | Aucune acceptation avant la date limite ; peut être republiée en une nouvelle demande (RG-21) | — |
| Annulée | Annulée par le régulateur ou l'auteur | — |

**Réponse d'un établissement** : En attente → Acceptée ou Refusée (définitive) → Retenue ou Non retenue ; En attente → Expirée si la demande expire.

## Glossaire

| Terme | Définition |
| --- | --- |
| Demande de transfert (TRF) | Besoin de transférer un patient d'un établissement à un autre |
| Réponse (REP) | Décision d'un établissement sollicité sur une demande |
| Établissement éligible | Établissement qui remplit RG-01 et reçoit la demande |
| Service | Unité d'un établissement pour une spécialité, avec ses lits totaux et libres |
| Ordre de transport (WO) | Work Order Field Service qui porte le transport et sa tâche « Transport du patient » |
| Zone | Secteur géographique de Dakar couvert par un groupe de dispatch et un groupe d'équipages |
| Référence pseudonymisée | Identifiant interne du patient, sans donnée directement identifiante |
| SMUR | Transport médicalisé avec soins avancés |
| Réservation (RES) | Blocage d'un équipement ou d'un véhicule pour une demande, de la destination retenue jusqu'à l'arrivée, l'annulation ou l'expiration |
| Règle d'équipement | Nombre minimum d'unités libres d'un modèle pour qu'un établissement soit sollicité |
| Véhicule sanitaire | Ambulance de réanimation (SMUR), ambulance ou VSL, géré comme un actif et stationné dans une zone |
| Republication | Nouvelle demande créée à partir d'une demande expirée, avec une nouvelle date limite |
| Relance (RLC) | Message d'un établissement qui a manqué une demande expirée, pour inviter le demandeur à la republier |
