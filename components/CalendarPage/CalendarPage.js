var nsGmx = nsGmx || {};

nsGmx.CalendarPage = nsGmx.GmxWidget.extend({
    className: 'calendarPage',
    template: _.template(nsGmx.Templates.CalendarPage.calendarPage),
    initialize: function() {
        this.render();
        this.model.on('change', this.update.bind(this));
    },
    render: function() {
        this.$el.html(this.template({}));
        this.$datepicker = this.$el.find('.calendarPage-datepickerInput');
        this.$datepicker.datepicker({
            onSelect: this._onDatepickerChange.bind(this),
            maxDate: this.model.get('dateBegin')
        });
        this.update();
        return this;
    },
    update: function() {
        this.$datepicker.datepicker('setDate', this.model.get('dateBegin'));
    },
    _onDatepickerChange: function(dateStr, de) {
        this.model.set({
            dateBegin: new Date(dateStr),
            dateEnd: new Date((new Date(dateStr)).getTime() + 1000 * 60 * 60 * 24)
        });
        this.trigger('datepickerchange');
    }
});
