cm.define('geolocationControl', ['locationMarkerManager', 'locationModel', 'map'], function (cm) {
    var locationMarkerManager = cm.get('locationMarkerManager');
    var locationModel = cm.get('locationModel');
    var map = cm.get('map');

    var geolocationControl = new nsGmx.GeolocationControl({
        locationModel: locationModel,
        position: nsGmx.Utils.isMobile() ? 'bottomright' : 'topleft',
        mode: nsGmx.Utils.isMobile() ? 'mobile' : 'desktop'
    });

    geolocationControl.on('click', function () {
        locationMarkerManager.showMarker();
    });

    map.addControl(geolocationControl);

    return null;
});

cm.define('alertsButton', ['activeAlertsNumber'], function(cm) {
    var activeAlertsNumber = cm.get('activeAlertsNumber');

    var iconWidget = new nsGmx.LabelIconWidget({
        iconClass: 'icon-newspaper'
    });

    function setn(num) {
        iconWidget.setLabel(num || null);
    }
    setn(activeAlertsNumber.getAlertsNumber());
    activeAlertsNumber.on('change', function(num) {
        setn(num);
    });

    return iconWidget;
});

cm.define('alertsWidget', [
    'alertsWidgetContainer',
    'newsLayersCollections',
    'sectionsManager',
    'config',
    'map'
], function(cm) {
    var alertsWidgetContainer = cm.get('alertsWidgetContainer');
    var newsLayersCollections = cm.get('newsLayersCollections');
    var sectionsManager = cm.get('sectionsManager');
    var config = cm.get('config');
    var map = cm.get('map');

    var alertsWidget = new nsGmx.AlertsWidget({
        collection: newsLayersCollections[sectionsManager.getActiveSectionId()],
        customScrollbar: !nsGmx.Utils.isMobile()
    });

    sectionsManager.on('sectionchange', function (sectionId) {
        alertsWidget.setCollection(newsLayersCollections[sectionId]);
    });

    $(window).on('resize', function() {
        alertsWidget.reset();
    });

    alertsWidget.on('marker', function(model) {
        map.setView(model.get('latLng'), config.user.markerZoom);
    });

    alertsWidgetContainer.addView(alertsWidget);

    return alertsWidget;
});
