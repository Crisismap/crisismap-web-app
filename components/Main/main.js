+ function() {
    cm.define('config', [], function(cm, cb) {
        $.ajax('resources/config.json').then(function(config) {
            $.ajax('local/config.json').then(function(localConfig) {
                cb(L.extend(config, localConfig));
            }).fail(function() {
                cb(config);
            });
        }).fail(function() {
            console.error('Config: error loading config file');
            cb(false);
        });
    });

    cm.define('gmxApplication', ['config'], function(cm, cb) {
        var config = cm.get('config');
        var gmxApplication = nsGmx.createGmxApplication(document.getElementsByClassName('crisisAlert-map')[0], config);
        gmxApplication.create().then(function() {
            cb(gmxApplication);
        });
    });

    cm.define('map', ['gmxApplication'], function() {
        return cm.get('gmxApplication').get('map');
    });

    cm.define('mobileWidgetsContainer', ['map'], function() {
        var map = cm.get('map');

        var MWC = L.Control.extend({
            includes: [nsGmx.GmxWidgetMixin],
            onAdd: function(map) {
                this._container = L.DomUtil.create('div', 'mobileWidgetsContainer');
                this._topContainer = L.DomUtil.create('div', 'mobileWidgetsContainer-topContainer', this._container);
                this._terminateMouseEvents(this._topContainer);
                this._bottomContainer = L.DomUtil.create('div', 'mobileWidgetsContainer-bottomContainer', this._container);
                this._terminateMouseEvents(this._bottomContainer);
                var corners = map._controlCorners;
                ['topleft', 'topright', 'right', 'left'].map(function(it) {
                    if (corners[it]) {
                        L.DomUtil.addClass(corners[it], 'mobileWidgetsContainer_topShift');
                    }
                });
                return this._container;
            },
            getTopContainer: function() {
                return this._topContainer;
            },
            getBottomContainer: function() {
                return this._bottomContainer;
            }
        });

        var mwc = new MWC({
            position: 'center'
        });

        map.addControl(mwc);

        return mwc;
    });

    cm.define('headerNavBar', ['mobileWidgetsContainer'], function() {
        var headerContainer = cm.get('mobileWidgetsContainer').getTopContainer();

        var HeaderNavBar = nsGmx.GmxWidget.extend({
            className: 'headerNavBar'
        });

        var hnb = new HeaderNavBar();
        hnb.appendTo(headerContainer);

        return hnb;
    });

    cm.create();
}();