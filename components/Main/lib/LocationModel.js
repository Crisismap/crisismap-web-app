var nsGmx = nsGmx || {};

nsGmx.LocationModel = Backbone.Model.extend({
    constructor: function (options) {
        this.map = options.map;
        Backbone.Model.apply(this)
    },

    initialize: function() {
        this.map.on('locationfound', function(le) {
            this.set(_.extend({
                state: 'success'
            }, _.pick(le, 'latlng', 'accuracy')));
        }.bind(this));

        this.map.on('locationerror', function () {
            this.set({
                state: 'error'
            });
            this.trigger('locationerror');
        }.bind(this));

        this.set({
            state: 'undefined'
        });
    },

    updateLocation: function() {
        this.set({
            state: 'pending'
        });

        var p = new Promise(function(resolve, reject) {
            this.map.once('locationfound', function() {
                setTimeout(function() {
                    resolve(this);
                }.bind(this), 0);
            }.bind(this));

            this.map.once('locationerror', function() {
                setTimeout(function() {
                    reject();
                }.bind(this), 0);
            }.bind(this));
        }.bind(this));

        this.map.locate({
            setView: false
        });

        return p;
    },

    ensureLocation: function () {
        return new Promise(function (resolve, reject) {
            if (this.get('latlng') && this.get('state') === 'success') {
                resolve(this);
            } else {
                this.updateLocation().then(function () {
                    resolve(this);
                }.bind(this), function () {
                    reject();
                }.bind(this))
            }
        }.bind(this));
    }
});
