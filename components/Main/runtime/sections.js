cm.define('externalDescriptions', ['layersTree'], function(cm, cb) {
    var layersTree = cm.get('layersTree');

    var urlReg = /^\/.*\.html$/i;
    var uri = new Uri(window.location.href);

    var sectionsDescriptionsPromises = layersTree.select(function(node) {
        if (node.get('properties').description && !!node.get('properties').description.match(urlReg)) {
            return true;
        }
    }).map(function(node) {
        return new Promise(function(resolve, reject) {
            var u = new Uri(uri.origin());
            u.path(joinPaths(uri.path(), node.get('properties').description));
            $.ajax(u.toString()).then(function(resp) {
                node.get('properties').description = resp;
                node.trigger('change');
                resolve();
            }, function() {
                resolve();
            });
        })
    });

    Promise.all(sectionsDescriptionsPromises).then(function(values) {
        cb({});
    });

    function joinPaths() {
        return Array.prototype.slice.call(arguments).reduce(function (prev, curr) {
            return prev + '/' + curr;
        }).replace(/([^:\s])\/+/g, '$1/');
    }
});

cm.define('sectionsManager', ['externalDescriptions', 'layersTreeWidget', 'layersTree', 'layersHash', 'resetter', 'config', 'map'], function(cm) {
    var layersTreeWidget = cm.get('layersTreeWidget');
    var layersHash = cm.get('layersHash');
    var layersTree = cm.get('layersTree');
    var resetter = cm.get('resetter');
    var config = cm.get('config');
    var i18n = cm.get('i18n');
    var map = cm.get('map');

    var sectionsManager = new nsGmx.SectionsManager({
        sectionsTree: layersTree,
        sectionsIcons: config.user.sectionsIcons
    });

    sectionsManager.on('sectionchange', onSectionChange);
    onSectionChange(sectionsManager.getActiveSectionId());

    return sectionsManager;

    function onSectionChange(sectionId) {
        var subtree = layersTree.find(sectionId) || layersTree;
        layersTreeWidget && layersTreeWidget.setModel(subtree);
        map.setZoom(config.user.globalZoom);
    }
});

cm.define('sectionsRouter', ['sectionsManager'], function() {
    var sectionsManager = cm.get('sectionsManager')

    var hash = window.location.hash.slice(1)
    var sectionsIds = sectionsManager.getSectionsIds()
    if (sectionsIds.indexOf(hash) + 1) {
        sectionsManager.setActiveSectionId(hash)
    }

    return null
})

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
    return _.extend(sectionsManager.getSectionsIds().reduce(function(collections, sectionId) {
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
    }.bind(this), {}), {
        _empty: new Backbone.Collection()
    });
});

cm.define('activeAlertsNumber', ['sectionsManager', 'newsLayersCollections'], function(cm) {
    return new(L.Class.extend({
        includes: [Backbone.Events],
        initialize: function(opts) {
            this.options = opts;
            this.options.sectionsManager.on('sectionchange', this._update, this);
            this._update();
        },
        getAlertsNumber: function() {
            return this._currentCollection && this._currentCollection.length;
        },
        _update: function(sectionId) {
            var sectionId = this.options.sectionsManager.getActiveSectionId();
            var newCollection = this.options.newsLayersCollections[sectionId];
            this._currentCollection && this._currentCollection.off('update', this._onCollectionUpdate, this);
            this._currentCollection = newCollection;
            newCollection && newCollection.on('update', this._onCollectionUpdate, this);
            newCollection && this._onCollectionUpdate();
        },
        _onCollectionUpdate: function() {
            this.trigger('change', this.getAlertsNumber());
        }
    }))({
        sectionsManager: cm.get('sectionsManager'),
        newsLayersCollections: cm.get('newsLayersCollections')
    });
});
