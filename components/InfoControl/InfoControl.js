var nsGmx = nsGmx || {};

nsGmx.InfoControl = L.Control.extend({
    includes: [nsGmx.GmxWidgetMixin],
    initialize: function(options) {
        L.setOptions(this, options);
        this._container = L.DomUtil.create('div', 'infoControl');
        this._terminateMouseEvents();
        this.render(null);
        this.hide();
    },
    render: function(model) {
        this._container.innerHTML = '';
        if (model) {
            var contentView = new nsGmx.EventDetailsView({
                model: model
            });
            contentView.appendTo(this._container);
        }
        return this;
    },
    onAdd: function(map) {
        return this._container;
    }
});
