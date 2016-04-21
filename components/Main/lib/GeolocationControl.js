var nsGmx = nsGmx || {};

nsGmx.GeolocationControl = L.Control.extend({
    includes: [L.Mixin.Events],

    // options.locationModel
    // options.mode
    initialize: function (options) {
        L.setOptions(this, options);
        this._container = L.DomUtil.create('div', 'geolocationControl');
        L.DomEvent.disableClickPropagation(this._container);
        this._container.addEventListener('mousewheel', L.DomEvent.stopPropagation);
        this._iconEl = L.DomUtil.create('a', 'geolocationControl-icon', this._container);
        this.options.locationModel.on('change:state', this._updateStateIcon, this);
        if (this.options.mode === 'desktop') {
            L.DomUtil.addClass(this._container, 'leaflet-bar');
        } else {
            L.DomUtil.addClass(this._container, 'geolocationControl_mobile');
        }
        L.DomEvent.on(this._container, 'click', function (e) {
            this.fire('click');

            var state = this.options.locationModel.get('state');
            if (state === 'success' || state === 'undefined') {
                this.options.locationModel.updateLocation();
            }
        }.bind(this));
        this._updateStateIcon();
    },

    onAdd: function (map) {
        return this._container;
    },

    _updateStateIcon: function () {
        var iconsMap = {
            'undefined': 'icon-direction',
            'success': 'icon-direction',
            'pending': 'icon-refresh animate-spin ui-state-disabled',
            'error': 'icon-direction ui-state-disabled'
        }
        this._iconEl.className = 'geolocationControl-icon ' + iconsMap[this.options.locationModel.get('state')];
    }
});
