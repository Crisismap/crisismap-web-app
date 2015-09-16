if (!nsGmx.Utils.isMobile()) {
    cm.define('mapContainer', ['layoutManager'], function (cm) {
        var layoutManager = cm.get('layoutManager');
        return $(layoutManager.getContentContainer());
    });
}
