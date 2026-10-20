// Après insertion : publication immédiate si demandée (déclenche la BR "Demande - publication").
if (producer.publier_immediatement == 'true') {
    current.setValue('state', '10');
    current.update();
}
