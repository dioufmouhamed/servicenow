(function executeRule(current, previous /*null when async*/) {
    // After update — arrivée, annulation ou expiration : libère les équipements et le véhicule réservés
    var motifs = { '3': 'Patient arrivé à destination', '7': 'Demande annulée', '4': 'Demande expirée' };
    var n = new x_2218203_ptrans.TransfertUtils().libererReservations(current, motifs[current.getValue('state')] || 'Clôture');
    if (n)
        gs.info('[Transfert Patients] ' + current.getValue('number') + ' : ' + n + ' réservation(s) libérée(s).');
})(current, previous);
