if (!nsGmx.Utils.isMobile()) {
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

        var items = [{
            id: 'fires',
            title: nsGmx.Translations.getText('crisismap.fires')
        }, {
            id: 'ecology',
            title: nsGmx.Translations.getText('crisismap.ecology')
        }, {
            id: 'floods',
            title: nsGmx.Translations.getText('crisismap.floods')
        }];

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

}
