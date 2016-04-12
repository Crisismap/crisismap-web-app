var nsGmx = nsGmx || {};

nsGmx.LocationMarker = L.Marker.extend({

});

nsGmx.LocationMarkerManager = L.Class.extend({
    options: {
        maxZoom: 10
    },

    initialize: function(options) {
        L.setOptions(this, options);
        this._location = null;
        this._visible = false;
        this._marker = null;
        this.options.map.on('locationfound', this._onLocationFound, this);
        this.options.map.on('locationerror', this._onLocationError, this);
    },

    _onLocationFound: function (le) {
        this._location = le;
        this.render();
    },

    _onLocationError: function (ee) {
        this._location = null;
        this.render();
    },

    render: function() {
        if (this._location && this._visible) {
            this._marker = new nsGmx.LocationMarker(this._location.latlng);
            this.options.map.setView(this._location.latlng, this.options.maxZoom)
            this.options.map.addLayer(this._marker);
        } else {
            this._marker && this.options.map.removeLayer(this._marker);
        }
    },

    show: function() {
        if (!this._location) {
            this.options.map.locate({
                setView: false
            });
        }
        this._visible = true;
        this.render();
    },

    hide: function() {
        this._visible = false;
        this.render();
    },

    reset: function() {
        this.hide();
    }
});
