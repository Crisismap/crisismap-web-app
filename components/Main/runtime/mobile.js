if (nsGmx.CrisisMap.isMobile()) {
    cm.define('sectionsMenu', ['mobileButtonsPane', 'sectionsManager', 'resetter'], function(cm) {
        var mobileButtonsPane = cm.get('mobileButtonsPane');
        var sectionsManager = cm.get('sectionsManager');
        var resetter = cm.get('resetter');

        var dropdownWidget = new nsGmx.IconDropdownWidget({
            sectionsManager: sectionsManager,
            showTopItem: false,
            trigger: 'click',
            direction: 'up'
        });

        mobileButtonsPane.addView(dropdownWidget);

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
    })
}
