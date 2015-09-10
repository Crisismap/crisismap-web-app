var MarkerModel = Backbone.Model.extend({
    constructor: function (properties) {
        Backbone.Model.call(this, {
            id: properties['id'],
            title: properties['Title'],
            description: properties['Description'],
            date: new Date(properties['pub_date'] * 1000),
            latLng: L.Projection.Mercator.unproject({
                x: properties['mercX'],
                y: properties['mercY']
            })
        });
    }
});
