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

    function unbindPopup(layer) {
        var styles = layer.getStyles();
        for (var i = 0; i < styles.length; i++) {
            styles[i].DisableBalloonOnClick = true;
        }
        layer.setStyles(styles);
    }

    cm.define('config', [], function(cm, cb) {
        $.ajax('resources/config.json').then(function(config) {
            $.ajax('local/config.json').then(function(localConfig) {
                cb($.extend(true, config, localConfig));
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

    cm.define('rootPageView', ['layoutManager'], function(cm) {
        var layoutManager = cm.get('layoutManager');

        var rootPageView = new nsGmx.PageView();
        rootPageView.appendTo(layoutManager.getContentContainer());

        return rootPageView;
    });

    cm.define('leafletProductionIssues', [], function(cm) {
        L.Icon.Default = L.Icon.Default.extend({
            options: {
                iconUrl: 'resources/marker-icon.png',
                iconSize: [25, 41],
                iconAnchor: [15, 37],
                popupAnchor: [0, -25],
                shadowUrl: 'resources/marker-icon.png',
                shadowSize: [0, 0],
                shadowAnchor: [0, 0]
            }
        });

        L.Icon.Default.imagePath = 'resources';

        L.Marker = L.Marker.extend({
            options: {
                icon: new L.Icon.Default()
            }
        });

        return null;
    });

    cm.define('gmxApplication', ['config', 'rootPageView', 'leafletProductionIssues'], function(cm, cb) {
        var config = cm.get('config');
        var rootPageView = cm.get('rootPageView');
        var mapPage = rootPageView.addPage('map');
        var mapContainer = $('<div>').addClass('crisisMap-mapContainer').appendTo(mapPage)[0];
        rootPageView.setActivePage('map');

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

    cm.define('newsLayersManager', ['config', 'layersTree'], function(cm) {
        var NLM = L.Class.extend({
            includes: [L.Mixin.Events],
            initialize: function(options) {
                L.setOptions(this, options);
            },
            getLayerIdByLayerName: function(name) {
                return this.options.newsLayers[name];
            },
            getLayerNameByLayerId: function() {
                for (name in this.options.newsLayers) {
                    if (this.options.layersTree.find(this.options.newsLayers[name]).get('visible')) {
                        return name
                    }
                }
            },
            setActiveLayerById: function(id) {
                this.options.layersTree.find(id).setNodeVisibility(true);
                this.fire('activelayerchange', {
                    name: this.getLayerNameByLayerId(id)
                });
            },
            setActiveLayerByName: function(name) {
                this.setActiveLayerById(this.getLayerIdByLayerName(name));
            },
            getActiveLayerId: function() {
                var activeLayerId;
                this.options.layersTree.eachNode(function(model) {
                    if (model.get('visible')) {
                        activeLayerId = model.get('properties').LayerID;
                    }
                });
                return activeLayerId;
            },
            getActiveLayerName: function() {
                return this.getLayerNameByLayerId(this.getActiveLayerId());
            },
            getLayersNames: function() {
                return _.keys(this.options.newsLayers);
            }
        });

        return new NLM({
            layersTree: cm.get('layersTree'),
            newsLayers: cm.get('config').user.newsLayers
        })
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

    cm.define('headerNavBar', ['layoutManager'], function(cm) {
        var layoutManager = cm.get('layoutManager');

        var HeaderNavBar = nsGmx.GmxWidget.extend({
            className: 'headerNavBar',
            initialize: function() {
                $('<div>').addClass('headerNavBar-menuContainer').appendTo(this.$el);
                $('<div>').addClass('headerNavBar-buttonContainer').appendTo(this.$el);
            },
            getMenuContainer: function() {
                return this.$el.find('.headerNavBar-menuContainer')[0];
            },
            getButtonContainer: function() {
                return this.$el.find('.headerNavBar-buttonContainer')[0];
            }
        });

        var headerNavBar = new HeaderNavBar();

        headerNavBar.appendTo(layoutManager.getHeaderContainer());

        return headerNavBar;
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

        headerLayoutButton.appendTo(headerNavBar.getButtonContainer());

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

    cm.define('headerLayersMenu', ['map', 'config', 'newsLayersManager', 'layersHash', 'headerNavBar'], function() {
        var map = cm.get('map');
        var config = cm.get('config');
        var layersHash = cm.get('layersHash');
        var headerNavBar = cm.get('headerNavBar');
        var newsLayersManager = cm.get('newsLayersManager');

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
            activeItem: newsLayersManager.getActiveLayerName()
        });

        radioGroupWidget.appendTo(headerNavBar.getMenuContainer());

        radioGroupWidget.on('select', function(id) {
            newsLayersManager.setActiveLayerByName(id);
            cm.get('markerLayersPopupsManager') && cm.get('markerLayersPopupsManager').reset();
            nsGmx.L.Map.fitBounds.call(map, layersHash[newsLayersManager.getActiveLayerId()].getBounds());
        });

        return radioGroupWidget;
    });

    cm.define('markerLayersPopupsManager', ['config', 'layersHash', 'infoControl', 'headerNavBar', 'newsLayersManager'], function(cm) {
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
                        this.show({
                            title: e.gmx.properties.Title,
                            description: e.gmx.properties.Description,
                            latLng: e.latlng
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
