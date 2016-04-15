var nsGmx = nsGmx || {};

nsGmx.Translations.addText('rus', {
    'mainMenuWidget': {
        'about': 'О проекте',
        'language': 'Язык приложения',
        'auth': 'Авторизация'
    }
});

nsGmx.Translations.addText('eng', {
    'mainMenuWidget': {
        'about': 'About',
        'language': 'Language',
        'auth': 'Auth'
    }
});

nsGmx.MainMenuWidget = Backbone.View.extend({
    className: 'mainMenuWidget',

    initialize: function() {
        this.$el.html(_.template(nsGmx.Templates.MainMenuWidget.mainMenuWidget)({
            about: nsGmx.Translations.getText('mainMenuWidget.about'),
            language: nsGmx.Translations.getText('mainMenuWidget.language'),
            auth: nsGmx.Translations.getText('mainMenuWidget.auth')
        }));
        this.$el.find('.mainMenuWidget-languageSection-eng').on('click', function(je) {
            window.localStorage['language'] = 'eng';
            window.location.reload(false);
        });
        this.$el.find('.mainMenuWidget-languageSection-rus').on('click', function(je) {
            window.localStorage['language'] = 'rus';
            window.location.reload(false);
        });

        $.ajax('resources/helpDialog/helpDialog_' + nsGmx.Translations.getLanguage() + '.html').then(function(resp) {
            this.$('.mainMenuWidget-section_about .mainMenuWidget-sectionContent').html(resp);
        }.bind(this));
    },

    reset: function() {

    }
});
