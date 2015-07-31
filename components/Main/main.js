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

    cm.define('layoutManager', [], function(cm) {
        var headerContainer = L.DomUtil.create('div', 'crisisMap-headerContainer');
        var contentContainer = L.DomUtil.create('div', 'crisisMap-contentContainer');

        [headerContainer, contentContainer].map(function(el) {
            document.body.appendChild(el);
        });

        return {
            getHeaderContainer: function() {
                return headerContainer;
            },
            getContentContainer: function() {
                return contentContainer;
            }
        }
    });

    cm.define('pageView', ['layoutManager'], function(cm) {
        var layoutManager = cm.get('layoutManager');

        var pageView = new nsGmx.PageView();
        pageView.appendTo(layoutManager.getContentContainer());

        return pageView;
    });

    cm.define('gmxApplication', ['config', 'pageView'], function(cm, cb) {
        var config = cm.get('config');
        var pageView = cm.get('pageView');
        var mapPage = pageView.addPage('map');
        var mapContainer = $('<div>').addClass('crisisMap-mapContainer').appendTo(mapPage)[0];

        var gmxApplication = nsGmx.createGmxApplication(mapContainer, config);
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

    cm.define('infoControl', ['map', 'mapLayoutHelper', 'markerCursor'], function() {
        var map = cm.get('map');
        var mlh = cm.get('mapLayoutHelper');
        var mc = cm.get('markerCursor');

        var infoControl = new nsGmx.InfoControl({
            position: 'center'
        });

        map.addControl(infoControl);

        return infoControl;
    });

    cm.define('headerNavBar', ['map', 'config', 'layersTree', 'layersHash', 'layoutManager'], function() {
        var map = cm.get('map');
        var config = cm.get('config');
        var layersTree = cm.get('layersTree');
        var layersHash = cm.get('layersHash');
        var layoutManager = cm.get('layoutManager');

        var activeId;
        for (stringId in config.user.newsLayersIds) {
            if (layersTree.find(config.user.newsLayersIds[stringId]).get('visible')) {
                activeId = stringId;
            }
        }

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
            activeItem: activeId
        });

        radioGroupWidget.appendTo(layoutManager.getHeaderContainer());

        radioGroupWidget.on('select', function(id) {
            layersTree.find(config.user.newsLayersIds[id]).setNodeVisibility(true);
            nsGmx.L.Map.fitBounds.call(map, layersHash[config.user.newsLayersIds[id]].getBounds());
        });

        return radioGroupWidget;
    });

    cm.define('markerLayersPopupsManager', ['config', 'layersHash', 'infoControl', 'headerNavBar'], function(cm) {
        var map = cm.get('map');
        var config = cm.get('config');
        var layersHash = cm.get('layersHash');
        var headerNavBar = cm.get('headerNavBar');

        var MLPM = L.Class.extend({
            initialize: function(options) {
                L.setOptions(this, options);
                this.options.layers.map(function(layer) {
                    layer.unbindPopup();
                    layer.on('click', function(e) {
                        var map = cm.get('map');
                        var mapLayoutHelper = cm.get('mapLayoutHelper');
                        this.options.mapLayoutHelper.hideBottomControls();
                        this.options.infoControl.show();
                        this.options.infoControl && this.options.infoControl.setTitle(e.gmx.properties.Title);
                        this.options.infoControl && this.options.infoControl.setContent(e.gmx.properties.Description);
                        map.setActiveArea({
                            bottom: getFullHeight(this.options.infoControl.getContainer()) + 'px'
                        });
                        map.setView(e.latlng, map.getZoom());
                        this.options.markerCursor.setLatLng(e.latlng);
                        this.options.markerCursor.show();
                    }.bind(this));
                }.bind(this));
            },
            reset: function() {
                this.options.infoControl.hide();
                this.options.mapLayoutHelper && this.options.mapLayoutHelper.showBottomControls();
                this.options.mapLayoutHelper.resetActiveArea();
                this.options.markerCursor.hide();
            }
        });

        var mlpm = new MLPM({
            layers: _.values(config.user.newsLayersIds).map(function(layerId) {
                return layersHash[layerId];
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

    cm.create().then(function() {
        console.log('ready');
        window.cfg = cm.get('config');
        window.map = cm.get('map');
        window.lh = cm.get('layersHash');
        window.lt = cm.get('layersTree');
        window.ld = cm.get('layersDebugger');
        window.cal = cm.get('calendar');
    });
}();