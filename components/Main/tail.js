// Позволяет просматривать дерево слоёв через консоль.
// Удобно для приложений, в которых отсутствует виджет дерева слоёв.
cm.define('layersDebugger', ['layersTree'], function(cm) {
    var layersTree = cm.get('layersTree');
    return new nsGmx.LayersDebugger(layersTree);
});
