function onChange(control, oldValue, newValue, isLoading) {
    // Propose niveau de soins, mode de transport et équipements configurés sur la spécialité
    if (isLoading || !newValue || newValue == oldValue)
        return;
    var ga = new GlideAjax('x_2218203_ptrans.TransfertAjax');
    ga.addParam('sysparm_name', 'getSuggestions');
    ga.addParam('sysparm_specialite', newValue);
    ga.getXMLAnswer(function(answer) {
        var s = JSON.parse(answer || '{}');
        if (s.niveau_soins)
            g_form.setValue('niveau_soins', s.niveau_soins);
        if (s.mode_transport)
            g_form.setValue('mode_transport', s.mode_transport);
        if (s.equipements)
            g_form.setValue('equipements_requis', s.equipements, s.equipements_noms);
        else
            g_form.clearValue('equipements_requis');
        g_form.hideFieldMsg('specialite_requise', true);
        g_form.showFieldMsg('specialite_requise',
            'Niveau de soins, mode de transport et équipements proposés pour cette spécialité : vérifiez-les.', 'info');
    });
}
