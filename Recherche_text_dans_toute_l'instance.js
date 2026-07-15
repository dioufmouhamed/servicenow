// Execute in background script
(function bgScript() {
    /**
     * A AMERLIORER
     * @param {string} fieldType Valeur à rechercher dans le type du champ
     * @returns {Object} Un objet mappant les noms des tables et les noms des champs trouvées
     * @example {
     *      nom_table1: nom_champ1_table1,
     *      nom_table1: nom_champ2_table1,
     *      nom_table2: nom_champ1_table2
     *      ...
     * }
     */
    function getTableFieldMapping(fieldType) {
        var dictGR = new GlideRecord('sys_dictionary');
        dictGR.addEncodedQuery('internal_type.labelLIKE' + fieldType);
        dictGR.query();
        var mapping = {};
        while (dictGR.next()) {
            mapping[dictGR.name.toString()] = dictGR.element.toString();
        }
        return mapping;
    }

    /**
     * Enrichit l'objet passé en paramètre de l'argument "results" avec les résultats de la recherche dans les tables et champs spécifiés
     * @param {string} table Nom de la table à vérifier
     * @param {string} valueToCheck Valeur à rechercher dans le champ
     * @param {Object} mapping Obje mapping des tables et champs à vérifier (retourné par getTableFieldMapping())
     * @param {Object} results Objet contenant les résultats de la recherche
     * @param {Array} excludeTables Tableaux des tables à exclure de la recherche
     */
    function checkTable(table, valueToCheck, mapping, results, excludeTables) {
        if (excludeTables.indexOf(table) !== -1) return;
        var record = new GlideRecord(table);
        var fieldName = mapping[table];
        record.addEncodedQuery(fieldName + 'LIKE' + valueToCheck + '^active=true');
        record.query();
        while (record.next()) {
            if (!results[table]) results[table] = [];
            results[table].push(record.getUniqueValue());
        }
    }

    /**
     * Affiche les résultats de la recherche dans la fenêtre de résultat d'execution du script
     * @param {string} valueToCheck Valeur à rechercher dans les champs
     * @param {string} fieldType Valeur à rechercher dans le type du champ. Servira à constituer la liste des champs à vérifier (voir getTableFieldMapping())
     * @param {Array} excludeTables Tableaux des tables à exclure de la recherche
     */
    function checkValueInFieldsOfType(valueToCheck, fieldType, excludeTables) {
        var mapping = getTableFieldMapping(fieldType);
        var results = {};
        var tables = Object.keys(mapping);
        tables.forEach(function (table) { checkTable(table, valueToCheck, mapping, results, excludeTables); });

        gs.print(JSON.stringify(results, null, 4));
    }

    //jjjgjg
    //test
    checkValueInFieldsOfType('u_work_notes', 'script', ['sys_script_execution_history']);
})();
