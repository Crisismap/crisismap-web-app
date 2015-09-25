// options.items[{id, title}, ...]
// options.activeItem
nsGmx.RadioGroupWidget = nsGmx.GmxWidget.extend({
    className: 'ui-widget radioGroupWidget',
    setActiveItem: function(id) {
        this._activeItemId = id;
        this.render();
        this.trigger('select', this._activeItemId);
    },
    events: {
        'click .radioGroupWidget-item': function(je) {
            $el = $(je.currentTarget);
            this.setActiveItem($el.attr('data-id'));
        }
    },
    initialize: function(options) {
        this.items = options.items;
        this.render();
        setTimeout(function() {
            options.activeItem && this.setActiveItem(options.activeItem);
        }.bind(this), 1);
    },
    render: function() {
        this.$el.empty();
        this.items.map(function(item) {
            var $el = $('<div>')
                .addClass('radioGroupWidget-item')
                .attr('data-id', item.id)
                .html(item.title);

            if (this._activeItemId && this._activeItemId === item.id) {
                $el.addClass('radioGroupWidget-item_active');
            }

            $el.appendTo(this.$el);
        }.bind(this));
        return this;
    }
});
