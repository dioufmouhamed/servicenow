(function executeRule(current, previous /*null when async*/) {
    // Before update — enregistrement et contrôle de la décision de l'établissement
    var d = current.getValue('decision');
    var avant = previous ? previous.getValue('decision') : '';
    // Une réponse envoyée (acceptée ou refusée) est définitive pour l'établissement :
    // seules les suites gérées par le système restent possibles (retenue, non retenue, expirée).
    if ((avant == 'acceptee' || avant == 'refusee') && ['retenue', 'non_retenue', 'expiree'].indexOf(d) < 0) {
        gs.addErrorMessage('Cet établissement a déjà répondu : la réponse est définitive.');
        current.setAbortAction(true);
        return;
    }
    if (avant == 'refusee' && d == 'retenue') {
        gs.addErrorMessage('Une réponse refusée ne peut pas être retenue.');
        current.setAbortAction(true);
        return;
    }
    if (d == 'acceptee') {
        if (!current.service_propose || current.service_propose.etablissement != current.getValue('etablissement')) {
            gs.addErrorMessage('Pour accepter, indiquez un service de votre établissement.');
            current.setAbortAction(true);
            return;
        }
        if ((parseInt(current.service_propose.lits_disponibles, 10) || 0) < 1) {
            gs.addErrorMessage("Le service proposé n'a plus de lit disponible.");
            current.setAbortAction(true);
            return;
        }
    }
    if (d == 'retenue') {
        if (previous.getValue('decision') != 'acceptee' || current.demande.state != 10) {
            gs.addErrorMessage('Seule une réponse acceptée sur une demande publiée peut être retenue.');
            current.setAbortAction(true);
            return;
        }
        if ((parseInt(current.service_propose.lits_disponibles, 10) || 0) < 1) {
            gs.addErrorMessage("Le service proposé n'a plus de lit disponible.");
            current.setAbortAction(true);
            return;
        }
    }
    if (d == 'refusee' && !current.motif_refus) {
        gs.addErrorMessage('Pour refuser, indiquez un motif de refus.');
        current.setAbortAction(true);
        return;
    }
    if (d == 'acceptee' || d == 'refusee') {
        current.setValue('date_reponse', new GlideDateTime());
        current.setValue('repondu_par', gs.getUserID());
    }
})(current, previous);
