cm.define('container', [], function () {
    return document.body;
});

cm.define('config', [], function(cm, cb) {
    $.ajax('resources/config.json').then(function(config) {
        $.ajax('local/config.json').then(function(localConfig) {
            cb(mimeFix($.extend(true, config, localConfig)));
        }).fail(function() {
            cb(mimeFix(config));
        });
    }).fail(function() {
        console.error('Config: error loading config file');
        cb(mimeFix(false));
    });

    // seems that cordova does'nt support JSON mime type
    function mimeFix(resp) {
        return typeof resp === 'object' ? resp : JSON.parse(resp);
    }
});

cm.define('leafletProductionIssues', [], function(cm) {
    L.Icon.Default = L.Icon.Default.extend({
        options: {
            iconUrl: 'resources/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [15, 37],
            popupAnchor: [0, -25],
            shadowUrl: 'resources/marker-icon.png',
            shadowSize: [0, 0],
            shadowAnchor: [0, 0]
        }
    });

    L.Icon.Default.imagePath = 'resources';

    L.Marker = L.Marker.extend({
        options: {
            icon: new L.Icon.Default()
        }
    });

    return null;
});

cm.define('gmxApplication', ['leafletProductionIssues', 'container', 'config'], function(cm, cb) {
    var container = cm.get('container');
    var config = cm.get('config');

    var cfg = $.extend(true, config, {
        app: {
            calendarWidget: nsGmx.CrisisMap.isMobile() ? false : {
                type: 'fire'
            },
            mobilePopups: nsGmx.CrisisMap.isMobile()
        }
    });

    var gmxApplication = window.gacm = nsGmx.createGmxApplication(container, cfg);
    gmxApplication.create().then(function() {
        cb(gmxApplication);
    });
});
