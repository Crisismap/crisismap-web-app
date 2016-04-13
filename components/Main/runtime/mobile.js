if (nsGmx.Utils.isMobile()) {
    cm.define('geolocationControl', ['locationMarkerManager', 'locationModel', 'map'], function (cm) {
        var locationMarkerManager = cm.get('locationMarkerManager');
        var locationModel = cm.get('locationModel');
        var map = cm.get('map');

        var geolocationControl = new nsGmx.GeolocationControl({
            locationModel: locationModel,
            position: 'bottomright'
        });

        geolocationControl.on('click', function () {
            locationMarkerManager.showMarker();
        });

        map.addControl(geolocationControl);

        return null;
    });

    cm.define('sectionsMenu', ['mobileButtonsPane', 'sectionsManager', 'resetter'], function(cm) {
        var mobileButtonsPane = cm.get('mobileButtonsPane');
        var sectionsManager = cm.get('sectionsManager');
        var resetter = cm.get('resetter');

        var dropdownWidget = new nsGmx.IconDropdownWidget({
            sectionsManager: sectionsManager,
            showTopItem: false,
            trigger: 'click',
            direction: 'up',
            align: 'center'
        });

        mobileButtonsPane.addView(dropdownWidget, 15);

        resetter.on('reset', function() {
            dropdownWidget.reset();
        });

        return dropdownWidget;
    });

    cm.define('alertsWidgetContainer', ['fullscreenPagingPane', 'mobileButtonsPane', 'alertsButton'], function(cm) {
        var fullscreenPagingPane = cm.get('fullscreenPagingPane');
        var mobileButtonsPane = cm.get('mobileButtonsPane');
        var alertsButton = cm.get('alertsButton');

        return {
            addView: function(alertsWidget) {
                var pane = fullscreenPagingPane.addView('alertsWidget', alertsWidget);

                alertsButton.$el.on('click', function() {
                    fullscreenPagingPane.showView('alertsWidget');
                });

                fullscreenPagingPane.on('showview', function(le) {
                    if (le.id === 'alertsWidget') {
                        alertsWidget.reset();
                    }
                });

                alertsWidget.on('marker', function () {
                    fullscreenPagingPane.hideView();
                });

                mobileButtonsPane.addView(alertsButton, 60);
            }
        };
    });

    cm.define('mainMenu', ['fullscreenPagingPane', 'mobileButtonsPane'], function (cm) {
        var fullscreenPagingPane = cm.get('fullscreenPagingPane');
        var mobileButtonsPane = cm.get('mobileButtonsPane');

        var mainMenuWidget = new nsGmx.MainMenuWidget();

        var button = new (Backbone.View.extend({
            el: $('<div>').addClass('icon-menu')
        }));
        var pane = fullscreenPagingPane.addView('mainMenuWidget', mainMenuWidget);

        button.$el.on('click', function() {
            fullscreenPagingPane.showView('mainMenuWidget');
        });

        fullscreenPagingPane.on('showview', function(le) {
            if (le.id === 'mainMenuWidget') {
                mainMenuWidget.reset();
            }
        });

        mainMenuWidget.on('marker', function () {
            fullscreenPagingPane.hideView();
        });

        mobileButtonsPane.addView(button, 5);

        return null;
    });
}
