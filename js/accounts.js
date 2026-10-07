// Account management system (now uses server API as source of truth when logged in)

const ACCOUNT_STORAGE_KEYS = {
    CURRENT_USER_ID: 'currentUserId',
    CURRENT_PSYCHOLOGIST_ID: 'currentPsychologistId'
};

const AccountManager = {
    getCurrentUser() {
        // Check server-side login first
        if (typeof getSessionToken === 'function' && getSessionToken()) {
            return { accountId: 'server', email: 'user' };
        }
        // Fallback to old sessionStorage logic
        const userId = sessionStorage.getItem(ACCOUNT_STORAGE_KEYS.CURRENT_USER_ID);
        if (userId) {
            return { accountId: userId };
        }
        return null;
    },

    getCurrentPsychologist() {
        // Check server-side login first
        if (typeof getPsychologistToken === 'function' && getPsychologistToken()) {
            return { accountId: 'server', therapistId: 'fetched-via-api' };
        }
        // Fallback to old sessionStorage logic
        const psychId = sessionStorage.getItem(ACCOUNT_STORAGE_KEYS.CURRENT_PSYCHOLOGIST_ID);
        if (psychId) {
            return { accountId: psychId };
        }
        return null;
    },

    isLoggedOut() {
        return localStorage.getItem('isLoggedOut') === 'true';
    },

    clearLoggedOutFlag() {
        localStorage.removeItem('isLoggedOut');
    },

    logout() {
        // Use AuthAPI if available
        if (typeof AuthAPI !== 'undefined') {
            AuthAPI.logout();
        } else if (typeof setSessionToken === 'function') {
            setSessionToken(null);
        }
        if (typeof setPsychologistToken === 'function') {
            setPsychologistToken(null);
        }
        sessionStorage.removeItem(ACCOUNT_STORAGE_KEYS.CURRENT_USER_ID);
        sessionStorage.removeItem(ACCOUNT_STORAGE_KEYS.CURRENT_PSYCHOLOGIST_ID);
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('psychologistSessionToken');
        if (typeof DataManager !== 'undefined' && DataManager.clearAllData) {
            DataManager.clearAllData();
        }
        localStorage.setItem('isLoggedOut', 'true');
    },

    // Legacy functions (kept for compatibility)
    getPsychologistAccounts() {
        // This is now handled server-side, but keep for any legacy code
        return [];
    }
};

// Expose globally
if (typeof window !== 'undefined') {
    window.AccountManager = AccountManager;
}
