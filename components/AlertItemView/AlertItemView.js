nsGmx.AlertItemView = nsGmx.GmxWidget.extend({
    className: 'gmx-listNode alertItemView',
    events: {
        'click': function() {
            this._expanded ? this.collapse() : this.expand();
        }
    },
    initialize: function() {
        this.collapse();
    },
    render: function() {
        this.$el.empty();
        this.$el.append($('<div>').addClass('alertItemView-title').html(this.model.get('Title')));
        if (this._expanded) {
            this.$el.append($('<div>').addClass('alertItemView-description').html(this.model.get('Description')));
            this.$el.append($('<div>').addClass('alertItemView-marker icon-location').click(function(je) {
                je.originalEvent.stopPropagation();
                this.trigger('marker', this.model);
            }.bind(this)));
        }
        return this;
    },
    expand: function() {
        this.trigger('expanding');
        this.$el.addClass('alertItemView_expanded');
        this.$el.removeClass('alertItemView_collapsed');
        this._expanded = true;
        this.render();
        this.trigger('expanded');
        this.trigger('resize');
    },
    collapse: function() {
        this.trigger('collapsing');
        this.$el.removeClass('alertItemView_expanded');
        this.$el.addClass('alertItemView_collapsed');
        this._expanded = false;
        this.render();
        this.trigger('collapsed');
        this.trigger('resize');
    }
});
