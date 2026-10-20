function($scope, spUtil) {
    var c = this;
    ['x_2218203_ptrans_reponse', 'x_2218203_ptrans_demande', 'x_2218203_ptrans_service'].forEach(function(t) {
        spUtil.recordWatch($scope, t, 'sys_idISNOTEMPTY', function() { c.server.refresh(); });
    });
}
