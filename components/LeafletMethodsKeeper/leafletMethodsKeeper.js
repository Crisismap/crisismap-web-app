// keeps leaflet methods overriden by leaflet-active-area

var nsGmx = nsGmx || {};
nsGmx.L = {};
nsGmx.L.Map = {
    getCenter: L.Map.prototype.getCenter,
    setView: L.Map.prototype.setView,
    setZoomAround: L.Map.prototype.setZoomAround,
    getBoundsZoom: L.Map.prototype.getBoundsZoom,
    fitBounds: function (bounds, options) {

        options = options || {};
        bounds = bounds.getBounds ? bounds.getBounds() : L.latLngBounds(bounds);

        var paddingTL = L.point(options.paddingTopLeft || options.padding || [0, 0]),
            paddingBR = L.point(options.paddingBottomRight || options.padding || [0, 0]),

            zoom = nsGmx.L.Map.getBoundsZoom.call(this, bounds, false, paddingTL.add(paddingBR)),
            paddingOffset = paddingBR.subtract(paddingTL).divideBy(2),

            swPoint = this.project(bounds.getSouthWest(), zoom),
            nePoint = this.project(bounds.getNorthEast(), zoom),
            center = this.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom);

        zoom = options && options.maxZoom ? Math.min(options.maxZoom, zoom) : zoom;

        return nsGmx.L.Map.setView.call(this, center, zoom, options);
    }
};