(function executeRule(current, previous /*null when async*/) {
    // After update — compteur d'acceptations sur la demande
    new x_2218203_ptrans.TransfertUtils().compterAcceptations(current.getValue('demande'));
})(current, previous);
