# Transfert Patients — application ServiceNow (scope `x_2218203_ptrans`)

Transfert de patients entre établissements : la demande est **publiée** aux établissements éligibles,
chacun **accepte ou refuse librement**, le régulateur **retient une destination** et le transport est
exécuté avec **Field Service Management (OOTB)**.

Instance : PDI `dev408543` — Application *Transfert Patients* (sys_app `f17d5cef93fb8310668230018bba10a9`).

## Processus

```
Brouillon → Publiée ──► Réponses (Accepter / Refuser) ──► Destination retenue → Transport planifié (WO FSM)
                │                                             → En transit → Arrivé - clôturée
                └─► Expirée (aucune acceptation avant la date limite)        Annulée (à tout moment avant transport)
```

1. **Publier** : calcule les établissements éligibles — service actif de la spécialité requise avec ≥ 1 lit libre,
   établissement actif et acceptant les transferts, possédant les **équipements requis** (assets OOTB `alm_asset`
   par modèle `cmdb_model`, localisés sur le `cmn_location` de l'établissement). Une *Réponse* « En attente » est créée
   par établissement et ses coordinateurs sont notifiés. Date limite : 30 min (vitale), 2 h (urgente), 24 h (programmée).
2. **Accepter** (service obligatoire, avec lit libre) / **Refuser** (motif obligatoire).
3. **Retenir cette destination** (régulateur) : réserve un lit (décrément du service), clôture les autres réponses,
   crée le **Work Order FSM** + 3 tâches (préparation, transport, remise) et applique la transition OOTB adaptée à la
   configuration FSM (avec qualification activée → *Awaiting Qualification*).
4. L'avancement du WO FSM est répercuté sur la demande (WIP → En transit, Closed Complete → Arrivé).
5. Job toutes les 15 min : expiration des demandes publiées sans acceptation.

## Modèle

| Table | Rôle |
|---|---|
| `x_2218203_ptrans_etablissement` | Établissement : type, `cmn_location`, coordinateur / groupe, capacité et lits (calculés) |
| `x_2218203_ptrans_service` | Service d'un établissement : spécialité, lits totaux / disponibles |
| `x_2218203_ptrans_specialite` | Référentiel des spécialités |
| `x_2218203_ptrans_demande` (étend `task`, TRF) | Demande de transfert |
| `x_2218203_ptrans_reponse` (REP) | Réponse d'un établissement à une demande |
| OOTB : `cmn_location`, `alm_asset`, `cmdb_model`, `wm_order`, `wm_task`, `sys_user_group` | |

Rôles : `x_2218203_ptrans.admin`, `.regulateur`, `.coordinateur` (attribué via les groupes « Coordination - … »).

## Record Producer

*Service Catalog → Transferts de patients → Demande de transfert de patient* (aussi dans le menu de l'app et sur `/sp`).
Formulaire guidé en 3 sections (origine et urgence, patient, besoin médical et transport) ; les listes de choix
réutilisent celles des champs de la table. Case « Publier immédiatement » (cochée par défaut) : le post-insert script
passe la demande en *Publiée*. Disponible pour les rôles régulateur et admin de l'app (user criteria).

## Portail /transferts (Service Portal)

`https://dev408543.service-now.com/transferts` — pages `tp_accueil`, `tp_demandes`, `tp_demande`, `tp_regulation`.
Widgets `tp-*` (code dans `src/portal/widgets/`), données et actions dans le Script Include `TransfertPortail`
(droits vérifiés côté serveur : coordinateur de l'établissement, demandeur, régulateur). Mise à jour en temps réel
par `spUtil.recordWatch`. Le tableau de régulation reprend le style workspace dans le portail ; un workspace
UI Builder reste possible en réutilisant `TransfertPortail`.

## Dispatch FSM (OOTB)

Les établissements (hôpitaux réels de Dakar ; capacités, services et équipements fictifs) sont rattachés à 3 zones
(`cmn_location` parents) : **Dakar Plateau-Médina**, **Fann-Grand Yoff**, **Pikine-Guédiawaye**.
Chaque zone a un groupe `wm_dispatch` « Dispatch transferts - <zone> » et un groupe `wm_work`
« Équipages ambulance - <zone> », qui couvrent la zone via `sys_group_covers_location`. FSM affecte
automatiquement le groupe de dispatch d'une tâche selon sa localisation. Le groupe `wm_qualification`
« Qualification transferts » (toute la région de Dakar) qualifie les ordres de transport.

## Structure du repo

```
tools/sn.py                 client REST (lit ../.env.servicenow, jamais commité)
build/01_schema.py          rôles, tables, champs, choix, états
build/02_logique.py         Script Include, Business Rules, UI Actions, job
build/03_donnees_demo.py    données fictives (6 établissements, services, équipements, utilisateurs)
build/04_interface.py       formulaires, listes, barre d'étapes, menu
build/05_securite_notifications.py   Fix Script ACL + notifications
build/07_record_producer.py record producer « Demande de transfert de patient »
build/08_portail.py         Service Portal /transferts (thème, header, 8 widgets, 4 pages)
build/09_scenarios_demo.py  demandes de démo à chaque étape (date limite +24 h)
build/migrations/          migrations ponctuelles (ex. passage aux hôpitaux de Dakar)
build/06_dispatch.py        zones (cmn_location) + groupes FSM : dispatch, équipages, qualification
src/                        code des scripts déployés
```

Tous les scripts sont idempotents : `python3 build/0X_....py` redéploie sans doublon.

## Mise en service

1. **ACL** (une fois) : *Avatar → Elevate role → security_admin*, puis
   *System Definition → Fix Scripts → « Transfert Patients - créer les ACL » → Run Fix Script*.
2. Tester en se faisant passer pour (*Impersonate*) : `reg.demo` (régulateur), `coord.fann`, `coord.principal`,
   `coord.albertroyer` (coordinateurs), `disp.plateau` / `disp.fann` / `disp.banlieue` (dispatchers).
