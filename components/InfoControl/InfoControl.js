var nsGmx = nsGmx || {};

nsGmx.InfoControl = L.Control.extend({
    includes: [nsGmx.GmxWidgetMixin],
    initialize: function(options) {
        L.setOptions(this, options);
        this.render();
        this.hide();
    },
    render: function() {
        this._container = L.DomUtil.create('div', 'infoControl')
        this._titleContainer = L.DomUtil.create('div', 'infoControl-titleContainer', this._container);
        this._contentContainer = L.DomUtil.create('div', 'infoControl-contentContainer', this._container);
        this._terminateMouseEvents();
        return this;
    },
    clean: function() {
        this._titleContainer.innerHTML = '';
        this._contentContainer.innerHTML = '';
    },
    setTitle: function(str) {
        this._titleContainer.innerHTML = str
    },
    setContent: function(str) {
        this._contentContainer.innerHTML = str;
    },
    onAdd: function(map) {
        return this._container;
    }
});