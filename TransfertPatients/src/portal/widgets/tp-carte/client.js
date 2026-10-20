function($scope, $timeout, $interval, spUtil) {
    var c = this;
    c.idCarte = 'tp-carte-' + Math.floor(Math.random() * 1e9);
    c.specialite = '';
    c.voir = { ambulances: true, transferts: true };
    var carte = null, couches = {}, marqueurs = {};
    var COULEURS = { v: '#2E7D32', o: '#E39B2D', r: '#C62828', g: '#A9B6B3' };
    var deuxChiffres = function(n) { return (n < 10 ? '0' : '') + n; };
    var echap = function(t) { return String(t === undefined || t === null ? '' : t).replace(/[&<>"']/g, function(x) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]; }); };

    // Niveau de disponibilité d'un hôpital pour la spécialité choisie (ou tous services confondus)
    function niveau(h) {
        if (!c.specialite) {
            var t = h.lits;
            return { niveau: t >= 5 ? 'v' : (t > 0 ? 'o' : 'r'), libelle: t + ' / ' + h.total + ' lits' };
        }
        var s = h.services.filter(function(x) { return x.specialite == c.specialite; })[0];
        if (!s) return { niveau: 'g', libelle: '—' };
        return { niveau: s.lits >= 2 ? 'v' : (s.lits > 0 ? 'o' : 'r'), libelle: s.lits + ' / ' + s.total + ' lits' };
    }

    function popup(h) {
        var html = '<div class="tp-carte-popup"><h3>' + echap(h.nom) + '</h3><div>' + echap(h.type) + ' · ' + echap(h.zone) + '</div>' +
            '<div>' + echap(h.adresse) + '</div>' + (h.telephone ? '<div><a href="tel:' + echap(h.telephone.replace(/ /g, '')) + '">' + echap(h.telephone) + '</a></div>' : '') +
            (h.accepte ? '' : '<div><strong>N\'accepte pas de transferts actuellement</strong></div>') + '<table>';
        h.services.forEach(function(s) {
            html += '<tr' + (s.specialite == c.specialite ? ' style="color:#0B5D57;font-weight:900"' : '') + '><td>' + echap(s.nom) + '</td><td>' + s.lits + ' / ' + s.total + '</td></tr>';
        });
        html += '</table>';
        if (h.equipements.length)
            html += '<div style="margin-top:6px"><strong>Équipements libres</strong><br>' + h.equipements.map(function(e) { return echap(e.nom) + ' : ' + e.libres; }).join('<br>') + '</div>';
        return html + '</div>';
    }

    function decalage() { return c.data.c.maintenantMs ? c.data.c.maintenantMs - Date.now() : 0; }
    function fmt(s) { var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60; return (h > 0 ? h + ':' + deuxChiffres(m) : m) + ':' + deuxChiffres(r); }
    function vue(mt) {
        if (!mt || mt.sens != 'rebours' || !mt.echeanceMs) return null;
        var reste = Math.round((mt.echeanceMs - (Date.now() + c.decal)) / 1000);
        return reste >= 0 ? { texte: fmt(reste), classe: reste < 60 ? 'urgent' : 'ok' } : { texte: '+' + fmt(-reste), classe: 'depasse', depasse: true };
    }

    c.dessiner = function() {
        if (!carte) return;
        Object.keys(couches).forEach(function(k) { couches[k].clearLayers(); });
        marqueurs = {};
        c.liste = [];
        (c.data.c.hopitaux || []).forEach(function(h) {
            var n = niveau(h);
            var item = angular.extend({}, h, n);
            c.liste.push(item);
            var mk = L.circleMarker([h.lat, h.lon], { radius: h.mien ? 13 : 11, color: h.mien ? '#083F3B' : '#fff', weight: h.mien ? 4 : 3,
                fillColor: COULEURS[n.niveau], fillOpacity: 0.95 });
            mk.bindTooltip('<span class="tp-carte-etiq">' + echap(h.nom) + ' · ' + echap(n.libelle) + '</span>', { direction: 'right', offset: [10, 0] });
            mk.bindPopup(popup(h));
            mk.on('click', function() { $scope.$evalAsync(function() { c.selection = h.id; }); });
            mk.addTo(couches.hopitaux);
            marqueurs[h.id] = mk;
        });
        var rang = { v: 0, o: 1, r: 2, g: 3 };
        c.liste.sort(function(a, b) { return rang[a.niveau] - rang[b.niveau] || a.nom.localeCompare(b.nom); });
        if (c.voir.ambulances)
            (c.data.c.zones || []).forEach(function(z) {
                L.marker([z.lat + 0.006, z.lon + 0.004], { icon: L.divIcon({ className: '', iconSize: null,
                    html: '<span class="tp-carte-amb">Ambulances ' + z.libres + '</span>' }) })
                    .bindPopup('<div class="tp-carte-popup"><h3>Zone ' + echap(z.nom) + '</h3>' + z.vehicules.map(function(v) {
                        return echap(v.nom) + ' : ' + v.libres + ' libre(s)'; }).join('<br>') + '</div>')
                    .addTo(couches.zones);
            });
        if (c.voir.transferts)
            (c.data.c.transferts || []).forEach(function(t) {
                var ligne = L.polyline([t.de, t.vers], { color: '#D85A30', weight: 4, dashArray: '8 6' });
                ligne.bindTooltip('<span class="tp-carte-etiq">' + echap(t.numero) + ' · ' + echap(t.urgenceLabel) + (t.vehicule ? ' · ' + echap(t.vehicule) : '') + '</span>', { sticky: true });
                ligne.on('click', function() { window.location.href = '?id=tp_demande&sys_id=' + t.id; });
                ligne.addTo(couches.transferts);
            });
    };

    c.choisir = function(id) { c.specialite = id; c.dessiner(); };
    c.montrer = function(h) {
        c.selection = h.id;
        var mk = marqueurs[h.id];
        if (mk && carte) { carte.flyTo(mk.getLatLng(), Math.max(carte.getZoom(), 14), { duration: 0.6 }); mk.openPopup(); }
    };

    function tic() {
        (c.data.c.transferts || []).forEach(function(t) { t.v = vue(t.mt); });
    }

    function initialiser() {
        if (typeof L === 'undefined' || !document.getElementById(c.idCarte)) return $timeout(initialiser, 200);
        carte = L.map(c.idCarte, { scrollWheelZoom: true, zoomControl: true });
        // OpenStreetMap exige l'origine du site (en-tête Referer) ; la politique ServiceNow ne l'envoie pas par défaut :
        // on la transmet uniquement pour les tuiles de la carte, sans toucher au réglage de l'instance.
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, referrerPolicy: 'strict-origin-when-cross-origin',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">contributeurs OpenStreetMap</a>' }).addTo(carte);
        couches = { zones: L.layerGroup().addTo(carte), transferts: L.layerGroup().addTo(carte), hopitaux: L.layerGroup().addTo(carte) };
        var pts = (c.data.c.hopitaux || []).map(function(h) { return [h.lat, h.lon]; });
        if (pts.length) carte.fitBounds(pts, { padding: [40, 40] }); else carte.setView([14.72, -17.45], 12);
        c.dessiner();
    }

    c.decal = decalage();
    tic();
    var minuteur = $interval(tic, 1000);
    $timeout(initialiser, 0);
    $scope.$on('$destroy', function() { $interval.cancel(minuteur); if (carte) carte.remove(); });

    // Temps réel : lits, transferts, réservations (véhicules, équipements)
    ['x_2218203_ptrans_service', 'x_2218203_ptrans_demande', 'x_2218203_ptrans_reservation'].forEach(function(table) {
        spUtil.recordWatch($scope, table, 'sys_idISNOTEMPTY', function() {
            c.server.refresh().then(function() { c.decal = decalage(); tic(); c.dessiner(); });
        });
    });
}
