function($scope, $interval, $timeout, spUtil, spModal) {
    var c = this;
    var deuxChiffres = function(n) { return (n < 10 ? '0' : '') + n; };
    // Décalage entre l'horloge du navigateur et celle du serveur, recalculé à chaque rechargement des données
    function recaler() {
        c.decalage = (c.data.d && c.data.d.maintenantMs) ? c.data.d.maintenantMs - Date.now() : 0;
        c.decalageTr = (c.data.d && c.data.d.transport && c.data.d.transport.maintenantMs) ? c.data.d.transport.maintenantMs - Date.now() : 0;
        tic();
    }
    function tic() {
        c.mtv = vue(c.data.d && c.data.d.mt, c.decalage);
        var d = c.data.d;
        if (!d || !d.limiteMs) { c.cd = { texte: '', depasse: false }; return; }
        var reste = Math.floor((d.limiteMs - (Date.now() + c.decalage)) / 1000);
        if (reste <= 0) { c.cd = { depasse: true, urgent: true }; return; }
        var h = Math.floor(reste / 3600), m = Math.floor((reste % 3600) / 60), s = reste % 60;
        c.cd = {
            texte: (h > 0 ? h + ':' : '') + deuxChiffres(m) + ':' + deuxChiffres(s),
            lisible: (h > 0 ? h + ' h ' : '') + m + ' min',
            urgent: reste < 30 * 60, depasse: false
        };
    }
    // Durée écoulée de la tâche en cours (minutes), à l'heure du serveur
    c.ecoule = function(t) {
        var tr = c.data.d && c.data.d.transport;
        var decal = tr && tr.maintenantMs ? c.decalageTr : 0;
        return Math.max(0, Math.round((Date.now() + (decal || 0) - t.reelDebutMs) / 60000));
    };
    // Minuteur de l'étape (data.mt calculé par TransfertPortail._minuteur) : rebours, chrono ou figé
    function fmt(s) {
        var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
        return (h > 0 ? h + ':' + deuxChiffres(m) : m) + ':' + deuxChiffres(r);
    }
    function vue(mt, decalage) {
        if (!mt) return null;
        var maintenant = Date.now() + (decalage || 0);
        if (mt.sens == 'rebours' && mt.echeanceMs) {
            var reste = Math.round((mt.echeanceMs - maintenant) / 1000);
            var total = mt.debutMs ? (mt.echeanceMs - mt.debutMs) / 1000 : 0;
            if (reste >= 0)
                return { texte: fmt(reste), classe: reste < 60 ? 'urgent' : 'ok', depasse: false,
                         progres: total > 0 ? Math.min(100, Math.round((1 - reste / total) * 100)) : null };
            return { texte: '+' + fmt(-reste), classe: 'depasse', depasse: true, progres: 100 };
        }
        if (mt.sens == 'chrono' && mt.debutMs)
            return { texte: fmt(Math.max(0, Math.round((maintenant - mt.debutMs) / 1000))), classe: 'chrono', progres: null };
        return { texte: '', classe: 'fige', progres: null };
    }
    // ----- Carte du trajet : tracé routier, départ, arrivée, ambulance en position estimée -----
    c.idTrajet = 'tp-trajet-' + Math.floor(Math.random() * 1e9);
    c.traj = { etape: '' };
    var tCarte = null, tCouches = null, tTrace = [], tCumul = [], tFait = null, tReste = null, tAmb = null, tCle = '';
    function decoder(str) {
        var pts = [], idx = 0, lat = 0, lng = 0;
        while (idx < str.length) {
            var b, shift = 0, res = 0;
            do { b = str.charCodeAt(idx++) - 63; res |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
            lat += (res & 1) ? ~(res >> 1) : (res >> 1);
            shift = 0; res = 0;
            do { b = str.charCodeAt(idx++) - 63; res |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
            lng += (res & 1) ? ~(res >> 1) : (res >> 1);
            pts.push([lat / 1e5, lng / 1e5]);
        }
        return pts;
    }
    function avancement() {
        var d = c.data.d, t = d && d.transport && d.transport.taches;
        if (!d || !d.trajet) return { f: 0, etape: '' };
        if (d.trajet.arrive) return { f: 1, etape: 'Arrivé' };
        if (t && t.length == 1) {
            var x = t[0], e = x.etapes || [];
            if (x.statut == 'fait') return { f: 1, etape: 'Patient remis' };
            if (x.reelDebutMs) {
                var duree = (parseInt(d.trajet.minutes, 10) || Math.max(1, x.dureeMin - 2)) * 60000;
                return { f: Math.max(0, Math.min(0.97, (Date.now() + (c.decalageTr || 0) - x.reelDebutMs) / duree)), etape: 'Transport en cours' };
            }
            if (e[3] && e[3].fait) return { f: 0, etape: 'Ambulance sur place à l\'origine' };
            if (e[2] && e[2].fait) return { f: 0, etape: 'Ambulance en route vers l\'origine' };
            return { f: 0, etape: x.statut == 'annule' ? 'Transport annulé' : 'Départ prévu ' + (x.prevu || '').split(' – ')[0] };
        }
        if (!t || t.length < 3) return { f: 0, etape: 'Transport en préparation' };
        if (t[2].statut == 'fait' || t[2].statut == 'courant' || t[1].statut == 'fait') return { f: 1, etape: 'Remise du patient' };
        if (t[1].reelDebutMs) {
            var ecoule = Date.now() + (c.decalageTr || 0) - t[1].reelDebutMs;
            return { f: Math.max(0, Math.min(0.97, ecoule / Math.max(60000, t[1].dureeMin * 60000))), etape: 'Transport en cours' };
        }
        return { f: 0, etape: t[0].statut == 'courant' ? 'Préparation du patient' : 'Départ prévu ' + (t[1].prevu || '').split(' – ')[0] };
    }
    function point(f) {
        var total = tCumul[tCumul.length - 1], cible = total * f;
        for (var i = 1; i < tCumul.length; i++) {
            if (tCumul[i] >= cible) {
                var r = (cible - tCumul[i - 1]) / ((tCumul[i] - tCumul[i - 1]) || 1);
                return { i: i, p: [tTrace[i - 1][0] + r * (tTrace[i][0] - tTrace[i - 1][0]), tTrace[i - 1][1] + r * (tTrace[i][1] - tTrace[i - 1][1])] };
            }
        }
        return { i: tTrace.length - 1, p: tTrace[tTrace.length - 1] };
    }
    function majAmbulance() {
        if (!tCarte || !tTrace.length) return;
        var a = avancement();
        c.traj.etape = a.etape;
        var pt = point(a.f);
        tFait.setLatLngs(tTrace.slice(0, pt.i).concat([pt.p]));
        tReste.setLatLngs([pt.p].concat(tTrace.slice(pt.i)));
        tFait.setStyle({ color: a.f >= 1 ? '#2E7D32' : '#D85A30' });
        tAmb.setLatLng(pt.p);
    }
    function dessinerTrajet() {
        var tr = c.data.d && c.data.d.trajet;
        if (!tr) { if (tCarte) { tCarte.remove(); tCarte = null; tCle = ''; } return; }
        if (typeof L === 'undefined' || !document.getElementById(c.idTrajet)) return $timeout(dessinerTrajet, 200);
        var cle = tr.polyline + '|' + tr.de + '|' + tr.vers;
        if (tCarte && cle == tCle) return majAmbulance();
        if (tCarte) tCarte.remove();
        tCle = cle;
        tCarte = L.map(c.idTrajet, { scrollWheelZoom: false });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, referrerPolicy: 'strict-origin-when-cross-origin',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">contributeurs OpenStreetMap</a>' }).addTo(tCarte);
        tTrace = tr.polyline ? decoder(tr.polyline) : [tr.de, tr.vers];
        tCumul = [0];
        for (var i = 1; i < tTrace.length; i++)
            tCumul.push(tCumul[i - 1] + Math.sqrt(Math.pow(tTrace[i][0] - tTrace[i - 1][0], 2) + Math.pow((tTrace[i][1] - tTrace[i - 1][1]) * 0.967, 2)));
        tReste = L.polyline(tTrace, { color: '#D85A30', weight: 5, opacity: 0.55, dashArray: '8 8' }).addTo(tCarte);
        tFait = L.polyline([], { color: '#D85A30', weight: 6 }).addTo(tCarte);
        L.circleMarker(tr.de, { radius: 10, color: '#fff', weight: 3, fillColor: '#5F5E5A', fillOpacity: 1 }).addTo(tCarte)
            .bindTooltip('<span class="tp-traj-etiq">Départ · ' + tr.origine + '</span>', { permanent: true, direction: 'top', offset: [0, -10] });
        L.circleMarker(tr.vers, { radius: 11, color: '#fff', weight: 3, fillColor: '#2E7D32', fillOpacity: 1 }).addTo(tCarte)
            .bindTooltip('<span class="tp-traj-etiq">Arrivée · ' + tr.destination + '</span>', { permanent: true, direction: 'bottom', offset: [0, 10] });
        tAmb = L.marker(tr.de, { icon: L.divIcon({ className: '', iconSize: [28, 28], iconAnchor: [14, 14], html: '<div class="tp-traj-amb">A</div>' }),
            zIndexOffset: 1000 }).addTo(tCarte);
        if (tr.vehicule) tAmb.bindTooltip(tr.vehicule + ' · position estimée', { direction: 'right', offset: [14, 0] });
        tCarte.fitBounds(L.latLngBounds(tTrace), { padding: [50, 50] });
        majAmbulance();
    }
    $timeout(dessinerTrajet, 0);
    $scope.$on('$destroy', function() { if (tCarte) tCarte.remove(); });

    var minuteur = $interval(function() { tic(); majAmbulance(); }, 1000);
    $scope.$on('$destroy', function() { $interval.cancel(minuteur); });
    function init() {
        var r = c.data.d && c.data.d.maReponse;
        c.f = r ? { decision: r.decision == 'refusee' ? 'refusee' : 'acceptee', serviceId: r.serviceId,
                    motif: r.motif || '', commentaire: r.commentaire || '', arrivee: '' } : {};
    }
    init();
    recaler();
    function appel(params) {
        c.envoi = true;
        params.sys_id = c.data.sys_id;
        c.server.get(params).then(function(r) {
            c.envoi = false;
            var res = r.data.resultat;
            if (res && res.ok) spUtil.addInfoMessage(res.message); else if (res) spUtil.addErrorMessage(res.message);
            c.data.d = r.data.d;
            init();
            recaler();
            dessinerTrajet();
        });
    }
    c.repondre = function() {
        appel({ action: 'repondre', params: { reponseId: c.data.d.maReponse.id, decision: c.f.decision, serviceId: c.f.serviceId,
            motif: c.f.motif, commentaire: c.f.commentaire, arrivee: c.f.arrivee } });
    };
    c.rl = {};
    c.republier = function() {
        spModal.confirm('Republier cette demande ? Une nouvelle demande sera publiée aux établissements éligibles.').then(function() {
            c.envoi = true;
            c.server.get({ action: 'republier', sys_id: c.data.sys_id }).then(function(r) {
                c.envoi = false;
                var res = r.data.resultat;
                if (res && res.ok) {
                    spUtil.addInfoMessage(res.message);
                    window.location.href = '?id=tp_demande&sys_id=' + res.nouvelleId;
                } else if (res) {
                    spUtil.addErrorMessage(res.message);
                }
            });
        });
    };
    c.relancer = function() {
        appel({ action: 'relancer', serviceId: c.rl.serviceId, commentaire: c.rl.commentaire });
    };
    c.retenir = function(r) {
        spModal.confirm('Retenir ' + r.etablissement + ' ? Un lit sera réservé et l\'ordre de transport créé.')
            .then(function() { appel({ action: 'retenir', reponseId: r.id }); });
    };
    c.etat = function(e) {
        if (e != '7') return appel({ action: 'etat', etat: e });
        spModal.confirm('Annuler cette demande ? Les établissements sollicités seront informés.')
            .then(function() { appel({ action: 'etat', etat: e }); });
    };
    var filtre = 'sys_id=' + c.data.sys_id;
    spUtil.recordWatch($scope, 'x_2218203_ptrans_demande', filtre, function() { if (!c.envoi) c.server.refresh().then(function() { init(); recaler(); dessinerTrajet(); }); });
    spUtil.recordWatch($scope, 'x_2218203_ptrans_reponse', 'demande=' + c.data.sys_id, function() { if (!c.envoi) c.server.refresh().then(function() { init(); recaler(); }); });
    spUtil.recordWatch($scope, 'wm_task', 'sys_idISNOTEMPTY', function() { if (!c.envoi) c.server.refresh().then(function() { recaler(); dessinerTrajet(); }); });
}
