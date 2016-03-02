document.addEventListener('DOMContentLoaded', function () {
    window.device = {
        platform: 'browser'
    };
    document.dispatchEvent(new CustomEvent('deviceready', {}));
});
