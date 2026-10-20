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
    function recaler(maintenantMs) { c.decalage = maintenantMs ? maintenantMs - Date.now() : 0; tic(); }
    var minuteur = $interval(function() { tic(); }, 1000);
    $scope.$on('$destroy', function() { $interval.cancel(minuteur); });
    function tic() {
        if (!c.data.r || !c.data.r.colonnes) return;
        c.data.r.colonnes.forEach(function(col) { col.cartes.forEach(function(x) { x.v = vue(x.mt, c.decalage); }); });
        c.prochaine = c.data.r.kpi && c.data.r.kpi.prochaineMs ? compte(c.data.r.kpi.prochaineMs) : null;
    }
    recaler(c.data.r && c.data.r.maintenantMs);
    ['x_2218203_ptrans_demande', 'x_2218203_ptrans_reponse', 'x_2218203_ptrans_service'].forEach(function(t) {
        spUtil.recordWatch($scope, t, 'sys_idISNOTEMPTY', function() { c.server.refresh().then(function() { recaler(c.data.r && c.data.r.maintenantMs); }); });
    });
}
