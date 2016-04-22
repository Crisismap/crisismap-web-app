if (nsGmx.Utils.isMobile()) {
    cm.define('greyBaseLayer', ['baseLayersManager'], function(cm) {
        var baseLayersManager = cm.get('baseLayersManager');

        var tilesUrl = [
            'https://{s}.tiles.mapbox.com/v4/mapbox.light/{z}/{x}/{y}@2x.png',
            '?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpbTgzcHQxMzAxMHp0eWx4bWQ1ZHN2NGcifQ.WVwjmljKYqKciEZIC3NfLA'
        ].join('');

        baseLayersManager.add('mapboxgrey', {
            layers: [L.tileLayer(tilesUrl, {})]
        });

        baseLayersManager.setActiveIDs(['mapboxgrey']);
        baseLayersManager.setCurrentID('mapboxgrey');

        return null;
    });

    cm.define('sectionsMenu', ['fullscreenPagingPane', 'mobileButtonsPane', 'sectionsManager'], function(cm) {
        var fullscreenPagingPane = cm.get('fullscreenPagingPane');
        var mobileButtonsPane = cm.get('mobileButtonsPane');
        var sectionsManager = cm.get('sectionsManager');

        var SectionsButton = Backbone.View.extend({
            events: {
                'click': '_onClick'
            },

            // options.sectionsManager
            initialize: function(options) {
                this.options = _.extend({}, options);
                this.options.sectionsManager.on('sectionchange', this._updateIconClass, this);
                this._updateIconClass();
            },

            _updateIconClass: function() {
                var activeSectionId = this.options.sectionsManager.getActiveSectionId();
                this.$el[0].className = 'sectionsButton ' + this.options.sectionsManager.getSectionProperties(activeSectionId).icon;
            },

            _onClick: function() {
                this.trigger('click');
            }
        });

        var sectionsMenuWidget = new nsGmx.MobileSectionsMenuWidget({
            sectionsManager: sectionsManager
        });

        sectionsMenuWidget.on('sectionchange', function() {
            fullscreenPagingPane.hideView();
        });

        var button = new SectionsButton({
            sectionsManager: sectionsManager
        });
        var pane = fullscreenPagingPane.addView('sectionsMenuWidget', sectionsMenuWidget);

        button.on('click', function() {
            fullscreenPagingPane.showView('sectionsMenuWidget');
        });

        fullscreenPagingPane.on('showview', function(le) {
            if (le.id === 'sectionsMenuWidget') {
                sectionsMenuWidget.reset();
            }
        });

        // mainMenuWidget.on('marker', function() {
        //     fullscreenPagingPane.hideView();
        // });

        mobileButtonsPane.addView(button, 5);

        return null;
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

                alertsWidget.on('marker', function() {
                    fullscreenPagingPane.hideView();
                });

                mobileButtonsPane.addView(alertsButton, 60);
            }
        };
    });

    cm.define('mainMenu', ['fullscreenPagingPane', 'mobileButtonsPane'], function(cm) {
        var fullscreenPagingPane = cm.get('fullscreenPagingPane');
        var mobileButtonsPane = cm.get('mobileButtonsPane');

        var mainMenuWidget = new nsGmx.MainMenuWidget();

        var button = new(Backbone.View.extend({
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

        mobileButtonsPane.addView(button, 5);

        return null;
    });
}
