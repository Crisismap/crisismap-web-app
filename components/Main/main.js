+ function() {
    function getFullHeight(el) {
        var $el = $(el);

        function r(str) {
            return str.replace('px', '') / 1;
        }

        return $el.height() +
            r($el.css('padding-top')) +
            r($el.css('padding-bottom')) +
            r($el.css('margin-top')) +
            r($el.css('margin-bottom'))
    }

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

    cm.define('mapLayoutHelper', ['map'], function(cm) {
        var map = cm.get('map');

        function resetActiveArea() {
            map.setActiveArea({
                position: 'absolute',
                border: '1 px solid red',
                left: '0',
                top: '40px',
                bottom: '0',
                right: '0'
            });
        }

        function getBottomControls() {
            var bottomControls = [];
            cm.get('bottomControl') && bottomControls.push(cm.get('bottomControl'));
            cm.get('copyrightControl') && bottomControls.push(cm.get('copyrightControl'));
            cm.get('logoControl') && bottomControls.push(cm.get('logoControl'));
            return bottomControls;
        }

        resetActiveArea();

        return {
            hideBottomControls: function() {
                getBottomControls().map(function(ctrl) {
                    L.DomUtil.addClass(ctrl.getContainer(), 'leaflet-control-gmx-hidden');
                });
            },
            showBottomControls: function() {
                getBottomControls().map(function(ctrl) {
                    L.DomUtil.removeClass(ctrl.getContainer(), 'leaflet-control-gmx-hidden');
                });
            },
            resetActiveArea: resetActiveArea
        }
    });

    cm.define('bottomControl', ['gmxApplication'], function(cm) {
        return cm.get('gmxApplication').get('bottomControl');
    });

    cm.define('copyrightControl', ['gmxApplication'], function(cm) {
        return cm.get('gmxApplication').get('copyrightControl');
    });

    cm.define('logoControl', ['gmxApplication'], function(cm) {
        return cm.get('gmxApplication').get('logoControl');
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

    cm.define('mobileWidgetsContainer', ['map', 'mapLayoutHelper', 'markerCursor'], function() {
        var map = cm.get('map');
        var mlh = cm.get('mapLayoutHelper');
        var mc = cm.get('markerCursor');

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
            var mapLayoutHelper = cm.get('mapLayoutHelper');
            mwc.hideBottomContainer();
            mapLayoutHelper && mapLayoutHelper.showBottomControls();
            mlh.resetActiveArea();
            mc.hide();
        });

        return mwc;
    });

    cm.define('headerNavBar', ['mobileWidgetsContainer', 'map', 'layersHash', 'config', 'layersTree'], function() {
        var map = cm.get('map');
        var config = cm.get('config');
        var layersHash = cm.get('layersHash');
        var layersTree = cm.get('layersTree');
        var headerContainer = cm.get('mobileWidgetsContainer').getTopContainer();

        var layersMap = {
            'fires': config.user.firesLayerId,
            'floods': config.user.floodsLayerId,
            'ecology': config.user.ecologyLayerId
        };

        function hasValue(hash, value) {
            for (key in hash) {
                if (hash[key] === value) {
                    return true;
                }
            }
            return false;
        }

        layersTree.eachNode(function(model) {
            if (hasValue(layersMap, model.get('properties').LayerID)) {
                map.removeLayer(layersHash[model.get('properties').LayerID]);
            }
        });

        var radioGroupWidget = new nsGmx.RadioGroupWidget({
            items: [{
                title: 'Пожары',
                id: 'fires'
            }, {
                title: 'Экология',
                id: 'ecology'
            }, {
                title: 'Наводнения',
                id: 'floods'
            }],
            activeItem: config.user.activeHeaderTab
        });

        radioGroupWidget.appendTo(headerContainer);

        var currentId;
        radioGroupWidget.on('select', function(id) {
            currentId && map.removeLayer(layersHash[layersMap[currentId]]);
            map.addLayer(layersHash[layersMap[id]]);
            //map.fitBounds(layersHash[layersMap[id]]);
            currentId = id;
        });

        return radioGroupWidget;
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
        var mc = cm.get('markerCursor');

        return [config.user.firesLayerId, config.user.floodsLayerId, config.user.ecologyLayerId].map(function(layerId) {
            return layersHash[layerId];
        }).map(function(layer) {
            layer.unbindPopup();
            layer.on('click', function(e) {
                var map = cm.get('map');
                var mapLayoutHelper = cm.get('mapLayoutHelper');
                var infoWidget = cm.get('infoWidget');
                var mobileWidgetsContainer = cm.get('mobileWidgetsContainer');
                mapLayoutHelper.hideBottomControls();
                mobileWidgetsContainer && mobileWidgetsContainer.showBottomContainer();
                infoWidget && infoWidget.setTitle(e.gmx.properties.Title);
                infoWidget && infoWidget.setContent(e.gmx.properties.Description);
                map.setActiveArea({
                    bottom: getFullHeight(mobileWidgetsContainer.getBottomContainer()) + 'px'
                });
                map.setView(e.latlng, map.getZoom());
                mc.setLatLng(e.latlng);
                mc.show();
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