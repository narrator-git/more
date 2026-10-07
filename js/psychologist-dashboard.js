// Psychologist Dashboard Logic

// Custom confirm modal (replaces browser confirm)
function showConfirmModal(title, message, onConfirm, onCancel = null) {
    const existing = document.getElementById('dash-confirm-modal');
    if (existing) { existing.remove(); document.body.style.overflow = ''; }

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
                <button class="btn btn-primary btn-sm dash-confirm-ok">Confirm</button>
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

    modal.querySelector('.dash-confirm-ok').onclick = () => {
        close();
        if (onConfirm) onConfirm();
    };
    modal.querySelector('.dash-confirm-cancel').onclick = () => {
        close();
        if (onCancel) onCancel();
    };
    modal.querySelector('.dash-modal-close').onclick = close;
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
}

async function initPsychologistDashboard() {
    if (typeof getPsychologistToken !== 'function' || !getPsychologistToken()) {
        window.location.href = 'psychologist-login.html';
        return;
    }

    let psychologist;
    try {
        psychologist = await PsychologistAPI.getMe();
    } catch (e) {
        console.warn('Psychologist auth failed:', e);
        setPsychologistToken(null);
        window.location.href = 'psychologist-login.html';
        return;
    }

    const therapist = psychologist.therapist || {}; // From API - DB is source of truth
    const patients = psychologist.patients || [];

    // Sidebar
    renderPsychSidebar(therapist, psychologist);

    // Greeting
    const greetEl = document.getElementById('psych-greeting');
    if (greetEl) {
        const hour = new Date().getHours();
        let greeting = 'Hello';
        if (hour < 12) greeting = 'Good morning';
        else if (hour < 18) greeting = 'Good afternoon';
        else greeting = 'Good evening';
        greetEl.textContent = `${greeting}, ${therapist ? therapist.name : 'Doctor'}`;
    }

    // Stats - build sessions from patients (each patient can have upcomingSessions array or single booking at top level)
    const allSessions = [];
    patients.forEach(p => {
        if (p.upcomingSessions && p.upcomingSessions.length > 0) {
            p.upcomingSessions.forEach(s => allSessions.push({ ...s, patientName: p.patientName, patientId: p.userId, initialInfo: s.initialInfo || p.initialInfo }));
        } else if (p.date && p.time && (p.status === 'upcoming' || !p.status)) {
            // Single booking stored at patient level (from addBookingToPsychologist)
            const sessDate = new Date(p.date + 'T' + p.time);
            if (sessDate > new Date()) {
                allSessions.push({
                    date: p.date,
                    time: p.time,
                    patientName: p.patientName,
                    patientId: p.userId,
                    initialInfo: p.initialInfo,
                    isFirstSession: !!p.initialInfo,
                    bookingId: p.bookingId
                });
            }
        }
    });
    allSessions.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));

    const assessments = patients.filter(p => p.initialInfo).length;
    setText('stat-upcoming', allSessions.length);
    setText('stat-patients', patients.length);
    setText('stat-assessments', assessments);

    // Overview — upcoming sessions
    renderPsychUpcoming(allSessions, 'psych-upcoming');

    // Schedule — all sessions
    renderPsychUpcoming(allSessions, 'schedule-all');

    // Patients tab
    renderPatientsList(patients);

    // Profile tab
    renderPsychProfile(therapist, psychologist);

    // Tab nav
    setupTabNavigation();

    // Logout
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        showConfirmModal('Log Out', 'Are you sure you want to log out?', () => {
            PsychologistAPI.logout();
            window.location.href = 'psychologist-login.html';
        });
    });
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function renderPsychSidebar(therapist, psychologist) {
    const name = therapist ? therapist.name : 'Doctor';
    const initials = name.replace('Dr. ', '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    setText('dash-avatar', initials);
    setText('dash-sidebar-name', name);
    setText('dash-sidebar-email', psychologist.email || '');
}

function setupTabNavigation() {
    const navItems = document.querySelectorAll('.dash-nav-item[data-tab]');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tab = item.dataset.tab;
            navItems.forEach(n => n.classList.remove('active'));
            document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
            item.classList.add('active');
            const tabEl = document.getElementById('tab-' + tab);
            if (tabEl) tabEl.classList.add('active');
        });
    });
}

// ─── Sessions ───────────────────────────────────────────────
function renderPsychUpcoming(sessions, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (sessions.length === 0) {
        container.innerHTML = `
            <div class="dash-card dash-empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <h3>No Upcoming Sessions</h3>
                <p>When patients book sessions, they will appear here.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <h2 class="dash-section-title">Upcoming Sessions</h2>
        <div class="dash-session-list">
            ${sessions.map(s => {
                const d = new Date(s.date + ' ' + s.time);
                const fDate = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                const fTime = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                const initials = (s.patientName || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

                return `
                    <div class="dash-session-row">
                        <div class="dash-patient-avatar">${initials}</div>
                        <div class="dash-session-info">
                            <span class="dash-session-name">${s.patientName || 'Patient'}</span>
                            <span class="dash-session-date">${fDate} &middot; ${fTime}</span>
                        </div>
                        <span class="dash-badge dash-badge-upcoming">${s.isFirstSession ? 'First Session' : 'Upcoming'}</span>
                        ${s.isFirstSession && s.initialInfo ? `
                            <button class="btn btn-outline btn-xs dash-view-assessment" data-info="${escapeAttr(s.initialInfo)}" data-name="${escapeAttr(s.patientName || 'Patient')}">View Assessment</button>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;

    container.querySelectorAll('.dash-view-assessment').forEach(btn => {
        btn.addEventListener('click', () => {
            showAssessmentModal(btn.dataset.name, btn.dataset.info);
        });
    });
}

// ─── Patients ───────────────────────────────────────────────
function renderPatientsList(patients) {
    const container = document.getElementById('patients-list');
    if (!container) return;

    if (patients.length === 0) {
        container.innerHTML = `
            <div class="dash-card dash-empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                <h3>No Patients Yet</h3>
                <p>Your patient list will grow as clients book sessions with you.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="dash-patients-grid">
            ${patients.map(p => {
                const initials = (p.patientName || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                const upcoming = (p.upcomingSessions || []).length;
                const past = (p.pastSessions || []).length;

                return `
                    <div class="dash-card dash-patient-card">
                        <div class="dash-patient-card-header">
                            <div class="dash-patient-avatar-lg">${initials}</div>
                            <div>
                                <h3 class="dash-patient-name">${p.patientName || 'Patient'}</h3>
                                <span class="dash-muted">${upcoming} upcoming &middot; ${past} past</span>
                            </div>
                        </div>
                        ${p.initialInfo ? `
                            <div class="dash-assessment-box">
                                <div class="dash-assessment-label">Initial Assessment</div>
                                <p class="dash-assessment-text">${escapeHTML(p.initialInfo)}</p>
                            </div>
                        ` : ''}
                        ${p.upcomingSessions && p.upcomingSessions.length > 0 ? `
                            <div class="dash-patient-next">
                                <span class="dash-muted">Next:</span>
                                <span>${new Date(p.upcomingSessions[0].date + ' ' + p.upcomingSessions[0].time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${p.upcomingSessions[0].time}</span>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// ─── Profile ────────────────────────────────────────────────
function renderPsychProfile(therapist, psychologist) {
    const container = document.getElementById('psych-profile-card');
    if (!container) return;

    if (!therapist) {
        container.innerHTML = '<div class="dash-card"><p class="dash-muted">Profile information not available.</p></div>';
        return;
    }

    const rawPhoto = typeof therapistPhotoUrl === 'function' ? therapistPhotoUrl(therapist) : (therapist.photo || '');
    const photoSrc = typeof escapeHtmlAttr === 'function' ? escapeHtmlAttr(rawPhoto) : String(rawPhoto).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

    container.innerHTML = `
        <div class="dash-card">
            <div class="dash-psych-profile-header">
                <img class="dash-psych-profile-photo" src="${photoSrc}" alt="${therapist.name}" loading="lazy" onerror="this.onerror=null;if(typeof therapistPhotoUrl==='function'){this.src=therapistPhotoUrl({name:this.alt||'T',photo:''});}">
                <div>
                    <h2>${therapist.name}</h2>
                    <p class="dash-muted">${psychologist.email}</p>
                </div>
            </div>
            <div class="dash-profile-grid" style="margin-top:24px;">
                <div class="dash-profile-field">
                    <span class="dash-profile-label">Specializations</span>
                    <span class="dash-profile-value">${therapist.specialization.join(', ')}</span>
                </div>
                <div class="dash-profile-field">
                    <span class="dash-profile-label">Experience</span>
                    <span class="dash-profile-value">${therapist.experience} years</span>
                </div>
                <div class="dash-profile-field">
                    <span class="dash-profile-label">Languages</span>
                    <span class="dash-profile-value">${therapist.languages.join(', ')}</span>
                </div>
                <div class="dash-profile-field">
                    <span class="dash-profile-label">Location</span>
                    <span class="dash-profile-value">${therapist.location}</span>
                </div>
                <div class="dash-profile-field">
                    <span class="dash-profile-label">Therapy Type</span>
                    <span class="dash-profile-value">${therapist.therapyType}</span>
                </div>
                <div class="dash-profile-field">
                    <span class="dash-profile-label">Rating</span>
                    <span class="dash-profile-value">${therapist.rating}/5</span>
                </div>
            </div>
        </div>
    `;
}

// ─── Assessment Modal ───────────────────────────────────────
function showAssessmentModal(patientName, info) {
    const existing = document.getElementById('dash-modal');
    if (existing) { existing.remove(); document.body.style.overflow = ''; }

    const modal = document.createElement('div');
    modal.id = 'dash-modal';
    modal.className = 'dash-modal-overlay';
    modal.innerHTML = `
        <div class="dash-modal">
            <div class="dash-modal-header">
                <h2>Initial Assessment</h2>
                <button class="dash-modal-close">&times;</button>
            </div>
            <p class="dash-muted">Patient: ${patientName}</p>
            <div class="dash-assessment-box" style="margin-top:16px;">
                <p class="dash-assessment-text">${escapeHTML(info)}</p>
            </div>
            <div class="dash-modal-footer">
                <button class="btn btn-primary btn-sm dash-modal-close-btn">Close</button>
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
    modal.querySelector('.dash-modal-close-btn').onclick = close;
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
}

// ─── Helpers ────────────────────────────────────────────────
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
}

function escapeAttr(str) {
    return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ─── Init ───────────────────────────────────────────────────
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initPsychologistDashboard());
} else {
    initPsychologistDashboard();
}
