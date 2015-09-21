if (!nsGmx.CrisisMap.isMobile()) {
    cm.define('mapContainer', ['layoutManager'], function(cm) {
        var layoutManager = cm.get('layoutManager');
        return $(layoutManager.getContentContainer());
    });

    cm.define('headerLayersMenu', ['map', 'config', 'sectionsManager', 'layersHash', 'headerNavBar', 'widgetsManager'], function() {
        var map = cm.get('map');
        var config = cm.get('config');
        var layersHash = cm.get('layersHash');
        var headerNavBar = cm.get('headerNavBar');
        var sectionsManager = cm.get('sectionsManager');
        var widgetsManager = cm.get('widgetsManager');

        var items = sectionsManager.getSectionsNames().map(function(sectionName) {
            return {
                id: sectionName,
                title: nsGmx.Translations.getText('crisismap.section.' + sectionName)
            }
        });

        var radioGroupWidget = new nsGmx.RadioGroupWidget({
            items: items,
            activeItem: sectionsManager.getActiveSectionName()
        });

        radioGroupWidget.on('select', function(id) {
            sectionsManager.setActiveSection(id);
            nsGmx.L.Map.fitBounds.call(
                map,
                layersHash[sectionsManager.getDataLayerId(id)].getBounds()
            );
        });

        radioGroupWidget.appendTo(headerNavBar.getCenterContainer());

        return radioGroupWidget;
    });

    cm.define('popups', ['sectionsManager', 'layersHash', 'markersClickHandler', 'map'], function(cm) {
        var map = cm.get('map');
        var layersHash = cm.get('layersHash');
        var sectionsManager = cm.get('sectionsManager');
        var markersClickHandler = cm.get('markersClickHandler');

        markersClickHandler.on('click', function(e) {
            var p = L.popup();
            var detailsView = new nsGmx.EventDetailsView({
                model: e.model
            });
            p.setContent(detailsView.getContainer());
            p.setLatLng(e.model.get('latLng'));
            map.openPopup(p);
        });

        return null;
    });
}
