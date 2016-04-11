var nsGmx = nsGmx || {};

nsGmx.Translations.addText('rus', {
    connectionErrorWidget: {
        connectionError: 'Отсутствует соединение с <strong>http://maps.kosmosnimki.ru</strong>. Проверьте подключение к Интернету и перезапустите приложение.'
    }
});

nsGmx.Translations.addText('eng', {
    connectionErrorWidget: {
        connectionError: 'Unable to reach <strong>http://maps.kosmosnimki.ru</strong>. Please check your connection and restart application.'
    }
});

nsGmx.ConnectionErrorWidget = Backbone.View.extend({
    className: 'connectionErrorWidget',

    initialize: function (options) {
        this.$el.append(
            $('<div>')
                .addClass('connectionErrorWidget-message')
                .html(nsGmx.Translations.getText('connectionErrorWidget.connectionError')))
    }
})
