(function executeRule(current, previous /*null when async*/) {
    // Before insert/update — 0 <= lits disponibles <= lits totaux
    var total = parseInt(current.getValue('lits_totaux'), 10) || 0;
    var dispo = parseInt(current.getValue('lits_disponibles'), 10) || 0;
    if (dispo < 0 || dispo > total) {
        gs.addErrorMessage('Les lits disponibles doivent être compris entre 0 et ' + total + '.');
        current.setAbortAction(true);
    }
})(current, previous);
