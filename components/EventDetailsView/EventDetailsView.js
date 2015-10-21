var nsGmx = nsGmx || {};

nsGmx.EventDetailsView = nsGmx.GmxWidget.extend({
    template: _.template(nsGmx.Templates.EventDetailsView.eventDetailsView),
    options: {
        topIcon: '',
        bottomIcon: ''
    },
    initialize: function(options) {
        this.options = _.extend({
            topIconClass: (typeof this.model.get('class') == 'number') && ('eventDetailsView-topIcon_class' + this.model.get('class'))
        }, this.options, options);
        this.render();
    },
    render: function() {
        this.$el.html(this.template(_.extend(this.model.attributes, this.options)));
        this.$el.find('.eventDetailsView-bottomIconCell').on('click', function(je) {
            this.trigger('bottomiconclick');
        }.bind(this))
        return this;
    }
});