(function executeRule(current, previous /*null when async*/) {
    // After update — demande annulée ou expirée : clôture des réponses ouvertes
    var rep = new GlideRecord('x_2218203_ptrans_reponse');
    rep.addQuery('demande', current.getUniqueValue());
    rep.addQuery('decision', 'IN', 'en_attente,acceptee');
    rep.query();
    while (rep.next()) {
        rep.setValue('decision', current.getValue('state') == '4' ? 'expiree' : 'non_retenue');
        rep.update();
    }
})(current, previous);
