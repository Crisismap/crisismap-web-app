window.nsGmx = window.nsGmx || {};

// options.widgetClass
// options.widgetOptions
window.nsGmx.PagedWidget = window.nsGmx.PageView.extend({
    initialize: function(options) {
        nsGmx.PageView.prototype.initialize.apply(this, arguments);
        this._widgets = [];
        this.options = _.extend(this.options || {}, options);
    },
    _createWidget: function(options) {
        var opts = _.extend({}, this.options.widgetOptions || {});
        var widget = new this.options.widgetClass(_.extend(opts, options));
        var container = this.addPage((options.model || options.collection).cid);
        widget.appendTo(container);
        this._widgets.push(widget);
        return widget;
    }
});
