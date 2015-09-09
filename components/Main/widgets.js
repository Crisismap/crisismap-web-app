cm.define('markerCursor', ['map'], function(cm) {
    var map = cm.get('map');
    var marker = L.marker([0, 0]);
    return {
        show: function() {
            map.addLayer(marker);
        },
        hide: function() {
            map.removeLayer(marker);
        },
        setLatLng: function() {
            marker.setLatLng.apply(marker, arguments);
        }
    }
});

cm.define('infoControl', ['map', 'mapLayoutHelper', 'markerCursor'], function(cm) {
    var map = cm.get('map');
    var mlh = cm.get('mapLayoutHelper');
    var mc = cm.get('markerCursor');

    var infoControl = new nsGmx.InfoControl({
        position: 'center'
    });

    map.addControl(infoControl);

    return infoControl;
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

cm.define('headerMainMenu', ['headerNavBar', 'map'], function(cm) {
    var map = cm.get('map');
    var headerNavBar = cm.get('headerNavBar');

    var dropdownWidget = new nsGmx.DropdownWidget({
        titleClassName: 'icon-menu',
        trigger: 'click'
    });

    dropdownWidget.addItem('login', new nsGmx.PlainTextWidget('Вход'));
    dropdownWidget.addItem('help', new nsGmx.PlainTextWidget('Справка'));
    dropdownWidget.addItem('caw', new nsGmx.PlainTextWidget('CrisisAlertWeb'));
    dropdownWidget.addItem('rate', new nsGmx.PlainTextWidget('Оценить приложение'));
    dropdownWidget.addItem('options', new nsGmx.PlainTextWidget('Настройки'));

    dropdownWidget.on('expand', function() {
        cm.get('headerLayersMenu') && cm.get('headerLayersMenu').collapse();
    });

    dropdownWidget.appendTo(headerNavBar.getLeftContainer());

    map.on('click', function(le) {
        dropdownWidget.collapse();
    });

    return dropdownWidget;
});

cm.define('headerLayersMenu', ['map', 'config', 'newsLayersManager', 'layersHash', 'headerNavBar'], function() {
    var map = cm.get('map');
    var config = cm.get('config');
    var layersHash = cm.get('layersHash');
    var headerNavBar = cm.get('headerNavBar');
    var newsLayersManager = cm.get('newsLayersManager');

    var dropdownItems = {
        fires: 'Пожары',
        ecology: 'Экология',
        floods: 'Наводнения'
    };

    var dropdownWidget = new nsGmx.DropdownWidget({
        title: dropdownItems[newsLayersManager.getActiveLayerName()],
        showTopItem: false,
        trigger: 'click'
    });

    dropdownWidget.on('item', function(id) {
        newsLayersManager.setActiveLayerByName(id);
        cm.get('markerLayersPopupsManager') && cm.get('markerLayersPopupsManager').reset();
        nsGmx.L.Map.fitBounds.call(map, layersHash[newsLayersManager.getActiveLayerId()].getBounds());
        dropdownWidget.setTitle(dropdownItems[id]);
    });

    for (var it in dropdownItems) {
        if (dropdownItems.hasOwnProperty(it)) {
            dropdownWidget.addItem(it, new nsGmx.PlainTextWidget(dropdownItems[it]));
        }
    }

    dropdownWidget.on('expand', function() {
        cm.get('headerMainMenu') && cm.get('headerMainMenu').collapse();
    });

    dropdownWidget.appendTo(headerNavBar.getCenterContainer());

    map.on('click', function(le) {
        dropdownWidget.collapse();
    });

    return dropdownWidget;
});

cm.define('headerLayoutButton', ['headerNavBar', 'newsLayersManager', 'rootPageView'], function(cm) {
    var rootPageView = cm.get('rootPageView');
    var headerNavBar = cm.get('headerNavBar');
    var newsLayersManager = cm.get('newsLayersManager');

    var HeaderLayoutButton = nsGmx.GmxWidget.extend({
        className: 'headerLayoutButton icon-bell',
        events: {
            'click': function() {
                this.toggleState();
            }
        },
        toggleState: function() {
            this.$el.toggleClass('icon-bell');
            this.$el.toggleClass('icon-globe');
            this.trigger('stateswitch', this.getState());
        },
        getState: function() {
            return this.$el.hasClass('icon-bell') ? 'map' : 'alerts';
        }
    });

    var headerLayoutButton = new HeaderLayoutButton();

    headerLayoutButton.appendTo(headerNavBar.getRightContainer());

    headerLayoutButton.on('stateswitch', function(state) {
        if (state === 'map') {
            rootPageView.setActivePage('map');
            map.invalidateSize();
        } else {
            rootPageView.setActivePage('alerts');
        }
    });

    return headerLayoutButton;
});

// компонент, обрабатывающий клики по маркерам
cm.define('markerLayersPopupsManager', ['config', 'layersHash', 'infoControl', 'headerNavBar', 'newsLayersManager', 'newsLayersClusters'], function(cm) {
    var map = cm.get('map');
    var config = cm.get('config');
    var layersHash = cm.get('layersHash');
    var headerNavBar = cm.get('headerNavBar');
    var newsLayersManager = cm.get('newsLayersManager');

    var MLPM = L.Class.extend({
        initialize: function(options) {
            L.setOptions(this, options);
            this.options.layers.map(function(layer) {
                unbindPopup(layer);
                layer.on('click', function(e) {
                    var geometry = e.gmx.target.properties[e.gmx.target.properties.length - 1];
                    this.show({
                        title: e.gmx.properties.Title,
                        description: e.gmx.properties.Description,
                        latLng: L.Projection.Mercator.unproject({
                            x: geometry.coordinates[0],
                            y: geometry.coordinates[1]
                        })
                    })
                }.bind(this));
            }.bind(this));
        },
        show: function(opts) {
            var map = cm.get('map');
            var mapLayoutHelper = cm.get('mapLayoutHelper');
            this.options.mapLayoutHelper.hideBottomControls();
            this.options.infoControl.show();
            this.options.infoControl && this.options.infoControl.setTitle(opts.title);
            this.options.infoControl && this.options.infoControl.setContent(opts.description);
            map.setActiveArea({
                bottom: getFullHeight(this.options.infoControl.getContainer()) + 'px'
            });
            map.setView(opts.latLng, map.getZoom());
            this.options.markerCursor.setLatLng(opts.latLng);
            this.options.markerCursor.show();
        },
        reset: function() {
            this.options.infoControl.hide();
            this.options.mapLayoutHelper && this.options.mapLayoutHelper.showBottomControls();
            this.options.mapLayoutHelper.resetActiveArea();
            this.options.markerCursor.hide();
        }
    });

    var mlpm = new MLPM({
        layers: newsLayersManager.getLayersNames().map(function(name) {
            return layersHash[newsLayersManager.getLayerIdByLayerName(name)];
        }),
        infoControl: cm.get('infoControl'),
        markerCursor: cm.get('markerCursor'),
        mapLayoutHelper: cm.get('mapLayoutHelper')
    });

    headerNavBar.on('select', function() {
        mlpm.reset();
    });

    map.on('click', function() {
        mlpm.reset();
    });

    return mlpm;
});

cm.define('alertsPageView', ['rootPageView'], function(cm) {
    var rootPageView = cm.get('rootPageView');

    var alertsPageView = new nsGmx.PageView();
    var $alertsPage = $(rootPageView.addPage('alerts')).addClass('pageView-item_alerts');
    alertsPageView.appendTo($alertsPage);

    return alertsPageView;
});

cm.define('alertsPages', ['alertsPageView', 'newsLayersManager', 'layersHash', 'calendar', 'headerLayoutButton', 'markerLayersPopupsManager'], function(cm) {
    var markerLayersPopupsManager = cm.get('markerLayersPopupsManager');
    var headerLayoutButton = cm.get('headerLayoutButton');
    var newsLayersManager = cm.get('newsLayersManager');
    var alertsPageView = cm.get('alertsPageView');
    var layersHash = cm.get('layersHash');
    var calendar = cm.get('calendar');

    var scrollViews = {}
    newsLayersManager.getLayersNames().map(function(name) {
        var page = alertsPageView.addPage(name);
        var markersCollection = new nsGmx.LayerMarkersCollection([], {
            layer: layersHash[newsLayersManager.getLayerIdByLayerName(name)],
            calendar: calendar
        });
        var markersCollectionView = new nsGmx.SwitchingCollectionWidget({
            className: 'alertsCollectionView',
            collection: markersCollection,
            itemView: nsGmx.AlertItemView,
            reEmitEvents: ['marker']
        });
        markersCollectionView.on('marker', function(model) {
            headerLayoutButton.toggleState();
            markerLayersPopupsManager.show({
                title: model.get('Title'),
                description: model.get('Description'),
                latLng: L.Projection.Mercator.unproject({
                    x: model.get('mercX'),
                    y: model.get('mercY')
                })
            });
        });
        var scrollView = scrollViews[name] = new nsGmx.ScrollView({
            views: [markersCollectionView]
        });
        window.mc = markersCollection;
        scrollView.appendTo(page);
    });

    alertsPageView.setActivePage(newsLayersManager.getActiveLayerName());

    newsLayersManager.on('activelayerchange', function(d) {
        alertsPageView.setActivePage(d.name);
        scrollViews[d.name].repaint();
    });

    headerLayoutButton.on('stateswitch', function(state) {
        if (state === 'alerts') {
            for (name in scrollViews) {
                if (scrollViews.hasOwnProperty(name)) {
                    scrollViews[name].repaint();
                }
            }
        }
    });

    return null;
});
