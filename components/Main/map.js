cm.define('gmxApplication', ['config', 'mapContainer', 'leafletProductionIssues'], function(cm, cb) {
    var config = cm.get('config');
    var mapContainer = cm.get('mapContainer');

    var cfg = $.extend(true, config, {
        app: {
            calendarWidget: nsGmx.CrisisMap.isMobile() ? false : {
                type: 'fire'
            },
            mobilePopups: nsGmx.CrisisMap.isMobile()
        }
    });

    var gmxApplication = window.gacm = nsGmx.createGmxApplication(mapContainer, cfg);
    gmxApplication.create().then(function() {
        cb(gmxApplication);
    });
});

cm.define('resetter', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('resetter');
});

cm.define('map', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('map');
});

cm.define('bottomControl', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('bottomControl');
});

cm.define('copyrightControl', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('copyrightControl');
});

cm.define('logoControl', ['gmxApplication', 'map'], function(cm) {
    return cm.get('gmxApplication').get('logoControl');
});

cm.define('gmxMap', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('gmxMap');
});

cm.define('calendarModel', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('calendar');
});
