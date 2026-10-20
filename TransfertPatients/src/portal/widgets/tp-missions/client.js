function($scope, $interval, $timeout, spUtil, spModal) {
    var c = this;
    c.sel = null;
    c.mode = '';
    c.note = '';
    c.idCarte = 'tp-mis-carte-' + Math.floor(Math.random() * 1e9);
    var deuxChiffres = function(n) { return (n < 10 ? '0' : '') + n; };
    function fmt(s) { var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60; return (h > 0 ? h + ':' + deuxChiffres(m) : m) + ':' + deuxChiffres(r); }
    function vue(mt) {
        if (!mt || mt.sens != 'rebours' || !mt.echeanceMs) return null;
        var reste = Math.round((mt.echeanceMs - (Date.now() + c.decal)) / 1000);
        return reste >= 0 ? { texte: fmt(reste), classe: reste < 60 ? 'urgent' : 'ok' } : { texte: '+' + fmt(-reste), classe: 'depasse', depasse: true };
    }
    function tic() { (c.data.m.missions || []).forEach(function(x) { x.v = vue(x.mt); }); }
    function recaler() { c.decal = c.data.m.maintenantMs ? c.data.m.maintenantMs - Date.now() : 0; tic(); }
    c.nomEq = function(e) { return e.nom; };
    c.etapeEnCours = function(x) {
        if ((x.taches || []).length == 1) {
            var u = x.taches[0];
            return u.etat == '18' ? 'Transport en cours' : (u.surPlace ? 'Sur place' : (u.depart ? 'En route' : 'Acceptée'));
        }
        var t = (x.taches || []).filter(function(y) { return y.etat == '18'; })[0];
        return t ? t.nom + ' en cours' : 'Acceptée';
    };

    // Carte du trajet de la mission ouverte
    var carte = null;
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
    function dessiner() {
        var tr = c.sel && c.sel.trajet;
        if (carte) { carte.remove(); carte = null; }
        if (!tr) return;
        if (typeof L === 'undefined' || !document.getElementById(c.idCarte)) return $timeout(dessiner, 200);
        carte = L.map(c.idCarte, { scrollWheelZoom: false, zoomControl: false });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, referrerPolicy: 'strict-origin-when-cross-origin',
            attribution: '&copy; OpenStreetMap' }).addTo(carte);
        var trace = tr.polyline ? decoder(tr.polyline) : [tr.de, tr.vers];
        L.polyline(trace, { color: '#D85A30', weight: 5 }).addTo(carte);
        L.circleMarker(tr.de, { radius: 9, color: '#fff', weight: 3, fillColor: '#5F5E5A', fillOpacity: 1 }).addTo(carte).bindTooltip('Départ', { permanent: true, direction: 'top' });
        L.circleMarker(tr.vers, { radius: 10, color: '#fff', weight: 3, fillColor: '#2E7D32', fillOpacity: 1 }).addTo(carte).bindTooltip('Arrivée', { permanent: true, direction: 'bottom' });
        carte.fitBounds(L.latLngBounds(trace), { padding: [30, 30] });
    }

    c.ouvrir = function(x) { c.sel = x; c.mode = ''; c.note = ''; $timeout(dessiner, 0); };
    c.fermer = function() { c.sel = null; if (carte) { carte.remove(); carte = null; } };
    function resynchroniser() {
        recaler();
        if (c.sel) {
            var id = c.sel.id;
            var x = (c.data.m.missions || []).filter(function(y) { return y.id == id; })[0];
            c.sel = x || null;
            if (!x && carte) { carte.remove(); carte = null; }
        }
    }
    c.agir = function(code) {
        var envoyer = function() {
            c.envoi = true;
            c.server.get({ action: 'mission', demandeId: c.sel.id, code: code, note: c.note }).then(function(r) {
                c.envoi = false;
                var res = r.data.resultat;
                if (res && res.ok) { spUtil.addInfoMessage(res.message); c.mode = ''; c.note = ''; }
                else if (res) spUtil.addErrorMessage(res.message);
                c.data.m = r.data.m;
                resynchroniser();
            });
        };
        if (code == 'terminer') return spModal.confirm('Confirmer la remise du patient ? La mission sera terminée.').then(envoyer);
        envoyer();
    };

    recaler();
    var minuteur = $interval(tic, 1000);
    $scope.$on('$destroy', function() { $interval.cancel(minuteur); if (carte) carte.remove(); });
    spUtil.recordWatch($scope, 'wm_task', 'sys_idISNOTEMPTY', function() {
        if (!c.envoi) c.server.refresh().then(resynchroniser);
    });
}
