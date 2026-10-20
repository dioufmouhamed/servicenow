(function() {
    var p = new x_2218203_ptrans.TransfertPortail();
    var id = (input && input.sys_id) || $sp.getParameter('sys_id');
    if (input && input.action == 'repondre')
        data.resultat = p.repondre(input.params);
    else if (input && input.action == 'retenir')
        data.resultat = p.retenir(input.reponseId);
    else if (input && input.action == 'republier')
        data.resultat = p.republier(id);
    else if (input && input.action == 'relancer')
        data.resultat = p.relancer({ demandeId: id, serviceId: input.serviceId, commentaire: input.commentaire });
    else if (input && input.action == 'etat')
        data.resultat = p.changerEtat(id, input.etat);
    data.d = p.detail(id);
    data.sys_id = id;
    data.regulation = p.regulateur;
})();
