var nsGmx = nsGmx || {};

var IconTextWidget = Backbone.View.extend({
    className: 'iconTextWidget',

    // options.icon
    // options.text
    initialize: function(options) {
        this.$el.append($('<div>')
            .addClass('iconTextWidget-icon')
            .addClass(options.icon));

        this.$el.append($('<div>')
            .addClass('iconTextWidget-text')
            .html(options.text));
    }
});

function createIcon(icon) {
    return '<div class=\"icon-' + icon + '\">';
}

nsGmx.IconDropdownWidget = nsGmx.DropdownWidget.extend({
    // options.sectionsManager
    initialize: function(options) {
        var sectionsManager = options.sectionsManager;
        nsGmx.DropdownWidget.prototype.initialize.call(this, _.extend(options, {
            title: createIcon(sectionsManager.getSectionProperties(sectionsManager.getActiveSectionId()).icon)
        }));

        this.on('item', function(id) {
            sectionsManager.setActiveSectionId(id);
        }.bind(this));

        sectionsManager.on('sectionchange', function (sectionId) {
            this.setTitle(createIcon(sectionsManager.getSectionProperties(sectionId).icon));
        }.bind(this));

        var sectionsIds = sectionsManager.getSectionsIds();
        for (var i = 0; i < sectionsIds.length; i++) {
            this.addItem(sectionsIds[i], new IconTextWidget({
                icon: sectionsManager.getSectionProperties(sectionsIds[i]).icon,
                text: sectionsManager.getSectionProperties(sectionsIds[i]).title
            }));
        }

        if (options.align && options.align === 'center') {
            // HACK: align menu center
            this.on('expand', function() {
                var $dropdown = this.$el.find('.dropdownWidget-dropdown');
                var initialWidth = this.$el.outerWidth();
                var dropdownWidth = $dropdown.outerWidth();
                $dropdown.css('left', Math.round(initialWidth / 2 - dropdownWidth / 2) + 'px');
            }.bind(this));
        }
    }
})
