(function() {
    var p = new x_2218203_ptrans.TransfertPortail();
    if (input && input.action == 'repondre')
        data.resultat = p.repondre(input.params);
    data.coordinateur = p.etabsCoordonnes.length > 0;
    data.items = p.aTraiter();
    data.maintenantMs = new GlideDateTime().getNumericValue();
    data.motifs = p._choix('x_2218203_ptrans_reponse', 'motif_refus');
})();
