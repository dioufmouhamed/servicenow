var TransfertUtils = Class.create();
TransfertUtils.prototype = {
    P: 'x_2218203_ptrans',
    // State flows OOTB de wm_order au départ de "Brouillon" : la première valide selon la config FSM (sm_config) est appliquée
    FLOWS_WO_DEPART: [
        '3530e4b8d7102100bbc783e80e6103fe', // Ready for Dispatch (approval qual both off)
        '923bb2d8d7230100fceaa6859e610338', // Ready For Qualification (approval off qual on)
        'df47ce00d7502100bbc783e80e610334'  // Ready For Approval
    ],

    // Délais par urgence (minutes) : lus dans les définitions de SLA (contract_sla) ; valeurs ci-dessous si SLA absent.
    // Programmée : réponse sous 24 h, pas de délai de prise en charge.
    SLA_NOMS: {
        reponse: { '1': 'Transfert - réponse - vitale', '2': 'Transfert - réponse - urgente' },
        prise_en_charge: { '1': 'Transfert - prise en charge - vitale', '2': 'Transfert - prise en charge - urgente' }
    },
    DELAIS_DEFAUT: {
        reponse: { '1': 5, '2': 15, '3': 1440 },
        prise_en_charge: { '1': 10, '2': 15 }
    },
    // Tâche unique « Transport du patient » : trajet FSM = approche de l'ambulance jusqu'à l'origine,
    // travail = prise en charge → remise (route + REMISE_MIN). Programmée (sans délai) : valeurs ci-dessous.
    REMISE_MIN: 2,
    APPROCHE_MIN: 2,
    APPROCHE_PROGRAMMEE_MIN: 30,
    TRAVAIL_PROGRAMME_MIN: 90,
    // Estimation de la durée de route : détour par rapport au vol d'oiseau et vitesse moyenne en ville
    FACTEUR_ROUTE: 1.3,
    VITESSE_KMH: 25,
    // Type de groupe FSM « wm_work » (équipages)
    TYPE_GROUPE_EQUIPAGE: '87245e061b13200050fdfbcd2c0713cc',

    initialize: function() {},

    /**
     * Publie une demande : identifie les établissements éligibles
     * (spécialité, lits disponibles, équipements requis) et crée une réponse "En attente" pour chacun.
     * Appelé depuis la BR "Publication demande" (before) : modifie current sans update().
     */
    publier: function(demande) {
        var P = this.P;
        var origine = demande.getValue('etablissement_origine');
        var modeles = demande.getValue('equipements_requis') ? demande.getValue('equipements_requis').split(',') : [];

        // Meilleur service (le plus de lits) par établissement pour la spécialité demandée
        var candidats = {};
        var svc = new GlideRecord(P + '_service');
        svc.addQuery('specialite', demande.getValue('specialite_requise'));
        svc.addQuery('active', true);
        svc.addQuery('lits_disponibles', '>', 0);
        svc.addQuery('etablissement.active', true);
        svc.addQuery('etablissement.accepte_transferts', true);
        svc.addQuery('etablissement', '!=', origine);
        svc.orderByDesc('lits_disponibles');
        svc.query();
        while (svc.next()) {
            var etab = svc.getValue('etablissement');
            if (!candidats[etab])
                candidats[etab] = { service: svc.getUniqueValue(), location: svc.etablissement.location + '' };
        }

        var origineLoc = demande.etablissement_origine.location + '';
        var nb = 0;
        for (var etabId in candidats) {
            if (!this._equipementsDisponibles(candidats[etabId].location, modeles))
                continue;
            if (!this._reponseExiste(demande.getUniqueValue(), etabId)) {
                var rep = new GlideRecord(P + '_reponse');
                rep.initialize();
                rep.setValue('demande', demande.getUniqueValue());
                rep.setValue('etablissement', etabId);
                rep.setValue('service_propose', candidats[etabId].service);
                rep.setValue('decision', 'en_attente');
                var km = this.distanceKm(origineLoc, candidats[etabId].location);
                if (km !== null) {
                    rep.setValue('distance_km', km);
                    rep.setValue('duree_route_min', this.dureeRouteMin(km));
                }
                rep.insert();
            }
            nb++;
        }

        demande.setValue('nb_eligibles', nb);
        demande.setValue('date_publication', new GlideDateTime());
        if (!demande.getValue('date_limite_reponse'))
            demande.setValue('date_limite_reponse', this._dateLimite(demande.getValue('urgence_transfert')));
        demande.work_notes = nb > 0 ?
            'Demande publiée à ' + nb + ' établissement(s) éligible(s).' :
            'Aucun établissement éligible (spécialité, lits ou équipements). Ajustez les critères et republiez.';
        return nb;
    },

    /**
     * Le régulateur a retenu une réponse (décision -> "retenue", contrôlée par la BR before) :
     * réserve le lit, clôture les autres réponses, renseigne la destination et crée l'ordre de transport FSM.
     * Appelé depuis la BR after "Réponse - destination retenue".
     */
    retenir: function(reponse) {
        var P = this.P;
        var demande = reponse.demande.getRefRecord();

        var svc = new GlideRecord(P + '_service');
        if (svc.get(reponse.getValue('service_propose'))) {
            svc.setValue('lits_disponibles', Math.max((parseInt(svc.getValue('lits_disponibles'), 10) || 0) - 1, 0));
            svc.update();
        }

        var autres = new GlideRecord(P + '_reponse');
        autres.addQuery('demande', demande.getUniqueValue());
        autres.addQuery('sys_id', '!=', reponse.getUniqueValue());
        autres.addQuery('decision', 'IN', 'en_attente,acceptee');
        autres.query();
        while (autres.next()) {
            autres.setValue('decision', 'non_retenue');
            autres.update();
        }

        var equipements = this.reserverEquipements(demande, reponse.getValue('etablissement'));

        // Itinéraire routier origine → destination (durée avec coefficient de circulation) ; sans réponse du service,
        // la planification garde l'estimation à vol d'oiseau de la réponse retenue.
        var itin = this.calculerItineraire(demande.etablissement_origine.location + '', reponse.etablissement.location + '');
        if (itin) {
            demande.setValue('itineraire', itin.polyline);
            demande.setValue('distance_route_km', itin.km);
            demande.setValue('duree_route_min', itin.minutes);
            equipements += '\nItinéraire routier : ' + (itin.km + '').replace('.', ',') + ' km, ≈ ' + itin.minutes + ' min avec la circulation.';
        } else {
            equipements += '\nItinéraire routier indisponible : durée estimée à vol d\'oiseau.';
        }

        // Délai de prise en charge : de la retenue jusqu'à l'arrivée du patient (vitale, urgente)
        var maintenant = new GlideDateTime();
        demande.setValue('date_retenue', maintenant);
        var delaiPec = this.delaiMin('prise_en_charge', demande.getValue('urgence_transfert'));
        if (delaiPec) {
            var echeance = new GlideDateTime(maintenant.getValue());
            echeance.addSeconds(delaiPec * 60);
            demande.setValue('date_limite_arrivee', echeance);
        }

        demande.setValue('etablissement_destination', reponse.getValue('etablissement'));
        demande.setValue('service_destination', reponse.getValue('service_propose'));
        demande.setValue('reponse_retenue', reponse.getUniqueValue());
        demande.setValue('state', '20');
        demande.work_notes = 'Destination retenue : ' + reponse.getDisplayValue('etablissement') +
            ' / ' + reponse.getDisplayValue('service_propose') + '. Lit réservé.' + equipements;
        demande.update();

        return this.creerOrdreTransport(demande);
    },

    /** Crée le Work Order FSM (OOTB) et ses 3 tâches : préparation, transport, remise. */
    creerOrdreTransport: function(demande) {
        var origine = demande.etablissement_origine.getRefRecord();
        var dest = demande.etablissement_destination.getRefRecord();
        var prio = { '1': 1, '2': 2, '3': 3 }[demande.getValue('urgence_transfert')] || 3;
        var vehicule = this.affecterVehicule(demande);
        var libelle = 'Transfert ' + demande.getValue('number') + ' : ' + origine.getValue('nom') + ' → ' + dest.getValue('nom');
        var details = [
            'Patient : ' + demande.getValue('patient_reference') + ' (' + (demande.getValue('patient_age') || '?') + ' ans)',
            'Niveau de soins : ' + demande.getDisplayValue('niveau_soins'),
            'Mode de transport : ' + demande.getDisplayValue('mode_transport') + ' — mobilité : ' + demande.getDisplayValue('mobilite'),
            'Véhicule : ' + (vehicule ? vehicule.model.getDisplayValue() + ' (' + vehicule.getValue('asset_tag') + ')' : 'à affecter par le dispatch'),
            'Équipements requis : ' + (demande.getDisplayValue('equipements_requis') || 'aucun'),
            'Destination : ' + dest.getValue('nom') + ' / ' + demande.getDisplayValue('service_destination'),
            'Date souhaitée : ' + (demande.getDisplayValue('date_souhaitee') || 'dès que possible')
        ].join('\n');

        var wo = new GlideRecord('wm_order');
        wo.initialize();
        wo.setValue('short_description', libelle);
        wo.setValue('description', details);
        wo.setValue('location', origine.getValue('location'));
        wo.setValue('priority', prio);
        wo.setValue('caller', demande.getValue('opened_by'));
        var woId = wo.insert();
        if (!woId)
            return null;

        // Lier l'ordre à la demande tout de suite : rien de ce qui suit ne doit pouvoir l'empêcher
        demande.setValue('work_order', woId);
        demande.setValue('state', '30');
        if (vehicule)
            demande.setValue('vehicule', vehicule.getUniqueValue());
        demande.work_notes = 'Ordre de transport FSM créé : ' + wo.getValue('number') + '. ' +
            (vehicule ? 'Véhicule réservé : ' + vehicule.model.getDisplayValue() + ' (' + vehicule.getValue('asset_tag') + ').' :
                'Aucun véhicule disponible pour ce mode de transport : affectation par le dispatch.');
        demande.update();

        // Une seule tâche : l'équipage va chercher le patient à l'origine (lieu de la tâche) et le remet à destination.
        // Étapes FSM OOTB : Start Travel (départ), Check-In (sur place), Start Work (prise en charge), Close (remise).
        var taches = [
            ['Transport du patient — ' + origine.getValue('nom') + ' → ' + dest.getValue('nom'), origine.getValue('location'),
                'Prise en charge à ' + origine.getValue('nom') + ' (' + (origine.location.street + '') + '), transport et remise au service ' +
                demande.getDisplayValue('service_destination') + ' de ' + dest.getValue('nom') + ' (' + (dest.location.street + '') + ').\n' + details]
        ];
        var tacheIds = [];
        for (var i = 0; i < taches.length; i++) {
            var t = new GlideRecord('wm_task');
            t.initialize();
            t.setValue('parent', woId);
            t.setValue('short_description', taches[i][0]);
            t.setValue('location', taches[i][1]);
            t.setValue('description', taches[i][2]);
            t.setValue('priority', prio);
            try {
                var tId = t.insert();
                if (tId)
                    tacheIds.push(tId);
            } catch (e) {
                // Une règle FSM peut lever une exception après l'insertion selon les rôles de l'utilisateur
                gs.warn('[Transfert Patients] Tâche « ' + taches[i][0] + ' » : ' + e);
            }
        }

        // Transition OOTB FSM selon la configuration (qualification / approbation), comme les UI Actions du WO.
        // Isolée : un State Flow peut lever une exception selon les rôles de l'utilisateur courant.
        try {
            var sf = new global.StateFlow();
            if (wo.get(woId)) {
                for (var f = 0; f < this.FLOWS_WO_DEPART.length; f++) {
                    if (sf.validFlow(wo, this.FLOWS_WO_DEPART[f], 'manual')) {
                        sf.processFlow(wo, this.FLOWS_WO_DEPART[f], 'manual');
                        break;
                    }
                }
            }
        } catch (e) {
            gs.warn('[Transfert Patients] Transition FSM non appliquée pour ' + wo.getValue('number') + ' : ' + e);
        }

        // Assignation directe des 3 tâches à un même ambulancier (l'équipage qui prend en charge le patient)
        try {
            this.assignerTaches(demande, tacheIds, vehicule);
        } catch (e) {
            gs.warn('[Transfert Patients] Assignation des tâches non appliquée pour ' + wo.getValue('number') + ' : ' + e);
        }
        return woId;
    },

    /**
     * Assigne les tâches au groupe d'équipages (wm_work) qui couvre la zone du véhicule réservé
     * (sinon celle de l'établissement d'origine) et à son ambulancier le moins chargé.
     * Le state flow OOTB de wm_task passe ensuite la tâche en « Assigned » ; le Work Order n'est pas modifié.
     */
    assignerTaches: function(demande, tacheIds, vehicule) {
        if (!tacheIds.length)
            return;
        var lieu = vehicule ? vehicule.getValue('location') : demande.etablissement_origine.location + '';
        var groupe = this._equipageDe(lieu);
        if (!groupe) {
            demande.work_notes = 'Aucun équipage ne couvre la zone : les tâches seront assignées par le dispatch.';
            demande.update();
            return;
        }
        var agent = this._ambulancierDisponible(groupe);
        // Planification de la tâche : approche (trajet FSM) puis travail (prise en charge → remise)
        var transport = Math.max(3, parseInt(demande.getValue('duree_route_min'), 10) ||
            parseInt(demande.reponse_retenue.duree_route_min + '', 10) || 5);
        var travail = transport + this.REMISE_MIN, approche = this.APPROCHE_PROGRAMMEE_MIN;
        var maintenant = new GlideDateTime(), debut, fenetreDebut = null, fenetreFin = null, alerte = '';
        if (demande.getValue('date_limite_arrivee')) {
            // Délai de prise en charge (vitale, urgente) : départ immédiat, la tâche tient dans la fenêtre
            // retenue → arrivée exigée ; l'approche prend le temps restant après le transport et la remise.
            var echeance = new GlideDateTime(demande.getValue('date_limite_arrivee'));
            var budget = Math.floor((echeance.getNumericValue() - maintenant.getNumericValue()) / 60000);
            approche = Math.max(this.APPROCHE_MIN, budget - travail);
            fenetreDebut = new GlideDateTime(maintenant.getValue());
            var finPlan = new GlideDateTime(maintenant.getValue());
            finPlan.addSeconds((approche + travail) * 60);
            fenetreFin = echeance;
            if (finPlan.after(echeance)) {
                fenetreFin = finPlan;
                alerte = ' Délai de prise en charge intenable : arrivée planifiée à ' + finPlan.getDisplayValue().substring(11, 16) +
                    ' pour une échéance à ' + echeance.getDisplayValue().substring(11, 16) + '.';
            }
            debut = new GlideDateTime(maintenant.getValue());
            debut.addSeconds(approche * 60);
        } else {
            travail = this.TRAVAIL_PROGRAMME_MIN;
            debut = new GlideDateTime(maintenant.getValue());
            debut.addSeconds((5 + approche) * 60);
            if (demande.getValue('date_souhaitee')) {
                var souhaitee = new GlideDateTime(demande.getValue('date_souhaitee'));
                if (souhaitee.after(debut))
                    debut = souhaitee;
            }
        }
        var t = new GlideRecord('wm_task');
        t.addQuery('sys_id', 'IN', tacheIds.join(','));
        t.orderBy('number');
        t.query();
        var faites = 0;
        while (t.next()) {
            t.setValue('expected_start', debut.getValue());
            t.setValue('estimated_work_duration', '1970-01-01 ' + this._hhmm(travail) + ':00');
            t.setValue('estimated_travel_duration', '1970-01-01 ' + this._hhmm(approche) + ':00');
            if (fenetreFin) {
                t.setValue('window_start', fenetreDebut.getValue());
                t.setValue('window_end', fenetreFin.getValue());
            }
            t.setValue('assignment_group', groupe);
            if (agent)
                t.setValue('assigned_to', agent);
            if (vehicule)
                t.work_notes = 'Véhicule réservé : ' + vehicule.model.getDisplayValue() + ' (' + vehicule.getValue('asset_tag') + ').';
            try {
                if (t.update())
                    faites++;
            } catch (e) {
                gs.warn('[Transfert Patients] Tâche ' + t.getValue('number') + ' non assignée : ' + e);
            }
        }
        var g = new GlideRecord('sys_user_group');
        g.get(groupe);
        var u = new GlideRecord('sys_user');
        demande.work_notes = 'Tâche de transport assignée à ' +
            (agent && u.get(agent) ? u.getDisplayValue() + ' (' + g.getDisplayValue() + ')' : 'l\'équipe ' + g.getDisplayValue()) + '.' +
            (fenetreFin ? ' Fenêtre : ' + fenetreDebut.getDisplayValue().substring(11, 16) + ' → ' + fenetreFin.getDisplayValue().substring(11, 16) +
                ' (approche ' + approche + ' min, transport ' + transport + ' min, remise ' + this.REMISE_MIN + ' min).' : '') +
            (faites ? '' : ' Assignation refusée par Field Service : à faire par le dispatch.') + alerte;
        demande.update();
    },

    _hhmm: function(minutes) {
        var h = Math.floor(minutes / 60), m = minutes % 60;
        return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
    },

    /** Groupe d'équipages (type wm_work) qui couvre la localisation ou l'un de ses parents. */
    _equipageDe: function(locationId) {
        var lieux = this._localisationEtParents(locationId);
        for (var i = 0; i < lieux.length; i++) {
            var c = new GlideRecord('sys_group_covers_location');
            c.addQuery('location', lieux[i]);
            c.addQuery('group.active', true);
            c.addQuery('group.type', 'CONTAINS', this.TYPE_GROUPE_EQUIPAGE);
            c.setLimit(1);
            c.query();
            if (c.next())
                return c.getValue('group');
        }
        return '';
    },

    /** Membre actif du groupe qui a le moins de tâches FSM en cours (dispatch, assignée, acceptée, en cours). */
    _ambulancierDisponible: function(groupId) {
        var meilleur = '', min = -1;
        var m = new GlideRecord('sys_user_grmember');
        m.addQuery('group', groupId);
        m.addQuery('user.active', true);
        m.query();
        while (m.next()) {
            var n = new GlideAggregate('wm_task');
            n.addQuery('assigned_to', m.getValue('user'));
            n.addQuery('state', 'IN', '10,12,16,17,18');
            n.addAggregate('COUNT');
            n.query();
            var nb = n.next() ? parseInt(n.getAggregate('COUNT'), 10) : 0;
            if (min < 0 || nb < min) {
                min = nb;
                meilleur = m.getValue('user');
            }
        }
        return meilleur;
    },

    /**
     * Réserve une unité disponible de chaque équipement requis dans l'établissement de destination.
     * Retourne un texte pour le journal de la demande.
     */
    reserverEquipements: function(demande, etabId) {
        var modeles = demande.getValue('equipements_requis') ? demande.getValue('equipements_requis').split(',') : [];
        var etab = new GlideRecord(this.P + '_etablissement');
        if (!modeles.length || !etab.get(etabId))
            return '';
        var faits = [], manquants = [];
        for (var i = 0; i < modeles.length; i++) {
            var libres = this._unitesDisponibles(etab.getValue('location'), [modeles[i]], 1);
            if (libres.length) {
                this._reserver(libres[0], demande, 'equipement', etabId);
                faits.push(libres[0].model.getDisplayValue() + ' (' + libres[0].getValue('asset_tag') + ')');
            } else {
                var m = new GlideRecord('cmdb_model');
                manquants.push(m.get(modeles[i]) ? m.getDisplayValue() : modeles[i]);
            }
        }
        return (faits.length ? '\nÉquipements réservés : ' + faits.join(', ') + '.' : '') +
            (manquants.length ? '\nAttention, plus aucune unité libre : ' + manquants.join(', ') + ' — à confirmer avec l\'établissement.' : '');
    },

    /**
     * Réserve un véhicule sanitaire libre adapté au mode de transport, au plus près de l'établissement d'origine
     * (localisation de l'établissement, puis sa zone, puis la région). Retourne l'asset ou null.
     */
    affecterVehicule: function(demande) {
        var modeles = this._modelesVehicule(demande.getValue('mode_transport'));
        if (!modeles.length)
            return null;
        var lieux = this._localisationEtParents(demande.etablissement_origine.location + '');
        for (var i = 0; i < lieux.length; i++) {
            for (var m = 0; m < modeles.length; m++) {
                var libres = this._unitesDisponibles(lieux[i], [modeles[m]], 1);
                if (libres.length) {
                    this._reserver(libres[0], demande, 'vehicule', '');
                    return libres[0];
                }
            }
        }
        // Aucun véhicule dans la zone : n'importe quel véhicule libre de la région
        for (var k = 0; k < modeles.length; k++) {
            var ailleurs = this._unitesDisponibles(null, [modeles[k]], 1);
            if (ailleurs.length) {
                this._reserver(ailleurs[0], demande, 'vehicule', '');
                return ailleurs[0];
            }
        }
        return null;
    },

    /** Libère les réservations actives d'une demande (arrivée, annulation, expiration). */
    libererReservations: function(demande, motif) {
        var r = new GlideRecord(this.P + '_reservation');
        r.addQuery('demande', demande.getUniqueValue());
        r.addQuery('statut', 'active');
        r.query();
        var n = 0;
        while (r.next()) {
            r.setValue('statut', 'liberee');
            r.setValue('date_fin', new GlideDateTime());
            r.setValue('motif_liberation', motif);
            r.update();
            n++;
        }
        return n;
    },

    /**
     * Délai cible en minutes pour 'reponse' ou 'prise_en_charge' selon l'urgence : durée de la définition de SLA
     * active (source de vérité, modifiable par l'admin), sinon DELAIS_DEFAUT ; null si aucun délai.
     */
    delaiMin: function(type, urgence) {
        var cle = type + '|' + urgence;
        this._delais = this._delais || {};
        if (this._delais[cle] !== undefined)
            return this._delais[cle];
        var res = (this.DELAIS_DEFAUT[type] || {})[urgence];
        var nom = (this.SLA_NOMS[type] || {})[urgence];
        if (nom) {
            var s = new GlideRecord('contract_sla');
            s.addQuery('name', nom);
            s.addQuery('active', true);
            s.setLimit(1);
            s.query();
            if (s.next() && s.getValue('duration'))
                res = Math.round(new GlideDateTime(s.getValue('duration')).getNumericValue() / 60000);
        }
        this._delais[cle] = res === undefined ? null : res;
        return this._delais[cle];
    },

    /**
     * Itinéraire routier entre deux localisations par le service OSRM (données OpenStreetMap) :
     * { polyline (tracé encodé, précision 5), km, minutes (durée de conduite × coefficient de circulation) } ou null.
     * URL du service et coefficient : propriétés x_2218203_ptrans.itineraire.*.
     */
    calculerItineraire: function(locA, locB) {
        var a = new GlideRecord('cmn_location'), b = new GlideRecord('cmn_location');
        if (!locA || !locB || !a.get(locA) || !b.get(locB) || !a.getValue('latitude') || !b.getValue('latitude'))
            return null;
        var base = gs.getProperty(this.P + '.itineraire.osrm_url', 'https://router.project-osrm.org');
        var coef = parseFloat(gs.getProperty(this.P + '.itineraire.coefficient_circulation', '1.5')) || 1.5;
        var points = a.getValue('longitude') + ',' + a.getValue('latitude') + ';' + b.getValue('longitude') + ',' + b.getValue('latitude');
        var detail = ['full', 'simplified'];
        for (var i = 0; i < detail.length; i++) {
            try {
                var r = new sn_ws.RESTMessageV2();
                r.setHttpMethod('get');
                r.setEndpoint(base + '/route/v1/driving/' + points + '?overview=' + detail[i] + '&geometries=polyline');
                r.setHttpTimeout(8000);
                var rep = r.execute();
                if (rep.getStatusCode() != 200)
                    return null;
                var j = JSON.parse(rep.getBody());
                if (j.code != 'Ok' || !j.routes || !j.routes.length)
                    return null;
                var route = j.routes[0];
                if (route.geometry.length > 3990)
                    continue;
                return { polyline: route.geometry, km: Math.round(route.distance / 100) / 10,
                    minutes: Math.max(3, Math.round(route.duration / 60 * coef)) };
            } catch (e) {
                gs.warn('[Transfert Patients] Itinéraire indisponible : ' + e);
                return null;
            }
        }
        return null;
    },

    /**
     * Distance à vol d'oiseau (km, 1 décimale) entre deux localisations cmn_location (latitude / longitude),
     * formule de haversine ; null si une coordonnée manque.
     */
    distanceKm: function(locA, locB) {
        var a = new GlideRecord('cmn_location'), b = new GlideRecord('cmn_location');
        if (!locA || !locB || !a.get(locA) || !b.get(locB))
            return null;
        var la1 = parseFloat(a.getValue('latitude')), lo1 = parseFloat(a.getValue('longitude'));
        var la2 = parseFloat(b.getValue('latitude')), lo2 = parseFloat(b.getValue('longitude'));
        if (isNaN(la1) || isNaN(lo1) || isNaN(la2) || isNaN(lo2))
            return null;
        var rad = Math.PI / 180;
        var dLa = (la2 - la1) * rad, dLo = (lo2 - lo1) * rad;
        var h = Math.sin(dLa / 2) * Math.sin(dLa / 2) +
            Math.cos(la1 * rad) * Math.cos(la2 * rad) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
        return Math.round(6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)) * 10) / 10;
    },

    /** Durée de route estimée : distance × facteur de détour routier, à la vitesse moyenne urbaine (Dakar). */
    dureeRouteMin: function(km) {
        return Math.max(5, Math.round(km * this.FACTEUR_ROUTE / this.VITESSE_KMH * 60));
    },

    /** Répercute l'avancement du Work Order FSM sur la demande. */
    synchroniserDepuisWorkOrder: function(wo) {
        var dem = new GlideRecord(this.P + '_demande');
        dem.addQuery('work_order', wo.getUniqueValue());
        dem.query();
        if (!dem.next())
            return;
        var s = wo.getValue('state');
        if (s == '18' && dem.getValue('state') == '30') {
            dem.setValue('state', '40');
            dem.work_notes = 'Transport en cours (' + wo.getValue('number') + ').';
        } else if (s == '3') {
            dem.setValue('state', '3');
            dem.setValue('date_arrivee', new GlideDateTime());
            dem.work_notes = 'Patient arrivé à destination. Ordre ' + wo.getValue('number') + ' clôturé.';
        } else if (s == '4' || s == '7') {
            dem.work_notes = 'Attention : ordre de transport ' + wo.getValue('number') + ' ' + wo.getDisplayValue('state') + '.';
        } else {
            return;
        }
        dem.update();
    },

    /**
     * Republie une demande expirée : crée une nouvelle demande avec les mêmes informations (nouvelle date limite),
     * la publie aux établissements éligibles, relie les deux demandes et clôture les relances reçues.
     * Retourne la nouvelle demande, ou null si la demande n'est pas republiable.
     */
    republier: function(ancienne) {
        if (ancienne.getValue('state') != '4' || ancienne.getValue('republication'))
            return null;
        var champs = ['patient_reference', 'patient_age', 'patient_sexe', 'etablissement_origine', 'service_origine',
            'specialite_requise', 'niveau_soins', 'urgence_transfert', 'mode_transport', 'mobilite', 'equipements_requis',
            'date_souhaitee', 'telephone_contact', 'description', 'opened_by'];
        var nouvelle = new GlideRecord(this.P + '_demande');
        nouvelle.initialize();
        for (var i = 0; i < champs.length; i++)
            nouvelle.setValue(champs[i], ancienne.getValue(champs[i]));
        nouvelle.setValue('demande_precedente', ancienne.getUniqueValue());
        nouvelle.setValue('state', '1');
        var id = nouvelle.insert();
        if (!id)
            return null;
        nouvelle.work_notes = 'Republication de ' + ancienne.getValue('number') + ' par ' + gs.getUserDisplayName() + '.';
        nouvelle.setValue('state', '10');   // déclenche la publication aux établissements éligibles
        nouvelle.update();

        ancienne.setValue('republication', id);
        ancienne.work_notes = 'Republiée en ' + nouvelle.getValue('number') + ' par ' + gs.getUserDisplayName() + '.';
        ancienne.update();

        var rel = new GlideRecord(this.P + '_relance');
        rel.addQuery('demande', ancienne.getUniqueValue());
        rel.addQuery('statut', 'envoyee');
        rel.query();
        while (rel.next()) {
            rel.setValue('statut', 'traitee');
            rel.update();
        }
        return nouvelle;
    },

    /** Recalcule capacité et lits disponibles d'un établissement à partir de ses services actifs. */
    recalculerCapacite: function(etabId) {
        var agg = new GlideAggregate(this.P + '_service');
        agg.addQuery('etablissement', etabId);
        agg.addQuery('active', true);
        agg.addAggregate('SUM', 'lits_totaux');
        agg.addAggregate('SUM', 'lits_disponibles');
        agg.setGroup(false);
        agg.query();
        var total = 0, dispo = 0;
        if (agg.next()) {
            total = parseInt(agg.getAggregate('SUM', 'lits_totaux'), 10) || 0;
            dispo = parseInt(agg.getAggregate('SUM', 'lits_disponibles'), 10) || 0;
        }
        var etab = new GlideRecord(this.P + '_etablissement');
        if (etab.get(etabId)) {
            etab.setValue('capacite_totale', total);
            etab.setValue('lits_disponibles', dispo);
            etab.update();
        }
    },

    /** Met à jour le compteur d'acceptations de la demande. */
    compterAcceptations: function(demandeId) {
        var agg = new GlideAggregate(this.P + '_reponse');
        agg.addQuery('demande', demandeId);
        agg.addQuery('decision', 'IN', 'acceptee,retenue');
        agg.addAggregate('COUNT');
        agg.query();
        var n = agg.next() ? parseInt(agg.getAggregate('COUNT'), 10) : 0;
        var dem = new GlideRecord(this.P + '_demande');
        if (dem.get(demandeId)) {
            dem.setValue('nb_acceptations', n);
            if (n > 0 && !dem.getValue('date_premiere_acceptation'))
                dem.setValue('date_premiere_acceptation', new GlideDateTime());
            dem.update();
        }
    },

    /** Passe en "Expirée" les demandes publiées sans aucune acceptation après la date limite. */
    expirerDemandes: function() {
        var dem = new GlideRecord(this.P + '_demande');
        dem.addQuery('state', '10');
        dem.addQuery('date_limite_reponse', '<', new GlideDateTime());
        dem.addQuery('nb_acceptations', 0);
        dem.query();
        while (dem.next()) {
            var rep = new GlideRecord(this.P + '_reponse');
            rep.addQuery('demande', dem.getUniqueValue());
            rep.addQuery('decision', 'en_attente');
            rep.query();
            while (rep.next()) {
                rep.setValue('decision', 'expiree');
                rep.update();
            }
            dem.setValue('state', '4');
            dem.work_notes = 'Demande expirée : aucune acceptation avant la date limite.';
            dem.update();
        }
    },

    /** L'utilisateur courant coordonne-t-il cet établissement (coordinateur ou membre du groupe) ? */
    estCoordinateur: function(etabId) {
        var etab = new GlideRecord(this.P + '_etablissement');
        if (!etabId || !etab.get(etabId))
            return false;
        var uid = gs.getUserID();
        if (etab.getValue('coordinateur') == uid)
            return true;
        var grp = etab.getValue('groupe_coordination');
        if (!grp)
            return false;
        var m = new GlideRecord('sys_user_grmember');
        m.addQuery('user', uid);
        m.addQuery('group', grp);
        m.setLimit(1);
        m.query();
        return m.hasNext();
    },

    /** Liste (sys_ids) des établissements coordonnés par l'utilisateur courant — utilisée dans les filtres. */
    mesEtablissements: function() {
        return this._etablissementsDe(gs.getUserID()).join(',');
    },

    /**
     * Contexte du demandeur pour pré-remplir le formulaire : établissement, service et téléphone.
     * Ordre : responsable d'un service > coordinateur / membre du groupe de coordination
     *         > localisation de l'utilisateur (ou une localisation parente) = celle d'un établissement.
     */
    contexteDemandeur: function(userId) {
        var res = { etablissement: '', etablissement_nom: '', service: '', service_nom: '', telephone: '', source: '' };
        var user = new GlideRecord('sys_user');
        if (!user.get(userId))
            return res;

        var etab = new GlideRecord(this.P + '_etablissement');
        var svc = new GlideRecord(this.P + '_service');
        svc.addQuery('responsable', userId);
        svc.addQuery('active', true);
        svc.setLimit(1);
        svc.query();
        if (svc.next()) {
            etab.get(svc.getValue('etablissement'));
            res.service = svc.getUniqueValue();
            res.service_nom = svc.getValue('nom');
            res.source = 'responsable de service';
        } else {
            var ids = this._etablissementsDe(userId);
            if (ids.length) {
                etab.get(ids[0]);
                res.source = 'coordination';
            } else if (user.getValue('location')) {
                etab.addQuery('location', 'IN', this._localisationEtParents(user.getValue('location')).join(','));
                etab.addQuery('active', true);
                etab.query();
                if (etab.next())
                    res.source = 'localisation';
            }
        }
        if (etab.isValidRecord()) {
            res.etablissement = etab.getUniqueValue();
            res.etablissement_nom = etab.getValue('nom');
        }
        res.telephone = user.getValue('phone') || user.getValue('mobile_phone') ||
            (etab.isValidRecord() ? etab.getValue('telephone_regulation') : '') || '';
        return res;
    },

    /** Valeurs proposées pour une spécialité (configurées sur la fiche Spécialité). */
    suggestionsSpecialite: function(specialiteId) {
        var res = { niveau_soins: '', mode_transport: '', equipements: '', equipements_noms: '' };
        var spe = new GlideRecord(this.P + '_specialite');
        if (!specialiteId || !spe.get(specialiteId))
            return res;
        res.niveau_soins = spe.getValue('niveau_soins_defaut') || '';
        res.mode_transport = spe.getValue('mode_transport_defaut') || '';
        res.equipements = spe.getValue('equipements_defaut') || '';
        res.equipements_noms = spe.getDisplayValue('equipements_defaut') || '';
        return res;
    },

    /** Établissements coordonnés par un utilisateur (coordinateur nommé ou membre du groupe de coordination). */
    _etablissementsDe: function(userId) {
        var groupes = [];
        var m = new GlideRecord('sys_user_grmember');
        m.addQuery('user', userId);
        m.query();
        while (m.next())
            groupes.push(m.getValue('group'));
        var ids = [];
        var etab = new GlideRecord(this.P + '_etablissement');
        var q = etab.addQuery('coordinateur', userId);
        if (groupes.length)
            q.addOrCondition('groupe_coordination', 'IN', groupes.join(','));
        etab.orderBy('nom');
        etab.query();
        while (etab.next())
            ids.push(etab.getUniqueValue());
        return ids;
    },

    _localisationEtParents: function(locId) {
        var ids = [], vus = {};
        var loc = new GlideRecord('cmn_location');
        while (locId && !vus[locId] && loc.get(locId)) {
            vus[locId] = true;
            ids.push(locId);
            locId = loc.getValue('parent');
        }
        return ids;
    },

    /** Chaque modèle requis a-t-il au moins le minimum d'unités libres (règle d'équipement, 1 par défaut) ? */
    _equipementsDisponibles: function(locationId, modeles) {
        for (var i = 0; i < modeles.length; i++) {
            var min = this._quantiteMinimum(modeles[i]);
            if (this._unitesDisponibles(locationId, [modeles[i]], min).length < min)
                return false;
        }
        return true;
    },

    /**
     * Assets utilisables (En service / En stock, hors sous-statuts en réparation ou défectueux) d'un des modèles,
     * à la localisation donnée (null = toutes), sans réservation active. Retourne au plus `max` GlideRecord.
     */
    _unitesDisponibles: function(locationId, modeles, max) {
        var res = [];
        var a = new GlideRecord('alm_asset');
        a.addQuery('model', 'IN', modeles.join(','));
        if (locationId)
            a.addQuery('location', locationId);
        a.addQuery('install_status', 'IN', '1,6');
        a.addEncodedQuery('substatusNOT INin_repair,defective,pending_repair,reserved^ORsubstatusISEMPTY');
        a.orderBy('asset_tag');
        a.query();
        while (a.next() && res.length < max) {
            var r = new GlideRecord(this.P + '_reservation');
            r.addQuery('asset', a.getUniqueValue());
            r.addQuery('statut', 'active');
            r.setLimit(1);
            r.query();
            if (!r.hasNext()) {
                var copie = new GlideRecord('alm_asset');
                copie.get(a.getUniqueValue());
                res.push(copie);
            }
        }
        return res;
    },

    _quantiteMinimum: function(modeleId) {
        var r = new GlideRecord(this.P + '_regle_equipement');
        r.addQuery('modele', modeleId);
        r.addQuery('active', true);
        r.setLimit(1);
        r.query();
        return r.next() ? Math.max(parseInt(r.getValue('quantite_minimum'), 10) || 1, 1) : 1;
    },

    /** Modèles de véhicule acceptables par mode de transport, du plus adapté au plus équipé. */
    _modelesVehicule: function(mode) {
        var noms = {
            vsl: ['Véhicule sanitaire léger (VSL)', 'Ambulance'],
            ambulance: ['Ambulance', 'Ambulance de réanimation (SMUR)'],
            smur: ['Ambulance de réanimation (SMUR)']
        }[mode] || [];
        var ids = [];
        for (var i = 0; i < noms.length; i++) {
            var m = new GlideRecord('cmdb_model');
            if (m.get('name', noms[i]))
                ids.push(m.getUniqueValue());
        }
        return ids;
    },

    _reserver: function(asset, demande, type, etabId) {
        var r = new GlideRecord(this.P + '_reservation');
        r.initialize();
        r.setValue('asset', asset.getUniqueValue());
        r.setValue('demande', demande.getUniqueValue());
        r.setValue('type_reservation', type);
        if (etabId)
            r.setValue('etablissement', etabId);
        r.setValue('statut', 'active');
        r.setValue('date_debut', new GlideDateTime());
        return r.insert();
    },

    _reponseExiste: function(demandeId, etabId) {
        var r = new GlideRecord(this.P + '_reponse');
        r.addQuery('demande', demandeId);
        r.addQuery('etablissement', etabId);
        r.setLimit(1);
        r.query();
        return r.hasNext();
    },

    _dateLimite: function(urgence) {
        var gdt = new GlideDateTime();
        var minutes = this.delaiMin('reponse', urgence) || 1440;
        gdt.addSeconds(minutes * 60);
        return gdt;
    },

    type: 'TransfertUtils'
};
