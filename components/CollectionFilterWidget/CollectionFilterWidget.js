window.nsGmx = window.nsGmx || {};

window.nsGmx.CollectionFilterWidget = nsGmx.GmxWidget.extend({
    className: 'filterWidget',

    // options.collection
    // options.field
    initialize: function(options) {
        this.options = _.extend({}, options);

        this._models = [];
        this.options.collection && this.setCollection(this.options.collection)
        this.render();
    },

    render: function() {
        this.$el.empty();

        this._models.map(function(model) {
            var w = new nsGmx.CheckboxWidget({
                model: model,
                showLabel: false
            });
            w.appendTo(this.$el);
        }.bind(this));
    },

    setCollection: function(collection) {
        if (this.collection) {
            this.collection.off('update', this._onCollectionUpdate, this);
        }
        this.collection = collection;
        this.collection.on('update', this._onCollectionUpdate, this);
        this._onCollectionUpdate();
    },

    getActiveValues: function() {
        return this._models.filter(function(model) {
            return model.get('state');
        }).map(function(model) {
            return model.get('value');
        });
    },

    _onCollectionUpdate: function() {
        this._unbindModels();
        this._models = [];
        var modelsValues = [];
        this.collection.map(function(model) {
            if (modelsValues.indexOf(model.get(this.options.field)) === -1) {
                this._models.push(new Backbone.Model({
                    value: model.get(this.options.field),
                    state: true
                }));
                modelsValues = this._models.map(function(model) {
                    return model.get('value');
                });
            }
        }.bind(this));
        this._bindModels();
        this.trigger('change', this.getActiveValues());
        this.render();
    },

    _bindModels: function() {
        this._models.map(function(model) {
            model.on('change', this._onModelChange, this);
        }.bind(this));
    },

    _unbindModels: function() {
        this._models.map(function(model) {
            model.off('change', this._onModelChange, this);
        }.bind(this));
    },

    _onModelChange: function() {
        this.trigger('change', this.getActiveValues());
    }
});
