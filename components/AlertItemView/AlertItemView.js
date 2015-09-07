nsGmx.AlertItemView = nsGmx.GmxWidget.extend({
    className: 'gmx-listNode alertItemView',
    events: {
        'click': function() {
            this._expanded ? this.collapse() : this.expand();
        }
    },
    initialize: function() {
        this.render();
        this.collapse();
    },
    render: function() {
        this.$el.html(nsGmx.Templates.AlertItemView.alertItemView);
        if (this.model.get('class')) {
            this.$el.addClass('alertItemView_class' + this.model.get('class'));
        }
        this.$el.find('.alertItemView-title').html(this.model.get('Title'));
        this.$el.find('.alertItemView-description').html(this.model.get('Description'));
        this.$el.find('.alertItemView-locationIcon').click(function(je) {
            je.originalEvent.stopPropagation();
            this.trigger('marker', this.model);
        }.bind(this));
        return this;
    },
    expand: function() {
        this.trigger('expanding');
        this.$el.addClass('alertItemView_expanded');
        this.$el.removeClass('alertItemView_collapsed');
        this._expanded = true;
        this.trigger('expanded');
        this.trigger('resize');
    },
    collapse: function() {
        this.trigger('collapsing');
        this.$el.removeClass('alertItemView_expanded');
        this.$el.addClass('alertItemView_collapsed');
        this._expanded = false;
        this.trigger('collapsed');
        this.trigger('resize');
    }
});
