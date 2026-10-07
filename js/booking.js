// Therapist profile and booking logic - modern design with calendar widget

let selectedTherapist = null;
let selectedDate = null;
let selectedTime = null;
let selectedSessionType = 'online'; // 'online' | 'in-person'
let bookedSlots = [];
let calendarCurrentMonth = new Date();
calendarCurrentMonth.setDate(1);

// HKU placeholder address for all in-person sessions
const DEFAULT_OFFICE_ADDRESS = 'https://www.google.com/maps/search/University+of+Hong+Kong+HKU';

function tt(key, fallback) {
    return typeof t === 'function' ? t(key) : fallback;
}

function normalizeKey(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/\+/g, 'plus')
        .replace(/'/g, '')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

function translateTaxonomy(prefix, value) {
    if (!value) return value;
    const key = `${prefix}.${normalizeKey(value)}`;
    return tt(key, value);
}

function translateSpecialization(value) {
    return translateTaxonomy('taxonomy.specialization', value);
}

function translateLanguage(value) {
    return translateTaxonomy('taxonomy.language', value);
}

function therapistPhotoImgHtml(therapist) {
    const rawSrc = typeof therapistPhotoUrl === 'function' ? therapistPhotoUrl(therapist) : (therapist.photo || '');
    const src = typeof escapeHtmlAttr === 'function' ? escapeHtmlAttr(rawSrc) : rawSrc.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    const nameEsc = String(therapist.name || 'Therapist').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    return `<img class="profile-modern-photo" src="${src}" alt="${nameEsc}" loading="lazy" onerror="this.onerror=null;if(typeof therapistPhotoUrl==='function'){this.src=therapistPhotoUrl({name:this.alt||'T',photo:''});}">`;
}

function translateBio(bio) {
    if (!bio) return '';
    const raw = String(bio).trim();
    const knownBioKey = `bio.${normalizeKey(raw)}`;
    const translated = typeof t === 'function' ? t(knownBioKey) : knownBioKey;
    if (translated !== knownBioKey) return translated;
    if (typeof tParam !== 'function') return raw;

    const generated = /^Licensed (junior|mid|senior) therapist with (\d+) years of experience specializing in (.+)\. I provide (online|in-person|both online and in-person) therapy sessions\.$/.exec(raw);
    if (!generated) return raw;

    const level = tt(`booking.level.${generated[1]}`, generated[1]);
    const years = generated[2];
    const specializations = generated[3]
        .split(',')
        .map(s => translateSpecialization(s.trim()))
        .join(', ');
    const modeMap = {
        online: tt('booking.mode.online', 'online'),
        'in-person': tt('booking.mode.in_person', 'in-person'),
        'both online and in-person': tt('booking.mode.both', 'both online and in-person')
    };
    const sessionMode = modeMap[generated[4]] || generated[4];

    return tParam('booking.bio.generated', {
        level,
        years,
        specializations,
        sessionMode
    });
}

async function initBooking() {
    if (typeof getSessionToken === 'function' && !getSessionToken()) {
        window.location.href = 'user-login.html';
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const therapistId = urlParams.get('id');
    if (!therapistId) {
        window.location.href = 'therapist-selection.html';
        return;
    }

    if (!(await DataManager.hasCompletedOnboarding())) {
        window.location.href = 'onboarding.html';
        return;
    }

    try {
        const res = await fetch(`/api/therapists/${encodeURIComponent(therapistId)}`);
        if (res.ok) {
            const data = await res.json();
            selectedTherapist = { ...data.therapist, id: therapistId };
        }
    } catch (e) { console.warn('Failed to load therapist:', e); }

    if (!selectedTherapist) {
        window.location.href = 'therapist-selection.html';
        return;
    }

    try {
        const res = await fetch(`/api/therapists/${encodeURIComponent(therapistId)}/booked-slots`);
        if (res.ok) {
            const data = await res.json();
            bookedSlots = data.slots || [];
        }
    } catch (e) { console.warn('Failed to fetch booked slots:', e); }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    calendarCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    renderTherapistProfile();
    renderSessionTypeSelector();
    renderCalendar();
    renderTimeSlots(null);
    setupBookingButton();
    setupCalendarNav();
}

function formatLocation(loc) {
    if (!loc) return tt('common.dash', '—');
    return String(loc).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getSessionTypes() {
    const t = selectedTherapist?.therapyType;
    if (t === 'online') return [{ id: 'online', label: tt('booking.online', 'Online') }];
    if (t === 'face-to-face') return [{ id: 'in-person', label: tt('booking.inPerson', 'In-person') }];
    return [{ id: 'online', label: tt('booking.online', 'Online') }, { id: 'in-person', label: tt('booking.inPerson', 'In-person') }];
}

function renderTherapistProfile() {
    const container = document.getElementById('therapist-profile');
    if (!container || !selectedTherapist) return;

    const t = selectedTherapist;
    const loc = formatLocation(t.location);
    const sessionTypes = getSessionTypes();
    const addressUrl = t.officeAddress || DEFAULT_OFFICE_ADDRESS;

    container.innerHTML = `
        <div class="profile-modern-header">
            ${therapistPhotoImgHtml(t)}
            <h1 class="profile-modern-name">${t.name}</h1>
            <div class="profile-modern-specs">
                ${(t.specialization || []).slice(0, 4).map(s => `<span class="spec-chip">${translateSpecialization(s)}</span>`).join('')}
            </div>
            <div class="profile-modern-rating">${renderStars(t.rating)} ${t.rating}</div>
        </div>
        <div class="profile-modern-details">
            <div class="profile-detail-row">
                <span class="profile-detail-icon">📍</span>
                <span>${loc}</span>
            </div>
            <div class="profile-detail-row">
                <span class="profile-detail-icon">💻</span>
                <span>${sessionTypes.map(s => s.label).join(', ')} ${tt('booking.sessions', 'sessions')}</span>
            </div>
            <div class="profile-detail-row">
                <span class="profile-detail-icon">🌐</span>
                <span>${(t.languages || []).map(translateLanguage).join(', ') || tt('common.dash', '—')}</span>
            </div>
            <div class="profile-detail-row profile-detail-price">
                <span>$${t.price}</span> / ${tt('booking.session', 'session')}
            </div>
        </div>
        <p class="profile-modern-bio">${translateBio(t.bio || '')}</p>
    `;
}

function renderStars(rating) {
    const r = Math.floor(rating);
    return '★'.repeat(r) + '☆'.repeat(5 - r);
}

function renderSessionTypeSelector() {
    const container = document.getElementById('session-type-options');
    if (!container) return;

    const types = getSessionTypes();
    container.innerHTML = types.map(t => `
        <button type="button" class="session-type-btn ${selectedSessionType === t.id ? 'active' : ''}" data-type="${t.id}">${t.label}</button>
    `).join('');

    container.querySelectorAll('.session-type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedSessionType = btn.dataset.type;
            container.querySelectorAll('.session-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTimeSlots(selectedDate);
        });
    });
}

function renderCalendar() {
    const titleEl = document.getElementById('calendar-month-title');
    const daysEl = document.getElementById('calendar-days');
    if (!titleEl || !daysEl) return;

    const monthNames = [
        tt('month.january', 'January'), tt('month.february', 'February'), tt('month.march', 'March'),
        tt('month.april', 'April'), tt('month.may', 'May'), tt('month.june', 'June'),
        tt('month.july', 'July'), tt('month.august', 'August'), tt('month.september', 'September'),
        tt('month.october', 'October'), tt('month.november', 'November'), tt('month.december', 'December')
    ];
    titleEl.textContent = `${monthNames[calendarCurrentMonth.getMonth()]} ${calendarCurrentMonth.getFullYear()}`;

    const year = calendarCurrentMonth.getFullYear();
    const month = calendarCurrentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = lastDay.getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let html = '';
    for (let i = 0; i < startOffset; i++) html += '<div class="calendar-day-empty"></div>';

    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(year, month, d);
        const dateStr = formatDate(date);
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
        const hasSlots = getAvailabilityForDate(dayName, date).length > 0;
        const bookedCount = bookedSlots.filter(s => s.date === dateStr).length;
        const totalSlots = getAvailabilityForDate(dayName, date).length;
        const isAvailable = hasSlots && (totalSlots === 0 || bookedCount < totalSlots);
        const isPast = date < today;
        const isSelected = selectedDate && formatDate(selectedDate) === dateStr;

        let cls = 'calendar-day';
        if (isPast) cls += ' past';
        else if (!isAvailable) cls += ' unavailable';
        else cls += ' available';
        if (isSelected) cls += ' selected';

        html += `<div class="${cls}" data-date="${dateStr}" ${isPast || !isAvailable ? '' : 'tabindex="0" role="button"'}><span>${d}</span></div>`;
    }

    daysEl.innerHTML = html;

    daysEl.querySelectorAll('.calendar-day.available').forEach(el => {
        el.addEventListener('click', () => {
            selectedDate = new Date(el.dataset.date);
            selectedTime = null;
            daysEl.querySelectorAll('.calendar-day').forEach(c => c.classList.remove('selected'));
            el.classList.add('selected');
            renderTimeSlots(selectedDate);
            updateBookingButton();
        });
    });
}

function renderTimeSlots(date) {
    const grid = document.getElementById('time-slots-grid');
    if (!grid) return;

    if (!date) {
        grid.innerHTML = `<p class="time-slots-hint">${tt('booking.selectDateFromCalendar', 'Select a date from the calendar')}</p>`;
        return;
    }

    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
    let times = getAvailabilityForDate(dayName, date);
    const dateStr = formatDate(date);
    times = times.filter(t => !bookedSlots.some(s => s.date === dateStr && s.time === t));

    if (times.length === 0) {
        grid.innerHTML = `<p class="time-slots-hint">${tt('booking.noTimesThisDay', 'No available times on this day')}</p>`;
        return;
    }

    grid.innerHTML = times.map(time => {
        const isSelected = selectedTime === time;
        return `<button type="button" class="time-slot-btn ${isSelected ? 'selected' : ''}" data-time="${time}">${time}</button>`;
    }).join('');

    grid.querySelectorAll('.time-slot-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedTime = btn.dataset.time;
            grid.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            updateBookingButton();
        });
    });
}

function setupCalendarNav() {
    const prevBtn = document.getElementById('calendar-prev');
    const nextBtn = document.getElementById('calendar-next');
    const today = new Date();
    today.setDate(1);
    today.setHours(0, 0, 0, 0);

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            calendarCurrentMonth = new Date(calendarCurrentMonth.getFullYear(), calendarCurrentMonth.getMonth() - 1, 1);
            renderCalendar();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            calendarCurrentMonth = new Date(calendarCurrentMonth.getFullYear(), calendarCurrentMonth.getMonth() + 1, 1);
            renderCalendar();
        });
    }
}

function getAvailabilityForDate(dayName, date) {
    if (!selectedTherapist) return [];
    const avail = (selectedTherapist.availability || []).find(a => a.day === dayName);
    if (!avail || !avail.times) return [];

    const today = new Date();
    if (formatDate(date) === formatDate(today)) {
        const [ch, cm] = [today.getHours(), today.getMinutes()];
        return (avail.times || []).filter(t => {
            const [h, m] = t.split(':').map(Number);
            return h > ch || (h === ch && m > cm);
        });
    }
    return avail.times || [];
}

function setupBookingButton() {
    const btn = document.getElementById('book-session-btn');
    if (!btn) return;
    btn.disabled = !(selectedDate && selectedTime);
    if (selectedDate && selectedTime) {
        const dateStr = selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const sessionLabel = selectedSessionType === 'online' ? tt('booking.online', 'online') : tt('booking.inPerson', 'in-person');
        btn.textContent = typeof tParam === 'function'
            ? tParam('booking.bookAt', { sessionType: sessionLabel, date: dateStr, time: selectedTime })
            : `Book ${sessionLabel} — ${dateStr} at ${selectedTime}`;
    } else {
        btn.textContent = tt('booking.selectDateTime', 'Select date and time');
    }
    btn.onclick = () => handleBooking();
}

function updateBookingButton() {
    const btn = document.getElementById('book-session-btn');
    if (btn) {
        btn.disabled = !(selectedDate && selectedTime);
        if (selectedDate && selectedTime) {
            const dateStr = selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            const sessionLabel = selectedSessionType === 'online' ? tt('booking.online', 'online') : tt('booking.inPerson', 'in-person');
            btn.textContent = typeof tParam === 'function'
                ? tParam('booking.bookAt', { sessionType: sessionLabel, date: dateStr, time: selectedTime })
                : `Book ${sessionLabel} — ${dateStr} at ${selectedTime}`;
        } else {
            btn.textContent = tt('booking.selectDateTime', 'Select date and time');
        }
    }
}

async function handleBooking() {
    if (!selectedDate || !selectedTime || !selectedTherapist) {
        alert(tt('booking.selectDateTimeAlert', 'Please select a date and time'));
        return;
    }

    const bookBtn = document.getElementById('book-session-btn');
    if (bookBtn) {
        bookBtn.disabled = true;
        bookBtn.textContent = tt('booking.booking', 'Booking...');
    }

    const dateStr = formatDate(selectedDate);
    if (bookedSlots.some(s => s.date === dateStr && s.time === selectedTime)) {
        alert(tt('booking.slotJustBooked', 'This time slot was just booked. Please select another.'));
        if (bookBtn) {
            bookBtn.disabled = false;
            updateBookingButton();
        }
        return;
    }

    const bookings = await DataManager.getBookings();
    const isFirstSession = !bookings.some(b => b.therapistId === selectedTherapist.id);
    let initialInfo = null;
    if (isFirstSession && typeof UserDataAPI !== 'undefined') {
        try {
            const codeMsg = await UserDataAPI.getAiCodeMessage();
            initialInfo = codeMsg ? codeMsg.psychologistInfo : null;
        } catch (e) {}
    }

    const isOnline = selectedSessionType === 'online';
    const officeAddress = selectedTherapist.officeAddress || DEFAULT_OFFICE_ADDRESS;

    const booking = {
        id: DataManager.generateId(),
        therapistId: selectedTherapist.id,
        therapistName: selectedTherapist.name,
        therapistPhoto: selectedTherapist.photo,
        date: dateStr,
        time: selectedTime,
        sessionType: selectedSessionType,
        isOnline,
        meetingLink: isOnline ? `https://meet.more.com/session/${DataManager.generateId()}` : null,
        officeAddress: isOnline ? null : officeAddress,
        type: 'initial',
        status: 'upcoming',
        isFirstSession,
        initialInfo: initialInfo || undefined
    };

    try {
        const profile = await DataManager.getUserProfile();
        const patientName = profile ? (profile.name || profile.email || tt('booking.patient', 'Patient')) : tt('booking.patient', 'Patient');
        await Promise.all([
            UserDataAPI.saveBooking(booking),
            UserDataAPI.addBookingToPsychologist(selectedTherapist.id, booking, patientName)
        ]);
        bookedSlots.push({ date: dateStr, time: selectedTime });
        window.location.href = 'dashboard.html';
    } catch (e) {
        const msg = (e.data && e.data.error) || e.message || tt('booking.failed', 'Booking failed');
        alert(msg);
        if (bookBtn) {
            bookBtn.disabled = false;
            updateBookingButton();
        }
    }
}

function formatDate(date) {
    const d = date instanceof Date ? date : new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBooking);
} else {
    initBooking();
}

window.addEventListener('i18n-updated', () => {
    renderTherapistProfile();
    renderSessionTypeSelector();
    renderCalendar();
    renderTimeSlots(selectedDate);
    updateBookingButton();
});
