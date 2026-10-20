/**
 * Données et actions du portail Transferts (widgets x_2218203_ptrans).
 * Toutes les actions vérifient les droits ici : coordinateur de l'établissement, demandeur ou régulateur.
 */
var TransfertPortail = Class.create();
TransfertPortail.prototype = {
    P: 'x_2218203_ptrans',
    ETAPES: ['Brouillon', 'Publiée', 'Destination retenue', 'Transport planifié', 'En transit', 'Arrivé'],
    INDEX_ETAT: { '1': 0, '10': 1, '20': 2, '30': 3, '40': 4, '3': 6 },

    initialize: function() {
        this.u = new x_2218203_ptrans.TransfertUtils();
        this.uid = gs.getUserID();
        this.regulateur = gs.hasRole(this.P + '.regulateur') || gs.hasRole(this.P + '.admin');
        this.ambulancier = gs.hasRole(this.P + '.ambulancier');
        // Deux notions distinctes :
        //  - etabsCoordonnes : établissements que l'utilisateur coordonne → répondre, lits, demandes reçues
        //  - etabIds : établissements auxquels il est rattaché (coordination ou profil d'agent) → demandes émises, arrivées, lecture
        this.etabsCoordonnes = this.u._etablissementsDe(this.uid);
        this.etabIds = this.etabsCoordonnes.slice();
        var ctx = this.u.contexteDemandeur(this.uid);
        if (ctx.etablissement && this.etabIds.indexOf(ctx.etablissement) < 0)
            this.etabIds.push(ctx.etablissement);
    },

    // ---------- Contexte ----------
    contexte: function() {
        var etabs = [];
        for (var i = 0; i < this.etabIds.length; i++) {
            var e = new GlideRecord(this.P + '_etablissement');
            if (e.get(this.etabIds[i]))
                etabs.push({ id: e.getUniqueValue(), nom: e.getValue('nom'), quartier: e.location.city + '' });
        }
        var user = new GlideRecord('sys_user');
        user.get(this.uid);
        var nom = user.getDisplayValue() || user.getValue('user_name') || '';
        var initiales = nom.split(' ').map(function(m) { return m.charAt(0); }).join('').substring(0, 2).toUpperCase();
        return {
            utilisateur: nom, initiales: initiales, etablissements: etabs, regulateur: this.regulateur,
            coordinateur: this.etabsCoordonnes.length > 0,
            agent: this.etabIds.length > 0 && this.etabsCoordonnes.length === 0,
            ambulancier: this.ambulancier,
            // Ambulancier sans autre rôle de l'application : le portail se limite à « Mes missions »
            ambulancierSeul: this.ambulancier && !this.regulateur && !this.etabIds.length &&
                !gs.hasRole(this.P + '.coordinateur') && !gs.hasRole(this.P + '.demandeur'),
            producteur: this.ambulancier && !this.regulateur && !this.etabIds.length ? '' : this._producteurId()
        };
    },

    // ---------- Accueil ----------
    accueil: function() {
        var ctx = this.contexte();
        var aTraiter = this.aTraiter();
        var plusUrgente = null;
        for (var i = 0; i < aTraiter.length; i++)
            if (plusUrgente === null || aTraiter[i].minutes < plusUrgente)
                plusUrgente = aTraiter[i].minutes;
        var arrivees = this.arrivees();
        var lits = 0, total = 0, nbSvc = 0;
        var s = this._services();
        while (s.next()) {
            lits += parseInt(s.getValue('lits_disponibles'), 10) || 0;
            total += parseInt(s.getValue('lits_totaux'), 10) || 0;
            nbSvc++;
        }
        var emises = this.mesDemandes(), enAttente = 0, enCours = 0;
        for (var j = 0; j < emises.length; j++) {
            if (emises[j].actif) enCours++;
            if (emises[j].etatValeur == '10') enAttente++;
        }
        return {
            contexte: ctx,
            titre: ctx.etablissements.length ? ctx.etablissements[0].nom : ctx.utilisateur,
            sousTitre: ctx.etablissements.length ? ctx.etablissements[0].nom + ' · ' + ctx.etablissements[0].quartier : '',
            kpis: {
                aTraiter: aTraiter.length, plusUrgente: plusUrgente === null ? '' : this._duree(plusUrgente),
                enRoute: arrivees.length, enRouteNumero: arrivees.length ? arrivees[0].numero : '',
                lits: lits, total: total, services: nbSvc, emises: enCours, emisesAttente: enAttente
            }
        };
    },

    /** Réponses « En attente » des établissements de l'utilisateur, sur des demandes publiées. */
    aTraiter: function() {
        var out = [];
        if (!this.etabsCoordonnes.length)
            return out;
        var r = new GlideRecord(this.P + '_reponse');
        r.addQuery('etablissement', 'IN', this.etabsCoordonnes.join(','));
        r.addQuery('decision', 'en_attente');
        r.addQuery('demande.state', '10');
        r.query();
        while (r.next()) {
            var d = r.demande.getRefRecord();
            var item = this._resume(d);
            item.reponseId = r.getUniqueValue();
            item.etablissement = r.getDisplayValue('etablissement');
            item.serviceId = r.getValue('service_propose');
            item.distance = this._distance(r);
            item.services = this._servicesPossibles(r.getValue('etablissement'), d.getValue('specialite_requise'));
            out.push(item);
        }
        out.sort(function(a, b) { return a.minutes - b.minutes; });
        return out;
    },

    /** Demandes émises par l'utilisateur ou par ses établissements. */
    mesDemandes: function(limite) {
        var out = [];
        var d = new GlideRecord(this.P + '_demande');
        var q = d.addQuery('opened_by', this.uid);
        if (this.etabIds.length)
            q.addOrCondition('etablissement_origine', 'IN', this.etabIds.join(','));
        d.orderByDesc('sys_created_on');
        d.setLimit(limite || 10);
        d.query();
        while (d.next())
            out.push(this._resume(d));
        return out;
    },

    /** Services des établissements de l'utilisateur avec leur capacité. */
    capacite: function() {
        var out = [];
        var s = this._services();
        while (s.next()) {
            var tot = parseInt(s.getValue('lits_totaux'), 10) || 0, dis = parseInt(s.getValue('lits_disponibles'), 10) || 0;
            out.push({ id: s.getUniqueValue(), nom: s.getValue('nom'), etablissement: s.getDisplayValue('etablissement'),
                dispo: dis, total: tot, pct: tot ? Math.round(dis * 100 / tot) : 0, bas: dis <= 1,
                majPar: s.getDisplayValue('sys_updated_by'), majLe: this._heure(s.getValue('sys_updated_on')) });
        }
        return out;
    },

    /** Patients attendus : demandes à destination des établissements de l'utilisateur, transport planifié ou en transit. */
    arrivees: function() {
        var out = [];
        if (!this.etabIds.length)
            return out;
        var d = new GlideRecord(this.P + '_demande');
        d.addQuery('etablissement_destination', 'IN', this.etabIds.join(','));
        d.addQuery('state', 'IN', '20,30,40');
        d.orderBy('urgence_transfert');
        d.query();
        while (d.next()) {
            var item = this._resume(d);
            item.transport = this._transport(d);
            out.push(item);
        }
        return out;
    },

    // ---------- Liste ----------
    liste: function(onglet) {
        var out = [];
        if (onglet == 'emises') {
            var em = this.mesDemandes(50);
            for (var i = 0; i < em.length; i++)
                if (em[i].actif) out.push(em[i]);
            return out;
        }
        if (onglet == 'historique') {
            var h = this.mesDemandes(50);
            for (var k = 0; k < h.length; k++)
                if (!h[k].actif) out.push(h[k]);
            return out;
        }
        if (!this.etabsCoordonnes.length)
            return out;
        var r = new GlideRecord(this.P + '_reponse');
        r.addQuery('etablissement', 'IN', this.etabsCoordonnes.join(','));
        r.orderByDesc('sys_created_on');
        r.setLimit(50);
        r.query();
        while (r.next()) {
            var item = this._resume(r.demande.getRefRecord());
            item.reponse = r.getDisplayValue('decision');
            item.reponseValeur = r.getValue('decision');
            item.motif = r.getDisplayValue('motif_refus');
            item.aRepondre = r.getValue('decision') == 'en_attente' && item.etatValeur == '10';
            item.aRelancer = r.getValue('decision') == 'expiree' && item.etatValeur == '4' && r.demande.republication.nil();
            out.push(item);
        }
        return out;
    },

    // ---------- Mes missions (ambulancier) ----------
    // State flows OOTB de wm_task (mêmes transitions que Field Service et son application mobile)
    FLOWS_TACHE: {
        accepter: ['53d0aea8d7230100fceaa6859e610326', 'e5dd8693d7502100bbc783e80e6103f3'],
        refuser: ['2a02ee60d7630100fceaa6859e610378'],
        trajet: ['a60426a0d7630100fceaa6859e6103e3'],
        demarrer: ['b48e00ead7201100158ba6859e6103c7'],
        terminer: ['6c1f62e0d7630100fceaa6859e610381'],
        sur_place: ['aaa8af4d77d121104fcd79207b5a99bf'],
        incomplete: ['41dfa2e0d7630100fceaa6859e61035d']
    },

    /**
     * Missions de l'ambulancier connecté : un transfert par Work Order dont il a des tâches (en cours, ou terminées
     * aujourd'hui), avec patient, trajet, minuteur, étapes et prochaine action.
     */
    missions: function() {
        var parWo = {}, ordre = [];
        var t = new GlideRecord('wm_task');
        t.addQuery('assigned_to', this.uid);
        t.addEncodedQuery('stateNOT IN3,4,7^ORclosed_atONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()');
        t.orderBy('number');
        t.query();
        while (t.next()) {
            var wo = t.getValue('parent');
            if (!parWo[wo]) { parWo[wo] = true; ordre.push(wo); }
        }
        var res = { missions: [], terminees: 0, dansLesDelais: 0, maintenantMs: new GlideDateTime().getNumericValue() };
        for (var i = 0; i < ordre.length; i++) {
            var d = new GlideRecord(this.P + '_demande');
            d.addQuery('work_order', ordre[i]);
            d.setLimit(1);
            d.query();
            if (!d.next())
                continue;
            var m = this._mission(d);
            if (m.terminee) {
                res.terminees++;
                if (m.dansLeDelai) res.dansLesDelais++;
            }
            res.missions.push(m);
        }
        var rang = function(x) { return x.terminee ? 9 : (x.action && x.action.code == 'accepter' ? 0 : 1); };
        res.missions.sort(function(a, b) { return rang(a) - rang(b) || (a.urgence + '').localeCompare(b.urgence + ''); });
        return res;
    },

    _mission: function(d) {
        var m = this._resume(d);
        m.mobilite = d.getDisplayValue('mobilite');
        m.modeTransport = d.getDisplayValue('mode_transport');
        m.service = d.getDisplayValue('service_destination');
        m.trajet = this._trajet(d);
        m.taches = [];
        var t = new GlideRecord('wm_task');
        t.addQuery('parent', d.getValue('work_order'));
        t.orderBy('number');
        t.query();
        while (t.next())
            m.taches.push({ id: t.getUniqueValue(), numero: t.getValue('number'), nom: t.getValue('short_description').split(' — ')[0],
                lieu: t.getDisplayValue('location'), etat: t.getValue('state'), etatLabel: t.getDisplayValue('state'),
                aMoi: t.getValue('assigned_to') == this.uid, depart: !!t.getValue('actual_travel_start'),
                surPlace: !!t.getValue('actual_onsite_arrival'),
                jalons: [
                    { nom: 'En route vers ' + d.getDisplayValue('etablissement_origine'), heure: this._hm(this._ms(t.getValue('actual_travel_start'))) },
                    { nom: 'Sur place', heure: this._hm(this._ms(t.getValue('actual_onsite_arrival'))) },
                    { nom: 'Patient pris en charge', heure: this._hm(this._ms(t.getValue('work_start'))) },
                    { nom: 'Patient remis · ' + d.getDisplayValue('etablissement_destination'), heure: this._hm(this._ms(t.getValue('work_end'))) }
                ],
                prevu: t.getValue('expected_start') ? this._hm(this._ms(t.getValue('expected_start'))) : '',
                debut: this._hm(this._ms(t.getValue('work_start'))), fin: this._hm(this._ms(t.getValue('work_end'))),
                dureeMin: Math.round(this._dureeMs(t.getValue('estimated_work_duration')) / 60000) });
        var tr = this._transport(d);
        m.equipements = tr ? tr.equipements : [];
        m.equipementsTexte = m.equipements.map(function(e) { return e.nom + ' (' + e.tag + ')'; }).join(', ');
        m.vehicule = tr && tr.vehicule ? tr.vehicule.nom + ' · ' + tr.vehicule.tag : '';
        m.terminee = d.getValue('state') == '3' || m.taches.every(function(x) { return ['3', '4', '7'].indexOf(x.etat) > -1; });
        m.dansLeDelai = m.terminee && (m.mt && m.mt.bilan || []).every(function(b) { return b.ok; });
        m.action = m.terminee ? null : this._prochaineAction(m.taches);
        return m;
    },

    /** Prochaine action de l'ambulancier selon l'état des 3 tâches (préparation, transport, remise). */
    _prochaineAction: function(t) {
        if (t.length == 1) {
            // Tâche unique « Transport du patient »
            var x = t[0];
            if (!x.aMoi)
                return { code: 'aucune', libelle: 'Mission réaffectée par le dispatch', inactif: true };
            if (x.etat == '16')
                return { code: 'accepter', libelle: 'Accepter la mission', secondaire: 'refuser' };
            if (x.etat == '17' && !x.depart)
                return { code: 'partir', libelle: 'Je pars vers ' + x.lieu };
            if (x.etat == '17' && !x.surPlace)
                return { code: 'sur_place', libelle: 'Arrivé à ' + x.lieu };
            if (x.etat == '17')
                return { code: 'prise_en_charge', libelle: 'Patient pris en charge : départ' };
            if (x.etat == '18')
                return { code: 'terminer', libelle: 'Terminer : patient remis', note: true, secondaire: 'incomplete' };
            return null;
        }
        if (t.length < 3)
            return null;
        var p = t[0], tr = t[1], r = t[2];
        var mien = function(x) { return x.aMoi; };
        if (!t.every(mien))
            return { code: 'aucune', libelle: 'Mission réaffectée par le dispatch', inactif: true };
        if (t.some(function(x) { return x.etat == '16'; }))
            return { code: 'accepter', libelle: 'Accepter la mission', secondaire: 'refuser' };
        if (p.etat == '17' && !p.depart)
            return { code: 'partir', libelle: 'Je pars vers ' + p.lieu };
        if (p.etat == '17')
            return { code: 'sur_place', libelle: 'Arrivé à ' + p.lieu };
        if (p.etat == '18')
            return { code: 'prise_en_charge', libelle: 'Patient pris en charge', secondaire: 'incomplete' };
        if (tr.etat == '17')
            return { code: 'prise_en_charge', libelle: 'Patient pris en charge', secondaire: 'incomplete' };
        if (tr.etat == '18')
            return { code: 'arrive', libelle: 'Arrivé à ' + r.lieu, secondaire: 'incomplete' };
        if (r.etat == '17')
            return { code: 'arrive', libelle: 'Arrivé à ' + r.lieu, secondaire: 'incomplete' };
        if (r.etat == '18')
            return { code: 'terminer', libelle: 'Terminer : patient remis', note: true, secondaire: 'incomplete' };
        return null;
    },

    /**
     * Applique une action de l'ambulancier par les state flows OOTB, uniquement sur SES tâches de la mission.
     * Les contrôles Field Service s'appliquent (assigné = utilisateur courant, note obligatoire à la clôture).
     */
    actionMission: function(demandeId, code, note) {
        var d = new GlideRecord(this.P + '_demande');
        if (!this.ambulancier || !demandeId || !d.get(demandeId))
            return { ok: false, message: 'Action non autorisée.' };
        var m = this._mission(d);
        var act = m.action;
        var autorisee = act && (act.code == code || act.secondaire == code);
        if (!autorisee)
            return { ok: false, message: 'Cette action n\'est plus possible : la mission a changé, la page est rafraîchie.' };
        if ((code == 'terminer' || code == 'incomplete' || code == 'refuser') && !(note || '').trim())
            return { ok: false, message: code == 'terminer' ? 'Ajoutez une note de remise.' : 'Indiquez un motif.' };
        var t = m.taches, ok = true;
        if (t.length == 1) {
            var flux = { accepter: 'accepter', refuser: 'refuser', partir: 'trajet', sur_place: 'sur_place', prise_en_charge: 'demarrer',
                terminer: 'terminer', incomplete: 'incomplete' }[code];
            var texte = code == 'refuser' ? 'Mission refusée : ' + note : (code == 'incomplete' ? 'Clôture incomplète : ' + note : (code == 'terminer' ? note : ''));
            ok = flux ? this._flux(t[0].id, flux, texte) : false;
            return ok ? { ok: true, message: { accepter: 'Mission acceptée.', refuser: 'Mission refusée : le dispatch est prévenu.', partir: 'Départ enregistré.',
                sur_place: 'Arrivée sur place enregistrée.', prise_en_charge: 'Patient pris en charge : transport en cours.',
                terminer: 'Mission terminée.', incomplete: 'Mission clôturée incomplète.' }[code] }
                : { ok: false, message: 'Field Service a refusé l\'action (vérifiez que la tâche vous est assignée).' };
        }
        var faire = function(self, tache, flux, texte) {
            if (!ok) return;
            ok = self._flux(tache.id, flux, texte);
        };
        if (code == 'accepter')
            for (var i = 0; i < t.length; i++) { if (t[i].etat == '16') faire(this, t[i], 'accepter'); }
        else if (code == 'refuser')
            for (var j = 0; j < t.length; j++) { if (t[j].etat == '16') faire(this, t[j], 'refuser', 'Mission refusée : ' + note); }
        else if (code == 'partir')
            faire(this, t[0], 'trajet');
        else if (code == 'sur_place')
            faire(this, t[0], 'demarrer');
        else if (code == 'prise_en_charge') {
            if (t[0].etat == '18') faire(this, t[0], 'terminer', 'Patient pris en charge par l\'équipage.');
            if (t[1].etat == '17') faire(this, t[1], 'demarrer');
        } else if (code == 'arrive') {
            if (t[1].etat == '18') faire(this, t[1], 'terminer', 'Arrivé à destination.');
            if (t[2].etat == '17') faire(this, t[2], 'demarrer');
        } else if (code == 'terminer')
            faire(this, t[2], 'terminer', note);
        else if (code == 'incomplete') {
            var cours = t.filter(function(x) { return x.etat == '18'; })[0];
            if (!cours) return { ok: false, message: 'Aucune étape en cours à clôturer.' };
            faire(this, cours, 'incomplete', 'Clôture incomplète : ' + note);
        }
        return ok ? { ok: true, message: { accepter: 'Mission acceptée.', refuser: 'Mission refusée : le dispatch est prévenu.', partir: 'Départ enregistré.',
            sur_place: 'Arrivée sur place enregistrée.', prise_en_charge: 'Patient pris en charge : transport démarré.',
            arrive: 'Arrivée enregistrée : remise du patient.', terminer: 'Mission terminée.', incomplete: 'Étape clôturée incomplète.' }[code] }
            : { ok: false, message: 'Field Service a refusé l\'action (vérifiez que la tâche vous est assignée).' };
    },

    _flux: function(tacheId, action, note) {
        var t = new GlideRecord('wm_task');
        if (!t.get(tacheId) || t.getValue('assigned_to') != this.uid)
            return false;
        var avant = t.getValue('state') + '|' + t.getValue('actual_travel_start') + '|' + t.getValue('actual_onsite_arrival');
        var sf = new global.StateFlow(), ids = this.FLOWS_TACHE[action];
        for (var i = 0; i < ids.length; i++) {
            try {
                if (sf.validFlow(t, ids[i], 'manual')) {
                    // La note part dans la même mise à jour que la transition (FSM exige une note de travail à la clôture)
                    if (note)
                        t.work_notes = note;
                    // Check-In OOTB ne renseigne pas l'heure d'arrivée sur site : on la pose dans la même mise à jour
                    if (action == 'sur_place' && !t.getValue('actual_onsite_arrival'))
                        t.setValue('actual_onsite_arrival', new GlideDateTime());
                    sf.processFlow(t, ids[i], 'manual');
                    var verif = new GlideRecord('wm_task');
                    verif.get(tacheId);
                    if (verif.getValue('state') + '|' + verif.getValue('actual_travel_start') + '|' + verif.getValue('actual_onsite_arrival') == avant) {
                        gs.warn('[Transfert Patients] Mission : ' + action + ' sans effet sur ' + t.getValue('number'));
                        return false;
                    }
                    return true;
                }
            } catch (e) {
                gs.warn('[Transfert Patients] Mission : action ' + action + ' refusée sur ' + t.getValue('number') + ' : ' + e);
                return false;
            }
        }
        return false;
    },

    // ---------- Carte des hôpitaux ----------
    /**
     * Données de la page Carte : hôpitaux (coordonnées, lits par service, équipements libres), ambulances libres
     * par zone et transferts en cours. Hôpitaux et lits : tous les utilisateurs du portail ; ambulances et
     * transferts : régulateur (tous) et coordinateurs (ceux de leurs établissements).
     */
    carte: function() {
        var P = this.P, res = { hopitaux: [], zones: [], transferts: [], specialites: [],
            detaille: this.regulateur || this.etabsCoordonnes.length > 0, maintenantMs: new GlideDateTime().getNumericValue() };
        var sp = new GlideRecord(P + '_specialite');
        sp.addQuery('active', true);
        sp.orderBy('nom');
        sp.query();
        while (sp.next())
            res.specialites.push({ id: sp.getUniqueValue(), nom: sp.getValue('nom') });

        var modeles = {};
        var m = new GlideRecord('cmdb_model');
        m.addQuery('short_description', 'CONTAINS', 'transfert patients');
        m.query();
        while (m.next())
            modeles[m.getUniqueValue()] = m.getValue('name');

        var zones = {};
        var e = new GlideRecord(P + '_etablissement');
        e.addQuery('active', true);
        e.orderBy('nom');
        e.query();
        while (e.next()) {
            var loc = e.location.getRefRecord();
            var lat = parseFloat(loc.getValue('latitude')), lon = parseFloat(loc.getValue('longitude'));
            if (isNaN(lat) || isNaN(lon))
                continue;
            var h = { id: e.getUniqueValue(), nom: e.getValue('nom'), type: e.getDisplayValue('type_etablissement'),
                lat: lat, lon: lon, adresse: [loc.getValue('street'), loc.getValue('city')].join(', '),
                telephone: e.getValue('telephone_regulation') || loc.getValue('phone') || '',
                zone: loc.parent.getDisplayValue(), accepte: e.getValue('accepte_transferts') == '1' || e.getValue('accepte_transferts') == 'true',
                mien: this.etabIds.indexOf(e.getUniqueValue()) > -1,
                lits: parseInt(e.getValue('lits_disponibles'), 10) || 0, total: parseInt(e.getValue('capacite_totale'), 10) || 0,
                services: [], equipements: [] };
            var s = new GlideRecord(P + '_service');
            s.addQuery('etablissement', e.getUniqueValue());
            s.addQuery('active', true);
            s.orderBy('nom');
            s.query();
            while (s.next())
                h.services.push({ nom: s.getValue('nom'), specialite: s.getValue('specialite'),
                    lits: parseInt(s.getValue('lits_disponibles'), 10) || 0, total: parseInt(s.getValue('lits_totaux'), 10) || 0 });
            for (var mid in modeles) {
                var libres = this.u._unitesDisponibles(e.getValue('location'), [mid], 50).length;
                if (libres || this._possede(e.getValue('location'), mid))
                    h.equipements.push({ nom: modeles[mid], libres: libres });
            }
            res.hopitaux.push(h);
            var z = loc.getValue('parent');
            if (z) {
                zones[z] = zones[z] || { id: z, nom: loc.parent.getDisplayValue().replace(/^Zone /, ''), lat: 0, lon: 0, n: 0 };
                zones[z].lat += lat;
                zones[z].lon += lon;
                zones[z].n++;
            }
        }

        if (res.detaille) {
            // Ambulances libres par zone, positionnées au centre des hôpitaux de la zone
            var vehicules = [];
            var vm = new GlideRecord('cmdb_model');
            vm.addQuery('short_description', 'CONTAINS', 'Véhicule sanitaire');
            vm.query();
            while (vm.next())
                vehicules.push({ id: vm.getUniqueValue(), nom: vm.getValue('name') });
            for (var zid in zones) {
                var zone = zones[zid];
                var item = { nom: zone.nom, lat: zone.lat / zone.n, lon: zone.lon / zone.n, vehicules: [], libres: 0 };
                for (var v = 0; v < vehicules.length; v++) {
                    var nb = this.u._unitesDisponibles(zid, [vehicules[v].id], 50).length;
                    item.vehicules.push({ nom: vehicules[v].nom, libres: nb });
                    item.libres += nb;
                }
                res.zones.push(item);
            }
            // Transferts en cours (retenue → en transit)
            var d = new GlideRecord(P + '_demande');
            d.addQuery('state', 'IN', '20,30,40');
            if (!this.regulateur) {
                var mes = this.etabsCoordonnes.join(',');
                d.addEncodedQuery('etablissement_origineIN' + mes + '^ORetablissement_destinationIN' + mes);
            }
            d.query();
            while (d.next()) {
                var o = d.etablissement_origine.location.getRefRecord(), dst = d.etablissement_destination.location.getRefRecord();
                if (!o.getValue('latitude') || !dst.getValue('latitude'))
                    continue;
                res.transferts.push({ id: d.getUniqueValue(), numero: d.getValue('number'), urgence: d.getValue('urgence_transfert'),
                    urgenceLabel: (d.getDisplayValue('urgence_transfert') || '').split(' (')[0], etat: d.getDisplayValue('state'),
                    origine: d.getDisplayValue('etablissement_origine'), destination: d.getDisplayValue('etablissement_destination'),
                    de: [parseFloat(o.getValue('latitude')), parseFloat(o.getValue('longitude'))],
                    vers: [parseFloat(dst.getValue('latitude')), parseFloat(dst.getValue('longitude'))],
                    vehicule: d.getValue('vehicule') ? d.vehicule.asset_tag + '' : '', mt: this._minuteur(d) });
            }
        }
        return res;
    },

    /** Trajet origine → destination pour la carte de la demande (après la retenue). */
    _trajet: function(d) {
        if (['20', '30', '40', '3'].indexOf(d.getValue('state')) < 0 || !d.getValue('etablissement_destination'))
            return null;
        var o = d.etablissement_origine.location.getRefRecord(), v = d.etablissement_destination.location.getRefRecord();
        if (!o.getValue('latitude') || !v.getValue('latitude'))
            return null;
        var de = [parseFloat(o.getValue('latitude')), parseFloat(o.getValue('longitude'))];
        var vers = [parseFloat(v.getValue('latitude')), parseFloat(v.getValue('longitude'))];
        return { de: de, vers: vers, origine: d.getDisplayValue('etablissement_origine'), destination: d.getDisplayValue('etablissement_destination'),
            service: d.getDisplayValue('service_destination'), polyline: d.getValue('itineraire') || '',
            km: d.getValue('distance_route_km') ? (Math.round(parseFloat(d.getValue('distance_route_km')) * 10) / 10 + '').replace('.', ',') : '',
            minutes: d.getValue('duree_route_min') || '', arrive: d.getValue('state') == '3',
            vehicule: d.getValue('vehicule') ? d.vehicule.model.getDisplayValue() + ' · ' + d.vehicule.asset_tag : '',
            osm: 'https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=' + de.join('%2C') + '%3B' + vers.join('%2C') };
    },

    _possede: function(locationId, modeleId) {
        var a = new GlideRecord('alm_asset');
        a.addQuery('location', locationId);
        a.addQuery('model', modeleId);
        a.setLimit(1);
        a.query();
        return a.hasNext();
    },

    // ---------- Détail d'une demande ----------
    detail: function(demandeId) {
        var d = new GlideRecord(this.P + '_demande');
        if (!demandeId || !d.get(demandeId))
            return { introuvable: true };
        if (!this._peutVoir(d))
            return { interdit: true };
        var res = this._resume(d);
        var etat = d.getValue('state');
        res.etapes = this._etapes(d);
        res.infos = [
            { k: 'Référence patient', v: d.getValue('patient_reference') },
            { k: 'Âge · sexe', v: (d.getValue('patient_age') ? d.getValue('patient_age') + ' ans' : '—') + ' · ' + (d.getDisplayValue('patient_sexe') || '—') },
            { k: 'Niveau de soins', v: d.getDisplayValue('niveau_soins') || '—' },
            { k: 'Mobilité', v: d.getDisplayValue('mobilite') || '—' },
            { k: 'Mode de transport', v: d.getDisplayValue('mode_transport') || '—' },
            { k: 'Équipements requis', v: d.getDisplayValue('equipements_requis') || 'Aucun' },
            { k: d.getValue('service_destination') ? 'Service retenu' : 'Service d\'origine',
              v: d.getDisplayValue(d.getValue('service_destination') ? 'service_destination' : 'service_origine') || '—' },
            { k: 'Date souhaitée', v: d.getDisplayValue('date_souhaitee') || 'Dès que possible' }
        ];
        res.motif = d.getValue('description') || '';
        res.demandeur = d.getDisplayValue('opened_by');
        res.telephone = d.getValue('telephone_contact') || d.etablissement_origine.telephone_regulation + '';
        res.parcours = this._parcours(d);
        res.transport = this._transport(d);
        res.trajet = this._trajet(d);
        res.limite = d.getValue('date_limite_reponse') ? this._heure(d.getValue('date_limite_reponse')) : '';
        // Compte à rebours en temps réel côté navigateur : échéance et heure du serveur en ms (UTC)
        res.limiteMs = d.getValue('date_limite_reponse') ? new GlideDateTime(d.getValue('date_limite_reponse')).getNumericValue() : null;
        res.maintenantMs = new GlideDateTime().getNumericValue();

        // Réponse de l'établissement de l'utilisateur
        var r = new GlideRecord(this.P + '_reponse');
        r.addQuery('demande', d.getUniqueValue());
        r.addQuery('etablissement', 'IN', this.etabsCoordonnes.join(',') || 'aucun');
        r.setLimit(1);
        r.query();
        if (r.next()) {
            res.maReponse = {
                id: r.getUniqueValue(), decision: r.getValue('decision'), decisionLabel: r.getDisplayValue('decision'),
                etablissement: r.getDisplayValue('etablissement'), serviceId: r.getValue('service_propose'),
                motif: r.getValue('motif_refus'), commentaire: r.getValue('commentaire'),
                arrivee: r.getDisplayValue('heure_arrivee_possible'),
                modifiable: etat == '10' && r.getValue('decision') == 'en_attente'
            };
            res.services = this._servicesPossibles(r.getValue('etablissement'), d.getValue('specialite_requise'));
        }
        res.motifs = this._choix(this.P + '_reponse', 'motif_refus');

        // Vue régulation : toutes les réponses
        if (this.regulateur) {
            res.reponses = [];
            var delaiPec = this.u.delaiMin('prise_en_charge', d.getValue('urgence_transfert'));
            var all = new GlideRecord(this.P + '_reponse');
            all.addQuery('demande', d.getUniqueValue());
            all.orderBy('etablissement.nom');
            all.query();
            while (all.next())
                res.reponses.push({
                    id: all.getUniqueValue(), etablissement: all.getDisplayValue('etablissement'),
                    zone: all.etablissement.location.parent.getDisplayValue(),
                    decision: all.getValue('decision'), decisionLabel: all.getDisplayValue('decision'),
                    service: all.getDisplayValue('service_propose') || '—',
                    lits: all.service_propose ? all.service_propose.lits_disponibles + ' / ' + all.service_propose.lits_totaux : '—',
                    arrivee: all.getDisplayValue('heure_arrivee_possible') || '—',
                    quand: all.getValue('date_reponse') ? this._heure(all.getValue('date_reponse')) + (all.getDisplayValue('repondu_par') ? ' · ' + all.getDisplayValue('repondu_par') : '') : '—',
                    commentaire: all.getValue('commentaire') || (all.getValue('motif_refus') ? 'Motif : ' + all.getDisplayValue('motif_refus') : ''),
                    retenable: all.getValue('decision') == 'acceptee' && etat == '10',
                    km: all.getValue('distance_km') ? parseFloat(all.getValue('distance_km')) : null,
                    // Délai de prise en charge tenable ? route estimée + 2 min de préparation + 2 min de remise
                    estimMin: (delaiPec && all.getValue('duree_route_min')) ? parseInt(all.getValue('duree_route_min'), 10) + 4 : null,
                    delaiPec: delaiPec,
                    distance: this._distance(all)
                });
            // Les plus proches d'abord ; repère sur l'établissement accepté le plus proche
            res.reponses.sort(function(x, y) { return (x.km === null ? 1e9 : x.km) - (y.km === null ? 1e9 : y.km); });
            for (var k = 0; k < res.reponses.length; k++) {
                if (['acceptee', 'retenue'].indexOf(res.reponses[k].decision) > -1 && res.reponses[k].km !== null) {
                    res.reponses[k].plusProche = true;
                    break;
                }
            }
            res.peutAnnuler = ['1', '10', '20'].indexOf(etat) > -1;
        } else {
            res.peutAnnuler = ['1', '10', '20'].indexOf(etat) > -1 && d.getValue('opened_by') == this.uid;
        }
        res.peutPublier = etat == '1' && (this.regulateur || d.getValue('opened_by') == this.uid);

        // Expiration : republication et relances
        res.precedente = d.getValue('demande_precedente') ? { id: d.getValue('demande_precedente'), numero: d.demande_precedente.number + '' } : null;
        res.republication = d.getValue('republication') ? { id: d.getValue('republication'), numero: d.republication.number + '' } : null;
        res.peutRepublier = etat == '4' && !res.republication && this._estDemandeur(d);
        res.relances = [];
        var rl = new GlideRecord(this.P + '_relance');
        rl.addQuery('demande', d.getUniqueValue());
        rl.orderByDesc('date_relance');
        rl.query();
        while (rl.next()) {
            var monEtab = this.etabsCoordonnes.indexOf(rl.getValue('etablissement')) > -1;
            if (this._estDemandeur(d) || monEtab)
                res.relances.push({ etablissement: rl.getDisplayValue('etablissement'), service: rl.getDisplayValue('service_propose'),
                    commentaire: rl.getValue('commentaire'), quand: this._heure(rl.getValue('date_relance')),
                    statut: rl.getValue('statut'), statutLabel: rl.getDisplayValue('statut'), monEtab: monEtab });
        }
        res.peutRelancer = false;
        if (etat == '4' && !res.republication && res.maReponse && res.maReponse.decision == 'expiree') {
            var deja = new GlideRecord(this.P + '_relance');
            deja.addQuery('demande', d.getUniqueValue());
            deja.addQuery('etablissement', 'IN', this.etabsCoordonnes.join(','));
            deja.setLimit(1);
            deja.query();
            res.peutRelancer = !deja.hasNext();
        }
        return res;
    },

    // ---------- Régulation ----------
    regulation: function() {
        if (!this.regulateur)
            return { interdit: true };
        var colonnes = [
            { cle: 'publiees', titre: 'Publiées · en attente', couleur: '#E39B2D', cartes: [] },
            { cle: 'arbitrer', titre: 'Réponses à arbitrer', couleur: '#0B5D57', cartes: [] },
            { cle: 'transport', titre: 'Destination retenue · transport', couleur: '#4F7CAC', cartes: [] },
            { cle: 'transit', titre: 'En transit', couleur: '#1F5130', cartes: [] }
        ];
        var kpi = { sansReponse: 0, urgente: '', arbitrer: 0, transport: 0, transit: 0 };
        var d = new GlideRecord(this.P + '_demande');
        d.addQuery('state', 'IN', '10,20,30,40');
        d.orderBy('urgence_transfert');
        d.orderBy('date_limite_reponse');
        d.query();
        while (d.next()) {
            var c = this._resume(d), etat = d.getValue('state');
            if (etat == '10' && parseInt(d.getValue('nb_acceptations'), 10) > 0) {
                c.pied = d.getValue('nb_acceptations') + ' acceptation(s) · retenir une destination';
                colonnes[1].cartes.push(c);
                kpi.arbitrer++;
            } else if (etat == '10') {
                c.pied = this._nbReponses(d) + ' réponse(s) · ' + d.getValue('nb_eligibles') + ' établissement(s) sollicité(s)';
                c.minuteur = true;
                colonnes[0].cartes.push(c);
                kpi.sansReponse++;
                if (c.limiteMs && c.minutes >= 0 && (!kpi.prochaineMs || c.limiteMs < kpi.prochaineMs)) kpi.prochaineMs = c.limiteMs;
            } else if (etat == '40') {
                c.pied = 'Transport en cours';
                colonnes[3].cartes.push(c);
                kpi.transit++;
            } else {
                c.pied = (d.work_order.number + '' || '') + ' · ' + (d.work_order.state.getDisplayValue() || '');
                colonnes[2].cartes.push(c);
                kpi.transport++;
            }
        }
        // Lits libres par spécialité dans la région
        var cap = {}, totalDispo = 0, totalLits = 0, etabs = {};
        var s = new GlideRecord(this.P + '_service');
        s.addQuery('active', true);
        s.addQuery('etablissement.active', true);
        s.query();
        while (s.next()) {
            var nom = s.getDisplayValue('specialite');
            var dis = parseInt(s.getValue('lits_disponibles'), 10) || 0;
            cap[nom] = (cap[nom] || 0) + dis;
            totalDispo += dis;
            totalLits += parseInt(s.getValue('lits_totaux'), 10) || 0;
            etabs[s.getValue('etablissement')] = true;
        }
        var capacite = [], max = 1;
        for (var k in cap) {
            capacite.push({ nom: k, lits: cap[k] });
            max = Math.max(max, cap[k]);
        }
        capacite.sort(function(a, b) { return b.lits - a.lits; });
        for (var i = 0; i < capacite.length; i++) {
            capacite[i].pct = Math.round(capacite[i].lits * 100 / max);
            capacite[i].bas = capacite[i].lits <= 2;
        }
        for (var j = 0; j < colonnes.length; j++)
            colonnes[j].nombre = colonnes[j].cartes.length;
        return { colonnes: colonnes, kpi: kpi, capacite: capacite, litsDispo: totalDispo, litsTotal: totalLits,
                 maintenantMs: new GlideDateTime().getNumericValue(),
                 nbEtabs: Object.keys(etabs).length, producteur: this._producteurId() };
    },

    // ---------- Actions ----------
    repondre: function(p) {
        var r = new GlideRecord(this.P + '_reponse');
        if (!p.reponseId || !r.get(p.reponseId))
            return this._ko('Réponse introuvable.');
        if (!this.u.estCoordinateur(r.getValue('etablissement')) && !gs.hasRole(this.P + '.admin'))
            return this._ko('Vous ne coordonnez pas cet établissement.');
        if (r.demande.state != 10)
            return this._ko("La demande n'est plus publiée.");
        if (r.getValue('decision') != 'en_attente')
            return this._ko('Votre établissement a déjà répondu (' + r.getDisplayValue('decision') + ') : la réponse est définitive.');
        if (p.decision != 'acceptee' && p.decision != 'refusee')
            return this._ko('Décision invalide.');
        if (p.decision == 'acceptee') {
            var svc = new GlideRecord(this.P + '_service');
            if (!p.serviceId || !svc.get(p.serviceId) || svc.getValue('etablissement') != r.getValue('etablissement'))
                return this._ko('Choisissez un service de votre établissement.');
            if ((parseInt(svc.getValue('lits_disponibles'), 10) || 0) < 1)
                return this._ko("Ce service n'a plus de lit libre.");
            r.setValue('service_propose', p.serviceId);
            r.setValue('motif_refus', '');
            if (p.arrivee)
                r.setDisplayValue('heure_arrivee_possible', p.arrivee);
        } else {
            if (!p.motif)
                return this._ko('Indiquez un motif de refus.');
            r.setValue('motif_refus', p.motif);
        }
        r.setValue('commentaire', p.commentaire || '');
        // Même décision : seuls les détails changent ; sinon la BR « contrôle décision » valide et horodate
        r.setValue('decision', p.decision);
        return r.update() ? this._ok(p.decision == 'acceptee' ? 'Acceptation envoyée à la régulation.' : 'Refus envoyé à la régulation.')
                          : this._ko(this._derniereErreur('Réponse refusée par les contrôles.'));
    },

    ajusterLits: function(serviceId, delta) {
        var s = new GlideRecord(this.P + '_service');
        if (!serviceId || !s.get(serviceId))
            return this._ko('Service introuvable.');
        if (!this.u.estCoordinateur(s.getValue('etablissement')) && !gs.hasRole(this.P + '.admin'))
            return this._ko('Vous ne coordonnez pas cet établissement.');
        var n = (parseInt(s.getValue('lits_disponibles'), 10) || 0) + (delta > 0 ? 1 : -1);
        var tot = parseInt(s.getValue('lits_totaux'), 10) || 0;
        if (n < 0 || n > tot)
            return this._ko('Les lits libres doivent rester entre 0 et ' + tot + '.');
        s.setValue('lits_disponibles', n);
        return s.update() ? this._ok(s.getValue('nom') + ' : ' + n + ' lit(s) libre(s).') : this._ko('Mise à jour refusée.');
    },

    republier: function(demandeId) {
        var d = new GlideRecord(this.P + '_demande');
        if (!demandeId || !d.get(demandeId))
            return this._ko('Demande introuvable.');
        if (!this._estDemandeur(d))
            return this._ko("Seuls le demandeur, l'établissement d'origine ou la régulation peuvent republier.");
        if (d.getValue('state') != '4')
            return this._ko('Seule une demande expirée peut être republiée.');
        if (d.getValue('republication'))
            return this._ko('Cette demande a déjà été republiée en ' + d.republication.number + '.');
        var n = this.u.republier(d);
        if (!n)
            return this._ko('La republication a échoué.');
        var r = this._ok('Demande republiée en ' + n.getValue('number') + ' auprès de ' + n.getValue('nb_eligibles') + ' établissement(s).');
        r.nouvelleId = n.getUniqueValue();
        return r;
    },

    relancer: function(p) {
        var d = new GlideRecord(this.P + '_demande');
        if (!p.demandeId || !d.get(p.demandeId))
            return this._ko('Demande introuvable.');
        if (d.getValue('state') != '4' || d.getValue('republication'))
            return this._ko("Cette demande n'est plus expirée ou a déjà été republiée.");
        var rep = new GlideRecord(this.P + '_reponse');
        rep.addQuery('demande', d.getUniqueValue());
        rep.addQuery('etablissement', 'IN', this.etabsCoordonnes.join(',') || 'aucun');
        rep.addQuery('decision', 'expiree');
        rep.setLimit(1);
        rep.query();
        if (!rep.next())
            return this._ko("Votre établissement n'avait pas de sollicitation expirée sur cette demande.");
        var deja = new GlideRecord(this.P + '_relance');
        deja.addQuery('demande', d.getUniqueValue());
        deja.addQuery('etablissement', rep.getValue('etablissement'));
        deja.setLimit(1);
        deja.query();
        if (deja.hasNext())
            return this._ko('Votre établissement a déjà relancé le demandeur.');
        if (p.serviceId) {
            var svc = new GlideRecord(this.P + '_service');
            if (!svc.get(p.serviceId) || svc.getValue('etablissement') != rep.getValue('etablissement'))
                return this._ko('Choisissez un service de votre établissement.');
        }
        var rl = new GlideRecord(this.P + '_relance');
        rl.initialize();
        rl.setValue('demande', d.getUniqueValue());
        rl.setValue('etablissement', rep.getValue('etablissement'));
        rl.setValue('service_propose', p.serviceId || '');
        rl.setValue('commentaire', p.commentaire || '');
        rl.setValue('statut', 'envoyee');
        rl.setValue('demande_par', this.uid);
        rl.setValue('date_relance', new GlideDateTime());
        if (!rl.insert())
            return this._ko("La relance n'a pas pu être enregistrée.");
        d.work_notes = rep.getDisplayValue('etablissement') + ' a relancé le demandeur : disponible' +
            (p.serviceId ? ' en ' + rl.getDisplayValue('service_propose') : '') + '. ' + (p.commentaire || '');
        d.update();
        return this._ok('Relance envoyée au demandeur.');
    },

    retenir: function(reponseId) {
        if (!this.regulateur)
            return this._ko('Action réservée à la régulation.');
        var r = new GlideRecord(this.P + '_reponse');
        if (!reponseId || !r.get(reponseId))
            return this._ko('Réponse introuvable.');
        r.setValue('decision', 'retenue');
        return r.update() ? this._ok('Destination retenue : lit réservé et ordre de transport créé.')
                          : this._ko(this._derniereErreur('Impossible de retenir cette réponse.'));
    },

    changerEtat: function(demandeId, etat) {
        var d = new GlideRecord(this.P + '_demande');
        if (!demandeId || !d.get(demandeId))
            return this._ko('Demande introuvable.');
        var proprio = d.getValue('opened_by') == this.uid;
        if (etat == '10' && d.getValue('state') == '1' && (this.regulateur || proprio)) {
            d.setValue('state', '10');
            return d.update() ? this._ok('Demande publiée à ' + d.getValue('nb_eligibles') + ' établissement(s).') : this._ko('Publication refusée.');
        }
        if (etat == '7' && ['1', '10', '20'].indexOf(d.getValue('state')) > -1 && (this.regulateur || proprio)) {
            d.setValue('state', '7');
            d.work_notes = 'Demande annulée depuis le portail par ' + gs.getUserDisplayName() + '.';
            return d.update() ? this._ok('Demande annulée.') : this._ko('Annulation refusée.');
        }
        return this._ko('Action non autorisée.');
    },

    // ---------- Outils ----------
    _resume: function(d) {
        var etat = d.getValue('state');
        var minutes = 0;
        if (d.getValue('date_limite_reponse')) {
            var lim = new GlideDateTime(d.getValue('date_limite_reponse'));
            minutes = Math.round((lim.getNumericValue() - new GlideDateTime().getNumericValue()) / 60000);
        }
        var detail;
        if (etat == '10')
            detail = d.getValue('nb_eligibles') + ' établissement(s) sollicité(s) · ' + d.getValue('nb_acceptations') + ' acceptation(s)';
        else if (['20', '30', '40'].indexOf(etat) > -1)
            detail = d.getDisplayValue('etablissement_destination') + (d.work_order ? ' · ' + d.work_order.number : '');
        else if (etat == '3')
            detail = d.getDisplayValue('etablissement_destination') + ' · arrivé';
        else
            detail = d.getDisplayValue('state');
        return {
            id: d.getUniqueValue(), numero: d.getValue('number'),
            urgence: d.getValue('urgence_transfert'), urgenceLabel: (d.getDisplayValue('urgence_transfert') || '').split(' (')[0],
            specialite: d.getDisplayValue('specialite_requise'), niveau: d.getDisplayValue('niveau_soins'),
            origine: d.getDisplayValue('etablissement_origine'), destination: d.getDisplayValue('etablissement_destination'),
            patient: d.getValue('patient_reference') + (d.getValue('patient_age') ? ' · ' + d.getValue('patient_age') + ' ans' : ''),
            transportLabel: (d.getDisplayValue('mode_transport') || '') + (d.getValue('mobilite') ? ' · ' + d.getDisplayValue('mobilite').toLowerCase() : ''),
            equipements: d.getDisplayValue('equipements_requis') ? d.getDisplayValue('equipements_requis').split(', ') : [],
            etat: d.getDisplayValue('state'), etatValeur: etat, actif: ['3', '4', '7'].indexOf(etat) < 0,
            etape: this.INDEX_ETAT[etat] !== undefined ? this.INDEX_ETAT[etat] : -1,
            minutes: minutes, delai: minutes >= 0 ? this._duree(minutes) : 'dépassée',
            limiteMs: d.getValue('date_limite_reponse') ? new GlideDateTime(d.getValue('date_limite_reponse')).getNumericValue() : null,
            mt: this._minuteur(d),
            detail: detail
        };
    },

    _etapes: function(d) {
        var idx = this.INDEX_ETAT[d.getValue('state')];
        var dates = [this._heure(d.getValue('opened_at')), '', '', '', '', ''];
        var r = new GlideRecord(this.P + '_reponse');
        r.addQuery('demande', d.getUniqueValue());
        r.orderBy('sys_created_on');
        r.setLimit(1);
        r.query();
        if (r.next()) dates[1] = this._heure(r.getValue('sys_created_on'));
        if (d.reponse_retenue) dates[2] = this._heure(d.reponse_retenue.sys_updated_on + '');
        if (d.work_order) {
            dates[3] = this._heure(d.work_order.sys_created_on + '');
            if (d.work_order.work_start) dates[4] = this._heure(d.work_order.work_start + '');
            if (d.work_order.closed_at) dates[5] = this._heure(d.work_order.closed_at + '');
        }
        var out = [];
        for (var i = 0; i < this.ETAPES.length; i++)
            out.push({ nom: this.ETAPES[i], date: dates[i] || (idx !== undefined && i > idx ? 'à venir' : ''),
                       statut: idx === undefined ? 'futur' : (i < idx ? 'fait' : (i == idx ? 'courant' : 'futur')) });
        return out;
    },

    _parcours: function(d) {
        var ev = [];
        var push = function(quand, titre, detail, statut) { ev.push({ t: quand, titre: titre, detail: detail, statut: statut }); };
        push(d.getValue('opened_at'), 'Demande créée par ' + d.getDisplayValue('opened_by'), d.getDisplayValue('etablissement_origine'), 'fait');
        var r = new GlideRecord(this.P + '_reponse');
        r.addQuery('demande', d.getUniqueValue());
        r.orderBy('sys_created_on');
        r.query();
        var premier = true, noms = [];
        while (r.next()) {
            noms.push(r.getDisplayValue('etablissement'));
            if (premier) { push(r.getValue('sys_created_on'), '', '', 'fait'); premier = false; }
            if (r.getValue('date_reponse'))
                push(r.getValue('date_reponse'), r.getDisplayValue('etablissement') + ' a ' +
                     (r.getValue('decision') == 'refusee' ? 'refusé' : 'accepté'),
                     r.getValue('decision') == 'refusee' ? 'Motif : ' + r.getDisplayValue('motif_refus') : (r.getDisplayValue('service_propose') || ''), 'fait');
        }
        if (noms.length) {
            for (var i = 0; i < ev.length; i++)
                if (ev[i].titre === '') { ev[i].titre = 'Publiée à ' + noms.length + ' établissement(s) éligible(s)'; ev[i].detail = noms.join(', '); }
        }
        if (d.reponse_retenue)
            push(d.reponse_retenue.sys_updated_on + '', 'Destination retenue : ' + d.getDisplayValue('etablissement_destination'),
                 '1 lit réservé · ' + d.getDisplayValue('service_destination'), 'fait');
        if (d.work_order) {
            push(d.work_order.sys_created_on + '', 'Ordre de transport ' + d.work_order.number + ' créé', d.work_order.state.getDisplayValue(), 'fait');
            var t = new GlideRecord('wm_task');
            t.addQuery('parent', d.getValue('work_order'));
            t.orderBy('number');
            t.query();
            while (t.next()) {
                if (t.getValue('actual_travel_start'))
                    push(t.getValue('actual_travel_start'), 'Départ — ' + t.getValue('short_description'), t.getDisplayValue('assigned_to'), 'fait');
                if (t.getValue('closed_at'))
                    push(t.getValue('closed_at'), 'Terminé — ' + t.getValue('short_description'), t.getDisplayValue('assigned_to'), 'fait');
            }
        }
        ev.sort(function(a, b) { return a.t < b.t ? -1 : (a.t > b.t ? 1 : 0); });
        var etat = d.getValue('state');
        if (etat == '10') ev.push({ t: '', titre: 'En attente des réponses', detail: 'Date limite ' + this._heure(d.getValue('date_limite_reponse')), statut: 'courant' });
        if (etat == '10') ev.push({ t: '', titre: 'Choix de la destination par la régulation', detail: 'Réservation du lit et ordre de transport', statut: 'futur' });
        if (etat == '20' || etat == '30') ev.push({ t: '', titre: 'Qualification et dispatch FSM', detail: 'Affectation d\'un équipage de la zone', statut: 'courant' });
        if (etat == '40') ev.push({ t: '', titre: 'Remise du patient', detail: d.getDisplayValue('service_destination'), statut: 'futur' });
        for (var j = 0; j < ev.length; j++)
            ev[j].heure = ev[j].t ? this._heure(ev[j].t) : (ev[j].statut == 'courant' ? 'Maintenant' : '');
        return ev;
    },

    /**
     * Suivi du transport : ordre FSM, ses 3 tâches (prévu / réel, étapes FSM horodatées, asset, dernière note),
     * équipage, véhicule et équipements réservés, arrivée estimée avec retard.
     * Téléphone et notes réservés au régulateur et aux coordinateurs de l'origine ou de la destination.
     */
    _transport: function(d) {
        if (!d.getValue('work_order'))
            return null;
        var maintenant = new GlideDateTime().getNumericValue();
        var res = { numero: d.work_order.number + '', etat: d.work_order.state.getDisplayValue(), taches: [], agent: '', groupe: '',
            telephone: '', mode: d.getDisplayValue('mode_transport'), urgence: d.getDisplayValue('urgence_transfert'),
            maintenantMs: maintenant, retardMin: 0, etaMs: null, eta: '', courante: -1 };
        var detaille = this.regulateur ||
            this.etabsCoordonnes.indexOf(d.getValue('etablissement_origine')) > -1 ||
            this.etabsCoordonnes.indexOf(d.getValue('etablissement_destination')) > -1;
        res.detaille = detaille;

        var t = new GlideRecord('wm_task');
        t.addQuery('parent', d.getValue('work_order'));
        t.orderBy('number');
        t.query();
        while (t.next()) {
            var s = t.getValue('state');
            var fini = ['3', '4', '7'].indexOf(s) > -1;
            var dureeMs = this._dureeMs(t.getValue('estimated_work_duration'));
            var prevuDebut = this._ms(t.getValue('expected_start'));
            var prevuFin = this._ms(t.getValue('estimated_end')) || (prevuDebut ? prevuDebut + dureeMs : null);
            var reelDebut = this._ms(t.getValue('work_start'));
            var reelFin = this._ms(t.getValue('work_end'));
            var depart = this._ms(t.getValue('actual_travel_start')), surPlace = this._ms(t.getValue('actual_onsite_arrival'));
            var audit = this._heuresEtats(t.getUniqueValue());
            var item = {
                id: t.getUniqueValue(), numero: t.getValue('number'),
                nom: t.getValue('short_description').split(' — ')[0], lieu: t.getDisplayValue('location'),
                etat: t.getDisplayValue('state'), etatValeur: s,
                statut: s == '3' ? 'fait' : (['17', '18'].indexOf(s) > -1 ? 'courant' : (['4', '7'].indexOf(s) > -1 ? 'annule' : 'futur')),
                prevuDebutMs: prevuDebut, prevuFinMs: prevuFin, reelDebutMs: reelDebut, reelFinMs: reelFin,
                prevu: prevuDebut ? this._hm(prevuDebut) + ' – ' + this._hm(prevuFin) : '',
                reel: reelDebut ? this._hm(reelDebut) + (reelFin ? ' – ' + this._hm(reelFin) : '') : '',
                demarre: reelDebut ? this._hm(reelDebut) : '', dureeMin: Math.round(dureeMs / 60000),
                asset: t.getValue('asset') ? t.asset.model.getDisplayValue() + ' · ' + t.asset.asset_tag : '',
                etapes: [
                    { nom: 'Assignée', heure: this._hm(audit['16']), fait: !!audit['16'] || ['16', '17', '18', '3'].indexOf(s) > -1 },
                    { nom: 'Acceptée', heure: this._hm(audit['17']), fait: !!audit['17'] || ['17', '18', '3'].indexOf(s) > -1 },
                    { nom: 'En route', heure: this._hm(depart), fait: !!depart || ['18', '3'].indexOf(s) > -1 },
                    { nom: 'Sur place', heure: this._hm(surPlace), fait: !!surPlace || ['18', '3'].indexOf(s) > -1 },
                    { nom: 'Pris en charge', heure: this._hm(reelDebut), fait: !!reelDebut || s == '3' },
                    { nom: 'Remis', heure: this._hm(reelFin || audit['3']), fait: s == '3' }
                ],
                note: detaille ? this._derniereNote(t) : null
            };
            res.taches.push(item);
            if (!res.agent && t.getValue('assigned_to')) {
                res.agent = t.getDisplayValue('assigned_to');
                res.groupe = t.getDisplayValue('assignment_group');
                if (detaille)
                    res.telephone = t.assigned_to.mobile_phone + '' || t.assigned_to.phone + '';
            }
            if (!res.groupe && t.getValue('dispatch_group'))
                res.groupe = t.getDisplayValue('dispatch_group');
            if (res.courante < 0 && !fini)
                res.courante = res.taches.length - 1;
        }

        // Retard de la tâche courante (projection de sa fin) répercuté sur l'arrivée estimée à destination
        if (res.courante > -1) {
            var c = res.taches[res.courante];
            var finProjetee = c.reelDebutMs ? c.reelDebutMs + c.dureeMin * 60000 :
                (c.prevuDebutMs && maintenant > c.prevuDebutMs ? maintenant + c.dureeMin * 60000 : c.prevuFinMs);
            if (finProjetee && c.prevuFinMs)
                res.retardMin = Math.round((finProjetee - c.prevuFinMs) / 60000);
            var derniere = res.taches[res.taches.length - 1];
            if (derniere.prevuFinMs) {
                res.etaMs = derniere.prevuFinMs + Math.max(res.retardMin, 0) * 60000;
                res.eta = this._hm(res.etaMs);
            }
        } else if (res.taches.length) {
            var fin = res.taches[res.taches.length - 1];
            res.eta = this._hm(fin.reelFinMs || fin.prevuFinMs);
            res.termine = true;
        }

        // Assets réservés pour ce transfert : véhicule sanitaire et équipements à destination
        res.vehicule = null;
        res.equipements = [];
        var rv = new GlideRecord(this.P + '_reservation');
        rv.addQuery('demande', d.getUniqueValue());
        rv.orderBy('type_reservation');
        rv.query();
        while (rv.next()) {
            var a = { nom: rv.asset.model.getDisplayValue() || rv.getDisplayValue('asset'), tag: rv.asset.asset_tag + '',
                lieu: rv.asset.location.getDisplayValue(), active: rv.getValue('statut') == 'active', statut: rv.getDisplayValue('statut') };
            if (rv.getValue('type_reservation') == 'vehicule')
                res.vehicule = a;
            else
                res.equipements.push(a);
        }
        for (var i = 0; i < res.taches.length; i++) {
            if (!res.taches[i].asset && res.vehicule && res.taches[i].nom.indexOf('Transport') === 0)
                res.taches[i].asset = res.vehicule.nom + ' · ' + res.vehicule.tag;
        }
        return res;
    },

    /** Heure du premier passage de la tâche dans chaque état (historique sys_audit du champ state). */
    _heuresEtats: function(tacheId) {
        var h = {};
        var a = new GlideRecord('sys_audit');
        a.addQuery('tablename', 'wm_task');
        a.addQuery('documentkey', tacheId);
        a.addQuery('fieldname', 'state');
        a.orderBy('sys_created_on');
        a.query();
        while (a.next()) {
            var v = a.getValue('newvalue');
            if (!h[v])
                h[v] = new GlideDateTime(a.getValue('sys_created_on')).getNumericValue();
        }
        return h;
    },

    _derniereNote: function(t) {
        var brut = t.work_notes.getJournalEntry(1) + '';
        if (!brut)
            return null;
        var lignes = brut.split('\n');
        var tete = lignes.shift();
        var m = tete.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2})(?::\d{2})? - (.*?)\s*\(/);
        return { auteur: m ? m[2] : '', heure: m ? m[1].substring(11) : '', texte: lignes.join(' ').trim() };
    },

    /**
     * Minuteur de la demande selon l'étape (calculé côté navigateur chaque seconde à partir de ces repères) :
     *  reponse  : compte à rebours publication → date limite de réponse (SLA réponse)
     *  decision : chrono depuis la première acceptation, en attente de la retenue
     *  arrivee  : compte à rebours retenue → arrivée exigée (SLA prise en charge), dépassement en positif
     *  bilan / fige : durées réalisées comparées aux délais, figées
     */
    _minuteur: function(d) {
        var etat = d.getValue('state'), urg = d.getValue('urgence_transfert');
        var pub = this._ms(d.getValue('date_publication')), acc = this._ms(d.getValue('date_premiere_acceptation'));
        var ret = this._ms(d.getValue('date_retenue')), arr = this._ms(d.getValue('date_arrivee'));
        var limRep = this._ms(d.getValue('date_limite_reponse')), limArr = this._ms(d.getValue('date_limite_arrivee'));
        var cibleRep = this.u.delaiMin('reponse', urg), ciblePec = this.u.delaiMin('prise_en_charge', urg);
        var bilan = [];
        if (pub && acc)
            bilan.push({ label: 'Réponse', texte: this._mmss(acc - pub), cible: cibleRep ? this._mmss(cibleRep * 60000) : '',
                ok: limRep ? acc <= limRep : true });
        if (ret && arr && limArr)
            bilan.push({ label: 'Prise en charge', texte: this._mmss(arr - ret), cible: this._mmss(ciblePec * 60000), ok: arr <= limArr });
        var delai = function(min) { return min >= 1440 ? Math.round(min / 60) + ' h' : min + ' min'; };
        if (etat == '10' && !acc)
            return { phase: 'reponse', sens: 'rebours', titre: 'Réponse attendue', debutMs: pub, echeanceMs: limRep,
                sous: (pub ? 'Publiée à ' + this._hm(pub) + ' · ' : '') + (cibleRep ? 'délai ' + delai(cibleRep) + ' · ' : '') +
                    d.getValue('nb_eligibles') + ' établissement(s) sollicité(s)', bilan: [] };
        if (etat == '10')
            return { phase: 'decision', sens: 'chrono', titre: 'Décision du régulateur', debutMs: acc,
                sous: d.getValue('nb_acceptations') + ' acceptation(s) à comparer · chrono depuis la 1re acceptation', bilan: bilan };
        if (['20', '30', '40'].indexOf(etat) > -1 && limArr)
            return { phase: 'arrivee', sens: 'rebours', titre: 'Arrivée exigée avant ' + this._hm(limArr), debutMs: ret, echeanceMs: limArr,
                sous: 'Retenue à ' + this._hm(ret) + ' · délai ' + delai(ciblePec), bilan: bilan };
        if (etat == '3')
            return { phase: 'bilan', sens: 'fige', titre: 'Arrivé · clôturée' + (arr ? ' à ' + this._hm(arr) : ''), sous: '', bilan: bilan };
        if (etat == '4')
            return { phase: 'fige', sens: 'fige', titre: 'Expirée sans acceptation', bilan: [],
                sous: (cibleRep ? 'Délai de réponse de ' + delai(cibleRep) + ' dépassé' : '') + (limRep ? ' · échéance ' + this._hm(limRep) : '') };
        if (etat == '7')
            return { phase: 'fige', sens: 'fige', titre: 'Demande annulée', sous: '', bilan: bilan };
        return null;
    },

    _mmss: function(ms) {
        var s = Math.max(0, Math.round(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
        s = s % 60;
        return (h > 0 ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (s < 10 ? '0' : '') + s;
    },

    /** « 3,2 km · ≈ 10 min de route » depuis l'origine, pour une réponse. */
    _distance: function(r) {
        if (!r.getValue('distance_km'))
            return '';
        var km = (Math.round(parseFloat(r.getValue('distance_km')) * 10) / 10 + '').replace('.', ',');
        return km + ' km' + (r.getValue('duree_route_min') ? ' · ≈ ' + r.getValue('duree_route_min') + ' min de route' : '');
    },

    _ms: function(valeur) {
        return valeur ? new GlideDateTime(valeur).getNumericValue() : null;
    },

    _dureeMs: function(valeur) {
        if (!valeur)
            return 0;
        var g = new GlideDateTime(valeur);
        return g.getNumericValue();
    },

    _hm: function(ms) {
        if (!ms)
            return '';
        var g = new GlideDateTime();
        g.setNumericValue(ms);
        return g.getDisplayValue().substring(11, 16);
    },

    /** Demandeur au sens large : auteur, établissement d'origine (agents et coordinateurs) ou régulation. */
    _estDemandeur: function(d) {
        return this.regulateur || d.getValue('opened_by') == this.uid ||
            this.etabIds.indexOf(d.getValue('etablissement_origine')) > -1;
    },

    _peutVoir: function(d) {
        if (this.regulateur || d.getValue('opened_by') == this.uid)
            return true;
        var ids = this.etabIds;
        if (ids.indexOf(d.getValue('etablissement_origine')) > -1 || ids.indexOf(d.getValue('etablissement_destination')) > -1)
            return true;
        var r = new GlideRecord(this.P + '_reponse');
        r.addQuery('demande', d.getUniqueValue());
        r.addQuery('etablissement', 'IN', ids.join(','));
        r.setLimit(1);
        r.query();
        return r.hasNext();
    },

    _services: function() {
        var s = new GlideRecord(this.P + '_service');
        s.addQuery('etablissement', 'IN', this.etabsCoordonnes.join(',') || 'aucun');
        s.addQuery('active', true);
        s.orderBy('etablissement.nom');
        s.orderBy('nom');
        s.query();
        return s;
    },

    _servicesPossibles: function(etabId, specialiteId) {
        var out = [];
        var s = new GlideRecord(this.P + '_service');
        s.addQuery('etablissement', etabId);
        s.addQuery('active', true);
        s.orderByDesc('lits_disponibles');
        s.query();
        while (s.next())
            out.push({ id: s.getUniqueValue(), label: s.getValue('nom') + ' — ' + s.getValue('lits_disponibles') + ' lit(s) libre(s)',
                       complet: (parseInt(s.getValue('lits_disponibles'), 10) || 0) < 1, specialite: s.getValue('specialite') == specialiteId });
        return out;
    },

    _nbReponses: function(d) {
        var a = new GlideAggregate(this.P + '_reponse');
        a.addQuery('demande', d.getUniqueValue());
        a.addQuery('decision', '!=', 'en_attente');
        a.addAggregate('COUNT');
        a.query();
        return a.next() ? a.getAggregate('COUNT') : 0;
    },

    _choix: function(table, champ) {
        var out = [];
        var c = new GlideRecord('sys_choice');
        c.addQuery('name', table);
        c.addQuery('element', champ);
        c.addQuery('language', 'fr');
        c.orderBy('sequence');
        c.query();
        while (c.next())
            out.push({ valeur: c.getValue('value'), label: c.getValue('label') });
        return out;
    },

    _producteurId: function() {
        var p = new GlideRecord('sc_cat_item_producer');
        p.addQuery('table_name', this.P + '_demande');
        p.addQuery('active', true);
        p.setLimit(1);
        p.query();
        return p.next() ? p.getUniqueValue() : '';
    },

    _heure: function(valeur) {
        if (!valeur)
            return '';
        var g = new GlideDateTime(valeur);
        var aff = g.getDisplayValue();
        var auj = new GlideDateTime().getDisplayValue().substring(0, 10);
        return aff.substring(0, 10) == auj ? aff.substring(11, 16) : aff.substring(8, 10) + '/' + aff.substring(5, 7) + ' ' + aff.substring(11, 16);
    },

    _duree: function(minutes) {
        if (minutes < 60)
            return minutes + ' min';
        var h = Math.floor(minutes / 60), m = minutes % 60;
        return h + ' h' + (m ? ' ' + (m < 10 ? '0' : '') + m : '');
    },

    _derniereErreur: function(defaut) {
        var msgs = gs.getErrorMessages ? gs.getErrorMessages() : null;
        return (msgs && msgs.length) ? msgs[msgs.length - 1] + '' : defaut;
    },

    _ok: function(msg) { return { ok: true, message: msg }; },
    _ko: function(msg) { return { ok: false, message: msg }; },

    type: 'TransfertPortail'
};
