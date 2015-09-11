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
        if (this._expanded) {
            this.$el.empty();
            var detailsView = new nsGmx.EventDetailsView({
                model: this.model,
                topIcon: this.model.get('class') && ('class' + this.model.get('class')),
                bottomIcon: 'location'
            });
            detailsView.on('bottomiconclick', function () {
                this.trigger('marker', this.model);
            }.bind(this));
            detailsView.appendTo(this.$el);
        } else {
            this.$el.html(
                _.template(nsGmx.Templates.AlertItemView.collapsed)(
                    this.model.attributes
                )
            );
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
