(function() {
    var p = new x_2218203_ptrans.TransfertPortail();
    var c = p.contexte();
    data.utilisateur = c.utilisateur;
    data.initiales = c.initiales;
    data.etablissements = c.etablissements;
    data.producteur = c.producteur;
    data.page = $sp.getParameter('id') || 'tp_accueil';
    data.liens = [
        { label: 'Accueil', url: '?id=tp_accueil', page: 'tp_accueil' },
        { label: 'Demandes', url: '?id=tp_demandes', page: 'tp_demandes' },
        { label: 'Carte', url: '?id=tp_carte', page: 'tp_carte' }
    ];
    if (c.ambulancierSeul)
        data.liens = [];
    if (c.ambulancier)
        data.liens.push({ label: 'Mes missions', url: '?id=tp_missions', page: 'tp_missions' });
    data.ambulancierSeul = c.ambulancierSeul;
    if (c.coordinateur)
        data.liens.push({ label: 'Capacité', url: '?id=tp_accueil#capacite', page: '' });
    if (c.regulateur)
        data.liens.push({ label: 'Régulation', url: '?id=tp_regulation', page: 'tp_regulation' });
})();
