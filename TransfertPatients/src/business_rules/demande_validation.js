(function executeRule(current, previous /*null when async*/) {
    // Before insert/update — cohérence des données et clôture
    if (current.service_origine && current.service_origine.etablissement != current.getValue('etablissement_origine')) {
        gs.addErrorMessage("Le service d'origine n'appartient pas à l'établissement d'origine.");
        current.setAbortAction(true);
        return;
    }
    if (!current.short_description)
        current.setValue('short_description', 'Transfert ' + current.getDisplayValue('specialite_requise') +
            ' depuis ' + current.getDisplayValue('etablissement_origine'));
    var etat = current.getValue('state');
    current.setValue('active', ['3', '4', '7'].indexOf(etat) < 0);
})(current, previous);
