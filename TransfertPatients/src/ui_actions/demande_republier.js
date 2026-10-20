var nouvelle = new x_2218203_ptrans.TransfertUtils().republier(current);
if (nouvelle) {
    gs.addInfoMessage('Demande republiée en ' + nouvelle.getValue('number') + '.');
    action.setRedirectURL(nouvelle);
} else {
    gs.addErrorMessage("Cette demande n'est pas republiable (non expirée ou déjà republiée).");
    action.setRedirectURL(current);
}
