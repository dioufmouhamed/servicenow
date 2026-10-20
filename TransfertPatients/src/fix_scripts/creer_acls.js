/**
 * Transfert Patients — création des ACL de l'application.
 * Fix Script en scope GLOBAL (un script scopé ne peut pas créer d'ACL) ; les ACL sont rattachées à l'application.
 * À exécuter UNE fois, session élevée en security_admin :
 *   Avatar > Elevate role > security_admin, puis ouvrir ce Fix Script > "Run Fix Script".
 * Idempotent : peut être relancé sans créer de doublons. Le résultat réel (créées / échecs) est affiché.
 */
(function() {
    var P = 'x_2218203_ptrans';
    var APP = 'f17d5cef93fb8310668230018bba10a9';
    var ok = 0, ko = [];
    var ADMIN = P + '.admin', REG = P + '.regulateur', COORD = P + '.coordinateur', DEM = P + '.demandeur';
    var U = 'new ' + P + '.TransfertUtils()';

    function acl(table, op, roles, script, desc) {
        var name = P + '_' + table;
        var gr = new GlideRecord('sys_security_acl');
        gr.addQuery('name', name);
        gr.addQuery('operation', op);
        gr.addQuery('description', desc);
        gr.query();
        if (!gr.next()) {
            gr.initialize();
            gr.setValue('name', name);
            gr.setValue('operation', op);
            gr.setValue('type', 'record');
            gr.setValue('description', desc);
        }
        gr.setValue('sys_scope', APP);
        gr.setValue('active', true);
        gr.setValue('admin_overrides', true);
        gr.setValue('advanced', !!script);
        gr.setValue('script', script || '');
        var id = gr.isNewRecord() ? gr.insert() : gr.update();
        if (!id) {
            ko.push(name + ' ' + op + ' (' + desc + ')');
            return;
        }

        var old = new GlideRecord('sys_security_acl_role');
        old.addQuery('sys_security_acl', id);
        old.deleteMultiple();
        for (var i = 0; i < roles.length; i++) {
            var role = new GlideRecord('sys_user_role');
            if (!role.get('name', roles[i]))
                continue;
            var r = new GlideRecord('sys_security_acl_role');
            r.initialize();
            r.setValue('sys_security_acl', id);
            r.setValue('sys_user_role', role.getUniqueValue());
            r.setValue('sys_scope', APP);
            if (!r.insert())
                ko.push(name + ' ' + op + ' : rôle ' + roles[i]);
        }
        ok++;
    }

    var tous = [ADMIN, REG, COORD, DEM];

    // Référentiel
    ['specialite', 'etablissement', 'service'].forEach(function(t) {
        acl(t, 'read', tous, '', 'Lecture référentiel');
        acl(t, 'create', [ADMIN], '', 'Administration référentiel');
        acl(t, 'write', [ADMIN], '', 'Administration référentiel');
        acl(t, 'delete', [ADMIN], '', 'Administration référentiel');
    });
    acl('etablissement', 'write', [COORD], 'answer = ' + U + '.estCoordinateur(current.getUniqueValue());',
        'Coordinateur : son établissement');
    acl('service', 'write', [COORD], "answer = " + U + ".estCoordinateur(current.getValue('etablissement'));",
        'Coordinateur : capacité de ses services');
    acl('service', 'create', [COORD], "answer = current.isNewRecord() && (!current.etablissement || " + U + ".estCoordinateur(current.getValue('etablissement')));",
        'Coordinateur : ajout de services');

    // Demandes
    acl('demande', 'read', [ADMIN, REG], '', 'Régulation');
    acl('demande', 'create', [ADMIN, REG], '', 'Régulation');
    acl('demande', 'write', [ADMIN, REG], '', 'Régulation');
    acl('demande', 'delete', [ADMIN], '', 'Administration');
    acl('demande', 'read', [COORD],
        "var r = new GlideRecord('" + P + "_reponse'); r.addQuery('demande', current.getUniqueValue()); " +
        "r.addQuery('etablissement', 'IN', " + U + ".mesEtablissements()); r.setLimit(1); r.query(); answer = r.hasNext();",
        'Coordinateur : demandes publiées à son établissement');

    // Agents d'établissement (demandeurs) et coordinateurs : leurs propres demandes
    acl('demande', 'create', [DEM, COORD], '', "Agent d'établissement : création");
    acl('demande', 'read', [DEM], "answer = current.getValue('opened_by') == gs.getUserID();",
        'Demandeur : ses propres demandes');
    acl('demande', 'write', [DEM, COORD], "answer = current.getValue('opened_by') == gs.getUserID() && ['1','10','20'].indexOf(current.getValue('state')) > -1;",
        'Demandeur : publier ou annuler sa demande');

    // Réponses
    acl('reponse', 'read', [ADMIN, REG], '', 'Régulation');
    acl('reponse', 'write', [ADMIN, REG], '', 'Régulation (retenir une destination)');
    acl('reponse', 'create', [ADMIN], '', 'Créées par la publication');
    acl('reponse', 'delete', [ADMIN], '', 'Administration');
    acl('reponse', 'read', [COORD], "answer = " + U + ".estCoordinateur(current.getValue('etablissement'));",
        'Coordinateur : réponses de son établissement');
    acl('reponse', 'write', [COORD], "answer = " + U + ".estCoordinateur(current.getValue('etablissement'));",
        'Coordinateur : répondre pour son établissement');

    // Relances (établissement qui a manqué une demande expirée)
    acl('relance', 'read', [ADMIN, REG], '', 'Régulation');
    acl('relance', 'read', [COORD], "answer = " + U + ".estCoordinateur(current.getValue('etablissement'));",
        'Coordinateur : relances de son établissement');
    acl('relance', 'read', [DEM, COORD], "answer = current.demande.opened_by == gs.getUserID();",
        'Demandeur : relances reçues sur ses demandes');
    acl('relance', 'create', [ADMIN], '', 'Créées par le portail');
    acl('relance', 'write', [ADMIN], '', 'Administration');
    acl('relance', 'delete', [ADMIN], '', 'Administration');

    // Réservations d'assets (créées et libérées par la logique métier) et règles de disponibilité
    acl('reservation', 'read', [ADMIN, REG], '', 'Régulation');
    acl('reservation', 'read', [COORD], "answer = current.etablissement.nil() || " + U + ".estCoordinateur(current.getValue('etablissement'));",
        'Coordinateur : réservations de son établissement');
    acl('reservation', 'create', [ADMIN], '', 'Créées par la logique métier');
    acl('reservation', 'write', [ADMIN], '', 'Administration');
    acl('reservation', 'delete', [ADMIN], '', 'Administration');
    acl('regle_equipement', 'read', tous, '', 'Lecture référentiel');
    acl('regle_equipement', 'create', [ADMIN], '', 'Administration référentiel');
    acl('regle_equipement', 'write', [ADMIN], '', 'Administration référentiel');
    acl('regle_equipement', 'delete', [ADMIN], '', 'Administration référentiel');

    if (ko.length) {
        gs.addErrorMessage('Transfert Patients : ' + ko.length + ' échec(s). Vérifiez que la session est élevée en security_admin. ' + ko.join(' ; '));
        gs.error('[Transfert Patients] ACL en échec : ' + ko.join(' ; '));
    }
    gs.addInfoMessage('Transfert Patients : ' + ok + ' ACL créées ou mises à jour.');
    gs.info('[Transfert Patients] ' + ok + ' ACL créées ou mises à jour, ' + ko.length + ' échec(s).');
})();
