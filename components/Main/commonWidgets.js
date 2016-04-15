


cm.define('helpButton', ['headerMainMenu', 'helpDialog'], function(cm, cb) {
    var headerMainMenu = cm.get('headerMainMenu');
    var helpDialog = cm.get('helpDialog');

    headerMainMenu.on('item:help', function() {
        helpDialog.open();
    });

    return null;
});
