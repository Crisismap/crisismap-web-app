var NewsLayersManager = L.Class.extend({
    includes: [L.Mixin.Events],
    initialize: function(options) {
        L.setOptions(this, options);
    },
    getLayerIdByLayerName: function(name) {
        return this.options.newsLayers[name];
    },
    getLayerNameByLayerId: function() {
        for (name in this.options.newsLayers) {
            if (this.options.layersTree.find(this.options.newsLayers[name]).get('visible')) {
                return name
            }
        }
    },
    setActiveLayerById: function(id) {
        this.options.layersTree.find(id).setNodeVisibility(true);
        this.fire('activelayerchange', {
            name: this.getLayerNameByLayerId(id)
        });
    },
    setActiveLayerByName: function(name) {
        this.setActiveLayerById(this.getLayerIdByLayerName(name));
    },
    getActiveLayerId: function() {
        var activeLayerId;
        this.options.layersTree.eachNode(function(model) {
            if (model.get('visible')) {
                activeLayerId = model.get('properties').LayerID;
            }
        });
        return activeLayerId;
    },
    getActiveLayerName: function() {
        return this.getLayerNameByLayerId(this.getActiveLayerId());
    },
    getLayersNames: function() {
        return _.keys(this.options.newsLayers);
    }
});
