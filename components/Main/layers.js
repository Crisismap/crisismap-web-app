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
