var nsGmx = nsGmx || {};

nsGmx.LocationMarker = L.Class.extend({
    // options.circleRadius
    initialize: function(options) {
        L.setOptions(this, options);
    },

    onAdd: function(map) {
        this._marker = L.marker(this.options.latlng);
        this._circle = L.circle(this.options.latlng, this.options.accuracy);
        map.addLayer(this._marker);
        map.addLayer(this._circle);
    },

    onRemove: function(map) {
        this._marker && map.removeLayer(this._marker);
        this._circle && map.removeLayer(this._circle);
        this._marker = null;
        this._circle = null;
    },

    getBounds: function () {

    }
});

nsGmx.LocationMarkerManager = L.Class.extend({
    options: {
        maxZoom: 14
    },

    initialize: function(options) {
        L.setOptions(this, options);
        this._visible = false;
        this._marker = null;
        this.options.locationModel.on('change', this.render, this);
    },

    render: function() {
        var latlng = this.options.locationModel.get('latlng');
        var accuracy = this.options.locationModel.get('accuracy');
        if (this.options.locationModel.get('state') === 'success' && this._visible) {
            this.options.map.setView(latlng, this.options.maxZoom)
            if (!this._marker) {
                this._marker = new nsGmx.LocationMarker({
                    latlng: latlng,
                    accuracy: accuracy
                });
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
        this.options.locationModel.ensureLocation().then(function() {
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
