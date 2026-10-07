// Dynamic nav auth button: shows "Log In" or "Dashboard" based on login state
// When logged in, "more" logo acts as logo only (no link to main page)
(function() {
    'use strict';

    function updateNavAuth() {
        const navAuthLink = document.getElementById('nav-auth-link');
        if (!navAuthLink) return;

        // Psychologist logged in
        if (typeof getPsychologistToken === 'function' && getPsychologistToken()) {
            navAuthLink.textContent = 'Dashboard';
            navAuthLink.href = 'psychologist-dashboard.html';
            navAuthLink.className = 'nav-link';
            updateLogoAsNonLink(true);
            return;
        }

        // User logged in = has session token (server-only, no localStorage)
        const userLoggedIn = !!(typeof getSessionToken === 'function' && getSessionToken());
        if (userLoggedIn) {
            navAuthLink.textContent = 'Dashboard';
            navAuthLink.href = 'dashboard.html';
            navAuthLink.className = 'nav-link';
        } else {
            navAuthLink.textContent = 'Log In';
            navAuthLink.href = 'user-login.html';
            navAuthLink.className = 'nav-login-btn';
        }
        updateLogoAsNonLink(userLoggedIn);
    }

    function updateLogoAsNonLink(loggedIn) {
        const logo = document.getElementById('header-logo') || document.querySelector('a.header-logo');
        if (!logo || !(logo instanceof HTMLAnchorElement)) return;
        if (loggedIn) {
            logo.href = 'javascript:void(0)';
            logo.style.cursor = 'default';
        } else {
            logo.href = 'index.html';
            logo.style.cursor = '';
        }
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateNavAuth);
    } else {
        updateNavAuth();
    }

    // Re-run when storage changes (for cross-tab sync)
    window.addEventListener('storage', updateNavAuth);
})();
