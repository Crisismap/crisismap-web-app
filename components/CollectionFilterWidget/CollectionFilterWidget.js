window.nsGmx = window.nsGmx || {};

window.nsGmx.CollectionFilterWidget = nsGmx.GmxWidget.extend({
    className: 'filterWidget',
    initialize: function() {
        this.render();
    },
    render: function() {
        this.$el.html('filterWidget');
    }
});
