var nsGmx = nsGmx || {};

nsGmx.InfoWidget = nsGmx.GmxWidget.extend({
    className: 'infoWidget',
    initialize: function() {
        this.render();
    },
    render: function() {
        this.$el.html(nsGmx.Templates.InfoWidget.infoWidget);
        this.$titleContainer = this.$el.find('.infoWidget-titleContainer');
        this.$contentContainer = this.$el.find('.infoWidget-contentContainer');
        this.clean();
        return this;
    },
    clean: function() {
        this.$titleContainer.empty();
        this.$contentContainer.empty();
    },
    setTitle: function(str) {
        this.$titleContainer.html(str)
    },
    setContent: function(str) {
        this.$contentContainer.html(str);
    }
});