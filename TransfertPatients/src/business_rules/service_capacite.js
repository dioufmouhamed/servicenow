(function executeRule(current, previous /*null when async*/) {
    // After insert/update/delete — recalcul de la capacité de l'établissement
    var utils = new x_2218203_ptrans.TransfertUtils();
    utils.recalculerCapacite(current.getValue('etablissement'));
    if (previous && previous.getValue('etablissement') && previous.getValue('etablissement') != current.getValue('etablissement'))
        utils.recalculerCapacite(previous.getValue('etablissement'));
})(current, previous);
