// Fix script: collecte les doublons de x_bellc_fsm_consumed_dictionary
// Un doublon = meme combinaison code + property_name + effective_end + effective_start
// On garde le record le plus ancien (sys_created_on) de chaque groupe, le reste est collecte comme doublon a supprimer.

var DRY_RUN = true; // passer a false pour effectuer la suppression apres validation des logs

var TABLE = "x_bellc_fsm_consumed_dictionary";
var duplicatesToDelete = [];

var grAgg = new GlideAggregate(TABLE);
grAgg.addAggregate("COUNT");
grAgg.groupBy("code");
grAgg.groupBy("property_name");
grAgg.groupBy("effective_end");
grAgg.groupBy("effective_start");
grAgg.addHaving("COUNT", ">", 1);
grAgg.query();

var groupCount = 0;

while (grAgg.next()) {
    groupCount++;

    var code = grAgg.getValue("code");
    var propertyName = grAgg.getValue("property_name");
    var effectiveEnd = grAgg.getValue("effective_end");
    var effectiveStart = grAgg.getValue("effective_start");

    var grDup = new GlideRecord(TABLE);
    grDup.addQuery("code", code);
    grDup.addQuery("property_name", propertyName);
    grDup.addQuery("effective_end", effectiveEnd);
    grDup.addQuery("effective_start", effectiveStart);
    grDup.orderBy("sys_created_on");
    grDup.query();

    var isFirst = true;
    while (grDup.next()) {
        if (isFirst) {
            // on garde le plus ancien
            isFirst = false;
            continue;
        }
        duplicatesToDelete.push(grDup.getUniqueValue());
        gs.info(
            "[DUP CONSUMED_DICTIONARY] sys_id=" + grDup.getUniqueValue() +
            " code=" + code +
            " property_name=" + propertyName +
            " effective_start=" + effectiveStart +
            " effective_end=" + effectiveEnd +
            " sys_created_on=" + grDup.getValue("sys_created_on")
        );
    }
}

gs.info("[DUP CONSUMED_DICTIONARY] Groupes en doublon: " + groupCount + " | Records a supprimer: " + duplicatesToDelete.length);

if (!DRY_RUN) {
    var grDelete = new GlideRecord(TABLE);
    grDelete.addQuery("sys_id", "IN", duplicatesToDelete.join(","));
    grDelete.query();
    grDelete.deleteMultiple();
    gs.info("[DUP CONSUMED_DICTIONARY] Suppression effectuee: " + duplicatesToDelete.length + " records.");
} else {
    gs.info("[DUP CONSUMED_DICTIONARY] DRY_RUN actif, aucune suppression effectuee.");
}
