+ function() {
    cm.define('config', [], function(cm, cb) {
        $.ajax('resources/config.json').then(function(config) {
            $.ajax('local/config.json').then(function(localConfig) {
                cb(L.extend(config, localConfig));
            }).fail(function() {
                cb(config);
            });
        }).fail(function() {
            console.error('Config: error loading config file');
            cb(false);
        });
    });

    cm.define('gmxApplication', ['config'], function(cm, cb) {
        var config = cm.get('config');
        var gmxApplication = nsGmx.createGmxApplication(document.getElementsByClassName('mapContainer')[0], config);
        gmxApplication.create().then(function() {
            cb(gmxApplication);
        });
    });

    cm.create();
}();