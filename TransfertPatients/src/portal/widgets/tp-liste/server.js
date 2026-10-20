(function() {
    var p = new x_2218203_ptrans.TransfertPortail();
    data.coordinateur = p.etabsCoordonnes.length > 0;
    data.recues = p.liste('recues');
    data.emises = p.liste('emises');
    data.historique = p.liste('historique');
    data.nbATraiter = data.recues.filter(function(l) { return l.aRepondre; }).length;
    data.ongletInitial = $sp.getParameter('onglet') || (data.coordinateur && (data.recues.length || !data.emises.length) ? 'recues' : 'emises');
})();
