function($scope, $interval, spUtil) {
    var c = this;
    // Minuteur temps réel : une mise à jour par seconde, recalée sur l'heure du serveur
    var deuxChiffres = function(n) { return (n < 10 ? '0' : '') + n; };
    function compte(limiteMs) {
        if (!limiteMs) return null;
        var reste = Math.floor((limiteMs - (Date.now() + (c.decalage || 0))) / 1000);
        if (reste <= 0) return { texte: 'Délai dépassé', classe: 'depasse', lisible: 'délai dépassé' };
        var h = Math.floor(reste / 3600), m = Math.floor((reste % 3600) / 60), s = reste % 60;
        return { texte: (h > 0 ? h + ':' : '') + deuxChiffres(m) + ':' + deuxChiffres(s),
                 classe: reste < 60 ? 'urgent' : 'ok', lisible: (h > 0 ? h + ' h ' : '') + m + ' min' };
    }
    function recaler(maintenantMs) { c.decalage = maintenantMs ? maintenantMs - Date.now() : 0; tic(); }
    var minuteur = $interval(function() { tic(); }, 1000);
    $scope.$on('$destroy', function() { $interval.cancel(minuteur); });
    function tic() { (c.data.items || []).forEach(function(d) { d.cd = compte(d.limiteMs); }); }
    recaler(c.data.maintenantMs);
    c.mode = {}; c.service = {}; c.motif = {};
    c.repondre = function(d, decision) {
        c.envoi = true;
        c.server.get({ action: 'repondre', params: {
            reponseId: d.reponseId, decision: decision,
            serviceId: c.service[d.reponseId] || d.serviceId, motif: c.motif[d.reponseId]
        } }).then(function(r) {
            c.envoi = false;
            var res = r.data.resultat;
            if (res && res.ok) spUtil.addInfoMessage(res.message); else if (res) spUtil.addErrorMessage(res.message);
            c.data.items = r.data.items;
            recaler(r.data.maintenantMs);
        });
    };
    ['x_2218203_ptrans_reponse', 'x_2218203_ptrans_service'].forEach(function(t) {
        spUtil.recordWatch($scope, t, 'sys_idISNOTEMPTY', function() { if (!c.envoi) c.server.refresh().then(function() { recaler(c.data.maintenantMs); }); });
    });
}
