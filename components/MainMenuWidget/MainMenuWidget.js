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
    initialize: function () {
        this.$el.html(_.template(nsGmx.Templates.MainMenuWidget.mainMenuWidget)({
            about: nsGmx.Translations.getText('mainMenuWidget.about'),
            language: nsGmx.Translations.getText('mainMenuWidget.language'),
            auth: nsGmx.Translations.getText('mainMenuWidget.auth')
        }));
        this.$el.find('.mainMenuWidget-languageSection-eng').on('click', function (je) {
            nsGmx.Translations.updateLanguageCookies('eng');
            window.location.reload(false);
        });
        this.$el.find('.mainMenuWidget-languageSection-rus').on('click', function (je) {
            nsGmx.Translations.updateLanguageCookies('rus');
            window.location.reload(false);
        });
    },

    reset: function () {

    }
});
