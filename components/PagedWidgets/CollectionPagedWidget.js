window.nsGmx = window.nsGmx || {};

window.nsGmx.CollectionPagedWidget = window.nsGmx.PagedWidget.extend({
    setCollection: function(collection) {
        var index = _.findIndex(this._widgets, function(widget) {
            return widget.collection.cid === collection.cid;
        });
        if (index === -1) {
            this._createWidget({
                collection: collection
            });
        }
        this.setActivePage(collection.cid);
    }
});
