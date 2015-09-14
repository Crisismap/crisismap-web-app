nsGmx.PageView = nsGmx.GmxWidget.extend({
    className: 'pageView',
    initialize: function() {},
    // returns DOMNode
    addPage: function(id) {
        return $('<div>').addClass('pageView-item').attr('data-id', id).appendTo(this.$el)[0];
    },
    setActivePage: function(id) {
        this._previousPageId = this._currentPageId;
        this._currentPageId = id;
        this.$el.children('.pageView-item').each(function(index, el) {
            var $el = $(el);
            $el.toggleClass('pageView-item_active', $el.attr('data-id') === id);
        }.bind(this));
    },
    back: function () {
        this.setActivePage(this._previousPageId);
    }
});
