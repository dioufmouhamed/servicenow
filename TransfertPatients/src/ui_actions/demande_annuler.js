current.setValue('state', '7');
current.work_notes = 'Demande annulée par ' + gs.getUserDisplayName() + '.';
current.update();
action.setRedirectURL(current);
