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

cm.define('headerMainMenu', ['headerNavBar', 'map', 'resetter'], function(cm) {
    var map = cm.get('map');
    var headerNavBar = cm.get('headerNavBar');
    var resetter = cm.get('resetter');

    var dropdownWidget = new nsGmx.DropdownWidget({
        titleClassName: 'icon-menu',
        trigger: 'click'
    });

    var AnchorWidget = nsGmx.GmxWidget.extend({
        className: 'anchorWidget',
        // options.href
        // options.title
        // options.target
        initialize: function(options) {
            this.options = options;
            this.render();
        },
        render: function() {
            $('<a>')
                .html(this.options.title)
                .attr('href', this.options.href)
                .attr('target', this.options.target)
                .appendTo(this.$el);
            return this;
        }
    });

    dropdownWidget.addItem('login', new nsGmx.PlainTextWidget(
        nsGmx.Translations.getText('crisismap.login')
    ));
    dropdownWidget.addItem('help', new nsGmx.PlainTextWidget(
        nsGmx.Translations.getText('crisismap.help')
    ));
    dropdownWidget.addItem('caw', new AnchorWidget({
        href: 'http://crisisalert.ru',
        title: nsGmx.Translations.getText('crisismap.crisisalertweb'),
        target: '_blank'
    }));
    dropdownWidget.addItem('rate', new nsGmx.PlainTextWidget(
        nsGmx.Translations.getText('crisismap.rateapp')
    ));
    dropdownWidget.addItem('options', new nsGmx.PlainTextWidget(
        nsGmx.Translations.getText('crisismap.options')
    ));

    dropdownWidget.appendTo(headerNavBar.getLeftContainer());

    resetter.on('reset', function() {
        dropdownWidget.reset();
    });

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

cm.define('helpDialog', ['config'], function (cm, cb) {
    var config = cm.get('config');
    var q = Handlebars.compile(config.user.helpDialogUrl)({
        lang: nsGmx.Translations.getLanguage()
    });
    $.ajax(q).then(function(resp) {
        cb(new nsGmx.ModalDialog({
            content: resp
        }))
    }).fail(function() {
        cb(new nsGmx.ModalDialog({
            content: 'unable to load ' + q
        }))
    });
});

cm.define('helpButton', ['headerMainMenu', 'helpDialog'], function (cm, cb) {
    var headerMainMenu = cm.get('headerMainMenu');
    var helpDialog = cm.get('helpDialog');

    headerMainMenu.on('item:help', function () {
        helpDialog.open();
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
    return new(L.Class.extend({
        includes: [Backbone.Events],
        initialize: function(opts) {
            this.options = opts;
            this.options.sectionsManager.on('sectionchange', this._update, this);
            this._update();
        },
        getAlertsNumber: function() {
            return this._currentCollection.length;
        },
        _update: function() {
            var sectionId = this.options.sectionsManager.getActiveSectionId();
            var newCollection = this.options.newsLayersCollections[sectionId];
            this._currentCollection && this._currentCollection.off('update', this._onCollectionUpdate, this);
            this._currentCollection = newCollection;
            newCollection && newCollection.on('update', this._onCollectionUpdate, this);
            newCollection && this._onCollectionUpdate();
        },
        _onCollectionUpdate: function() {
            this.trigger('change', this.getAlertsNumber());
        }
    }))({
        sectionsManager: cm.get('sectionsManager'),
        newsLayersCollections: cm.get('newsLayersCollections')
    });
});

cm.define('alertsWidget', [
    'alertsWidgetContainer',
    'newsLayersCollections',
    'sectionsManager',
    'config',
    'map'
], function(cm) {
    var alertsWidgetContainer = cm.get('alertsWidgetContainer');
    var newsLayersCollections = cm.get('newsLayersCollections');
    var sectionsManager = cm.get('sectionsManager');
    var config = cm.get('config');
    var map = cm.get('map');

    var alertsWidget = new nsGmx.SwitchingCollectionWidget({
        itemView: nsGmx.MarkerItemView,
        reEmitEvents: ['marker']
    });

    if (sectionsManager.getActiveSectionId() && sectionsManager.getActiveSectionId() !== '_empty') {
        alertsWidget.setCollection(newsLayersCollections[sectionsManager.getActiveSectionId()]);
    }

    sectionsManager.on('sectionchange', function(sectionId) {
        alertsWidget.setCollection(newsLayersCollections[sectionId]);
    });

    alertsWidget.appendTo(alertsWidgetContainer);

    return alertsWidget;
});

cm.define('geolocationControl', ['map', 'config', 'sidebarWidget'], function() {
    var map = cm.get('map');
    var config = cm.get('config');
    var sidebarWidget = cm.get('sidebarWidget');

    var ctrl = new L.Control.gmxIcon({
        id: 'geolocationControl',
        className: 'geolocationControl icon-direction leaflet-bar'
    });

    ctrl.addTo(map);

    sidebarWidget.on('stick', function(e) {
        if (e.isStuck) {
            ctrl && L.DomUtil.addClass(ctrl.getContainer(), 'leaflet-control-gmx-hidden');
        } else {
            ctrl && L.DomUtil.removeClass(ctrl.getContainer(), 'leaflet-control-gmx-hidden');
        }
    });

    ctrl.on('click', function() {
        map.locate({
            setView: true,
            maxZoom: config.user.geolocationMaxZoom
        });
    });

    return ctrl;
});
