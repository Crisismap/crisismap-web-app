window.nsGmx = window.nsGmx || {};

window.nsGmx.AlertsWidget = nsGmx.CompositeScrollView.extend({
    options: {
        field: 'class'
    },

    // options.customScrollbar
    initialize: function(options) {

        this.alertsListWidget = new nsGmx.SwitchingCollectionWidget({
            itemView: nsGmx.MarkerItemView,
            reEmitEvents: ['marker']
        });

        this.alertsListWidget.on('marker', function(model) {
            this.trigger.call(this, 'marker', model);
        }.bind(this));

        this.collectionFilterWidget = new nsGmx.CollectionFilterWidget({
            field: this.options.field
        });

        this._activeValues = this.collectionFilterWidget.getActiveValues();

        this.collectionFilterWidget.on('change', function(activeValues) {
            this._activeValues = activeValues;
            this._updateAlertsListWidget();
        }.bind(this));

        // save old options
        var opts = this.options;

        nsGmx.CompositeScrollView.prototype.initialize.call(this, {
            staticWidget: this.collectionFilterWidget,
            scrollingWidget: this.alertsListWidget,
            customScrollbar: options.customScrollbar
        });

        this.options = _.extend(opts, this.options, options);

        this.options.collection && this.setCollection(this.options.collection);
    },

    setCollection: function(collection) {
        this.collection && this.collection.off('update', this._onSectionCollectionUpdate, this);
        this.collection = collection;
        this.collection && this.collection.on('update', this._onSectionCollectionUpdate, this);
        this._updateAlertsListWidget();
        this._updateCollectionFilterWidget();
    },

    _getCollection: function() {
        return this.collection;
    },

    _getFilteredCollection: function() {
        var collection = this._getCollection();
        if (!collection) {
            return new Backbone.Collection();
        }
        return new Backbone.Collection(collection.filter(function(model) {
            return this._activeValues.indexOf(model.get(this.options.field)) > -1;
        }.bind(this)));
    },

    _updateAlertsListWidget: function() {
        this.alertsListWidget.setCollection(this._getFilteredCollection());
    },

    _updateCollectionFilterWidget: function() {
        this.collectionFilterWidget.setCollection(this._getCollection());
    },

    _onSectionCollectionUpdate: function(collection) {
        this._updateCollectionFilterWidget();
        this._updateAlertsListWidget();
    },

    _getSectionIdByCollection: function(collection) {
        var id;
        Object.keys(this.options.newsLayersCollections).map(function(sectionId) {
            if (this.options.newsLayersCollections[sectionId] === collection) {
                id = sectionId;
            }
        }.bind(this));
        return id;
    }
});
