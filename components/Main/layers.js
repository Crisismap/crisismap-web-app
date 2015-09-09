cm.define('layersHash', ['gmxMap'], function(cm) {
    return cm.get('gmxMap').getLayersHash();
});

cm.define('calendar', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('calendar');
});

cm.define('layersTree', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('layersTree');
});

cm.define('newsLayersManager', ['config', 'layersTree'], function(cm) {
    return new NewsLayersManager({
        layersTree: cm.get('layersTree'),
        newsLayers: cm.get('config').user.newsLayers
    })
});

cm.define('newsLayersClusters', ['layersHash', 'newsLayersManager'], function(cm) {
    var layersHash = cm.get('layersHash');
    var newsLayersManager = cm.get('newsLayersManager');
    newsLayersManager.getLayersNames().map(function(name) {
        layersHash[newsLayersManager.getLayerIdByLayerName(name)].bindClusters();
    });
    return null;
});

cm.define('newsLayersCollections', ['newsLayersManager', 'layersHash', 'calendar'], function(cm) {
    var calendar = cm.get('calendar');
    var layersHash = cm.get('layersHash')
    var newsLayersManager = cm.get('newsLayersManager');

    var names = newsLayersManager.getLayersNames();
    var collections = {};
    for (var i = 0; i < names.length; i++) {
        collections[names[i]] = new nsGmx.LayerMarkersCollection([], {
            layer: layersHash[newsLayersManager.getLayerIdByLayerName(names[i])],
            calendar: calendar
        });
    }

    return collections;
});
