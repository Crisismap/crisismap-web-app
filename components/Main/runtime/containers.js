cm.define('topBarContainerControl', ['map', 'rootContainer'], function(cm) {
    var rootContainer = cm.get('rootContainer');
    var map = cm.get('map');

    $(rootContainer).addClass('crisisMap_withTopBar');

    var topBarContainerControl = new(L.Control.extend({
        options: {
            className: 'topBarContainerControl'
        },

        includes: [nsGmx.FullscreenControlMixin],
    }))();

    topBarContainerControl.addTo(map);

    return topBarContainerControl;
});

cm.define('headerNavBar', ['topBarContainerControl'], function(cm) {
    var topBarContainerControl = cm.get('topBarContainerControl');

    var HeaderNavBar = Backbone.View.extend({
        el: topBarContainerControl.getContainer(),

        className: 'headerNavBar',

        initialize: function() {
            $('<div>').addClass('headerNavBar-leftContainer').appendTo(this.$el);
            $('<div>').addClass('headerNavBar-centerContainer').appendTo(this.$el);
            $('<div>').addClass('headerNavBar-rightContainer').appendTo(this.$el);
        },

        getLeftContainer: function() {
            return this.$el.find('.headerNavBar-leftContainer')[0];
        },

        getCenterContainer: function() {
            return this.$el.find('.headerNavBar-centerContainer')[0];
        },

        getRightContainer: function() {
            return this.$el.find('.headerNavBar-rightContainer')[0];
        }
    });

    var headerNavBar = new HeaderNavBar();
    // topBarContainerControl.getContainer().appendChild(headerNavBar.el);

    return headerNavBar;
});
