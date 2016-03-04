window.nsGmx = window.nsGmx || {};
// window.nsGmx.CompositeScrollView = nsGmx.GmxWidget.extend({});
window.nsGmx.CompositeScrollView = nsGmx.GmxWidget.extend({
    className: 'compositeScrollView',

    // options.staticWidget
    // options.scrollingWidget
    initialize: function (options) {
        this.options = _.extend({}, options);
        this.render();
    },

    render: function () {
        this.$el.empty();
        ['staticWidget', 'scrollingWidget'].map(function (widgetName) {
            var $container = $('<div>').addClass('compositeScrollView-' + widgetName + 'Container').appendTo(this.$el);
            this.options[widgetName].appendTo($container);
        }.bind(this));
        return this;
    }
});
