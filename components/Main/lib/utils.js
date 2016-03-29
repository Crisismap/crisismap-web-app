var nsGmx = window.nsGmx || {};
nsGmx.CrisisMap = nsGmx.CrisisMap || {};

function getFullHeight(el) {
    var $el = $(el);

    function r(str) {
        return str.replace('px', '') / 1;
    }

    return $el.height() +
        r($el.css('padding-top')) +
        r($el.css('padding-bottom')) +
        r($el.css('margin-top')) +
        r($el.css('margin-bottom'))
}

function getQueryVariable(variable) {
    var parser = document.createElement('a');
    parser.href = window.location.href;
    var query = parser.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
}

nsGmx.CrisisMap.isMobile = function() {
    if (getQueryVariable('mobile')) {
        return true;
    } else {
        return nsGmx.Utils.isMobile();
    }
}

nsGmx.CrisisMap.formatDate = function(dt, fstr) {
    function pz(n) {
        var s = n + '';
        if (s.length === 1) {
            return '0' + s;
        }
        return s;
    }

    fstr = fstr || 'DD.MM.YYYY hh:mm';

    return fstr.replace(/YYYY/g, dt.getFullYear())
        .replace(/MM/g, pz(dt.getMonth()))
        .replace(/DD/g, pz(dt.getDate()))
        .replace(/hh/g, pz(dt.getHours()))
        .replace(/mm/g, pz(dt.getMinutes()));
};
