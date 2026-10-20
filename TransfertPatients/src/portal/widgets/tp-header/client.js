function($window) {
    var c = this;
    // Ambulancier sans autre rôle : le portail se limite à « Mes missions »
    if (c.data.ambulancierSeul && c.data.page != 'tp_missions')
        $window.location.replace('?id=tp_missions');
}
