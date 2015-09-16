cm.define('widgetsManager', ['map'], function(cm) {
    var map = cm.get('map');

    var wm = new(L.Class.extend({
        includes: [L.Mixin.Events],
        initialize: function() {
            this._widgets = [];
            this._currentWidget = {};
        },
        add: function(widget) {
            if (!widget.cid || !widget.getContainer) {
                throw 'widget must be instance of nsGmx.GmxWidget';
            }
            this._widgets.push(widget);
            $(widget.getContainer()).on('click', function() {
                this._currentWidget = widget;
            }.bind(this));
        },
        reset: function() {
            this._widgets.map(function(widget) {
                if (widget.cid !== this._currentWidget.cid) {
                    widget.reset && widget.reset();
                }
            }.bind(this));
            this._currentWidget = {};
        }
    }));

    map.on('click', function() {
        wm.reset();
    });

    $('body').on('click', function() {
        wm.reset();
    });

    return wm;
});

cm.define('headerNavBar', ['layoutManager'], function(cm) {
    var layoutManager = cm.get('layoutManager');

    var HeaderNavBar = nsGmx.GmxWidget.extend({
        className: 'headerNavBar',
        initialize: function() {
            $('<div>').addClass('headerNavBar-leftContainer').appendTo(this.$el);
            $('<div>').addClass('headerNavBar-centerContainer').appendTo(this.$el);
            $('<div>').addClass('headerNavBar-rightContainer').appendTo(this.$el);
        },
        getLeftContainer: function() {
            return this.$el.find('.headerNavBar-leftContainer')[0];
        },
        getCenterContainer: function() {
            return this.$el.find('.headerNavBar-centerContainer')[0];
        },
        getRightContainer: function() {
            return this.$el.find('.headerNavBar-rightContainer')[0];
        }
    });

    var headerNavBar = new HeaderNavBar();

    headerNavBar.appendTo(layoutManager.getHeaderContainer());

    return headerNavBar;
});

cm.define('headerMainMenu', ['headerNavBar', 'map', 'widgetsManager'], function(cm) {
    var map = cm.get('map');
    var headerNavBar = cm.get('headerNavBar');
    var widgetsManager = cm.get('widgetsManager');

    var dropdownWidget = new nsGmx.DropdownWidget({
        titleClassName: 'icon-menu',
        trigger: nsGmx.Utils.isMobile() ? 'click' : 'hover'
    });

    dropdownWidget.addItem('login', new nsGmx.PlainTextWidget(
        nsGmx.Translations.getText('crisismap.login')
    ));
    dropdownWidget.addItem('help', new nsGmx.PlainTextWidget(
        nsGmx.Translations.getText('crisismap.help')
    ));
    dropdownWidget.addItem('caw', new nsGmx.PlainTextWidget(
        nsGmx.Translations.getText('crisismap.crisisalertweb')
    ));
    dropdownWidget.addItem('rate', new nsGmx.PlainTextWidget(
        nsGmx.Translations.getText('crisismap.rateapp')
    ));
    dropdownWidget.addItem('options', new nsGmx.PlainTextWidget(
        nsGmx.Translations.getText('crisismap.options')
    ));

    dropdownWidget.appendTo(headerNavBar.getLeftContainer());

    widgetsManager.add(dropdownWidget);

    return dropdownWidget;
});

cm.define('switchLanguageButton', ['headerMainMenu'], function(cm) {
    var headerMainMenu = cm.get('headerMainMenu');
    headerMainMenu.addItem('switchLanguage', new nsGmx.PlainTextWidget(
        nsGmx.Translations.getText('crisismap.switchLanguage')
    ));
    headerMainMenu.on('item:switchLanguage', function() {
        nsGmx.Translations.updateLanguageCookies(
            nsGmx.Translations.getLanguage() === 'rus' ? 'eng' : 'rus',
            '/'
        );
        window.location.reload(false);
    });
    return null;
});
