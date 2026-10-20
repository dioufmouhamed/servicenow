(function() {
    var p = new x_2218203_ptrans.TransfertPortail();
    if (input && input.action == 'mission')
        data.resultat = p.actionMission(input.demandeId, input.code, input.note);
    data.ambulancier = p.ambulancier;
    data.m = p.ambulancier ? p.missions() : { missions: [], terminees: 0, dansLesDelais: 0 };
})();
