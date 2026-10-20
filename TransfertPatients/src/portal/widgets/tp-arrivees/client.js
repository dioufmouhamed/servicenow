function($scope, $interval, spUtil) {
    var c = this;
    var deuxChiffres = function(n) { return (n < 10 ? '0' : '') + n; };
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
    function tic() { (c.data.items || []).forEach(function(a) { a.v = vue(a.mt, c.decalage); }); }
    function recaler() { c.decalage = c.data.maintenantMs ? c.data.maintenantMs - Date.now() : 0; tic(); }
    var minuteur = $interval(tic, 1000);
    $scope.$on('$destroy', function() { $interval.cancel(minuteur); });
    recaler();
    ['x_2218203_ptrans_demande', 'wm_task'].forEach(function(t) {
        spUtil.recordWatch($scope, t, 'sys_idISNOTEMPTY', function() { c.server.refresh().then(recaler); });
    });
}
