window.nsGmx = window.nsGmx || {};
window.nsGmx.MergedCollection = Backbone.Collection.extend({
    constructor: function(arrayOfCollections, options) {
        this.collections = arrayOfCollections.map(function(collection) {
            collection.on('update', this._update, this);
            return collection;
        }.bind(this));
        Backbone.Collection.call(this, [], options);
    },
    initialize: function() {
        this._update();
    },
    _update: function() {
        this.reset();
        var a = this.collections.map(function (c) {
            return c.models;
        }).reduce(function(prev, curr) {
            return prev.concat(curr);
        }.bind(this), []);
        this.set(a);
        this.trigger('update');
    }
});
