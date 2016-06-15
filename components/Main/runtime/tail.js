cm.define('debug', ['sectionsManager', 'config'], function(cm) {
    if (cm.get('config').debug && cm.get('config').debug.globals) {
        window.sm = cm.get('sectionsManager');
    }

    return null;
})
