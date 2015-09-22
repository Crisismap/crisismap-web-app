window.nsGmx = window.nsGmx || {};

window.nsGmx.ModelPagedWidget = window.nsGmx.PagedWidget.extend({
    setModel: function(model) {
        var index = _.findIndex(this._widgets, function(widget) {
            return widget.model.cid === model.cid;
        });
        if (index === -1) {
            this._createWidget({
                model: model
            });
        }
        this.setActivePage(model.cid);
    }
});
