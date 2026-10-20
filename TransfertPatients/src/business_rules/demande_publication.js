(function executeRule(current, previous /*null when async*/) {
    // Before insert/update — état passe à "Publiée" : calcul des établissements éligibles
    new x_2218203_ptrans.TransfertUtils().publier(current);
})(current, previous);
