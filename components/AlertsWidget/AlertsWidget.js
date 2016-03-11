window.nsGmx = window.nsGmx || {};

window.nsGmx.AlertsWidget = nsGmx.CompositeScrollView.extend({
    options: {
        field: 'class'
    },

    initialize: function(options) {

        this.alertsListWidget = new nsGmx.SwitchingCollectionWidget({
            itemView: nsGmx.MarkerItemView,
            reEmitEvents: ['marker']
        });

        this.alertsListWidget.on('marker', function (model) {
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
            scrollingWidget: this.alertsListWidget
        });

        this.options = _.extend(opts, this.options, options);

        this.options.sectionsManager.on('sectionchange', this._onSectionChange, this);

        Object.keys(this.options.newsLayersCollections).map(function(sectionId) {
            this.options.newsLayersCollections[sectionId].on('update', this._onSectionCollectionUpdate, this);
        }.bind(this));

        if (this.options.sectionsManager.getActiveSectionId()) {
            this._onSectionChange(this.options.sectionsManager.getActiveSectionId());
        }
    },

    _getCollection: function () {
        return this.options.newsLayersCollections[this.options.sectionsManager.getActiveSectionId()];
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

    _onSectionChange: function(sectionId) {
        // this.updateCollection();
    },

    _onSectionCollectionUpdate: function(collection) {
        var activeSectionId = this.options.sectionsManager.getActiveSectionId();
        if (this._getSectionIdByCollection(collection) === activeSectionId) {
            this._updateCollectionFilterWidget();
            this._updateAlertsListWidget();
        }
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
