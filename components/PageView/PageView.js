nsGmx.PageView = nsGmx.GmxWidget.extend({
    className: 'pageView',
    initialize: function() {
    },
    // returns DOMNode
    addPage: function(id) {
        return $('<div>').addClass('pageView-item').attr('data-id', id).appendTo(this.$el)[0];
    },
    switchPage: function(id) {
        $el.find('.pageView-item').each(function() {
            console.log(arguments);
        });
    }
});