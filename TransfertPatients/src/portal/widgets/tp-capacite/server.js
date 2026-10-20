(function() {
    var p = new x_2218203_ptrans.TransfertPortail();
    if (input && input.action == 'ajuster')
        data.resultat = p.ajusterLits(input.serviceId, input.delta);
    data.coordinateur = p.etabsCoordonnes.length > 0;
    data.items = p.capacite();
    var etabs = {};
    data.items.forEach(function(s) { etabs[s.etablissement] = true; });
    data.plusieurs = Object.keys(etabs).length > 1;
})();
