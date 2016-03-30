if (!nsGmx.CrisisMap.isMobile()) {
    cm.define('mapContainer', ['layoutManager'], function(cm) {
        var layoutManager = cm.get('layoutManager');
        return $(layoutManager.getContentContainer());
    });

    cm.define('alertsWidgetContainer', ['sidebarWidget', 'activeAlertsNumber'], function() {
        var sidebarWidget = cm.get('sidebarWidget');
        var activeAlertsNumber = cm.get('activeAlertsNumber');

        var iconWidget = new nsGmx.LabelIconWidget({
            iconClass: 'icon-bell'
        });

        function setn(num) {
            iconWidget.setLabel(num || null);
        }
        setn(activeAlertsNumber.getAlertsNumber());
        activeAlertsNumber.on('change', function(num) {
            setn(num);
        });

        var alertsWidgetContainer = sidebarWidget.addTab('alertsWidget', iconWidget);

        sidebarWidget.on('closed', function(e) {
            iconWidget.showLabel();
        });

        return alertsWidgetContainer;
    });

    cm.define('alertsWidgetMarkerHandler', ['alertsWidget', 'config', 'map'], function() {
        var alertsWidget = cm.get('alertsWidget');
        var config = cm.get('config');
        var map = cm.get('map');

        alertsWidget.on('marker', function(model) {
            map.setView(model.get('latLng'), config.user.markerZoom);
        });

        return null;
    });


}
