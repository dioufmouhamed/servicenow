current.setValue('decision', 'retenue');
if (current.update())
    gs.addInfoMessage('Destination retenue : lit réservé et ordre de transport FSM créé.');
action.setRedirectURL(current.demande.getRefRecord());
