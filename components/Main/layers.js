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

    var MarkerModel = Backbone.Model.extend({
        constructor: function (properties) {
            Backbone.Model.call(this, {
                id: properties['id'],
                title: properties['Title'],
                description: properties['Description'],
                date: new Date(properties['pub_date'] * 1000),
                latLng: L.Projection.Mercator.unproject({
                    x: properties['mercX'],
                    y: properties['mercY']
                })
            });
        }
    });

    var names = newsLayersManager.getLayersNames();
    var collections = {};
    for (var i = 0; i < names.length; i++) {
        collections[names[i]] = new nsGmx.LayerMarkersCollection([], {
            model: MarkerModel,
            layer: layersHash[newsLayersManager.getLayerIdByLayerName(names[i])],
            calendar: calendar,
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
    }

    return collections;
});

cm.define('markersClickHandler', ['layersHash', 'newsLayersManager', 'newsLayersCollections'], function(cm) {
    var layersHash = cm.get('layersHash');
    var newsLayersManager = cm.get('newsLayersManager');
    var newsLayersCollections = cm.get('newsLayersCollections');

    var MarkersClickHandler = L.Class.extend({
        includes: [L.Mixin.Events],
        initialize: function() {
            newsLayersManager.getLayersNames().map(function(name) {
                var layer = layersHash[newsLayersManager.getLayerIdByLayerName(name)];
                var collection = newsLayersCollections[name];
                unbindPopup(layer);
                layer.on('click', function(e) {
                    var id = layer.getItemProperties(e.gmx.target.properties)['id'];
                    this.fire('click', {
                        model: collection.findWhere({
                            id: id
                        }),
                        layer: layer,
                        name: name
                    });
                }.bind(this));
            }.bind(this));
        }
    });

    return new MarkersClickHandler();
});
