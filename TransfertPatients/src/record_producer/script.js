// Record Producer « Demande de transfert de patient » — avant insertion.
// Les variables mappées (map_to_field) sont copiées automatiquement sur la demande.
current.setValue('opened_by', gs.getUserID());
current.setValue('state', '1'); // Brouillon : la publication se fait après insertion
if (!current.getValue('patient_age') || isNaN(parseInt(current.getValue('patient_age'), 10)))
    current.setValue('patient_age', '');
producer.redirect = 'x_2218203_ptrans_demande.do?sys_id=' + current.getUniqueValue();       // interface classique
producer.portal_redirect = '?id=tp_demande&sys_id=' + current.getUniqueValue();            // Service Portal
