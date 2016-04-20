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
        newsLayersCollections: newsLayersCollections,
        sectionsManager: sectionsManager,
        customScrollbar: !nsGmx.Utils.isMobile()
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
