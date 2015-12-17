window.nsGmx = window.nsGmx || {};
window.nsGmx.MergedCollection = Backbone.Collection.extend({
    constructor: function(arrayOfCollections, options) {
        this.collections = arrayOfCollections.map(function(collection) {
            collection.on('reset update', this._update, this);
            return collection;
        }.bind(this));
        Backbone.Collection.call(this, [], options);
    },
    initialize: function() {
        this._update();
    },
    _update: function() {
        this.reset();
        this.collections.map(function(collection) {
            this.add(collection.models);
        }.bind(this));
    }
});