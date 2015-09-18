var nsGmx = window.nsGmx || {};
nsGmx.CrisisMap = nsGmx.CrisisMap || {};

function getFullHeight(el) {
    var $el = $(el);

    function r(str) {
        return str.replace('px', '') / 1;
    }

    return $el.height() +
        r($el.css('padding-top')) +
        r($el.css('padding-bottom')) +
        r($el.css('margin-top')) +
        r($el.css('margin-bottom'))
}

function unbindPopup(layer) {
    var styles = layer.getStyles();
    for (var i = 0; i < styles.length; i++) {
        styles[i].DisableBalloonOnClick = true;
    }
    layer.setStyles(styles);
}

function getQueryVariable(variable) {
    var parser = document.createElement('a');
    parser.href = window.location.href;
    var query = parser.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
}

nsGmx.CrisisMap.isMobile = function() {
    if (getQueryVariable('mobile')) {
        return true;
    } else {
        return nsGmx.Utils.isMobile();
    }
}

nsGmx.CrisisMap.formatDate = function(dt, fstr) {
    function pz(n) {
        var s = n + '';
        if (s.length === 1) {
            return '0' + s;
        }
        return s;
    }

    fstr = fstr || 'DD.MM.YYYY hh:mm';

    return fstr.replace(/YYYY/g, dt.getFullYear())
        .replace(/MM/g, pz(dt.getMonth()))
        .replace(/DD/g, pz(dt.getDate()))
        .replace(/hh/g, pz(dt.getHours()))
        .replace(/mm/g, pz(dt.getMinutes()));
};

// вернуть глобальную переменную underscore _
cm.define('gmxUtils', [], function() {
    return nsGmx.Utils.noConflicts();
});

// получить параметры из url
cm.define('urlManager', [], function(cm) {
    return {
        getParam: getQueryVariable
    };
});

// определение языка
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
        nsGmx.Translations.setLanguage(nsGmx.Translations.getLanguageFromCookies('/'));
    }
    return nsGmx.Translations;
});

cm.define('config', [], function(cm, cb) {
    $.ajax('resources/config.json').then(function(config) {
        $.ajax('local/config.json').then(function(localConfig) {
            cb($.extend(true, config, localConfig));
        }).fail(function() {
            cb(config);
        });
    }).fail(function() {
        console.error('Config: error loading config file');
        cb(false);
    });
});

cm.define('layoutManager', [], function(cm) {
    var headerContainer = L.DomUtil.create('div', 'crisisMap-headerContainer');
    var contentContainer = L.DomUtil.create('div', 'crisisMap-contentContainer');

    [headerContainer, contentContainer].map(function(el) {
        document.body.appendChild(el);
    });

    return {
        getHeaderContainer: function() {
            return headerContainer;
        },
        getContentContainer: function() {
            return contentContainer;
        }
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
