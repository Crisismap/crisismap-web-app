var nsGmx = nsGmx || {};

nsGmx.CalendarPage = nsGmx.GmxWidget.extend({
    className: 'calendarPage',
    template: _.template(nsGmx.Templates.CalendarPage.calendarPage),
    initialize: function() {
        this.render();
        this.model.on('datechange', this.update.bind(this));
    },
    render: function() {
        this.$el.html(this.template({}));
        this.$datepicker = this.$el.find('.calendarPage-datepickerInput');
        this.$datepicker.datepicker({
            onSelect: this._onDatepickerChange.bind(this),
            maxDate: this.model.getDateBegin()
        });
        this.update();
        return this;
    },
    update: function() {
        this.$datepicker.datepicker('setDate', this.model.getDateBegin());
    },
    _onDatepickerChange: function(dateStr, de) {
        var dateBegin = new Date(dateStr);
        var dateEnd = new Date(dateBegin.getTime() + 1000 * 60 * 60 * 24);
        this.model.setDateBegin(dateBegin);
        this.model.setDateEnd(dateEnd);
    }
});
