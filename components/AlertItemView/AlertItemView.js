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
        function pz(n) {
            var s = n + '';
            if (s.length === 1) {
                return '0' + s;
            }
            return s;
        }

        this.$el.html(nsGmx.Templates.AlertItemView.alertItemView);
        if (this.model.get('class')) {
            this.$el.addClass('alertItemView_class' + this.model.get('class'));
        }

        var dt = this.model.get('date');
        var dateStr = pz(dt.getDate()) + '.' +
            pz(dt.getMonth() + 1) + '.' +
            pz(dt.getFullYear()) + ' ' +
            pz(dt.getHours()) + ':' +
            pz(dt.getMinutes());

        this.$el.find('.alertItemView-date').html(dateStr);
        this.$el.find('.alertItemView-title').html(this.model.get('title'));
        this.$el.find('.alertItemView-description').html(this.model.get('description'));
        this.$el.find('.alertItemView-sourceLink').attr('href', this.model.get('url'));
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
