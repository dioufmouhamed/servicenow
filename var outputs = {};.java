	var outputs = {};
	var tache = "3d87ef7b3b5e2610a0c07424c3e45ab0";
	var retour = true;
	var erreur_message = '';


	function prepareData(row) {
	    myData = {};
	    myData.asset_tag = row['Asset tag'];
	    myData.location = row['Emplacement'];

	    return myData;
	}

	var attachmentSID = getSysidAttachment(); // pass your excel attachment sys_id
	if (attachmentSID && attachmentSID != -1) {

	    var myobjArray = [];

	    var parser = new sn_impex.GlideExcelParser();
	    var attachment = new GlideSysAttachment();

	    // use attachment sys id of an excel file
	    var attachmentStream = attachment.getContentStream(attachmentSID);
	    parser.parse(attachmentStream);
	    while (parser.next()) {
			var row = parser.getRow();
			var cleansRow = trimKeys(row)
            myobjArray.push(prepareData(cleansRow));
	 
	        //gs.print(JSON.stringify(row))
	    }

	    var liste_machine_introuvable = [];
	    for (var index in myobjArray) {
	        var tabobjet = myobjArray[index];
	        //gs.log(index)
	    }
	    gs.log(JSON.stringify(myobjArray, "null", 2));
	    
	}


	function getSysidAttachment() {
	    var grSA = new GlideRecord('sys_attachment');
	    grSA.addEncodedQuery("table_sys_id=" + tache);
	    grSA.query();
	    if (grSA.next()) {
	        return grSA.sys_id;
	    }
	    return -1;
	}

	function trimKeys(obj) {
    var newObj = {};
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            // Supprimer les espaces de fin
            var newKey = key.trim();
            newObj[newKey] = obj[key];
        }
    }
    return newObj;
}