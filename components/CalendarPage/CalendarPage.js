var nsGmx = nsGmx || {};

nsGmx.CalendarPage = nsGmx.GmxWidget.extend({
    className: 'calendarPage',
    template: _.template(nsGmx.Templates.CalendarPage.calendarPage),
    initialize: function() {
        this.model.on('datechange', function(dateBegin, dateEnd) {
            this.update();
        }.bind(this));
        this.render();
    },
    render: function() {
        this.$el.html(this.template({}));
        this.$el.find('.calendarPage-datepicker_day')
            .on('change', this._onDatepickerChange.bind(this));
        this.update();
        return this;
    },
    update: function() {
        this.$el.find('.calendarPage-datepicker_day').attr(
            'value',
            nsGmx.CrisisMap.formatDate(this.model.getDateEnd(), 'YYYY-MM-DD')
        );
    },
    _onDatepickerChange: function(je) {
        var dateBegin = new Date(je.currentTarget.value);
        var dateEnd = new Date(dateBegin.getTime() + 1000 * 60 * 60 * 24);
        this.model.setDateBegin(dateBegin);
        this.model.setDateEnd(dateEnd);
    }
});
