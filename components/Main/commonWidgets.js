cm.define('widgetsManager', ['map'], function(cm) {
    var map = cm.get('map');

    var wm = new(L.Class.extend({
        includes: [L.Mixin.Events],
        initialize: function() {
            this._widgets = [];
            this._currentWidget = {};
        },
        add: function(widget) {
            if (!widget.cid || !widget.getContainer) {
                throw 'widget must be instance of nsGmx.GmxWidget';
            }
            this._widgets.push(widget);
            $(widget.getContainer()).on('click', function() {
                this._currentWidget = widget;
            }.bind(this));
        },
        reset: function() {
            this._widgets.map(function(widget) {
                if (widget.cid !== this._currentWidget.cid) {
                    widget.reset && widget.reset();
                }
            }.bind(this));
            this._currentWidget = {};
        }
    }));

    map.on('click', function() {
        wm.reset();
    });

    $('body').on('click', function() {
        wm.reset();
    });

    return wm;
});

cm.define('headerNavBar', ['layoutManager'], function(cm) {
    var layoutManager = cm.get('layoutManager');

    var HeaderNavBar = nsGmx.GmxWidget.extend({
        className: 'headerNavBar',
        initialize: function() {
            $('<div>').addClass('headerNavBar-leftContainer').appendTo(this.$el);
            $('<div>').addClass('headerNavBar-centerContainer').appendTo(this.$el);
            $('<div>').addClass('headerNavBar-rightContainer').appendTo(this.$el);
        },
        getLeftContainer: function() {
            return this.$el.find('.headerNavBar-leftContainer')[0];
        },
        getCenterContainer: function() {
            return this.$el.find('.headerNavBar-centerContainer')[0];
        },
        getRightContainer: function() {
            return this.$el.find('.headerNavBar-rightContainer')[0];
        }
    });

    var headerNavBar = new HeaderNavBar();

    headerNavBar.appendTo(layoutManager.getHeaderContainer());

    return headerNavBar;
});

cm.define('headerMainMenu', ['headerNavBar', 'map', 'widgetsManager'], function(cm) {
    var map = cm.get('map');
    var headerNavBar = cm.get('headerNavBar');
    var widgetsManager = cm.get('widgetsManager');

    var dropdownWidget = new nsGmx.DropdownWidget({
        titleClassName: 'icon-menu',
        trigger: 'click'
    });

    dropdownWidget.addItem('login', new nsGmx.PlainTextWidget(
        nsGmx.Translations.getText('crisismap.login')
    ));
    dropdownWidget.addItem('help', new nsGmx.PlainTextWidget(
        nsGmx.Translations.getText('crisismap.help')
    ));
    dropdownWidget.addItem('caw', new nsGmx.PlainTextWidget(
        nsGmx.Translations.getText('crisismap.crisisalertweb')
    ));
    dropdownWidget.addItem('rate', new nsGmx.PlainTextWidget(
        nsGmx.Translations.getText('crisismap.rateapp')
    ));
    dropdownWidget.addItem('options', new nsGmx.PlainTextWidget(
        nsGmx.Translations.getText('crisismap.options')
    ));

    dropdownWidget.appendTo(headerNavBar.getLeftContainer());

    widgetsManager.add(dropdownWidget);

    return dropdownWidget;
});

cm.define('switchLanguageButton', ['headerMainMenu'], function(cm) {
    var headerMainMenu = cm.get('headerMainMenu');
    headerMainMenu.addItem('switchLanguage', new nsGmx.PlainTextWidget(
        nsGmx.Translations.getText('crisismap.switchLanguage')
    ));
    headerMainMenu.on('item:switchLanguage', function() {
        nsGmx.Translations.updateLanguageCookies(
            nsGmx.Translations.getLanguage() === 'rus' ? 'eng' : 'rus',
            '/'
        );
        window.location.reload(false);
    });
    return null;
});

cm.define('sidebarWidget', ['gmxApplication'], function() {
    return cm.get('gmxApplication').get('sidebarWidget');
});

cm.define('layersTreeWidget', ['layersTree', 'sidebarWidget', 'sectionsManager'], function(cm) {
    var layersTree = cm.get('layersTree');
    var sidebarWidget = cm.get('sidebarWidget');
    var sectionsManager = cm.get('sectionsManager');
    var switchingLayersTreeWidget = new nsGmx.ModelPagedWidget({
        widgetClass: nsGmx.LayersTreeWidget
    });
    var container = sidebarWidget.addTab('layersTreeWidget', 'icon-layers');
    switchingLayersTreeWidget.appendTo(container);
    sectionsManager.on('sectionchange', function(sectionId) {
        var model = sectionsManager.getSectionProperties(sectionId).tree;
        model && switchingLayersTreeWidget.setModel(model);
    });
    var model = sectionsManager.getSectionProperties(sectionsManager.getActiveSectionId()).tree
    model && switchingLayersTreeWidget.setModel(model);
    return switchingLayersTreeWidget;
});

cm.define('activeAlertsNumber', ['sectionsManager', 'newsLayersCollections'], function(cm) {
    return new (L.Class.extend({
        includes: [Backbone.Events],
        initialize: function(opts) {
            this.options = opts;
            var update = this._update.bind(this);
            this.options.sectionsManager.on('sectionchange', update);
            update(this.options.sectionsManager.getActiveSectionId());
            this._prevCollection = null;
        },
        getAlertsNumber: function () {
            return this.number;
        },
        _update: function(sectionId) {
            var onCollectionUpdate = this._onCollectionUpdate.bind(this);
            sectionId = sectionId || this.options.sectionsManager.getActiveSectionId();
            var collection = this.options.newsLayersCollections[sectionId];
            this._prevCollection && this._prevCollection.off('update', onCollectionUpdate);
            collection && onCollectionUpdate(collection);
            collection && collection.off('update', onCollectionUpdate)
            collection && collection.on('update', onCollectionUpdate);
            this._prevCollection = collection;
        },
        _onCollectionUpdate: function (collection) {
            this.number = collection.length;
            this.trigger('change', this.number);
        }
    }))({
        sectionsManager: cm.get('sectionsManager'),
        newsLayersCollections: cm.get('newsLayersCollections')
    });
});

cm.define('alertsWidget', [
    'sectionsManager',
    'newsLayersCollections',
    'alertsWidgetScrollView'
], function(cm) {
    var sectionsManager = cm.get('sectionsManager');
    var newsLayersCollections = cm.get('newsLayersCollections');
    var alertsWidgetScrollView = cm.get('alertsWidgetScrollView');

    var alertsWidget = new nsGmx.SwitchingCollectionWidget({
        className: 'alertsCollectionView',
        itemView: nsGmx.AlertItemView,
        reEmitEvents: ['marker']
    });

    if (sectionsManager.getActiveSectionId() && sectionsManager.getActiveSectionId() !== '_empty') {
        alertsWidget.setCollection(newsLayersCollections[sectionsManager.getActiveSectionId()]);
    }

    sectionsManager.on('sectionchange', function(sectionId) {
        alertsWidget.setCollection(newsLayersCollections[sectionId]);
    });

    alertsWidgetScrollView.addView(alertsWidget);

    return alertsWidget;
});
