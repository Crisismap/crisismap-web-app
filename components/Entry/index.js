document.addEventListener('deviceready', function (e) {
    cm.create().then(function() {
        console.log('ready');
        window.cfg = cm.get('config');
        window.map = cm.get('map');
        window.lh = cm.get('layersHash');
        window.lt = cm.get('layersTree');
        window.ld = cm.get('layersDebugger');
        window.sm = cm.get('sectionsManager');
        window.cal = cm.get('calendar');
        window.lmc = cm.get('layersMarkersCollections');
        window.nlc = cm.get('newsLayersCollections');
        window.ltw = cm.get('layersTreeWidget');
        window.aan = cm.get('activeAlertsNumber');
    });
}, false)
