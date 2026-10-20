function($scope, spUtil) {
    var c = this;
    spUtil.recordWatch($scope, 'x_2218203_ptrans_demande', 'sys_idISNOTEMPTY', function() { c.server.refresh(); });
}
