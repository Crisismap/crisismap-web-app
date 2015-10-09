if (nsGmx.CrisisMap.isMobile()) {
    cm.define('rootPageView', ['layoutManager'], function(cm) {
        var layoutManager = cm.get('layoutManager');

        var rootPageView = new nsGmx.PageView();
        rootPageView.appendTo(layoutManager.getContentContainer());

        return rootPageView;
    });

    cm.define('mapContainer', ['rootPageView'], function(cm) {
        var rootPageView = cm.get('rootPageView');
        var mapPage = rootPageView.addPage('map');
        rootPageView.setActivePage('map');
        return $('<div>').addClass('crisisMap-mapPage').appendTo(mapPage)[0];
    });

    cm.define('alertsWidgetScrollView', ['rootPageView'], function() {
        var rootPageView = cm.get('rootPageView');
        var alertsWidgetContainer = $(rootPageView.addPage('alerts')).addClass('pageView-item_alerts');
        var scrollView = new nsGmx.ScrollView();
        scrollView.appendTo(alertsWidgetContainer);
        return scrollView;
    });

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

    cm.define('headerLayersMenu', ['map', 'config', 'sectionsManager', 'layersHash', 'headerNavBar', 'widgetsManager'], function() {
        var map = cm.get('map');
        var config = cm.get('config');
        var layersHash = cm.get('layersHash');
        var headerNavBar = cm.get('headerNavBar');
        var sectionsManager = cm.get('sectionsManager');
        var widgetsManager = cm.get('widgetsManager');

        var dropdownWidget = new nsGmx.DropdownWidget({
            title: sectionsManager.getSectionProperties(sectionsManager.getActiveSectionId()).title,
            showTopItem: false,
            trigger: 'click'
        });

        dropdownWidget.on('item', function(id) {
            sectionsManager.setActiveSectionId(id);
            cm.get('markerLayersPopupsManager') && cm.get('markerLayersPopupsManager').reset();
            var layer = layersHash[sectionsManager.getSectionProperties(id).dataLayerId];
            layer && nsGmx.L.Map.fitBounds.call(
                map,
                layer.getBounds()
            );
            dropdownWidget.setTitle(sectionsManager.getSectionProperties(id).title);
        });

        var sectionsIds = sectionsManager.getSectionsIds();
        for (var i = 0; i < sectionsIds.length; i++) {
            dropdownWidget.addItem(sectionsIds[i], new nsGmx.PlainTextWidget(
                sectionsManager.getSectionProperties(sectionsIds[i]).title
            ));
        }

        dropdownWidget.appendTo(headerNavBar.getCenterContainer());

        widgetsManager.add(dropdownWidget);

        return dropdownWidget;
    });

    cm.define('headerLayoutButton', ['headerNavBar', 'rootPageView', 'map', 'alertsWidget'], function(cm) {
        var map = cm.get('map');
        var alertsWidget = cm.get('alertsWidget');
        var rootPageView = cm.get('rootPageView');
        var headerNavBar = cm.get('headerNavBar');

        var HeaderLayoutButton = nsGmx.LabelIconWidget.extend({
            initialize: function() {
                nsGmx.LabelIconWidget.prototype.initialize.apply(this);
                this.setState('map');
                this.$el.on('click',function () {
                    this.toggleState();
                }.bind(this));
            },
            toggleState: function() {
                this.setState(this._state === 'map' ? 'alerts' : 'map');
            },
            setState: function(state) {
                this._state = state;
                this.setIconClass(state === 'map' ? 'icon-bell' : 'icon-globe');
                this.trigger('stateswitch', this.getState());
            },
            getState: function() {
                return this._state;
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
                alertsWidget.trigger('resize');
            }
        });

        return headerLayoutButton;
    });

    // компонент, отображающий попапы маркеров
    cm.define('markerLayersPopupsManager', [
        'map',
        'config',
        'infoControl',
        'headerNavBar',
        'alertsWidget',
        'headerLayoutButton',
        'markersClickHandler',
    ], function(cm) {
        var map = cm.get('map');
        var config = cm.get('config');
        var layersHash = cm.get('layersHash');
        var headerNavBar = cm.get('headerNavBar');
        var alertsWidget = cm.get('alertsWidget');
        var headerLayoutButton = cm.get('headerLayoutButton');
        var markersClickHandler = cm.get('markersClickHandler');

        var MLPM = L.Class.extend({
            initialize: function(options) {
                L.setOptions(this, options);
            },
            show: function(model) {
                var map = cm.get('map');
                var mapLayoutHelper = cm.get('mapLayoutHelper');
                this.options.mapLayoutHelper.hideBottomControls();
                this.options.infoControl.render(model);
                this.options.infoControl.show();
                map.setActiveArea({
                    bottom: getFullHeight(this.options.infoControl.getContainer()) + 'px'
                });
                map.setView(model.get('latLng'), config.user.markerZoom);
                this.options.markerCursor.setLatLng(model.get('latLng'));
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

        markersClickHandler.on('click', function(e) {
            mlpm.show(e.model);
        });

        alertsWidget.on('marker', function(model) {
            headerLayoutButton.toggleState();
            mlpm.show(model);
        })

        return mlpm;
    });

    cm.define('calendarPage', ['calendar', 'rootPageView', 'headerMainMenu'], function(cm) {
        var calendar = cm.get('calendar');
        var rootPageView = cm.get('rootPageView');
        var headerMainMenu = cm.get('headerMainMenu');

        var $container = rootPageView.addPage('calendar');
        var calendarPage = new nsGmx.CalendarPage({
            model: calendar
        });
        calendarPage.appendTo($container);

        headerMainMenu.addItem('calendar', new nsGmx.PlainTextWidget(nsGmx.Translations.getText('crisismap.archive')));
        headerMainMenu.on('item', function(id) {
            if (id === 'calendar') {
                rootPageView.setActivePage('calendar');
            }
        });

        calendarPage.on('datepickerchange', function() {
            rootPageView.back();
        });

        return calendarPage;
    });
}
