function prepareData(row) {
    myData = {};
   //Update the below variables based on your Excel column name and need
    myData.nom = row['nom'];
    myData.picci = row['picci'];
    
    return myData;
}
var myobjArray = [];
var attachmentSID = '24cfb4da473c9a506d84e9d4116d43fb'; // pass your excel attachment sys_id
var parser = new sn_impex.GlideExcelParser();
var attachment = new GlideSysAttachment();

// use attachment sys id of an excel file
var attachmentStream = attachment.getContentStream(attachmentSID);
parser.parse(attachmentStream);
while (parser.next()) {
    var row = parser.getRow();
    myobjArray.push(prepareData(row));
}
gs.info(JSON.stringify(myobjArray)); 