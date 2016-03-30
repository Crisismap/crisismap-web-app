cm.define('rootContainer', [], function () {
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

cm.define('gmxApplication', ['leafletProductionIssues', 'rootContainer', 'config'], function(cm, cb) {
    var rootContainer = cm.get('rootContainer');
    var config = cm.get('config');

    var cfg = $.extend(true, config, {
        app: {
            calendarWidget: {
                type: 'fire'
            },
            mobilePopups: nsGmx.CrisisMap.isMobile()
        }
    });

    var gmxApplication = window.gacm = nsGmx.createGmxApplication(rootContainer, cfg);
    gmxApplication.create().then(function() {
        cb(gmxApplication);
    });
});

cm.define('map', ['gmxApplication'], function (cm) {
    return cm.get('gmxApplication').get('map');
});

cm.define('resetter', ['gmxApplication'], function (cm) {
    return cm.get('gmxApplication').get('resetter');
});

cm.define('calendar', ['gmxApplication'], function (cm) {
    return cm.get('gmxApplication').get('calendar');
});

cm.define('layersTree', ['gmxApplication'], function (cm) {
    return cm.get('gmxApplication').get('layersTree');
});

cm.define('layersHash', ['gmxApplication'], function (cm) {
    return cm.get('gmxApplication').get('layersHash');
});

cm.define('mobileButtonsPane', ['gmxApplication'], function (cm) {
    return cm.get('gmxApplication').get('mobileButtonsPane');
});
