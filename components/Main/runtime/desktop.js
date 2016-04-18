if (!nsGmx.Utils.isMobile()) {
    cm.define('greyBaseLayer', ['baseLayersManager'], function (cm) {
        var baseLayersManager = cm.get('baseLayersManager');

        baseLayersManager.add('mapboxgrey', {
            layers: [L.tileLayer('https://{s}.tiles.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpbTgzcHQxMzAxMHp0eWx4bWQ1ZHN2NGcifQ.WVwjmljKYqKciEZIC3NfLA', {

            })]
        });

        baseLayersManager.setActiveIDs(['mapboxgrey']);
        baseLayersManager.setCurrentID('mapboxgrey');

        return null;
    });

    cm.define('topBarContainerControl', ['map', 'rootContainer'], function(cm) {
        var rootContainer = cm.get('rootContainer');
        var map = cm.get('map');

        $(rootContainer).addClass('crisisMap_withTopBar');

        var topBarContainerControl = new(L.Control.extend({
            options: {
                className: 'topBarContainerControl'
            },

            includes: [nsGmx.FullscreenControlMixin],
        }))();

        topBarContainerControl.addTo(map);

        return topBarContainerControl;
    });

    cm.define('helpDialog', ['config'], function(cm, cb) {
        var config = cm.get('config');
        var q = Handlebars.compile(config.user.helpDialogUrl)({
            lang: nsGmx.Translations.getLanguage()
        });
        $.ajax(q).then(function(resp) {
            cb(new nsGmx.ModalDialog({
                content: resp
            }))
        }).fail(function() {
            cb(new nsGmx.ModalDialog({
                content: 'unable to load ' + q
            }))
        });
    });

    cm.define('headerNavBar', ['topBarContainerControl'], function(cm) {
        var topBarContainerControl = cm.get('topBarContainerControl');

        var HeaderNavBar = Backbone.View.extend({
            el: topBarContainerControl.getContainer(),

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
        // topBarContainerControl.getContainer().appendChild(headerNavBar.el);

        return headerNavBar;
    });

    cm.define('sectionsMenu', ['map', 'config', 'resetter', 'layersHash', 'headerNavBar', 'sectionsManager'], function() {
        var sectionsManager = cm.get('sectionsManager');
        var headerNavBar = cm.get('headerNavBar');
        var layersHash = cm.get('layersHash');
        var resetter = cm.get('resetter');
        var config = cm.get('config');
        var map = cm.get('map');

        var items = sectionsManager.getSectionsIds().map(function(sectionId) {
            return {
                id: sectionId,
                title: sectionsManager.getSectionProperties(sectionId).title
            }
        });

        var radioGroupWidget = new nsGmx.RadioGroupWidget({
            items: items,
            activeItem: sectionsManager.getActiveSectionId()
        });

        radioGroupWidget.on('select', function(id) {
            sectionsManager.setActiveSectionId(id);
        });

        sectionsManager.on('sectionchange', function(sectionId) {
            radioGroupWidget.setActiveItem(sectionId);
        });

        radioGroupWidget.appendTo(headerNavBar.getCenterContainer());

        return radioGroupWidget;
    });

    cm.define('mainMenu', ['headerNavBar', 'resetter'], function(cm) {
        var headerNavBar = cm.get('headerNavBar');
        var resetter = cm.get('resetter');

        var containerEl = headerNavBar.getLeftContainer();

        var dropdownWidget = new nsGmx.DropdownWidget({
            titleClassName: 'icon-menu',
            trigger: 'click'
        });

        resetter.on('reset', function() {
            dropdownWidget.reset();
        });

        dropdownWidget.appendTo(headerNavBar.getLeftContainer());

        return dropdownWidget;
    });

    cm.define('loginMenuButton', ['mainMenu'], function(cm) {
        var mainMenu = cm.get('mainMenu');

        var item = new nsGmx.PlainTextWidget(nsGmx.Translations.getText('crisismap.login'));
        mainMenu.addItem('login', item, 10);

        return null;
    });

    cm.define('helpMenuButton', ['helpDialog', 'mainMenu'], function(cm) {
        var helpDialog = cm.get('helpDialog');
        var mainMenu = cm.get('mainMenu');

        var item = new nsGmx.PlainTextWidget(nsGmx.Translations.getText('crisismap.help'));
        item.on('click', function () {
            helpDialog.open();
        });
        mainMenu.addItem('help', item, 20);

        return null;
    });

    cm.define('cawMenuButton', ['mainMenu'], function(cm) {
        var mainMenu = cm.get('mainMenu');

        var AnchorWidget = nsGmx.GmxWidget.extend({
            className: 'anchorWidget',
            // options.href
            // options.title
            // options.target
            initialize: function(options) {
                this.options = options;
                this.render();
            },
            render: function() {
                $('<a>')
                    .html(this.options.title)
                    .attr('href', this.options.href)
                    .attr('target', this.options.target)
                    .appendTo(this.$el);
                return this;
            }
        });

        mainMenu.addItem('caw', new AnchorWidget({
            href: 'http://crisisalert.ru',
            title: nsGmx.Translations.getText('crisismap.crisisalertweb'),
            target: '_blank'
        }), 30);

        return null;
    });

    cm.define('rateMenuButton', ['mainMenu'], function(cm) {
        var mainMenu = cm.get('mainMenu');

        var item = new nsGmx.PlainTextWidget(nsGmx.Translations.getText('crisismap.rateapp'));
        mainMenu.addItem('rate', item, 40);

        return null;
    });

    cm.define('optionsMenuButton', ['mainMenu'], function(cm) {
        var mainMenu = cm.get('mainMenu');

        var item = new nsGmx.PlainTextWidget(nsGmx.Translations.getText('crisismap.options'));
        mainMenu.addItem('options', item, 50);

        return null;
    });

    cm.define('switchLanguageMenuButton', ['mainMenu'], function(cm) {
        var mainMenu = cm.get('mainMenu');

        var item = new nsGmx.PlainTextWidget(nsGmx.Translations.getText('crisismap.switchLanguage'));
        item.on('click', function() {
            window.localStorage['language'] = nsGmx.Translations.getLanguage() === 'rus' ? 'eng' : 'rus';
            window.location.reload(false);
        });
        mainMenu.addItem('switchLanguage', item, 60);

        return null;
    });

    cm.define('alertsWidgetContainer', ['sidebarWidget', 'alertsButton'], function(cm) {
        var sidebarWidget = cm.get('sidebarWidget');
        var alertsButton = cm.get('alertsButton');

        sidebarWidget.on('closed', function(e) {
            alertsButton.showLabel();
        });

        return {
            addView: function(alertsWidget) {
                var alertsWidgetContainer = sidebarWidget.addTab('alertsWidget', alertsButton);
                alertsWidget.appendTo(alertsWidgetContainer);

                sidebarWidget && sidebarWidget.on('opened', function(le) {
                    if (le.id === 'alertsWidget') {
                        alertsButton.hideLabel();
                        alertsWidget.reset();
                    }
                });
            }
        };
    });

    cm.define('layersTreeWidget', ['sectionsManager', 'sidebarWidget', 'layersTree'], function(cm) {
        var sectionsManager = cm.get('sectionsManager');
        var sidebarWidget = cm.get('sidebarWidget');
        var layersTree = cm.get('layersTree');

        var tabEl = sidebarWidget.addTab('layersTreeWidget', 'icon-layers');

        var pagingLayersTreeView = new nsGmx.PagingView();
        tabEl.appendChild(pagingLayersTreeView.el);

        sectionsManager.getSectionsIds().map(function(sectionId) {
            var model = layersTree.find(sectionId);

            if (!model) {
                return;
            }

            var layersTreeWidget = new nsGmx.LayersTreeWidget({
                model: model
            });

            pagingLayersTreeView.addView(sectionId, layersTreeWidget);
        });

        sectionsManager.on('sectionchange', onSectionChange);
        onSectionChange(sectionsManager.getActiveSectionId());

        return pagingLayersTreeView;

        function onSectionChange(sectionId) {
            if (!sectionId) {
                return;
            }
            pagingLayersTreeView.showView(sectionId);
        }
    });
}
