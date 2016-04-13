var nsGmx = nsGmx || {};

nsGmx.LocationMarker = L.Marker.extend({

});

nsGmx.LocationMarkerManager = L.Class.extend({
    options: {
        maxZoom: 10
    },

    initialize: function(options) {
        L.setOptions(this, options);
        this._visible = false;
        this._marker = null;
        this.options.locationModel.on('change', this.render, this);
    },

    render: function() {
        var latlng = this.options.locationModel.get('latlng');
        if (this.options.locationModel.get('state') === 'success' && this._visible) {
            this.options.map.setView(latlng, this.options.maxZoom)
            if (!this._marker) {
                this._marker = new nsGmx.LocationMarker(latlng);
                this.options.map.addLayer(this._marker);
            } else {
                this._marker.setLatLng(latlng);
            }
        } else {
            this._marker && this.options.map.removeLayer(this._marker);
            this._marker = null;
        }
    },

    showMarker: function() {
        this.options.locationModel.ensureLocation().then(function () {
            this._visible = true;
            this.render();
        }.bind(this));
    },

    hideMarker: function() {
        this._visible = false;
        this.render();
    },

    reset: function() {
        this.hideMarker();
    }
});
