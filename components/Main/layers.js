cm.define('layersHash', ['gmxMap'], function(cm) {
    return cm.get('gmxMap').getLayersHash();
});

cm.define('calendar', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('calendar');
});

cm.define('layersTree', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('layersTree');
});

cm.define('sectionsManager', ['config', 'layersTree'], function (cm) {
    return new SectionsManager({
        sections: cm.get('config').user.sections,
        layersTree: cm.get('layersTree')
    })
});

cm.define('newsLayersClusters', ['layersHash', 'sectionsManager'], function(cm) {
    var layersHash = cm.get('layersHash');
    var sectionsManager = cm.get('sectionsManager');
    sectionsManager.getSectionsNames().map(function(sectionName) {
        layersHash[sectionsManager.getDataLayerId(sectionName)].bindClusters();
    });
    return null;
});

cm.define('newsLayersCollections', ['sectionsManager', 'layersHash', 'calendar'], function(cm) {
    var calendar = cm.get('calendar');
    var layersHash = cm.get('layersHash')
    var sectionsManager = cm.get('sectionsManager');

    var MarkerModel = Backbone.Model.extend({
        constructor: function(properties) {
            Backbone.Model.call(this, {
                id: properties['id'],
                title: properties['Title'],
                description: properties['Description'],
                date: new Date(properties['pub_date'] * 1000),
                url: properties['URL'],
                class: properties['class'],
                latLng: L.Projection.Mercator.unproject({
                    x: properties['mercX'],
                    y: properties['mercY']
                })
            });
        }
    });

    var names = sectionsManager.getSectionsNames();
    var collections = {};
    for (var i = 0; i < names.length; i++) {
        collections[names[i]] = new nsGmx.LayerMarkersCollection([], {
            model: MarkerModel,
            layer: layersHash[sectionsManager.getDataLayerId(names[i])],
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

cm.define('markersClickHandler', ['layersHash', 'sectionsManager', 'newsLayersCollections'], function(cm) {
    var layersHash = cm.get('layersHash');
    var sectionsManager = cm.get('sectionsManager');
    var newsLayersCollections = cm.get('newsLayersCollections');

    var MarkersClickHandler = L.Class.extend({
        includes: [L.Mixin.Events],
        initialize: function() {
            sectionsManager.getSectionsNames().map(function(name) {
                var layer = layersHash[sectionsManager.getDataLayerId(name)];
                var collection = newsLayersCollections[name];
                unbindPopup(layer);
                layer.on('click', function(e) {
                    if (!e.eventFrom || e.originalEventType === 'click') {
                        // кликнули не по кластерам
                        var id = layer.getItemProperties(e.gmx.target.properties)['id'];
                        this.fire('click', {
                            model: collection.findWhere({
                                id: id
                            }),
                            layer: layer,
                            name: name
                        });
                    }
                }.bind(this));
            }.bind(this));
        }
    });

    return new MarkersClickHandler();
});
