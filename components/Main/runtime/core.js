cm.define('rootContainer', [], function() {
    return document.body;
});

cm.define('config', [], function(cm, cb) {
    Promise.resolve(true)
        .then(function () {
            return ajaxMerge('resources/config.json', {});
        })
        .then(function (config) {
            return ajaxMerge('resources/map.json', config);
        })
        .then(function (withMapConfig) {
            ajaxMerge('local/config.json', withMapConfig).then(function (withLocalConfig) {
                cb(withLocalConfig);
            }, function () {
                cb(withMapConfig);
            });
        }, function () {
            console.error('Config: error loading config file');
            cb(mimeFix(false));
        });

    function ajaxMerge(url, prev) {
        return new Promise(function (resolve, reject) {
            $.ajax(url).then(function (response) {
                resolve($.extend(true, prev, mimeFix(response)))
            }, function (err) {
                reject(err);
            });
        });
    }

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

cm.define('urlManager', [], function(cm) {
    return {
        getParam: getQueryVariable
    };
});

cm.define('i18n', ['urlManager'], function(cm) {
    var urlManager = cm.get('urlManager');
    if (
        urlManager.getParam('lang') &&
        (
            urlManager.getParam('lang') === 'eng' ||
            urlManager.getParam('lang') === 'rus'
        )
    ) {
        nsGmx.Translations.setLanguage(urlManager.getParam('lang'));
    } else {
        var lang = window.localStorage['language'] || 'rus';
        nsGmx.Translations.setLanguage(lang);
    }
    return nsGmx.Translations;
});

cm.define('connectionCheck', ['rootContainer', 'config'], function(cm, cb) {
    var rootContainer = cm.get('rootContainer');
    var config = cm.get('config');

    $.ajax(config.user.connectionCheckUrl).then(function() {
        cb(true);
    }, function() {
        var connectionErrorWidget = new nsGmx.ConnectionErrorWidget();
        $(rootContainer).append(connectionErrorWidget.el);
        cb(false);
    })
});

cm.define('viewportMeta', [], function(cm) {
    if (nsGmx.Utils.isMobile()) {
        $('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />').appendTo($('head'));
    }
    return null;
});

cm.define('gmxApplication', ['leafletProductionIssues', 'connectionCheck', 'rootContainer', 'config', 'i18n'], function(cm, cb) {
    var connectionCheck = cm.get('connectionCheck');
    var rootContainer = cm.get('rootContainer');
    var config = cm.get('config');

    var cfg = $.extend(true, config, {
        app: {
            calendarWidget: nsGmx.Utils.isMobile() ? false : {
                type: 'fire'
            },
            mobilePopups: nsGmx.Utils.isMobile(),
            zoomControl: {
                type: 'leaflet',
                position: nsGmx.Utils.isMobile() ? 'bottomright' : 'topleft'
            },
            layersTreeWidget: nsGmx.Utils.isMobile() ? false : undefined
        }
    });

    if (connectionCheck) {
        var gmxApplication = window.gacm = nsGmx.createGmxApplication(rootContainer, cfg);
        gmxApplication.create().then(function() {
            cb(gmxApplication);
        });
    } else {
        cb(false);
    }
});

cm.define('map', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('map');
});

cm.define('resetter', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('resetter');
});

cm.define('calendar', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('calendar');
});

cm.define('layersTree', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('layersTree');
});

cm.define('layersHash', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('layersHash');
});

cm.define('debugWindow', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('debugWindow');
});

cm.define('sidebarWidget', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('sidebarWidget');
});

cm.define('layersClusters', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('layersClusters');
});

cm.define('layersTreeWidget', ['gmxApplication'], function (cm) {
    return cm.get('gmxApplication').get('layersTreeWidget');
});

cm.define('baseLayersManager', ['gmxApplication'], function (cm) {
    return cm.get('gmxApplication').get('baseLayersManager');
});

cm.define('mobileButtonsPane', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('mobileButtonsPane');
});

cm.define('fullscreenPagingPane', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('fullscreenPagingPane');
});

cm.define('locationModel', ['gmxApplication'], function(cm) {
    var map = cm.get('map');

    return new nsGmx.LocationModel({
        map: map
    })
});
