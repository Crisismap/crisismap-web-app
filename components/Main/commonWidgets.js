

cm.define('helpDialog', ['config'], function(cm, cb) {
    var config = cm.get('config');
    var q = Handlebars.compile(config.user.helpDialogUrl)({
        lang: nsGmx.Translations.getLanguage()
    });
    $.ajax(q).then(function(resp) {
        cb(new nsGmx.ModalDialog({
            content: resp
        }))
    }).fail(function() {
        cb(new nsGmx.ModalDialog({
            content: 'unable to load ' + q
        }))
    });
});

cm.define('helpButton', ['headerMainMenu', 'helpDialog'], function(cm, cb) {
    var headerMainMenu = cm.get('headerMainMenu');
    var helpDialog = cm.get('helpDialog');

    headerMainMenu.on('item:help', function() {
        helpDialog.open();
    });

    return null;
});
