function($scope, spUtil) {
    var c = this;
    c.onglets = [{ cle: 'recues', label: 'Reçues' }, { cle: 'emises', label: 'Émises' }, { cle: 'historique', label: 'Historique' }]
        .filter(function(o) { return o.cle != 'recues' || c.data.coordinateur; });
    c.urgences = [{ v: '1', l: 'Vitale' }, { v: '2', l: 'Urgente' }, { v: '3', l: 'Programmée' }];
    c.onglet = c.data.ongletInitial;
    c.aTraiter = false;
    c.urgence = '';
    c.filtre = function(l) {
        if (c.onglet == 'recues' && c.aTraiter && !l.aRepondre) return false;
        if (c.urgence && l.urgence != c.urgence) return false;
        return true;
    };
    ['x_2218203_ptrans_reponse', 'x_2218203_ptrans_demande'].forEach(function(t) {
        spUtil.recordWatch($scope, t, 'sys_idISNOTEMPTY', function() { c.server.refresh(); });
    });
}
