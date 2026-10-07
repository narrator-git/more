// Database module for more - SQLite database operations
const Database = require('better-sqlite3');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'more.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
function initDatabase() {
    // Users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Sessions table (for user auth tokens)
    db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // User profiles table
    db.exec(`
        CREATE TABLE IF NOT EXISTS user_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            profile_json TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Conversations table
    db.exec(`
        CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            conversation_id TEXT UNIQUE NOT NULL,
            messages_json TEXT NOT NULL,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Bookings table
    db.exec(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            client_booking_id TEXT UNIQUE,
            booking_json TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // AI code messages (therapist matching parameters)
    db.exec(`
        CREATE TABLE IF NOT EXISTS ai_code_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            code_message_json TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Psychologist accounts table
    db.exec(`
        CREATE TABLE IF NOT EXISTS psychologist_accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            therapist_id TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            therapist_json TEXT NOT NULL,
            patients_json TEXT DEFAULT '[]',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Psychologist sessions table
    db.exec(`
        CREATE TABLE IF NOT EXISTS psychologist_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            psychologist_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME,
            FOREIGN KEY (psychologist_id) REFERENCES psychologist_accounts(id) ON DELETE CASCADE
        )
    `);

    // User notes for psychologist (things to discuss - stored even without booking)
    db.exec(`
        CREATE TABLE IF NOT EXISTS user_therapist_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            notes_text TEXT NOT NULL,
            therapist_id TEXT,
            booking_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Create indexes
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
        CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_psychologist_sessions_token ON psychologist_sessions(token);
        CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
        CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_therapist_notes_user ON user_therapist_notes(user_id);
    `);
}

// Hash password
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// User functions
function createUser(email, password) {
    const passwordHash = hashPassword(password);
    const stmt = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
    const result = stmt.run(email, passwordHash);
    return result.lastInsertRowid;
}

function getUserByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
}

function verifyUserPassword(email, password) {
    const user = getUserByEmail(email);
    if (!user) return null;
    const passwordHash = hashPassword(password);
    if (user.password_hash === passwordHash) {
        return user;
    }
    return null;
}

function createSession(userId, token) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const stmt = db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)');
    stmt.run(userId, token, expiresAt.toISOString());
}

function getUserIdFromToken(token) {
    const stmt = db.prepare('SELECT user_id FROM sessions WHERE token = ? AND (expires_at IS NULL OR expires_at > datetime(\'now\'))');
    const result = stmt.get(token);
    return result ? result.user_id : null;
}

function deleteSession(token) {
    const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
    stmt.run(token);
}

// User profile functions
function saveUserProfile(userId, profile) {
    const profileJson = JSON.stringify(profile);
    const stmt = db.prepare('INSERT OR REPLACE INTO user_profiles (user_id, profile_json, updated_at) VALUES (?, ?, datetime(\'now\'))');
    stmt.run(userId, profileJson);
}

function getUserProfile(userId) {
    const stmt = db.prepare('SELECT profile_json FROM user_profiles WHERE user_id = ?');
    const result = stmt.get(userId);
    return result ? JSON.parse(result.profile_json) : null;
}

// Conversation functions
function saveConversation(userId, conversationId, messages) {
    const messagesJson = JSON.stringify(messages);
    const stmt = db.prepare('INSERT OR REPLACE INTO conversations (user_id, conversation_id, messages_json, updated_at) VALUES (?, ?, ?, datetime(\'now\'))');
    stmt.run(userId, conversationId, messagesJson);
}

function getConversation(userId, conversationId) {
    const stmt = db.prepare('SELECT messages_json, conversation_id FROM conversations WHERE user_id = ? AND conversation_id = ?');
    const result = stmt.get(userId, conversationId);
    if (result) {
        return {
            messages: JSON.parse(result.messages_json),
            conversationId: result.conversation_id
        };
    }
    return null;
}

// Booking functions
function saveBooking(userId, booking) {
    const bookingJson = JSON.stringify(booking);
    const clientBookingId = booking.id || `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const stmt = db.prepare('INSERT INTO bookings (user_id, client_booking_id, booking_json) VALUES (?, ?, ?)');
    stmt.run(userId, clientBookingId, bookingJson);
    return clientBookingId;
}

function getBookings(userId) {
    const stmt = db.prepare('SELECT booking_json FROM bookings WHERE user_id = ? ORDER BY created_at DESC');
    const results = stmt.all(userId);
    return results.map(r => JSON.parse(r.booking_json));
}

// Get all booked slots for a therapist (across all users) - for conflict prevention
function getBookedSlotsForTherapist(therapistId) {
    const stmt = db.prepare('SELECT booking_json FROM bookings');
    const results = stmt.all();
    const slots = [];
    for (const row of results) {
        try {
            const b = JSON.parse(row.booking_json);
            if (b.therapistId === therapistId && (b.status === 'upcoming' || !b.status)) {
                slots.push({ date: b.date, time: b.time });
            }
        } catch (e) { /* skip */ }
    }
    return slots;
}

function updateBooking(userId, bookingId, updates) {
    const bookings = getBookings(userId);
    const booking = bookings.find(b => String(b.id) === String(bookingId));
    if (!booking) return false;
    
    const updatedBooking = { ...booking, ...updates };
    const bookingJson = JSON.stringify(updatedBooking);
    const stmt = db.prepare('UPDATE bookings SET booking_json = ? WHERE user_id = ? AND client_booking_id = ?');
    stmt.run(bookingJson, userId, bookingId);
    return true;
}

// AI code message functions
function saveAiCodeMessage(userId, codeMessage) {
    const codeMessageJson = JSON.stringify(codeMessage);
    const stmt = db.prepare('INSERT OR REPLACE INTO ai_code_messages (user_id, code_message_json, created_at) VALUES (?, ?, datetime(\'now\'))');
    stmt.run(userId, codeMessageJson);
}

function getAiCodeMessage(userId) {
    const stmt = db.prepare('SELECT code_message_json FROM ai_code_messages WHERE user_id = ?');
    const result = stmt.get(userId);
    return result ? JSON.parse(result.code_message_json) : null;
}

// Psychologist functions
function createPsychologistAccount(therapistId, email, password, therapistData) {
    const passwordHash = hashPassword(password);
    const therapistJson = JSON.stringify(therapistData);
    const stmt = db.prepare('INSERT INTO psychologist_accounts (therapist_id, email, password_hash, therapist_json) VALUES (?, ?, ?, ?)');
    const result = stmt.run(therapistId, email, passwordHash, therapistJson);
    return result.lastInsertRowid;
}

function getPsychologistByEmail(email) {
    const stmt = db.prepare('SELECT * FROM psychologist_accounts WHERE email = ?');
    return stmt.get(email);
}

function verifyPsychologistPassword(email, password) {
    const psych = getPsychologistByEmail(email);
    if (!psych) return null;
    const passwordHash = hashPassword(password);
    if (psych.password_hash === passwordHash) {
        return psych;
    }
    return null;
}

function createPsychologistSession(psychologistId, token) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const stmt = db.prepare('INSERT INTO psychologist_sessions (psychologist_id, token, expires_at) VALUES (?, ?, ?)');
    stmt.run(psychologistId, token, expiresAt.toISOString());
}

function getPsychologistIdFromToken(token) {
    const stmt = db.prepare('SELECT psychologist_id FROM psychologist_sessions WHERE token = ? AND (expires_at IS NULL OR expires_at > datetime(\'now\'))');
    const result = stmt.get(token);
    return result ? result.psychologist_id : null;
}

function deletePsychologistSession(token) {
    const stmt = db.prepare('DELETE FROM psychologist_sessions WHERE token = ?');
    stmt.run(token);
}

function getPsychologistById(psychologistId) {
    const stmt = db.prepare('SELECT * FROM psychologist_accounts WHERE id = ?');
    return stmt.get(psychologistId);
}

function addBookingToPsychologist(therapistId, booking, patientName) {
    const stmt = db.prepare('SELECT patients_json FROM psychologist_accounts WHERE therapist_id = ?');
    const result = stmt.get(therapistId);
    if (!result) return false;
    
    let patients = JSON.parse(result.patients_json || '[]');
    const existingIndex = patients.findIndex(p => p.bookingId === booking.id || (p.patientName === patientName && p.date === booking.date && p.time === booking.time));
    
    const patientData = {
        patientName,
        bookingId: booking.id,
        date: booking.date,
        time: booking.time,
        status: booking.status || 'upcoming',
        initialInfo: booking.initialInfo || null
    };
    
    if (existingIndex >= 0) {
        patients[existingIndex] = { ...patients[existingIndex], ...patientData };
    } else {
        patients.push(patientData);
    }
    
    const updateStmt = db.prepare('UPDATE psychologist_accounts SET patients_json = ? WHERE therapist_id = ?');
    updateStmt.run(JSON.stringify(patients), therapistId);
    return true;
}

// Update psychologist's patient when user cancels a booking
function updatePsychologistBookingStatus(therapistId, bookingId, status) {
    const stmt = db.prepare('SELECT patients_json FROM psychologist_accounts WHERE therapist_id = ?');
    const result = stmt.get(therapistId);
    if (!result) return false;
    
    let patients = JSON.parse(result.patients_json || '[]');
    const idx = patients.findIndex(p => p.bookingId === bookingId);
    if (idx < 0) return false;
    
    patients[idx].status = status;
    db.prepare('UPDATE psychologist_accounts SET patients_json = ? WHERE therapist_id = ?').run(JSON.stringify(patients), therapistId);
    return true;
}

function getPsychologistPatients(therapistId) {
    const stmt = db.prepare('SELECT patients_json FROM psychologist_accounts WHERE therapist_id = ?');
    const result = stmt.get(therapistId);
    return result ? JSON.parse(result.patients_json || '[]') : [];
}

// Delete user and all associated data
function deleteUserAccount(userId) {
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM user_profiles WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM conversations WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM bookings WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM ai_code_messages WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM user_therapist_notes WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);
}

// User therapist notes (things to discuss with therapist - single latest per user)
function saveOrUpdateUserTherapistNotes(userId, notes, therapistId = null, bookingId = null) {
    const existing = db.prepare('SELECT id FROM user_therapist_notes WHERE user_id = ? LIMIT 1').get(userId);
    if (existing) {
        db.prepare(`
            UPDATE user_therapist_notes SET notes_text = ?, therapist_id = ?, booking_id = ?, updated_at = datetime('now') WHERE id = ?
        `).run(notes, therapistId || null, bookingId || null, existing.id);
    } else {
        db.prepare(`
            INSERT INTO user_therapist_notes (user_id, notes_text, therapist_id, booking_id, updated_at)
            VALUES (?, ?, ?, ?, datetime('now'))
        `).run(userId, notes, therapistId || null, bookingId || null);
    }
}

function getUserTherapistNotes(userId) {
    const stmt = db.prepare('SELECT * FROM user_therapist_notes WHERE user_id = ? ORDER BY updated_at DESC');
    return stmt.all(userId);
}

function getLatestUserTherapistNotes(userId) {
    const result = db.prepare('SELECT notes_text FROM user_therapist_notes WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1').get(userId);
    return result ? result.notes_text : null;
}

// Initialize database on module load
initDatabase();

module.exports = {
    db,
    deleteUserAccount,
    getBookedSlotsForTherapist,
    updatePsychologistBookingStatus,
    saveOrUpdateUserTherapistNotes,
    getUserTherapistNotes,
    getLatestUserTherapistNotes,
    createUser,
    getUserByEmail,
    verifyUserPassword,
    createSession,
    getUserIdFromToken,
    deleteSession,
    saveUserProfile,
    getUserProfile,
    saveConversation,
    getConversation,
    saveBooking,
    getBookings,
    updateBooking,
    saveAiCodeMessage,
    getAiCodeMessage,
    createPsychologistAccount,
    getPsychologistByEmail,
    verifyPsychologistPassword,
    createPsychologistSession,
    getPsychologistIdFromToken,
    deletePsychologistSession,
    getPsychologistById,
    addBookingToPsychologist,
    getPsychologistPatients,
    hashPassword
};
