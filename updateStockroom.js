function prepareData(row) {
    myData = {};
    //Update the below variables based on your Excel column name and need
    myData.nom = row['nom'];
    myData.picci = row['picci'];

    return myData;
}
gs.log("Debut de la correction", "stockroom updated start");
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
        myobjArray.push(prepareData(row));
    }
    var listnom = "";
    //gs.info(JSON.stringify(myobjArray[0])); 
    for (var index in myobjArray) {
        if (index == 0)
            listnom = "u_emplacement_picciLIKE" + myobjArray[index].picci;
        else listnom += "^ORu_emplacement_picciLIKE" + myobjArray[index].picci;
    }
    //gs.info(JSON.stringify(listnom));
    var grAlmAsset = new GlideRecord('alm_asset');
    grAlmAsset.addEncodedQuery("life_cycle_stage=Inventory^life_cycle_stage_status=Available^" + listnom);
    //grAlmAsset.setLimit(10);
    grAlmAsset.query();
    var listAsset = [];
    while (grAlmAsset.next()) {

        var emplacement = grAlmAsset.u_emplacement_picci.toString();
        for (var i in myobjArray) {
            if (emplacement.includes(myobjArray[i].picci)) {
                grAlmAsset.stockroom = getStockroom(myobjArray[i].nom);
                //grAlmAsset.update();
                //gs.log("stage "+grAlmAsset.life_cycle_stage+" : status"+grAlmAsset.life_cycle_stage_status,"stockroom status");
                gs.log("Asset id " + grAlmAsset.asset_tag + " : " + grAlmAsset.u_emplacement_picci + " , stockroom id :" + getStockroom(myobjArray[i].nom), "stockroom updated");
                listAsset.push(grAlmAsset.asset_tag.toString());
            }
        }
    }
    //gs.log("Asset id " + current.getUniqueValue(), "stockroom current");
}
gs.log("Fin de la correction", "stockroom updated complete");
function getStockroom(name) {
    var grAS = new GlideRecord('alm_stockroom');
    grAS.addEncodedQuery("name=" + name);
    grAS.orderBy('name');
    grAS.setLimit(1);
    grAS.query();
    if (grAS.next()) return grAS.sys_id;
    else return -1;
}

function getSysidAttachment() {
    var grSA = new GlideRecord('sys_attachment');
    grSA.addEncodedQuery("table_sys_id=" + current.getUniqueValue());
    grSA.query();
    if (grSA.next()) {
        return grSA.sys_id;
    }
    return -1;
}


{
	"contextual": [
		"record",
		"kb_view"
	],
	"newTabMenu": [
		{
			"label": {
				"translatable": true,
				"message": "New Interaction"
			},
			"routeInfo": {
				"route": "record",
				"fields": {
					"table": "interaction",
					"sysId": "-1"
				},
				"multiInstField": "sysId"
			},
			"condition": {
				"tableDescription": {
					"table": "interaction",
					"canCreate": true
				}
			}
		},
		{
			"label": {
				"translatable": true,
				"message": "New Incident de securite"
			},
			"routeInfo": {
				"route": "record",
				"fields": {
					"table": "incident",
					"sysId": "-1",
                    "sysparm_securise": true
				},
				"multiInstField": "sysId"
			},
			"condition": {
				"tableDescription": {
					"table": "incident",
					"canCreate": true
				}
			}
		},
		{
			"label": {
				"translatable": true,
				"message": "New Secure Incident"
			},
			"routeInfo": {
				"route": "create-change-request-page",
				"fields": {},
				"multiInstField": ""
			},
			"condition": {
				"tableDescription": {
					"table": "change_request",
					"canCreate": true
				}
			}
		}
	],
	"maxMainTabLimit": 10,
	"maxTotalSubTabLimit": 30
}