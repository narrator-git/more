// Dashboard logic — user dashboard

let currentUserProfile = null;

function tt(key, fallback) {
    return typeof t === 'function' ? t(key) : fallback;
}

// Custom confirm modal (replaces browser confirm)
function showConfirmModal(title, message, onConfirm, onCancel = null, confirmLabel = 'Confirm', confirmDanger = false) {
    const existing = document.getElementById('dash-confirm-modal');
    if (existing) { existing.remove(); document.body.style.overflow = ''; }

    const okCls = confirmDanger ? 'btn btn-sm dash-confirm-ok dash-confirm-ok-danger' : 'btn btn-primary btn-sm dash-confirm-ok';
    const modal = document.createElement('div');
    modal.id = 'dash-confirm-modal';
    modal.className = 'dash-modal-overlay';
    modal.innerHTML = `
        <div class="dash-modal" style="max-width:420px;">
            <div class="dash-modal-header">
                <h2>${escapeHTML(title)}</h2>
                <button class="dash-modal-close">&times;</button>
            </div>
            <p style="margin:16px 0;color:#555;line-height:1.6;">${escapeHTML(message)}</p>
            <div class="dash-modal-footer">
                <button class="btn btn-outline btn-sm dash-confirm-cancel">Cancel</button>
                <button class="${okCls}">${escapeHTML(confirmLabel)}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('open'));

    const close = () => {
        modal.classList.remove('open');
        setTimeout(() => { modal.remove(); document.body.style.overflow = ''; }, 200);
    };

    modal.querySelector('.dash-confirm-ok').onclick = async () => {
        const okBtn = modal.querySelector('.dash-confirm-ok');
        if (onConfirm) {
            okBtn.disabled = true;
            okBtn.textContent = '...';
            try {
                await onConfirm();
                close();
            } catch (e) {
                okBtn.disabled = false;
                okBtn.textContent = 'Confirm';
                alert(e?.message || e?.data?.error || 'Something went wrong. Please try again.');
            }
        } else {
            close();
        }
    };
    modal.querySelector('.dash-confirm-cancel').onclick = () => {
        close();
        if (onCancel) onCancel();
    };
    modal.querySelector('.dash-modal-close').onclick = close;
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
}

async function initDashboard() {
    // If user explicitly logged out, redirect to login
    if (typeof AccountManager !== 'undefined' && AccountManager.isLoggedOut()) {
        window.location.href = 'user-login.html';
        return;
    }

    // Check if user is logged in
    if (typeof getSessionToken === 'function' && !getSessionToken()) {
        window.location.href = 'user-login.html';
        return;
    }

    // Check if user has completed onboarding
    if (!(await DataManager.hasCompletedOnboarding())) {
        window.location.href = 'onboarding.html';
        return;
    }

    // Check and update session statuses automatically
    await DataManager.checkAndUpdateSessionStatuses();

    // Load user profile
    const userProfile = await DataManager.getUserProfile();
    if (userProfile) {
        currentUserProfile = userProfile;
        renderSidebar(userProfile);
        renderUserGreeting(userProfile);
    }

    // Stats
    const allBookings = await DataManager.getBookings();
    const upcoming = await DataManager.getUpcomingBookings();
    const completed = allBookings.filter(b => b.status === 'completed');
    const withNotes = allBookings.filter(b => b.notes && b.notes.trim());

    setText('stat-upcoming', upcoming.length);
    setText('stat-completed', completed.length);
    setText('stat-notes', withNotes.length);

    // Resolve therapist names from API (DB is source of truth; avoids mock vs DB mismatch)
    const therapistMap = await fetchTherapistsForSessions(allBookings);

    // Overview tab
    renderNextSession(upcoming[0], therapistMap);
    renderUpcomingSessions(upcoming.slice(1), 'upcoming-sessions', therapistMap);

    // Notes for therapist (things to discuss)
    const therapistNotes = await DataManager.getTherapistNotes();
    renderTherapistNotesSection(therapistNotes);

    // Schedule tab
    renderScheduleUpcoming(upcoming, therapistMap);
    renderScheduleHistory(allBookings, therapistMap);

    // Journal tab
    renderJournalEntries(allBookings, therapistMap);

    // Profile tab
    renderProfileCard(userProfile);

    // Setup sidebar nav
    setupTabNavigation();

    // Logout handler
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showConfirmModal('Log Out', 'Are you sure you want to log out?', () => {
                if (typeof AccountManager !== 'undefined') AccountManager.logout();
                window.location.href = 'index.html';
            });
        });
    }

    // Delete account handler
    const deleteBtn = document.getElementById('delete-account-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            showConfirmModal('Delete Account', 'Are you sure you want to delete your account? All your data (profile, bookings, notes, conversations) will be permanently removed. This cannot be undone.', async () => {
                if (typeof UserDataAPI !== 'undefined' && UserDataAPI.deleteAccount) {
                    await UserDataAPI.deleteAccount();
                }
                if (typeof AccountManager !== 'undefined') AccountManager.logout();
                window.location.href = 'index.html';
            }, null, 'Delete', true);
        });
    }
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

// Fetch therapists from API for sessions (DB is source of truth; avoids mock vs DB name mismatch)
async function fetchTherapistsForSessions(sessions) {
    const map = {};
    const ids = [...new Set((sessions || []).map(s => s.therapistId).filter(Boolean))];
    await Promise.all(ids.map(async (id) => {
        try {
            const res = await fetch(typeof moreApi === 'function' ? moreApi(`/api/therapists/${encodeURIComponent(id)}`) : `/api/therapists/${encodeURIComponent(id)}`);
            if (res.ok) {
                const data = await res.json();
                map[id] = data.therapist;
            }
        } catch (e) { /* ignore */ }
    }));
    return map;
}

// ─── Sidebar ────────────────────────────────────────────────
function renderSidebar(profile) {
    const name = profile.name || 'User';
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    setText('dash-avatar', initials);
    setText('dash-sidebar-name', name);

    // Get email from auth
    const emailEl = document.getElementById('dash-sidebar-email');
    if (emailEl) {
        if (typeof AuthAPI !== 'undefined' && typeof getSessionToken === 'function' && getSessionToken()) {
            AuthAPI.me().then(r => {
                emailEl.textContent = r.email || '';
                setText('profile-email-display', r.email || '');
            }).catch(() => {});
        }
    }
}

// ─── Tab Navigation ─────────────────────────────────────────
function switchDashTab(tab) {
    const navItems = document.querySelectorAll('.dash-nav-item[data-tab]');
    const mobileItems = document.querySelectorAll('.dash-mobile-tab[data-tab]');
    navItems.forEach(n => n.classList.remove('active'));
    mobileItems.forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
    navItems.forEach(n => { if (n.dataset.tab === tab) n.classList.add('active'); });
    mobileItems.forEach(n => { if (n.dataset.tab === tab) n.classList.add('active'); });
    const tabEl = document.getElementById('tab-' + tab);
    if (tabEl) tabEl.classList.add('active');
}

function setupTabNavigation() {
    document.querySelectorAll('.dash-nav-item[data-tab]').forEach(item => {
        item.addEventListener('click', () => switchDashTab(item.dataset.tab));
    });
    document.querySelectorAll('.dash-mobile-tab[data-tab]').forEach(item => {
        item.addEventListener('click', () => switchDashTab(item.dataset.tab));
    });
}

// ─── Overview Tab ───────────────────────────────────────────
function renderUserGreeting(userProfile) {
    const greetingEl = document.getElementById('user-greeting');
    if (!greetingEl) return;
    const name = userProfile.name || tt('dash.there', 'there');
    const hour = new Date().getHours();
    let greeting = tt('dash.greeting.hello', 'Hello');
    if (hour < 12) greeting = tt('dash.greeting.morning', 'Good morning');
    else if (hour < 18) greeting = tt('dash.greeting.afternoon', 'Good afternoon');
    else greeting = tt('dash.greeting.evening', 'Good evening');
    greetingEl.textContent = `${greeting}, ${name}`;
}

function renderNextSession(session, therapistMap = {}) {
    const el = document.getElementById('next-session');
    if (!el) return;

    if (!session) {
        el.innerHTML = `
            <div class="dash-card dash-empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <h3>No Upcoming Sessions</h3>
                <p>Book your first session with a therapist to get started on your journey.</p>
                <a href="therapist-selection.html" class="btn btn-primary btn-sm">Find a Therapist</a>
            </div>
        `;
        return;
    }

    const apiTherapist = therapistMap[session.therapistId];
    const displayName = apiTherapist?.name ?? session.therapistName ?? 'Therapist';
    const rawDisplayPhoto = apiTherapist?.photo ?? session.therapistPhoto;
    const resolvedPhoto = typeof therapistPhotoUrl === 'function'
        ? therapistPhotoUrl({ id: session.therapistId, photo: rawDisplayPhoto })
        : (rawDisplayPhoto || 'https://ui-avatars.com/api/?name=T&background=6ab12f&color=fff&size=80');
    const displayPhoto = typeof escapeHtmlAttr === 'function'
        ? escapeHtmlAttr(resolvedPhoto)
        : String(resolvedPhoto).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    const sessionDate = new Date(`${session.date}T${session.time}`);
    const fDate = sessionDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const fTime = sessionDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const countdown = getCountdownText(sessionDate);
    const status = session.status || 'upcoming';

    el.innerHTML = `
        <h2 class="dash-section-title">Next Session</h2>
        <div class="dash-card dash-next-session">
            <div class="dash-next-left">
                <img class="dash-next-avatar" src="${displayPhoto}" alt="" onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=T&background=6ab12f&color=fff&size=80'">
                <div class="dash-next-info">
                    <h3>${escapeHTML(displayName)}</h3>
                    <span class="dash-next-type">${session.type === 'initial' ? 'Initial Consultation' : 'Regular Session'}</span>
                </div>
            </div>
            <div class="dash-next-right">
                <div class="dash-next-date">${fDate} at ${fTime}</div>
                ${countdown ? `<div class="dash-next-countdown">${countdown}</div>` : ''}
                <div class="dash-next-actions">
                    ${getSessionActionButton(session, status)}
                    ${status === 'upcoming' ? `<button class="btn btn-outline btn-sm dash-cancel-btn" data-id="${session.id}">Cancel</button>` : ''}
                </div>
            </div>
        </div>
    `;

    // Cancel handler
    el.querySelector('.dash-cancel-btn')?.addEventListener('click', () => {
            showConfirmModal('Cancel Session', 'Are you sure you want to cancel this session?', async () => {
                await DataManager.updateSessionStatus(session.id, 'cancelled');
                await initDashboard();
            }, null, 'Confirm', true);
    });
}

function renderUpcomingSessions(sessions, containerId, therapistMap = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!sessions || sessions.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <h2 class="dash-section-title">More Upcoming</h2>
        <div class="dash-session-list">
            ${sessions.map(s => sessionRowHTML(s, therapistMap)).join('')}
        </div>
    `;
    attachSessionHandlers(container);
}

function getSessionActionButton(session, status) {
    if (status !== 'upcoming' && status !== 'in-progress') return '';
    const isInPerson = session.sessionType === 'in-person' || session.isOnline === false;
    const addressUrl = session.officeAddress || 'https://www.google.com/maps/search/University+of+Hong+Kong+HKU';
    if (isInPerson) {
        return `<a href="${addressUrl}" target="_blank" class="btn btn-primary btn-sm">Address / Maps</a>`;
    }
    return `<a href="${session.meetingLink || '#'}" target="_blank" class="btn btn-primary btn-sm">Join Session</a>`;
}

function sessionRowHTML(session, therapistMap = {}) {
    const apiTherapist = therapistMap[session.therapistId];
    const displayName = apiTherapist?.name ?? session.therapistName ?? 'Therapist';
    const rawSessionPhoto = apiTherapist?.photo ?? session.therapistPhoto;
    const resolvedPhoto = typeof therapistPhotoUrl === 'function'
        ? therapistPhotoUrl({ id: session.therapistId, photo: rawSessionPhoto })
        : (rawSessionPhoto || 'https://ui-avatars.com/api/?name=T&background=6ab12f&color=fff&size=48');
    const displayPhoto = typeof escapeHtmlAttr === 'function'
        ? escapeHtmlAttr(resolvedPhoto)
        : String(resolvedPhoto).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    const d = new Date(`${session.date}T${session.time}`);
    const fDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const fTime = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const status = session.status || 'upcoming';
    const isInPerson = session.sessionType === 'in-person' || session.isOnline === false;
    const actionUrl = isInPerson ? (session.officeAddress || 'https://www.google.com/maps/search/University+of+Hong+Kong+HKU') : session.meetingLink;
    const actionLabel = isInPerson ? 'Address' : 'Join';

    return `
        <div class="dash-session-row">
            <img class="dash-session-avatar" src="${displayPhoto}" alt="" onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name=T&background=6ab12f&color=fff&size=48'">
            <div class="dash-session-info">
                <span class="dash-session-name">${escapeHTML(displayName)}</span>
                <span class="dash-session-date">${fDate} &middot; ${fTime}</span>
            </div>
            <span class="dash-badge dash-badge-${status}">${capitalize(status)}</span>
            <div class="dash-session-actions">
                ${status === 'upcoming' && actionUrl ? `<a href="${actionUrl}" target="_blank" class="btn btn-primary btn-xs">${actionLabel}</a>` : ''}
                ${status === 'upcoming' ? `<button class="btn btn-outline btn-xs dash-cancel-btn" data-id="${session.id}">Cancel</button>` : ''}
                ${status === 'completed' && !(session.feedback && session.feedback.rating) ? `<button class="btn btn-outline btn-xs dash-feedback-btn" data-id="${session.id}">Rate</button>` : ''}
                <button class="btn btn-outline btn-xs dash-notes-btn" data-id="${session.id}">${session.notes ? 'Notes' : '+ Note'}</button>
            </div>
        </div>
    `;
}

// ─── Schedule Tab ───────────────────────────────────────────
function renderScheduleUpcoming(sessions, therapistMap = {}) {
    const container = document.getElementById('schedule-upcoming');
    if (!container) return;

    if (sessions.length === 0) {
        container.innerHTML = `
            <h2 class="dash-section-title">Upcoming</h2>
            <div class="dash-card dash-empty-state">
                <p>No upcoming sessions.</p>
                <a href="therapist-selection.html" class="btn btn-primary btn-sm" style="margin-top:12px;">Book a Session</a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <h2 class="dash-section-title">Upcoming</h2>
        <div class="dash-session-list">
            ${sessions.map(s => sessionRowHTML(s, therapistMap)).join('')}
        </div>
    `;
    attachSessionHandlers(container);
}

function renderScheduleHistory(allBookings, therapistMap = {}) {
    const container = document.getElementById('schedule-history');
    if (!container) return;

    const completed = allBookings
        .filter(b => b.status === 'completed' || b.status === 'cancelled')
        .sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`))
        .slice(0, 10);

    if (completed.length === 0) {
        container.innerHTML = `<h2 class="dash-section-title" style="margin-top:32px;">History</h2><p class="dash-muted">No past sessions yet.</p>`;
        return;
    }

    container.innerHTML = `
        <h2 class="dash-section-title" style="margin-top:32px;">History</h2>
        <div class="dash-session-list">
            ${completed.map(s => sessionRowHTML(s, therapistMap)).join('')}
        </div>
    `;
    attachSessionHandlers(container);
}

// ─── Journal Tab ────────────────────────────────────────────
function renderJournalEntries(allBookings, therapistMap = {}) {
    const container = document.getElementById('journal-entries');
    if (!container) return;

    const withNotes = allBookings.filter(b => b.notes && b.notes.trim()).sort((a, b) => {
        return new Date(b.notesDate || b.date) - new Date(a.notesDate || a.date);
    });

    if (withNotes.length === 0) {
        container.innerHTML = `
            <div class="dash-card dash-empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                <h3>No Journal Entries</h3>
                <p>After your sessions, you can add notes and reflections here.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = withNotes.map(b => {
        const d = new Date(`${b.date}T${b.time}`);
        const fDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const apiTherapist = therapistMap ? therapistMap[b.therapistId] : null;
        const therapistName = apiTherapist?.name ?? b.therapistName ?? 'Therapist';
        return `
            <div class="dash-card dash-journal-entry">
                <div class="dash-journal-header">
                    <span class="dash-journal-therapist">${escapeHTML(therapistName)}</span>
                    <span class="dash-journal-date">${fDate}</span>
                </div>
                <p class="dash-journal-text">${escapeHTML(b.notes)}</p>
                <button class="btn btn-outline btn-xs dash-notes-btn" data-id="${b.id}">Edit</button>
            </div>
        `;
    }).join('');

    attachSessionHandlers(container);
}

// ─── Notes for Therapist Section (Overview) ─────────────────
function renderTherapistNotesSection(notes) {
    const container = document.getElementById('therapist-notes-section');
    if (!container) return;
    if (!notes || !notes.trim()) {
        container.innerHTML = `
            <div class="dash-card dash-empty-state" style="padding: 24px;">
                <h3 class="dash-section-title">Notes for your therapist</h3>
                <p class="dash-muted">Things you want to discuss in your next session. Add them in <a href="ai-chat.html">more AI</a>.</p>
            </div>
        `;
        return;
    }
    container.innerHTML = `
        <div class="dash-card">
            <h3 class="dash-section-title">Notes for your therapist</h3>
            <p class="dash-muted">Things you want to discuss in your next session</p>
            <div class="dash-journal-text" style="margin-top:12px;white-space:pre-wrap;">${escapeHTML(notes)}</div>
            <a href="ai-chat.html" class="btn btn-outline btn-sm" style="margin-top:12px;">Edit in more AI</a>
        </div>
    `;
}

// ─── Profile Tab ────────────────────────────────────────────
function renderProfileCard(profile) {
    const card = document.getElementById('profile-card');
    if (!card) return;

    const fields = [];
    if (profile.name) fields.push({ label: 'Name', value: profile.name });
    if (profile.age) fields.push({ label: 'Age', value: profile.age });
    if (profile.gender) fields.push({ label: 'Gender', value: profile.gender });
    if (profile.location) fields.push({ label: 'Location', value: profile.location });
    if (profile.preferredLanguage) fields.push({ label: 'Language', value: profile.preferredLanguage });
    if (profile.therapyType) fields.push({ label: 'Therapy Type', value: profile.therapyType });
    if (profile.concerns && profile.concerns.length) fields.push({ label: 'Focus Areas', value: profile.concerns.join(', ') });

    if (fields.length === 0) {
        card.innerHTML = '<div class="dash-card"><p class="dash-muted">No profile information yet.</p></div>';
        return;
    }

    card.innerHTML = `
        <div class="dash-card">
            <h3 class="dash-card-title">Personal Information</h3>
            <div class="dash-profile-grid">
                ${fields.map(f => `
                    <div class="dash-profile-field">
                        <span class="dash-profile-label">${f.label}</span>
                        <span class="dash-profile-value">${f.value}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ─── Session Handlers ───────────────────────────────────────
function attachSessionHandlers(container) {
    container.querySelectorAll('.dash-cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => {
                showConfirmModal('Cancel Session', 'Are you sure you want to cancel this session?', async () => {
                    await DataManager.updateSessionStatus(btn.dataset.id, 'cancelled');
                    await initDashboard();
                }, null, 'Confirm', true);
        });
    });
    container.querySelectorAll('.dash-notes-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const bookings = await DataManager.getBookings();
            const booking = bookings.find(b => b.id === btn.dataset.id);
            if (booking) showNotesModal(btn.dataset.id, booking);
        });
    });
    container.querySelectorAll('.dash-feedback-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const bookings = await DataManager.getBookings();
            const booking = bookings.find(b => b.id === btn.dataset.id);
            if (booking) showFeedbackModal(btn.dataset.id, booking);
        });
    });
}

// ─── Modals ─────────────────────────────────────────────────
function showNotesModal(bookingId, booking) {
    removeModal('dash-modal');
    const modal = document.createElement('div');
    modal.id = 'dash-modal';
    modal.className = 'dash-modal-overlay';
    modal.innerHTML = `
        <div class="dash-modal">
            <div class="dash-modal-header">
                <h2>Session Notes</h2>
                <button class="dash-modal-close">&times;</button>
            </div>
            <p class="dash-muted">${booking.therapistName} &middot; ${booking.date}</p>
            <textarea class="dash-modal-textarea" rows="8" placeholder="Write your thoughts, reflections, or things to remember...">${booking.notes || ''}</textarea>
            <div class="dash-modal-footer">
                <button class="btn btn-outline btn-sm dash-modal-cancel">Cancel</button>
                <button class="btn btn-primary btn-sm dash-modal-save">Save Notes</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('open'));

    const close = () => {
        modal.classList.remove('open');
        setTimeout(() => { modal.remove(); document.body.style.overflow = ''; }, 200);
    };
    modal.querySelector('.dash-modal-close').onclick = close;
    modal.querySelector('.dash-modal-cancel').onclick = close;
    modal.addEventListener('click', e => { if (e.target === modal) close(); });

    modal.querySelector('.dash-modal-save').onclick = async () => {
        const notes = modal.querySelector('.dash-modal-textarea').value.trim();
        await DataManager.saveSessionNotes(bookingId, notes);
        close();
        setTimeout(async () => await initDashboard(), 250);
    };
}

function showFeedbackModal(bookingId, booking) {
    removeModal('dash-modal');
    let selectedRating = 0;

    const modal = document.createElement('div');
    modal.id = 'dash-modal';
    modal.className = 'dash-modal-overlay';
    modal.innerHTML = `
        <div class="dash-modal">
            <div class="dash-modal-header">
                <h2>Rate Session</h2>
                <button class="dash-modal-close">&times;</button>
            </div>
            <p class="dash-muted">${booking.therapistName} &middot; ${booking.date}</p>
            <div class="dash-star-row" id="dash-star-row">
                ${[1,2,3,4,5].map(i => `<span class="dash-star" data-r="${i}">&#9734;</span>`).join('')}
            </div>
            <textarea class="dash-modal-textarea" rows="4" placeholder="Share your thoughts about this session (optional)..."></textarea>
            <div class="dash-modal-footer">
                <button class="btn btn-outline btn-sm dash-modal-cancel">Cancel</button>
                <button class="btn btn-primary btn-sm dash-modal-submit" disabled>Submit</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('open'));

    const stars = modal.querySelectorAll('.dash-star');
    const submitBtn = modal.querySelector('.dash-modal-submit');
    stars.forEach(s => {
        s.addEventListener('click', () => {
            selectedRating = parseInt(s.dataset.r);
            stars.forEach((st, i) => {
                st.innerHTML = i < selectedRating ? '&#9733;' : '&#9734;';
                st.classList.toggle('active', i < selectedRating);
            });
            submitBtn.disabled = false;
        });
    });

    const close = () => {
        modal.classList.remove('open');
        setTimeout(() => { modal.remove(); document.body.style.overflow = ''; }, 200);
    };
    modal.querySelector('.dash-modal-close').onclick = close;
    modal.querySelector('.dash-modal-cancel').onclick = close;
    modal.addEventListener('click', e => { if (e.target === modal) close(); });

    submitBtn.onclick = async () => {
        const comment = modal.querySelector('.dash-modal-textarea').value.trim();
        await DataManager.saveSessionFeedback(bookingId, { rating: selectedRating, comment });
        close();
        setTimeout(async () => await initDashboard(), 250);
    };
}

function removeModal(id) {
    const m = document.getElementById(id);
    if (m) { m.remove(); document.body.style.overflow = ''; }
}

// ─── Helpers ────────────────────────────────────────────────
function getCountdownText(date) {
    const diff = date - new Date();
    if (diff <= 0) return 'Session time!';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (days > 0) return `in ${days}d ${hours}h`;
    if (hours > 0) return `in ${hours}h ${mins}m`;
    return `in ${mins}m`;
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ─── Init ───────────────────────────────────────────────────
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initDashboard());
} else {
    initDashboard();
}

window.addEventListener('i18n-updated', () => {
    if (currentUserProfile) renderUserGreeting(currentUserProfile);
});
