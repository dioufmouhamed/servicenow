(function executeRule(current, previous /*null when async*/) {
    // After update sur wm_order (FSM OOTB) — avancement répercuté sur la demande de transfert
    new x_2218203_ptrans.TransfertUtils().synchroniserDepuisWorkOrder(current);
})(current, previous);
