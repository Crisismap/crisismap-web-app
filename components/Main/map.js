cm.define('gmxApplication', ['config', 'mapContainer', 'leafletProductionIssues'], function(cm, cb) {
    var config = cm.get('config');
    var mapContainer = cm.get('mapContainer');

    var cfg = $.extend(true, config, {
        app: {
            calendarWidget: !nsGmx.CrisisMap.isMobile()
        }
    });

    var gmxApplication = nsGmx.createGmxApplication(mapContainer, cfg);
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

cm.define('logoControl', ['gmxApplication', 'map'], function(cm) {
    return cm.get('gmxApplication').get('logoControl');
});

cm.define('gmxMap', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('gmxMap');
});

cm.define('calendarModel', ['gmxApplication'], function(cm) {
    return cm.get('gmxApplication').get('calendar');
});

cm.define('markerCursor', ['map'], function(cm) {
    var map = cm.get('map');

    var desktopMarker = new(L.Marker.extend({
        options: {
            icon: new L.DivIcon({
                iconSize: [10, 10],
                className: 'markerCursor'
            })
        }
    }))([0, 0], {
        zIndexOffset: 9999999
    });
    var mobileMarker = L.marker([0, 0], {
        zIndexOffset: 9999999
    });
    var marker = nsGmx.Utils.isMobile() ? mobileMarker : desktopMarker;

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
    };
});
