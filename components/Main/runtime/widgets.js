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
        sectionsManager: sectionsManager
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
