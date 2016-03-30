if (nsGmx.CrisisMap.isMobile()) {
    cm.define('sectionsMenu', ['mobileButtonsPane', 'sectionsManager', 'resetter'], function(cm) {
        var mobileButtonsPane = cm.get('mobileButtonsPane');
        var sectionsManager = cm.get('sectionsManager');
        var resetter = cm.get('resetter');

        var dropdownWidget = new nsGmx.IconDropdownWidget({
            sectionsManager: sectionsManager,
            showTopItem: false,
            trigger: 'click',
            direction: 'up'
        });

        mobileButtonsPane.addView(dropdownWidget);

        resetter.on('reset', function() {
            dropdownWidget.reset();
        });

        return dropdownWidget;
    });
}
