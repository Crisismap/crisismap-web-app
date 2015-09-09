// Позволяет просматривать дерево слоёв через консоль.
// Удобно для приложений, в которых отсутствует виджет дерева слоёв.
cm.define('layersDebugger', ['layersTree'], function(cm) {
    var layersTree = cm.get('layersTree');
    return new nsGmx.LayersDebugger(layersTree);
});

cm.create().then(function() {
    console.log('ready');
    window.cfg = cm.get('config');
    window.map = cm.get('map');
    window.lh = cm.get('layersHash');
    window.lt = cm.get('layersTree');
    window.ld = cm.get('layersDebugger');
    window.cal = cm.get('calendar');
    window.nlm = cm.get('newsLayersManager');
    window.nlc = cm.get('newsLayersCollections')
});
