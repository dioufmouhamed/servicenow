var grUPC = new GlideRecord('u_picci_computer');
grUPC.addEncodedQuery("");
//grUPC.query();
while (grUPC.next()) {

    // find function and cadre utilisateur dans la table intermediaire
    var resultat = getInfo(grUPC);
    resultat = resultat.split("|||");

    //update Asset 
    var grAH = new GlideRecord('alm_hardware');
    grAH.addEncodedQuery("asset_tagISNOTEMPTY^asset_tag=" + grUPC.u_nom_ci);
    grAH.setLimit(1);
    grAH.query();
    if (grAH.next()) {
        // asset_function  u_application_d_actif
        grAH.asset_function = resultat[0];
        grAH.u_application_d_actif = resultat[1];
		grAH.update();

    }
}

function getInfo(gr) {
    var inputFonction = gr.u_fonction.trim(); // la fonction de l'asset
    var inputCadre = gr.u_cadre_utilisateur.trim(); // le cadre de l'utilisateur
    var result = "";
    // Access input column values by their names, ex: batch[i].column_name

    var data_function = {
        "Accueil": "shared|||",
        "Contingence": "shared|||",
        "Formation": "shared|||",
        "Ilôt": "shared|||",
        "Individuel": "primary|||",
        "Période de pointe": "shared|||peak period",
        "Secondaire": "secondary|||",
        "Laboratoire": "laboratoire|||",
    };
    var data_cadre_utilisateur = {
        "Banctec": "|||banctec",
        "BNA": "bna|||",
        "dépannage": "shared|||depannage",
        "Enquêtes": "laboratoire|||",
        "Ergonomie": "primary|||medical",
        "Poste Fantôme": "|||hors reseau rq",
        "Fantôme": "|||hors reseau rq",
        "Fantome": "|||hors reseau rq",
        "ilot analyste VAO": "shared|||",
        "Impression massive": "|||ininterruptible",
        "Numériseur": "|||ininterruptible",
        "Poste courtoisie": "bna|||",
        "Poste de nuit": "|||ininterruptible",
        "Reprodocmic": "|||ininterruptible",
        "Résidence": "|||residence",
        "SCCM": "laboratoire|||",
        "WAAS": "laboratoire|||",
        "Super Calculateur": "|||ininterruptible",
        "Tenant de secours": "secondary|||tenant secours"
    };
    if (inputFonction == "" && inputCadre == "") {
        result = "|||";
    } else if (inputFonction != "") {
        for (var key in data_function) {
            if (key.includes(inputFonction)) {
                result = data_function[key];
                break;
            }
        }
    } else {
        for (var keyCad in data_cadre_utilisateur) {
            if (keyCad.includes(inputCadre)) {
                result = data_cadre_utilisateur[keyCad];
                break;
            }
        }
    }

    return result;
}