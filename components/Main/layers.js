cm.define('layersHash', ['gmxMap'], function(cm) {
    return cm.get('gmxMap').getLayersHash();
});

cm.define('calendar', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('calendar');
});

cm.define('layersTree', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('layersTree');
});

cm.define('sectionsManager', ['config', 'resetter', 'layersTree'], function() {
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
        var dataLayers = sectionsManager.getSectionProperties(sectionsIds[i]).dataLayersIds.map(function(layerId) {
            return layersHash[layerId];
        });
        if (dataLayers) {
            collections[sectionsIds[i]] = new nsGmx.LayerMarkersCollection([], {
                model: MarkerModel,
                layers: dataLayers,
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
    var markerCircle = cm.get('markerCircle');
    var sectionsManager = cm.get('sectionsManager');
    var newsLayersCollections = cm.get('newsLayersCollections');

    var MarkersClickHandler = L.Class.extend({
        includes: [L.Mixin.Events],
        initialize: function() {
            sectionsManager.getSectionsIds().map(function(sectionId) {
                sectionsManager.getSectionProperties(sectionId).dataLayersIds.map(function(layerID) {
                    var layer = layersHash[layerID];
                    var collection = newsLayersCollections[sectionId];
                    unbindPopup(layer);
                    layer.on('click', function(e) {
                        if (!e.eventFrom || e.originalEventType === 'click') {
                            // кликнули не по кластерам
                            var id = layer.getItemProperties(e.gmx.target.properties)['id'];
                            var model = collection.findWhere({
                                id: id
                            });
                            this.fire('click', {
                                model: model,
                                layer: layer,
                                name: sectionId,
                                markerLatLng: e.eventFrom ? e.latlng : model.get('latLng')
                            });
                        }
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }
    });

    return new MarkersClickHandler();
});

cm.define('layersStyleFixes', ['layersHash', 'sectionsManager'], function() {
    var layersHash = cm.get('layersHash');
    var sectionsManager = cm.get('sectionsManager');

    var dataLayersIds = [].concat.apply([], sectionsManager.getSectionsIds().map(function(sectionId) {
        return sectionsManager.getSectionProperties(sectionId).dataLayersIds;
    }));

    dataLayersIds.map(function(dataLayerId) {
        var layer = layersHash[dataLayerId];
        for (var i = 0; i < layer.getStyles().length; i++) {
            var originalStyle = layer.getStyle(i);
            layer.setStyle($.extend(true, originalStyle, {
                'RenderStyle': {
                    'iconAnchor': [12, 12],
                    'iconCenter': false
                },
                'HoverStyle': {
                    'iconAnchor': [12, 12],
                    'iconCenter': false
                }
            }), i);
        }
    });

    return null;
});

cm.define('markerCircle', ['map', 'markersClickHandler', 'sectionsManager', 'resetter'], function(cm) {
    var map = cm.get('map');
    var resetter = cm.get('resetter');
    var sectionsManager = cm.get('sectionsManager');
    var markersClickHandler = cm.get('markersClickHandler');

    var MarkerCircle = L.Class.extend({
        initialize: function(opts) {
            L.setOptions(this, opts);
            this.marker = L.marker(e.latlng, {
                icon: L.divIcon({
                    iconSize: [23, 23],
                    iconAnchor: [13, 13],
                    className: 'marker-circled'
                }),
                zIndexOffset: 9999999
            });
            this.options.map.on('click', this.hide.bind(this));
            this.options.map.on('zoomstart', this.hide.bind(this));
        },
        show: function() {
            this.marker.setLatLng.apply(this.marker, arguments);
            this.marker.addTo(this.options.map);
        },
        hide: function() {
            this.options.map.removeLayer(this.marker);
        }
    });

    var markerCircle = new MarkerCircle({
        map: map
    });

    markersClickHandler.on('click', function(e) {
        markerCircle.show(e.markerLatLng);
    });

    resetter.on('reset', function(e) {
        markerCircle.hide();
    });

    return markerCircle;
});