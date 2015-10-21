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
        var cls = this.model.get('class') + '' || '3';
        if (this._expanded) {
            this.$el.html(
                _.template(nsGmx.Templates.AlertItemView.expanded)({
                    cls: cls,
                    title: this.model.get('title'),
                    description: this.model.get('description'),
                    date: this.model.get('date'),
                    url: this.model.get('url')
                })
            );
            this.$el.find('.alertItemView-expanded-bottomIcon').on('click', function(je) {
                je.stopPropagation();
                this.trigger('marker', this.model);
            }.bind(this));
        } else {
            this.$el.html(
                _.template(nsGmx.Templates.AlertItemView.collapsed)({
                    cls: cls,
                    date: this.model.get('date'),
                    title: this.model.get('title')
                })
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
