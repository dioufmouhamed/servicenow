var TransfertAjax = Class.create();
TransfertAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    /** Formulaire de demande : établissement, service et téléphone de l'utilisateur connecté. */
    getContexte: function() {
        return JSON.stringify(new x_2218203_ptrans.TransfertUtils().contexteDemandeur(gs.getUserID()));
    },

    /** Formulaire de demande : niveau de soins, mode de transport et équipements proposés pour une spécialité. */
    getSuggestions: function() {
        return JSON.stringify(new x_2218203_ptrans.TransfertUtils().suggestionsSpecialite(this.getParameter('sysparm_specialite')));
    },

    type: 'TransfertAjax'
});
