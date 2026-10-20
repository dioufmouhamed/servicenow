function($scope, spUtil) {
    var c = this;
    c.ajuster = function(s, delta) {
        c.envoi = true;
        c.server.get({ action: 'ajuster', serviceId: s.id, delta: delta }).then(function(r) {
            c.envoi = false;
            var res = r.data.resultat;
            if (res && !res.ok) spUtil.addErrorMessage(res.message);
            c.data.items = r.data.items;
        });
    };
    spUtil.recordWatch($scope, 'x_2218203_ptrans_service', 'sys_idISNOTEMPTY', function() { if (!c.envoi) c.server.refresh(); });
}
