window.nsGmx = window.nsGmx || {};

window.nsGmx.ModalDialog = Backbone.View.extend({
    className: 'modalDialog modalDialog-curtain',
    options: {
        content: '<h1>modal dialog</h1>'
    },
    events: {
        'click' : '_onCurtainClick',
        'click .modalDialog-windowCloseButton': 'close'
    },
    // <String|DOMElement> options.content
    // <DOMElement> options.dialogsContainer || document.body
    initialize: function(options) {
        this.options = _.extend({}, this.options, {
            dialogsContainer: document.body // declare it here because document may be not ready
        }, options);
        this.render();
    },
    render: function() {
        var $window = $('<div>').addClass('modalDialog-window')
            .appendTo(this.$el);
        var $windowCloseButton = $('<div>').addClass('modalDialog-windowCloseButton icon-cancel')
            .appendTo($window);
        var $windowBody = $('<div>').addClass('modalDialog-windowBody')
            .html(this.options.content)
            .appendTo($window);
    },
    open: function() {
        this.delegateEvents();
        $(this.options.dialogsContainer).append(this.$el);
    },
    close: function() {
        this.undelegateEvents();
        this.$el.remove();
    },
    _onCurtainClick: function (je) {
        if (je.target === this.el) {
            this.close();
        }
    }
})
