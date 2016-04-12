var nsGmx = nsGmx || {};

nsGmx.LocationModel = Backbone.Model.extend({
    constructor: function (options) {
        this.map = options.map;
        Backbone.Model.apply(this)
    },

    initialize: function() {
        map.on('locationfound', function(le) {
            this.set(_.extend({
                state: 'success'
            }, _.pick(le, 'latlng', 'accuracy')));
        }.bind(this));

        map.on('locationerror', function () {
            this.set({
                state: 'error'
            });
            this.trigger('locationerror');
        }.bind(this));

        this.set({
            state: 'pending'
        });

        this.updateLocation();
    },

    updateLocation: function() {
        var p = new Promise(function(resolve, reject) {
            map.once('locationfound', function() {
                setTimeout(function() {
                    resolve(this);
                }.bind(this), 0);
            }.bind(this));

            map.once('locationerror', function() {
                setTimeout(function() {
                    reject();
                }.bind(this), 0);
            }.bind(this));
        }.bind(this));

        map.locate({
            setView: false
        });

        return p;
    },

    ensureLocation: function () {
        return new Promise(function (resolve, reject) {
            if (this.get('latlng')) {
                resolve(this);
            } else {
                this.updateLocation().then(function () {
                    resolve(this);
                }, function () {
                    reject();
                })
            }
        }.bind(this));
    }
});
