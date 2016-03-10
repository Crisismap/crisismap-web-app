window.nsGmx = window.nsGmx || {};

window.nsGmx.AlertsWidget = nsGmx.CompositeScrollView.extend({
    initialize: function(options) {

        this.alertsListWidget = new nsGmx.SwitchingCollectionWidget({
            itemView: nsGmx.MarkerItemView,
            reEmitEvents: ['marker']
        });

        this.collectionFilterWidget = new nsGmx.CollectionFilterWidget({
            field: 'class'
        });

        nsGmx.CompositeScrollView.prototype.initialize.call(this, {
            staticWidget: this.collectionFilterWidget,
            scrollingWidget: this.alertsListWidget
        });

        this.options = _.extend(this.options, options);

        this.options.sectionsManager.on('sectionchange', this._onSectionChange, this);

        Object.keys(this.options.newsLayersCollections).map(function(sectionId) {
            this.options.newsLayersCollections[sectionId].on('update', this._onSectionCollectionUpdate, this);
        }.bind(this));

        if (this.options.sectionsManager.getActiveSectionId()) {
            this._onSectionChange(this.options.sectionsManager.getActiveSectionId());
        }
    },


    updateCollection: function() {
        console.time('set_collection');
        var collection = this.options.newsLayersCollections[this.options.sectionsManager.getActiveSectionId()];
        if (!collection) {
            return;
        }
        this.alertsListWidget.setCollection(collection);
        this.collectionFilterWidget.setCollection(collection);
        console.timeEnd('set_collection');
    },

    _onSectionChange: function (sectionId) {
        this.updateCollection();
    },

    _onSectionCollectionUpdate: function(collection) {
        var activeSectionId = this.options.sectionsManager.getActiveSectionId();
        if (this._getSectionIdByCollection(collection) === activeSectionId) {
            console.log(activeSectionId);
        }
    },

    _getSectionIdByCollection: function (collection) {
        var id;
        Object.keys(this.options.newsLayersCollections).map(function(sectionId) {
            if (this.options.newsLayersCollections[sectionId] === collection) {
                id = sectionId;
            }
        }.bind(this));
        return id;
    }
});
