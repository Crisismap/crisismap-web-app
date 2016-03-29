

// вернуть глобальную переменную underscore _
cm.define('gmxUtils', [], function() {
    return nsGmx.Utils.noConflicts();
});

// получить параметры из url
cm.define('urlManager', [], function(cm) {
    return {
        getParam: getQueryVariable
    };
});

// определение языка
cm.define('i18n', ['urlManager'], function(cm) {
    var urlManager = cm.get('urlManager');
    if (
        urlManager.getParam('lang') &&
        (
            urlManager.getParam('lang') === 'eng' ||
            urlManager.getParam('lang') === 'rus'
        )
    ) {
        nsGmx.Translations.setLanguage(urlManager.getParam('lang'));
    } else {
        nsGmx.Translations.setLanguage(nsGmx.Translations.getLanguageFromCookies('/'));
    }
    return nsGmx.Translations;
});



cm.define('layoutManager', [], function(cm) {
    var rootContainer = document.body;
    L.DomUtil.addClass(rootContainer, 'crisisMap');
    L.DomUtil.addClass(rootContainer, nsGmx.CrisisMap.isMobile() ?
        'crisisMap_mobile' :
        'crisisMap_desktop'
    );
    var headerContainer = L.DomUtil.create('div', 'crisisMap-headerContainer', rootContainer);
    var contentContainer = L.DomUtil.create('div', 'crisisMap-contentContainer', rootContainer);

    return {
        getHeaderContainer: function() {
            return headerContainer;
        },
        getContentContainer: function() {
            return contentContainer;
        }
    }
});
