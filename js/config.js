// Public site settings. The OpenAI key never belongs in this file.
// MORE_API_BASE is set only for GitHub Pages. Local pages talk to the same server.
(function () {
    var LIVE_API = 'https://37.114.63.12.sslip.io';
    var host = location.hostname;
    window.MORE_API_BASE = host.endsWith('github.io') ? LIVE_API.replace(/\/$/, '') : '';

    window.moreApi = function (path) {
        var base = window.MORE_API_BASE || '';
        if (!path) return base;
        if (path.charAt(0) !== '/') path = '/' + path;
        return base + path;
    };

    window.moreAsset = function (path) {
        if (!path || /^(https?:|data:)/i.test(path)) return path;
        var prefix = '';
        var name = location.pathname;
        if (name === '/more' || name.indexOf('/more/') === 0) prefix = '/more';
        if (path.charAt(0) !== '/') path = '/' + path;
        return prefix + path;
    };
})();
