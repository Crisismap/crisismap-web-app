// if (nsGmx.Utils.isMobile()) {
//     cm.define('greyBaseLayer', ['baseLayersManager'], function (cm) {
//         var baseLayersManager = cm.get('baseLayersManager');
//
//         baseLayersManager.add('mapboxgrey', {
//             layers: [L.tileLayer('https://{s}.tiles.mapbox.com/v4/mapbox.light/{z}/{x}/{y}@2x.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpbTgzcHQxMzAxMHp0eWx4bWQ1ZHN2NGcifQ.WVwjmljKYqKciEZIC3NfLA', {
//
//             })]
//         });
//
//         baseLayersManager.setActiveIDs(['mapboxgrey']);
//         baseLayersManager.setCurrentID('mapboxgrey');
//
//         return null;
//     });
//
//     cm.define('sectionsMenu', ['mobileButtonsPane', 'sectionsManager', 'resetter'], function(cm) {
//         var mobileButtonsPane = cm.get('mobileButtonsPane');
//         var sectionsManager = cm.get('sectionsManager');
//         var resetter = cm.get('resetter');
//
//         var dropdownWidget = new nsGmx.IconDropdownWidget({
//             sectionsManager: sectionsManager,
//             showTopItem: false,
//             trigger: 'click',
//             direction: 'up',
//             align: 'center'
//         });
//
//         mobileButtonsPane.addView(dropdownWidget, 15);
//
//         resetter.on('reset', function() {
//             dropdownWidget.reset();
//         });
//
//         return dropdownWidget;
//     });
//
//     cm.define('alertsWidgetContainer', ['fullscreenPagingPane', 'mobileButtonsPane', 'alertsButton'], function(cm) {
//         var fullscreenPagingPane = cm.get('fullscreenPagingPane');
//         var mobileButtonsPane = cm.get('mobileButtonsPane');
//         var alertsButton = cm.get('alertsButton');
//
//         return {
//             addView: function(alertsWidget) {
//                 var pane = fullscreenPagingPane.addView('alertsWidget', alertsWidget);
//
//                 alertsButton.$el.on('click', function() {
//                     fullscreenPagingPane.showView('alertsWidget');
//                 });
//
//                 fullscreenPagingPane.on('showview', function(le) {
//                     if (le.id === 'alertsWidget') {
//                         alertsWidget.reset();
//                     }
//                 });
//
//                 alertsWidget.on('marker', function () {
//                     fullscreenPagingPane.hideView();
//                 });
//
//                 mobileButtonsPane.addView(alertsButton, 60);
//             }
//         };
//     });
//
//     cm.define('mainMenu', ['fullscreenPagingPane', 'mobileButtonsPane'], function (cm) {
//         var fullscreenPagingPane = cm.get('fullscreenPagingPane');
//         var mobileButtonsPane = cm.get('mobileButtonsPane');
//
//         var mainMenuWidget = new nsGmx.MainMenuWidget();
//
//         var button = new (Backbone.View.extend({
//             el: $('<div>').addClass('icon-menu')
//         }));
//         var pane = fullscreenPagingPane.addView('mainMenuWidget', mainMenuWidget);
//
//         button.$el.on('click', function() {
//             fullscreenPagingPane.showView('mainMenuWidget');
//         });
//
//         fullscreenPagingPane.on('showview', function(le) {
//             if (le.id === 'mainMenuWidget') {
//                 mainMenuWidget.reset();
//             }
//         });
//
//         mainMenuWidget.on('marker', function () {
//             fullscreenPagingPane.hideView();
//         });
//
//         mobileButtonsPane.addView(button, 5);
//
//         return null;
//     });
// }
