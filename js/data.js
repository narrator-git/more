// Data management utilities and mock data

// Bundled therapist photos (run: node scripts/fetch-therapist-photos.js)
const NUM_HEADSHOTS = 30;
function _headshot(i) {
    return `/images/therapists/${i % NUM_HEADSHOTS}.jpg`;
}

/**
 * Image URL for therapist cards. Only returns local paths or ui-avatars fallback — never external image hosts.
 */
function withSiteBase(path) {
    if (typeof window !== 'undefined' && typeof window.moreAsset === 'function') return window.moreAsset(path);
    return path;
}

function therapistPhotoUrl(therapist) {
    if (!therapist) {
        return 'https://ui-avatars.com/api/?name=T&background=6ab12f&color=fff&size=400';
    }
    const p = typeof therapist.photo === 'string' ? therapist.photo.trim() : '';
    if (p && p.startsWith('/') && !p.includes('..')) {
        return withSiteBase(p);
    }
    const n = parseInt(String(therapist.id || therapist.therapistId || '0').replace(/\D/g, ''), 10) || 0;
    return withSiteBase(_headshot(Math.max(0, n - 1)));
}

/** Use in HTML attribute values — unescaped & in URLs breaks <img src="...&..."> */
function escapeHtmlAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

if (typeof window !== 'undefined') {
    window.therapistPhotoUrl = therapistPhotoUrl;
    window.escapeHtmlAttr = escapeHtmlAttr;
}

// Mock therapist data
const mockTherapists = [
    {
        id: 't1',
        name: 'Dr. Sarah Johnson',
        photo: _headshot(0),
        specialization: ['Anxiety', 'Depression', 'Stress'],
        experience: 8,
        rating: 4.8,
        price: 120,
        bio: 'Licensed clinical psychologist with 8 years of experience specializing in anxiety and mood disorders. I use evidence-based approaches including CBT and mindfulness.',
        languages: ['English', 'Spanish'],
        availability: [
            { day: 'Monday', times: ['09:00', '10:00', '14:00', '15:00', '16:00'] },
            { day: 'Wednesday', times: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
            { day: 'Friday', times: ['10:00', '11:00', '14:00', '15:00'] }
        ]
    },
    {
        id: 't2',
        name: 'Dr. Michael Chen',
        photo: _headshot(1),
        specialization: ['Relationships', 'Family', 'Trauma'],
        experience: 12,
        rating: 4.9,
        price: 150,
        bio: 'Experienced therapist focusing on relationship dynamics and family systems. I help individuals and couples navigate complex interpersonal challenges.',
        languages: ['English', 'Mandarin'],
        availability: [
            { day: 'Tuesday', times: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'] },
            { day: 'Thursday', times: ['09:00', '10:00', '14:00', '15:00', '16:00'] },
            { day: 'Saturday', times: ['10:00', '11:00', '12:00'] }
        ]
    },
    {
        id: 't3',
        name: 'Dr. Emily Rodriguez',
        photo: _headshot(2),
        specialization: ['Work', 'Stress', 'Anxiety'],
        experience: 6,
        rating: 4.7,
        price: 110,
        bio: 'Career-focused therapist helping professionals manage work-related stress and achieve work-life balance. Specialized in workplace anxiety and burnout.',
        languages: ['English', 'Spanish', 'Portuguese'],
        availability: [
            { day: 'Monday', times: ['08:00', '09:00', '13:00', '14:00', '15:00'] },
            { day: 'Wednesday', times: ['08:00', '09:00', '13:00', '14:00'] },
            { day: 'Friday', times: ['09:00', '10:00', '11:00', '14:00'] }
        ]
    },
    {
        id: 't4',
        name: 'Dr. James Wilson',
        photo: _headshot(3),
        specialization: ['Depression', 'Trauma', 'Anxiety'],
        experience: 15,
        rating: 4.9,
        price: 160,
        bio: 'Senior psychologist with extensive experience in trauma-informed care and depression treatment. I provide a safe, supportive environment for healing.',
        languages: ['English'],
        availability: [
            { day: 'Tuesday', times: ['10:00', '11:00', '14:00', '15:00', '16:00'] },
            { day: 'Thursday', times: ['10:00', '11:00', '14:00', '15:00'] },
            { day: 'Saturday', times: ['09:00', '10:00', '11:00'] }
        ]
    },
    {
        id: 't5',
        name: 'Dr. Lisa Thompson',
        photo: _headshot(4),
        specialization: ['Relationships', 'Family', 'Work'],
        experience: 10,
        rating: 4.8,
        price: 130,
        bio: 'Marriage and family therapist helping individuals and families build stronger connections and resolve conflicts effectively.',
        languages: ['English', 'French'],
        availability: [
            { day: 'Monday', times: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
            { day: 'Wednesday', times: ['09:00', '10:00', '14:00', '15:00', '16:00'] },
            { day: 'Friday', times: ['10:00', '11:00', '14:00'] }
        ]
    },
    {
        id: 't6',
        name: 'Dr. Robert Martinez',
        photo: _headshot(5),
        specialization: ['Anxiety', 'Stress', 'Work'],
        experience: 7,
        rating: 4.6,
        price: 115,
        bio: 'Cognitive-behavioral therapist specializing in anxiety disorders and stress management. I help clients develop practical coping strategies.',
        languages: ['English', 'Spanish'],
        availability: [
            { day: 'Tuesday', times: ['09:00', '10:00', '11:00', '13:00', '14:00'] },
            { day: 'Thursday', times: ['09:00', '10:00', '14:00', '15:00'] },
            { day: 'Saturday', times: ['10:00', '11:00', '12:00'] }
        ]
    },
    {
        id: 't7',
        name: 'Dr. Amanda White',
        photo: _headshot(6),
        specialization: ['Depression', 'Anxiety', 'Trauma'],
        experience: 9,
        rating: 4.7,
        price: 125,
        bio: 'Compassionate therapist with expertise in treating depression and anxiety. I use an integrative approach tailored to each client\'s unique needs.',
        languages: ['English'],
        availability: [
            { day: 'Monday', times: ['10:00', '11:00', '14:00', '15:00', '16:00'] },
            { day: 'Wednesday', times: ['10:00', '11:00', '14:00', '15:00'] },
            { day: 'Friday', times: ['09:00', '10:00', '11:00', '14:00'] }
        ]
    },
    {
        id: 't8',
        name: 'Dr. David Kim',
        photo: _headshot(7),
        specialization: ['Work', 'Stress', 'Relationships'],
        experience: 11,
        rating: 4.8,
        price: 140,
        bio: 'Executive coach and therapist helping professionals navigate career challenges and improve workplace relationships.',
        languages: ['English', 'Korean'],
        availability: [
            { day: 'Tuesday', times: ['08:00', '09:00', '10:00', '13:00', '14:00'] },
            { day: 'Thursday', times: ['08:00', '09:00', '13:00', '14:00', '15:00'] },
            { day: 'Saturday', times: ['09:00', '10:00'] }
        ]
    },
    {
        id: 't9',
        name: 'Dr. Jennifer Brown',
        photo: _headshot(8),
        specialization: ['Family', 'Relationships', 'Trauma'],
        experience: 13,
        rating: 4.9,
        price: 145,
        bio: 'Family systems therapist with deep expertise in trauma recovery and relationship healing. I create a nurturing space for transformation.',
        languages: ['English'],
        availability: [
            { day: 'Monday', times: ['09:00', '10:00', '11:00', '14:00'] },
            { day: 'Wednesday', times: ['09:00', '10:00', '14:00', '15:00', '16:00'] },
            { day: 'Friday', times: ['10:00', '11:00', '14:00', '15:00'] }
        ]
    },
    {
        id: 't10',
        name: 'Dr. Christopher Lee',
        photo: _headshot(9),
        specialization: ['Anxiety', 'Depression', 'Work'],
        experience: 5,
        rating: 4.5,
        price: 100,
        bio: 'Young, energetic therapist specializing in helping millennials and Gen Z navigate modern life challenges, anxiety, and career transitions.',
        languages: ['English', 'Mandarin'],
        availability: [
            { day: 'Tuesday', times: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
            { day: 'Thursday', times: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
            { day: 'Saturday', times: ['09:00', '10:00', '11:00', '12:00'] }
        ]
    }
];

// Generate diverse therapists (100-150 total)
function generateDiverseTherapists() {
    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage', 'River', 'Blake', 'Cameron', 'Dakota', 'Emery', 'Finley', 'Hayden', 'Indigo', 'Jules', 'Kai', 'Logan', 'Marley', 'Noah', 'Ocean', 'Parker', 'Reese', 'Skyler', 'Tatum', 'Winter', 'Zephyr', 'Adrian', 'Blair', 'Cary', 'Dale', 'Eden', 'Gale', 'Harley', 'Ivy', 'Jade', 'Kendall', 'Lane', 'Marlowe', 'Nico', 'Orion', 'Phoenix', 'Quinn', 'Rowan', 'Sloane', 'Tierney', 'Vale', 'Wren'];
    const lastNames = ['Anderson', 'Brown', 'Chen', 'Davis', 'Evans', 'Foster', 'Garcia', 'Harris', 'Ito', 'Johnson', 'Kim', 'Lee', 'Martinez', 'Nguyen', 'O\'Connor', 'Patel', 'Quinn', 'Rodriguez', 'Singh', 'Thompson', 'Ueda', 'Vargas', 'Wang', 'Xu', 'Yamamoto', 'Zhang', 'Adams', 'Baker', 'Clark', 'Diaz', 'Edwards', 'Fisher', 'Green', 'Hall', 'Ibrahim', 'Jackson', 'Kumar', 'Lewis', 'Moore', 'Nelson', 'Ortiz', 'Perez', 'Roberts', 'Scott', 'Taylor', 'White', 'Young', 'Zhou', 'Ahmed', 'Bennett'];
    
    const specializations = ['Anxiety', 'Depression', 'Stress', 'Relationships', 'Family', 'Trauma', 'Work', 'Grief', 'Addiction', 'Eating Disorders', 'PTSD', 'OCD', 'Bipolar', 'ADHD', 'Autism', 'Sleep', 'Anger', 'Self-Esteem', 'LGBTQ+', 'Couples', 'Teen', 'Elderly', 'Men\'s Issues', 'Women\'s Issues', 'Career', 'Life Transitions'];
    const languages = ['English', 'Spanish', 'Mandarin', 'Cantonese', 'French', 'German', 'Japanese', 'Korean', 'Portuguese', 'Hindi', 'Arabic', 'Russian', 'Italian', 'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish', 'Turkish'];
    const locations = ['los-angeles', 'new-york', 'chicago', 'houston', 'phoenix', 'philadelphia', 'san-antonio', 'san-diego', 'dallas', 'san-jose', 'austin', 'jacksonville', 'san-francisco', 'indianapolis', 'columbus', 'fort-worth', 'charlotte', 'seattle', 'denver', 'washington', 'boston', 'el-paso', 'detroit', 'nashville', 'portland', 'oklahoma-city', 'las-vegas', 'memphis', 'louisville', 'baltimore', 'milwaukee', 'albuquerque', 'tucson', 'fresno', 'sacramento', 'kansas-city', 'mesa', 'atlanta', 'omaha', 'colorado-springs', 'raleigh', 'virginia-beach', 'miami', 'oakland', 'minneapolis', 'tulsa', 'cleveland', 'wichita', 'arlington', 'hong-kong', 'london', 'toronto', 'sydney', 'singapore', 'tokyo', 'paris', 'berlin', 'amsterdam', 'dublin', 'vancouver', 'melbourne', 'auckland', 'zurich', 'stockholm', 'copenhagen', 'oslo', 'helsinki'];
    const therapyTypes = ['online', 'face-to-face', 'both'];
    const genders = ['male', 'female', 'non-binary'];
    
    const therapists = [];
    let idCounter = 11; // Start after t10
    
    // Generate 140 more therapists (total 150)
    for (let i = 0; i < 140; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `Dr. ${firstName} ${lastName}`;
        const gender = genders[Math.floor(Math.random() * genders.length)];
        const age = 28 + Math.floor(Math.random() * 35); // 28-63
        const location = locations[Math.floor(Math.random() * locations.length)];
        const therapyType = therapyTypes[Math.floor(Math.random() * therapyTypes.length)];
        const experience = 3 + Math.floor(Math.random() * 20); // 3-23 years
        const experienceLevel = experience < 5 ? 'junior' : experience < 10 ? 'mid' : 'senior';
        const rating = 4.0 + Math.random() * 1.0; // 4.0-5.0
        const price = 80 + Math.floor(Math.random() * 9) * 10; // 80-160 in increments of 10
        
        // Random specializations (1-4)
        const numSpecs = 1 + Math.floor(Math.random() * 4);
        const therapistSpecs = [];
        const availableSpecs = [...specializations];
        for (let j = 0; j < numSpecs; j++) {
            const idx = Math.floor(Math.random() * availableSpecs.length);
            therapistSpecs.push(availableSpecs.splice(idx, 1)[0]);
        }
        
        // Random languages (1-3)
        const numLangs = 1 + Math.floor(Math.random() * 3);
        const therapistLangs = [];
        const availableLangs = [...languages];
        for (let j = 0; j < numLangs; j++) {
            const idx = Math.floor(Math.random() * availableLangs.length);
            therapistLangs.push(availableLangs.splice(idx, 1)[0]);
        }
        
        // Generate availability (2-4 days per week)
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const numDays = 2 + Math.floor(Math.random() * 3);
        const availableDays = [];
        const availableDayNames = [...days];
        for (let j = 0; j < numDays; j++) {
            const idx = Math.floor(Math.random() * availableDayNames.length);
            availableDays.push(availableDayNames.splice(idx, 1)[0]);
        }
        
        const availability = availableDays.map(day => {
            const numSlots = 3 + Math.floor(Math.random() * 4); // 3-6 slots
            const times = [];
            const startHour = 8 + Math.floor(Math.random() * 4); // 8-11
            for (let k = 0; k < numSlots; k++) {
                const hour = startHour + k;
                if (hour < 18) {
                    times.push(`${String(hour).padStart(2, '0')}:00`);
                }
            }
            return { day, times };
        });
        
        // Generate bio
        const bio = `Licensed ${experienceLevel} therapist with ${experience} years of experience specializing in ${therapistSpecs.join(', ')}. I provide ${therapyType === 'online' ? 'online' : therapyType === 'face-to-face' ? 'in-person' : 'both online and in-person'} therapy sessions.`;
        
        const photo = _headshot(idCounter + i);
        
        therapists.push({
            id: `t${idCounter++}`,
            name,
            photo,
            gender,
            age,
            location,
            therapyType,
            specialization: therapistSpecs,
            languages: therapistLangs,
            experience,
            experienceLevel,
            rating: Math.round(rating * 10) / 10,
            price,
            bio,
            availability
        });
    }
    
    return therapists;
}

// Append generated therapists to mockTherapists
const generatedTherapists = generateDiverseTherapists();
mockTherapists.push(...generatedTherapists);

// Data storage keys
const STORAGE_KEYS = {
    USER_PROFILE: 'userProfile',
    AI_CONVERSATION: 'aiConversation',
    BOOKINGS: 'bookings',
    SELECTED_THERAPIST: 'selectedTherapist'
};

// Server-only: no localStorage for user data
function _isLoggedIn() {
    return typeof getSessionToken === 'function' && getSessionToken() && typeof UserDataAPI !== 'undefined';
}

const DataManager = {
    async getUserProfile() {
        if (!_isLoggedIn()) return null;
        try {
            return await UserDataAPI.getProfile();
        } catch (e) {
            console.warn('getProfile failed:', e);
            return null;
        }
    },

    async saveUserProfile(profile) {
        if (!_isLoggedIn()) throw new Error('Must be logged in to save profile');
        await UserDataAPI.saveProfile(profile);
    },

    async hasCompletedOnboarding() {
        const profile = await this.getUserProfile();
        return profile !== null;
    },

    async getConversation() {
        if (!_isLoggedIn()) return { messages: [], conversationId: null };
        try {
            const r = await UserDataAPI.getConversation();
            return { messages: r.messages || [], conversationId: r.conversationId || null };
        } catch (e) {
            console.warn('getConversation failed:', e);
            return { messages: [], conversationId: null };
        }
    },

    async saveConversation(messages, conversationId) {
        if (!_isLoggedIn()) throw new Error('Must be logged in');
        await UserDataAPI.saveConversation(messages, conversationId);
    },

    async addMessage(sender, message, conversationId) {
        const { messages } = await this.getConversation();
        const conversation = [...messages];
        conversation.push({
            sender,
            message,
            timestamp: new Date().toISOString()
        });
        await this.saveConversation(conversation, conversationId);
        return conversation;
    },

    async getBookings() {
        if (!_isLoggedIn()) return [];
        try {
            return await UserDataAPI.getBookings();
        } catch (e) {
            console.warn('getBookings failed:', e);
            return [];
        }
    },

    async getUpcomingBookings() {
        const bookings = await this.getBookings();
        const now = new Date();
        return bookings.filter(booking => {
            const bookingDate = new Date(`${booking.date}T${booking.time}`);
            return bookingDate > now && booking.status === 'upcoming';
        }).sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });
    },

    // Therapists
    getAllTherapists() {
        return mockTherapists;
    },

    getTherapistById(id) {
        return mockTherapists.find(t => t.id === id);
    },

    // Navigation helpers
    async redirectIfNotOnboarded() {
        if (!(await this.hasCompletedOnboarding())) {
            window.location.href = 'onboarding.html';
        }
    },

    async redirectIfOnboarded() {
        if (await this.hasCompletedOnboarding()) {
            const { messages } = await this.getConversation();
            if (messages.length > 0) {
                window.location.href = 'dashboard.html';
            } else {
                window.location.href = 'ai-chat.html';
            }
        }
    },

    // Generate UUID
    generateId() {
        return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    },

    // Session Notes
    async saveSessionNotes(bookingId, notes) {
        if (!_isLoggedIn() || typeof UserDataAPI === 'undefined') {
            throw new Error('Not logged in');
        }
        const notesDate = new Date().toISOString();
        await UserDataAPI.updateBooking(bookingId, { notes, notesDate });
    },

    async getSessionNotes(bookingId) {
        const bookings = await this.getBookings();
        const booking = bookings.find(b => b.id === bookingId);
        return booking ? booking.notes : null;
    },

    async saveNotesForTherapist(bookingId, notes, therapistId = null) {
        if (!_isLoggedIn() || typeof UserDataAPI === 'undefined') throw new Error('Not logged in');
        await UserDataAPI.saveTherapistNotes(notes, bookingId, therapistId);
        if (bookingId) {
            try {
                await UserDataAPI.updateBooking(bookingId, { notesForTherapist: notes });
            } catch (_) {
                // Booking update may fail; notes are saved in therapist_notes table
            }
        }
    },

    async getTherapistNotes() {
        if (!_isLoggedIn() || typeof UserDataAPI === 'undefined') return null;
        try {
            return await UserDataAPI.getTherapistNotes();
        } catch (e) {
            return null;
        }
    },

    // Session Feedback
    async saveSessionFeedback(bookingId, feedback) {
        if (!_isLoggedIn() || typeof UserDataAPI === 'undefined') {
            throw new Error('Not logged in');
        }
        await UserDataAPI.updateBooking(bookingId, { feedback });
    },

    // Update Session Status
    async updateSessionStatus(bookingId, status) {
        if (!_isLoggedIn() || typeof UserDataAPI === 'undefined') {
            throw new Error('Not logged in');
        }
        await UserDataAPI.updateBooking(bookingId, { status });
    },

    // Check and update all session statuses
    async checkAndUpdateSessionStatuses() {
        const bookings = await this.getBookings();
        const now = new Date();
        const updates = [];
        bookings.forEach(booking => {
            const bookingDate = new Date(`${booking.date}T${booking.time}`);
            if (booking.status === 'upcoming' && bookingDate <= now) {
                updates.push(this.updateSessionStatus(booking.id, 'completed'));
            }
        });
        if (updates.length > 0) {
            await Promise.all(updates);
        }
    },

    // Clear all data (now just clears session tokens and UI state)
    clearAllData() {
        // Only clear non-sensitive UI state
        localStorage.removeItem(STORAGE_KEYS.SELECTED_THERAPIST);
        localStorage.removeItem('recommendedTherapists');
        // Note: user data is on server, so no need to clear it here
    },

    // Therapy Context for AI Support
    async hasActiveTherapy() {
        const bookings = await this.getBookings();
        const now = new Date();
        return bookings.some(booking => {
            const bookingDate = new Date(`${booking.date}T${booking.time}`);
            return bookingDate > now && booking.status === 'upcoming';
        });
    },

    async getTherapyContext() {
        const bookings = await this.getBookings();
        const now = new Date();
        
        // Get active therapist (most recent booking)
        const activeBookings = bookings.filter(booking => {
            const bookingDate = new Date(`${booking.date}T${booking.time}`);
            return bookingDate > now && booking.status === 'upcoming';
        }).sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });

        if (activeBookings.length === 0) return null;

        const nextBooking = activeBookings[0];
        // Use booking's therapist info (from DB) - no mock fallback
        const therapist = { name: nextBooking.therapistName, id: nextBooking.therapistId };

        return {
            therapist: therapist,
            nextSession: nextBooking,
            totalSessions: bookings.filter(b => b.therapistId === nextBooking.therapistId).length
        };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mockTherapists, DataManager, STORAGE_KEYS };
}
