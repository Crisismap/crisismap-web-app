window.nsGmx = window.nsGmx || {};

// options.widgetClass
// options.widgetOptions
window.nsGmx.ModelPagedWidget = window.nsGmx.PageView.extend({
    initialize: function(options) {
        nsGmx.PageView.prototype.initialize.apply(this, arguments);
        this._widgets = [];
        this.options = _.extend(this.options || {}, options);
    },
    setModel: function(model) {
        var index = _.findIndex(this._widgets, function(widget) {
            return widget.model.cid === model.cid;
        });
        if (index === -1) {
            this._createWidget(model);
        }
        this.setActivePage(model.cid);
    },
    _createWidget: function(model) {
        var opts = _.extend({}, this.options.widgetOptions || {});
        var widget = new this.options.widgetClass(_.extend(opts, {
            model: model
        }));
        var container = this.addPage(model.cid);
        widget.appendTo(container);
        this._widgets.push(widget);
        return widget;
    }
});
