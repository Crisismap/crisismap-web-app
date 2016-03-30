cm.define('sectionsManager', ['config', 'resetter', 'layersTree'], function(cm) {
    var config = cm.get('config');
    var resetter = cm.get('resetter');
    var layersTree = cm.get('layersTree');

    var sectionsManager = new nsGmx.SectionsManager({
        sectionsTree: layersTree.find(config.user.sectionsTree)
    });

    sectionsManager.on('sectionchange', function() {
        resetter.reset();
    });

    return sectionsManager;
});

cm.define('layersMarkersCollections', ['layersTree', 'layersHash', 'calendar', 'config'], function(cm, cb) {
    var layersTree = cm.get('layersTree');
    var layersHash = cm.get('layersHash');
    var calendar = cm.get('calendar');
    var config = cm.get('config');

    var MarkerModel = Backbone.Model.extend({
        constructor: function(properties) {
            Backbone.Model.call(this, {
                id: properties['id'],
                title: properties['Title'],
                description: properties['Description'],
                date: new Date(properties['pub_date'] * 1000),
                url: properties['URL'],
                class: properties['class'],
                styles: properties['styles'],
                latLng: L.Projection.Mercator.unproject({
                    x: properties['mercX'],
                    y: properties['mercY']
                })
            });
        }
    });

    var nodes = layersTree.select(function(node) {
        return !!(
            node.get('properties').MetaProperties &&
            node.get('properties').MetaProperties.data_provider &&
            node.get('properties').MetaProperties.data_provider.Value
        )
    });

    var collections = {};
    nodes.map(function(node) {
        var id = node.get('id');
        if (!id || !layersHash[id]) {
            return;
        }

        var col = new nsGmx.LayerMarkersCollection(layersHash[id], {
            model: MarkerModel
        });

        collections[id] = col;
    });

    return collections;
});

cm.define('newsLayersCollections', ['layersMarkersCollections', 'sectionsManager'], function(cm) {
    var layersMarkersCollections = cm.get('layersMarkersCollections');
    var sectionsManager = cm.get('sectionsManager');

    // для каждого раздела с данными создаём коллекуию, состоящую из коллекций его data_provider'ов
    return sectionsManager.getSectionsIds().reduce(function(collections, sectionId) {
        var dataLayersIds = sectionsManager.getSectionProperties(sectionId).dataLayersIds;
        var dataLayersCollections = dataLayersIds.map(function(dataLayerId) {
            return layersMarkersCollections[dataLayerId];
        });
        collections[sectionId] = new nsGmx.MergedCollection(dataLayersCollections, {
            comparator: function(a, b) {
                a = a.get('date').getTime();
                b = b.get('date').getTime();
                if (a > b) {
                    return -1
                } else if (a < b) {
                    return 1;
                } else {
                    return 0;
                }
            }
        });
        return collections;
    }.bind(this), {});
});