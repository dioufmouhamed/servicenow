(function(batch, output) {
    for (var i = 0; i < batch.length; i++) {
       var inputFonction = batch[i].u_fonction.trim(); // Value of the input columns concatenated with '|'.
       var inputCadre = batch[i].u_cadre_utilisateur.trim();
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
        "Banctec":"|||banctec",
        "BNA": "bna|||",
        "dépannage":"shared|||depannage",
        "Enquêtes":"laboratoire|||",
        "Ergonomie":"primary|||medical",
        "Poste Fantôme": "hors reseau rq",
        "Fantôme": "hors reseau rq",
        "Fantome": "hors reseau rq",
        "ilot analyste VAO":"shared|||",
        "Impression massive":"|||ininterruptible",
        "Numériseur":"|||ininterruptible",
        "Poste courtoisie":"bna|||",
        "Poste de nuit":"|||ininterruptible",
        "Reprodocmic":"|||ininterruptible",
        "Résidence":"|||residence",
        "SCCM":"laboratoire|||",
        "WAAS":"laboratoire|||",
        "Super Calculateur":"|||ininterruptible",
        "Tenant de secours":"secondary|||tenant secours"    
     };
       if(inputFonction == "" && inputCadre == ""){
          output[i] = "|||";
       }
       else if(inputFonction != ""){for (var key in data_function) {
          if (key.includes(inputFonction)) {
             output[i] = data_function[key];
             break;
          }
       }}
       else {
          for (var keyCad in data_cadre_utilisateur) {
             if (keyCad.includes(inputCadre)) {
                output[i] = data_cadre_utilisateur[keyCad];
                break;
             } }
          }
       }
    })(batch, output);