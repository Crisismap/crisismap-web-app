if (!nsGmx.CrisisMap.isMobile()) {
    cm.define('mapContainer', ['layoutManager'], function(cm) {
        var layoutManager = cm.get('layoutManager');
        return $(layoutManager.getContentContainer());
    });

    cm.define('alertsWidgetScrollView', ['sidebarWidget'], function () {
        var sidebarWidget = cm.get('sidebarWidget')
        var alertsWidgetContainer = sidebarWidget.addTab('alertsWidget', 'icon-bell');
        var scrollView = new nsGmx.ScrollView();
        scrollView.appendTo(alertsWidgetContainer);
        sidebarWidget.on('opened', function (e) {
            if (e.id === 'alertsWidget') {
                scrollView.repaint();
            }
        });
        return scrollView;
    });

    cm.define('headerLayersMenu', ['map', 'config', 'sectionsManager', 'layersHash', 'headerNavBar', 'widgetsManager'], function() {
        var map = cm.get('map');
        var config = cm.get('config');
        var layersHash = cm.get('layersHash');
        var headerNavBar = cm.get('headerNavBar');
        var sectionsManager = cm.get('sectionsManager');
        var widgetsManager = cm.get('widgetsManager');

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

    cm.define('popups', ['layersHash', 'markersClickHandler', 'map', 'alertsWidget'], function(cm) {
        var map = cm.get('map');
        var layersHash = cm.get('layersHash');
        var alertsWidget = cm.get('alertsWidget');
        var markersClickHandler = cm.get('markersClickHandler');

        function openPopup(model) {
            var p = L.popup();
            var detailsView = new nsGmx.EventDetailsView({
                model: model
            });
            p.setContent(detailsView.getContainer());
            p.setLatLng(model.get('latLng'));
            map.openPopup(p);
        }

        markersClickHandler.on('click', function(e) {
            openPopup(e.model);
        });

        alertsWidget.on('marker', function (model) {
            openPopup(model);
        })

        return null;
    });
}
