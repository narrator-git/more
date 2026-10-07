// API client for more - handles auth token and requests to backend
// Load before accounts.js (accounts uses getSessionToken)

// Same-origin so deploy (VDS) and phone work; avoids Chrome "local network" permission
// for public-site → localhost requests. Local dev: serve site from the same server/port.
const API_BASE = (typeof window !== 'undefined' && window.MORE_API_BASE) ? window.MORE_API_BASE.replace(/\/$/, '') : '';

function getSessionToken() {
    return localStorage.getItem('sessionToken');
}

function setSessionToken(token) {
    if (token) {
        localStorage.setItem('sessionToken', token);
    } else {
        localStorage.removeItem('sessionToken');
    }
}

// Psychologist session (separate from user)
const PSYCHOLOGIST_TOKEN_KEY = 'psychologistSessionToken';

function getPsychologistToken() {
    return localStorage.getItem(PSYCHOLOGIST_TOKEN_KEY);
}

function setPsychologistToken(token) {
    if (token) {
        localStorage.setItem(PSYCHOLOGIST_TOKEN_KEY, token);
    } else {
        localStorage.removeItem(PSYCHOLOGIST_TOKEN_KEY);
    }
}

function getAuthHeaders() {
    const token = getSessionToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = 'Bearer ' + token;
    }
    return headers;
}

let _redirectingToLogin = false;

async function apiRequest(method, path, body = null, usePsychologistToken = false) {
    const token = usePsychologistToken ? getPsychologistToken() : getSessionToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + path, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        if (res.status === 401 && token && !path.startsWith('/api/auth/')) {
            if (usePsychologistToken) {
                setPsychologistToken(null);
            } else {
                setSessionToken(null);
            }
            if (!_redirectingToLogin) {
                _redirectingToLogin = true;
                window.location.href = 'user-login.html';
            }
        }
        const err = new Error(data.error || res.statusText || 'Request failed');
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
}

// Auth - stores token on success
const AuthAPI = {
    async register(email, password) {
        const r = await apiRequest('POST', '/api/auth/register', { email, password });
        if (r.token) setSessionToken(r.token);
        return r;
    },
    async login(email, password) {
        const r = await apiRequest('POST', '/api/auth/login', { email, password });
        if (r.token) setSessionToken(r.token);
        return r;
    },
    logout() {
        const token = getSessionToken();
        setSessionToken(null);
        if (token) {
            fetch(API_BASE + '/api/auth/logout', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token }
            }).catch(() => {});
        }
    },
    async me() {
        return apiRequest('GET', '/api/auth/me');
    }
};

// Psychologist auth
const PsychologistAPI = {
    async login(email, password) {
        const r = await apiRequest('POST', '/api/psychologist/auth/login', { email, password }, false);
        if (r.token) setPsychologistToken(r.token);
        return r;
    },
    logout() {
        const token = getPsychologistToken();
        setPsychologistToken(null);
        if (token) {
            fetch(API_BASE + '/api/psychologist/auth/logout', {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + token }
            }).catch(() => {});
        }
    },
    async getMe() {
        return apiRequest('GET', '/api/psychologist/me', null, true);
    }
};

// User data
const UserDataAPI = {
    async getProfile() {
        const r = await apiRequest('GET', '/api/user/profile');
        return r.profile;
    },
    async saveProfile(profile) {
        await apiRequest('PUT', '/api/user/profile', { profile });
    },
    async getConversation() {
        const r = await apiRequest('GET', '/api/user/conversation');
        return { messages: r.messages || [], conversationId: r.conversationId };
    },
    async saveConversation(messages, conversationId) {
        await apiRequest('PUT', '/api/user/conversation', { messages, conversationId });
    },
    async getBookings() {
        const r = await apiRequest('GET', '/api/user/bookings');
        return r.bookings || [];
    },
    async saveBooking(booking) {
        const r = await apiRequest('POST', '/api/user/bookings', { booking });
        return r.booking;
    },
    async updateBooking(bookingId, updates) {
        await apiRequest('PUT', '/api/user/bookings/' + encodeURIComponent(bookingId), updates);
    },
    async getAiCodeMessage() {
        const r = await apiRequest('GET', '/api/user/ai-code-message');
        return r.codeMessage;
    },
    async saveAiCodeMessage(codeMessage) {
        await apiRequest('PUT', '/api/user/ai-code-message', { codeMessage });
    },
    async addBookingToPsychologist(therapistId, booking, patientName) {
        await apiRequest('POST', '/api/user/add-booking-to-psychologist', {
            therapistId,
            booking,
            patientName
        });
    },
    async getTherapistNotes() {
        const r = await apiRequest('GET', '/api/user/therapist-notes');
        return r.notes;
    },
    async saveTherapistNotes(notes, bookingId = null, therapistId = null) {
        await apiRequest('PUT', '/api/user/therapist-notes', { notes, bookingId, therapistId });
    },
    async deleteAccount() {
        await apiRequest('DELETE', '/api/user/account');
    }
};

// Note: syncUserDataFromServer() removed - DataManager now calls API directly

// Helper: is user logged in via server?
function isLoggedInViaServer() {
    return !!getSessionToken();
}

// Expose for use in pages
if (typeof window !== 'undefined') {
    window.AuthAPI = AuthAPI;
    window.PsychologistAPI = PsychologistAPI;
    window.UserDataAPI = UserDataAPI;
    window.getSessionToken = getSessionToken;
    window.setSessionToken = setSessionToken;
    window.getPsychologistToken = getPsychologistToken;
    window.setPsychologistToken = setPsychologistToken;
}
