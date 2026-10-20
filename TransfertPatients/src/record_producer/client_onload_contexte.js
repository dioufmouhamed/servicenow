function onLoad() {
    // Pré-remplit établissement, service et téléphone d'après le profil de l'agent connecté
    var ga = new GlideAjax('x_2218203_ptrans.TransfertAjax');
    ga.addParam('sysparm_name', 'getContexte');
    ga.getXMLAnswer(function(answer) {
        if (!answer)
            return;
        var ctx = JSON.parse(answer);
        if (ctx.etablissement && !g_form.getValue('etablissement_origine'))
            g_form.setValue('etablissement_origine', ctx.etablissement, ctx.etablissement_nom);
        if (ctx.service && !g_form.getValue('service_origine'))
            g_form.setValue('service_origine', ctx.service, ctx.service_nom);
        if (ctx.telephone && !g_form.getValue('telephone_contact'))
            g_form.setValue('telephone_contact', ctx.telephone);
        if (ctx.etablissement)
            g_form.addInfoMessage('Établissement' + (ctx.service ? ' et service' : '') +
                " d'origine pré-remplis d'après votre profil. Vous pouvez les modifier.");
    });
}
