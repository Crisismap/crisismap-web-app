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

    cm.define('map', ['gmxApplication'], function(cm) {
        return cm.get('gmxApplication').get('map');
    });

    cm.define('gmxMap', ['gmxApplication'], function(cm) {
        return cm.get('gmxApplication').get('gmxMap');
    });

    cm.define('layersHash', ['gmxMap'], function(cm) {
        return cm.get('gmxMap').getLayersHash();
    });

    cm.define('calendar', ['gmxApplication'], function(cm) {
        return cm.get('gmxApplication').get('calendar');
    });

    cm.define('layersTree', ['gmxApplication'], function(cm) {
        return cm.get('gmxApplication').get('layersTree');
    });

    // Позволяет просматривать дерево слоёв через консоль.
    // Удобно для приложений, в которых отсутствует виджет дерева слоёв.
    cm.define('layersDebugger', ['layersTree'], function(cm) {
        var layersTree = cm.get('layersTree');
        return new nsGmx.LayersDebugger(layersTree);
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
                this.hideBottomContainer();
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
            },
            hideBottomContainer: function() {
                L.DomUtil.addClass(this._container, 'mobileWidgetsContainer_bottomContainerHidden');
            },
            showBottomContainer: function() {
                L.DomUtil.removeClass(this._container, 'mobileWidgetsContainer_bottomContainerHidden');
            }
        });

        var mwc = new MWC({
            position: 'center'
        });

        map.addControl(mwc);

        map.on('click', function() {
            mwc.hideBottomContainer();
        });

        return mwc;
    });

    cm.define('headerNavBar', ['mobileWidgetsContainer'], function() {
        var headerContainer = cm.get('mobileWidgetsContainer').getTopContainer();

        var dropdownMenuWidget = new nsGmx.DropdownMenuWidget({
            items: [{
                title: 'Пожары',
                id: 'btn-refresh'
            }, {
                title: 'Экология',
                id: 'btn-save'
            }, {
                title: 'Наводнения',
                id: 'btn-wizard',
                className: 'dropdownMenuWidget-last'
            }]
        });
        dropdownMenuWidget.appendTo(headerContainer);

        return dropdownMenuWidget;
    });

    cm.define('infoWidget', ['mobileWidgetsContainer'], function(cm) {
        var mobileWidgetsContainer = cm.get('mobileWidgetsContainer');
        var infoWidget = new nsGmx.InfoWidget();
        infoWidget.appendTo(mobileWidgetsContainer.getBottomContainer());
        return infoWidget;
    });

    cm.define('markerLayersPopups', ['config', 'layersHash'], function(cm) {
        var config = cm.get('config');
        var layersHash = cm.get('layersHash');
        [config.user.firesLayerId, config.user.floodsLayerId, config.user.ecologyLayerId].map(function(layerId) {
            return layersHash[layerId];
        }).map(function(layer) {
            layer.unbindPopup();
            layer.on('click', function(data) {
                var infoWidget = cm.get('infoWidget');
                var mobileWidgetsContainer = cm.get('mobileWidgetsContainer');
                mobileWidgetsContainer && mobileWidgetsContainer.showBottomContainer();
                infoWidget && infoWidget.setTitle(data.gmx.properties.Title);
                infoWidget && infoWidget.setContent(data.gmx.properties.Description);
            });
        });
    });

    cm.create().then(function() {
        console.log('ready');
        window.map = cm.get('map');
        window.lh = cm.get('layersHash');
        window.lt = cm.get('layersTree');
        window.ld = cm.get('layersDebugger');
        window.cal = cm.get('calendar');
    });
}();