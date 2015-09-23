cm.define('layersHash', ['gmxMap'], function(cm) {
    return cm.get('gmxMap').getLayersHash();
});

cm.define('calendar', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('calendar');
});

cm.define('layersTree', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('layersTree');
});

cm.define('layersTranslations', ['config', 'layersTree'], function(cm) {
    var config = cm.get('config');
    var layersTree = cm.get('layersTree');

    if (!config.user.layersTranslations || nsGmx.Translations.getLanguage() !== 'eng') {
        return null;
    }

    for (var groupId in config.user.layersTranslations) {
        var layer = layersTree.find(groupId);
        if (layer) {
            var p = layer.get('properties');
            p.title = config.user.layersTranslations[groupId];
        }
    }

    return true;
});

cm.define('sectionsManager', ['config', 'layersTree', 'layersTranslations'], function() {
    var config = cm.get('config');
    var layersTree = cm.get('layersTree');
    return new nsGmx.SectionsManager({
        sectionsTree: layersTree.find(config.user.sectionsTree)
    });
});

cm.define('newsLayersClusters', ['layersHash', 'sectionsManager', 'map'], function(cm) {
    var map = cm.get('map');
    var layersHash = cm.get('layersHash');
    var sectionsManager = cm.get('sectionsManager');
    sectionsManager.getSectionsIds().map(function(sectionId) {
        var layer = layersHash[sectionsManager.getSectionProperties(sectionId).dataLayerId];
        layer && layer.bindClusters({
            maxZoom: map.getMaxZoom(),
            zoomToBoundsOnClick: false,
            clusterclick: function(e) {
                var bounds = e.layer.getBounds();
                var nw = bounds.getNorthWest();
                var se = bounds.getSouthEast();
                if (nw.distanceTo(se) === 0) {
                    e.layer.spiderfy();
                } else {
                    e.layer.zoomToBounds();
                }
            }
        });
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

    var sectionsIds = sectionsManager.getSectionsIds();
    var collections = {};
    for (var i = 0; i < sectionsIds.length; i++) {
        var dataLayer = layersHash[sectionsManager.getSectionProperties(sectionsIds[i]).dataLayerId];
        if (dataLayer) {
            collections[sectionsIds[i]] = new nsGmx.LayerMarkersCollection([], {
                model: MarkerModel,
                layer: dataLayer,
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
        } else {
            collections[sectionsIds[i]] = new Backbone.Collection();
        }
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
            sectionsManager.getSectionsIds().map(function(sectionId) {
                var layer = layersHash[sectionsManager.getSectionProperties(sectionId).dataLayerId];
                if (!layer) {
                    return;
                }
                var collection = newsLayersCollections[sectionId];
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
                            name: sectionId
                        });
                    }
                }.bind(this));
            }.bind(this));
        }
    });

    return new MarkersClickHandler();
});
