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

    cm.define('alertsWidgetMarkerHandler', ['sidebarWidget', 'rootPageView', 'alertsWidget', 'config'], function() {
        var sidebarWidget = cm.get('sidebarWidget');
        var rootPageView = cm.get('rootPageView');
        var alertsWidget = cm.get('alertsWidget');
        var config = cm.get('config');
        var map = cm.get('map');

        alertsWidget.on('marker', function(model) {
            rootPageView.setActivePage('map');
            sidebarWidget.close();
            map.setView(model.get('latLng'), config.user.markerZoom);
        });

        return null;
    });

    cm.define('headerLayersMenu', ['map', 'config', 'sectionsManager', 'layersHash', 'headerNavBar', 'resetter'], function() {
        var map = cm.get('map');
        var config = cm.get('config');
        var layersHash = cm.get('layersHash');
        var headerNavBar = cm.get('headerNavBar');
        var sectionsManager = cm.get('sectionsManager');
        var resetter = cm.get('resetter');

        var dropdownWidget = new nsGmx.DropdownWidget({
            title: sectionsManager.getSectionProperties(sectionsManager.getActiveSectionId()).title,
            showTopItem: false,
            trigger: 'click'
        });

        dropdownWidget.on('item', function(id) {
            sectionsManager.setActiveSectionId(id);
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

        resetter.on('reset', function() {
            dropdownWidget.reset();
        });

        return dropdownWidget;
    });

    cm.define('headerLayoutButton', [
        'activeAlertsNumber',
        'headerNavBar',
        'rootPageView',
        'alertsWidget',
        'map'
    ], function(cm) {
        var map = cm.get('map');
        var alertsWidget = cm.get('alertsWidget');
        var rootPageView = cm.get('rootPageView');
        var headerNavBar = cm.get('headerNavBar');

        var activeAlertsNumber = cm.get('activeAlertsNumber');

        var HeaderLayoutButton = nsGmx.LabelIconWidget.extend({
            initialize: function() {
                nsGmx.LabelIconWidget.prototype.initialize.apply(this);
                this.setState('map');
                this.$el.on('click', function() {
                    this.toggleState();
                }.bind(this));
            },
            toggleState: function() {
                this.setState(this._state === 'map' ? 'alerts' : 'map');
            },
            setState: function(state, silent) {
                this._state = state;
                this.setIconClass(state === 'map' ? 'icon-bell' : 'icon-globe');
                this._updateLabel();
                if (!silent) {
                    this.trigger('stateswitch', this.getState());
                }
            },
            getState: function() {
                return this._state;
            },
            setAlertsNumber: function(n) {
                this._currentNumber = n ? n + '' : null;
                this._updateLabel();
            },
            _updateLabel: function() {
                if (this._state === 'alerts') {
                    this.setLabel(null);
                } else {
                    this.setLabel(this._currentNumber);
                }
            }
        });

        var headerLayoutButton = new HeaderLayoutButton();

        headerLayoutButton.setAlertsNumber(activeAlertsNumber.getAlertsNumber());
        activeAlertsNumber.on('change', function(num) {
            headerLayoutButton.setAlertsNumber(num);
        });

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

        rootPageView.on('switch', function(id) {
            headerLayoutButton.setState(id, true);
        })

        return headerLayoutButton;
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