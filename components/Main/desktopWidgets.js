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

    cm.define('headerLayersMenu', ['map', 'config', 'sectionsManager', 'layersHash', 'headerNavBar', 'resetter'], function() {
        var map = cm.get('map');
        var config = cm.get('config');
        var layersHash = cm.get('layersHash');
        var headerNavBar = cm.get('headerNavBar');
        var sectionsManager = cm.get('sectionsManager');
        var resetter = cm.get('resetter');

        var items = sectionsManager.getSectionsIds().map(function(sectionId) {
            return {
                id: sectionId,
                title: sectionsManager.getSectionProperties(sectionId).title
            }
        });

        var radioGroupWidget = new nsGmx.RadioGroupWidget({
            items: items,
            activeItem: sectionsManager.getActiveSectionId()
        });

        radioGroupWidget.on('select', function(id) {
            sectionsManager.setActiveSectionId(id);
            var layer = layersHash[sectionsManager.getSectionProperties(id).dataLayerId];
            layer && nsGmx.L.Map.fitBounds.call(
                map,
                layer.getBounds()
            );
        });

        sectionsManager.on('sectionchange', function(sectionId) {
            radioGroupWidget.setActiveItem(sectionId);
        });

        radioGroupWidget.appendTo(headerNavBar.getCenterContainer());

        return radioGroupWidget;
    });
}
