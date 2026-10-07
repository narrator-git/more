// Backend server for more AI agent
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const OpenAI = require('openai');
const crypto = require('crypto');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Increase payload size limit for large conversation histories
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Initialize OpenAI client only when a key is provided via the environment.
const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

function requireOpenAI(res) {
    if (openai) return true;
    res.status(503).json({ error: 'OPENAI_API_KEY is not configured' });
    return false;
}

// Store conversation contexts (in production, use a database)
const conversationContexts = new Map();

// Auth middleware
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.substring(7);
    const userId = db.getUserIdFromToken(token);
    if (!userId) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.userId = userId;
    next();
}

function requirePsychologistAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.substring(7);
    const psychologistId = db.getPsychologistIdFromToken(token);
    if (!psychologistId) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
    req.psychologistId = psychologistId;
    next();
}

// Bundled therapist photos in images/therapists/0.jpg..29.jpg
function therapistHeadshotFromTherapistId(therapistId) {
    const n = parseInt(String(therapistId).replace(/\D/g, ''), 10) || 0;
    const idx = Number.isFinite(n) ? Math.max(0, n - 1) % 30 : 0;
    return `/images/therapists/${idx}.jpg`;
}
function ensureTherapistPhoto(t, therapistId) {
    if (!t || typeof t !== 'object') return t;
    const p = typeof t.photo === 'string' ? t.photo.trim() : '';
    if (p && p.startsWith('/') && !p.includes('..')) {
        return t;
    }
    return { ...t, photo: therapistHeadshotFromTherapistId(therapistId) };
}

// System prompt for more AI agent
const SYSTEM_PROMPT = `You are "more AI", a compassionate and professional mental health support assistant. Your role is to:

1. Help users explore and understand their mental health concerns
2. Ask thoughtful, non-intrusive questions to better understand their situation
3. Provide empathetic support and validation
4. Gather enough information to help match them with appropriate therapists
5. Maintain a warm, understanding, and non-judgmental tone

Guidelines:
- Be empathetic and supportive
- Ask one question at a time to avoid overwhelming the user
- Focus on understanding their feelings, concerns, and what they're seeking help with
- Don't provide diagnoses or medical advice
- After gathering sufficient information (typically 5-8 exchanges), acknowledge that you have enough information to help them find a therapist
- Keep responses concise but warm (2-3 sentences typically)
- Use the user's onboarding information (age, concerns, previous therapy experience) to inform your questions

Remember: You're here to listen, understand, and help guide them toward professional help, not to replace therapy.`;

// Enhanced system prompt for therapist matching - based on standard therapy intake practices
const MATCHING_SYSTEM_PROMPT = `You are "more AI", an AI assistant that helps users find suitable therapists. You are NOT a therapist and must NEVER provide therapeutic advice, diagnosis, or treatment recommendations.

## SAFETY PROTOCOL (CRITICAL)
- NEVER give medical or mental health advice, diagnosis, or treatment suggestions
- NEVER minimize or dismiss concerns; validate and empathize instead
- If the user mentions self-harm, suicide, abuse, or crisis: respond with empathy, then immediately recommend they speak with a mental health professional or crisis helpline (e.g., "Please reach out to a crisis helpline or emergency services if you're in immediate distress")
- Keep responses supportive but neutral—you are a guide to finding help, not the help itself
- Do not interpret dreams, suggest medications, or advise on relationship decisions

## YOUR ROLE
1. Conduct an intake-style conversation to understand the user's needs
2. Ask questions that therapists typically ask during initial assessments
3. Use the user's onboarding info (age, concerns, etc.) to inform your questions
4. When you have gathered SUFFICIENT information per standard intake practices, output [MATCH_READY] with matching parameters

## STANDARD INTAKE AREAS (gather enough to cover these before matching)
Based on clinical intake practices, you need to understand:

**Presenting Issues:**
- What brings them to therapy (chief complaint)
- How long they've experienced this
- Severity/impact on daily life (work, relationships, sleep)
- What triggers or worsens symptoms; what helps

**Background:**
- Previous therapy experience (if any): what helped, what didn't
- Recent life changes or stressors
- Family/support network

**Preferences & Requirements:**
- Therapist gender preference (or none)
- Preferred format: online, in-person, or both
- Language requirements
- Location (if in-person)
- Experience level preference (if mentioned)

**Goals:**
- What they hope to achieve in therapy
- Any special concerns (cultural, spiritual, accessibility)

## WHEN TO MATCH
You have gathered ENOUGH information when you can answer: (1) What is the main concern? (2) What is the severity/context? (3) What are the user's preferences and constraints? (4) What would help the therapist prepare for the first session?

Typically this requires 5–10 exchanges. Do NOT match too early. Do NOT match after only 1–2 questions.

## OUTPUT FORMAT
When ready, FIRST write a short closing sentence to the user (e.g. "I'll match you with therapists based on these details."). THEN on the SAME line or next, output EXACTLY:
[MATCH_READY]
{"therapistParams":{...},"psychologistInfo":"..."}
[/MATCH_READY]

CRITICAL: The [MATCH_READY] block is extracted by the system and NEVER shown to the user. Only your text BEFORE it is shown. So end your user-facing message with a complete sentence, then append the block. Always include [/MATCH_READY] to close the block.

Full JSON format (all on one line is fine):
[MATCH_READY]
{"therapistParams":{"gender":"any","specialty":["depression","family"],"languages":["English"],"therapyType":"face-to-face","location":"hong-kong","experienceLevel":"any"},"psychologistInfo":"4-5 sentences for the therapist. End with $"}
[/MATCH_READY]

Use specialty values: anxiety, depression, stress, relationships, family, trauma, work, grief, addiction, PTSD, OCD, eating disorders, etc. Location: use lowercase with hyphens (e.g. hong-kong not Hong Kong).

## MACHINE-MATCHING JSON — ENGLISH CANONICAL VALUES ONLY (CRITICAL)
The user may speak Cantonese, Mandarin, or English. Your visible replies MUST match their language. However, inside the hidden [MATCH_READY] JSON block, therapistParams MUST use **English canonical tokens only** (same vocabulary as the examples above). The matching engine compares these fields to an English-language therapist database.
- specialty: array of lowercase English tags only (e.g. ["anxiety","work"] never ["焦虑","工作"])
- languages: array of English names only: "English", "Mandarin", "Cantonese", "Spanish", etc. (never 中文, 粤语 alone)
- therapyType: exactly one of: "online", "face-to-face", "both"
- location: ASCII slug only, e.g. "hong-kong" (never 香港 as the only value)
- gender: "male", "female", or "any"
- experienceLevel: "junior", "mid", "senior", or "any"
If the user asked for therapy in Chinese, still encode languages as e.g. ["Mandarin"] or ["Mandarin","Cantonese"] as appropriate — not as Chinese characters.

Use open-ended, empathetic questions. Ask one at a time. Acknowledge what they share before asking the next.`;

// ===== AUTH ROUTES =====

// User registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        
        const existingUser = db.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        
        const userId = db.createUser(email, password);
        const token = crypto.randomBytes(32).toString('hex');
        db.createSession(userId, token);
        
        res.json({ token, userId });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// User login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        const user = db.verifyUserPassword(email, password);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = crypto.randomBytes(32).toString('hex');
        db.createSession(user.id, token);
        
        res.json({ token, userId: user.id });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// User logout
app.post('/api/auth/logout', requireAuth, (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader.substring(7);
    db.deleteSession(token);
    res.json({ success: true });
});

// Get current user
app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
        const user = db.db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ id: user.id, email: user.email, createdAt: user.created_at });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// ===== USER DATA ROUTES =====

// Get user profile
app.get('/api/user/profile', requireAuth, (req, res) => {
    try {
        const profile = db.getUserProfile(req.userId);
        res.json({ profile });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to get profile' });
    }
});

// Save user profile
app.put('/api/user/profile', requireAuth, (req, res) => {
    try {
        const { profile } = req.body;
        db.saveUserProfile(req.userId, profile);
        res.json({ success: true });
    } catch (error) {
        console.error('Save profile error:', error);
        res.status(500).json({ error: 'Failed to save profile' });
    }
});

// Get conversation
app.get('/api/user/conversation', requireAuth, (req, res) => {
    try {
        const conversationId = req.query.conversationId;
        if (conversationId) {
            // Get specific conversation
            const conversation = db.getConversation(req.userId, conversationId);
            if (conversation) {
                res.json(conversation);
            } else {
                res.json({ messages: [], conversationId });
            }
        } else {
            // Get most recent conversation for this user
            const stmt = db.db.prepare('SELECT conversation_id, messages_json FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1');
            const result = stmt.get(req.userId);
            if (result) {
                res.json({
                    messages: JSON.parse(result.messages_json),
                    conversationId: result.conversation_id
                });
            } else {
                res.json({ messages: [], conversationId: null });
            }
        }
    } catch (error) {
        console.error('Get conversation error:', error);
        res.status(500).json({ error: 'Failed to get conversation' });
    }
});

// Save conversation
app.put('/api/user/conversation', requireAuth, (req, res) => {
    try {
        const { messages, conversationId } = req.body;
        if (!conversationId) {
            return res.status(400).json({ error: 'conversationId required' });
        }
        db.saveConversation(req.userId, conversationId, messages);
        res.json({ success: true });
    } catch (error) {
        console.error('Save conversation error:', error);
        res.status(500).json({ error: 'Failed to save conversation' });
    }
});

// Get bookings
app.get('/api/user/bookings', requireAuth, (req, res) => {
    try {
        const bookings = db.getBookings(req.userId);
        res.json({ bookings });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ error: 'Failed to get bookings' });
    }
});

// Save booking (with conflict check - no double-booking)
app.post('/api/user/bookings', requireAuth, (req, res) => {
    try {
        const { booking } = req.body;
        const therapistId = booking.therapistId;
        const date = booking.date;
        const time = booking.time;
        if (!therapistId || !date || !time) {
            return res.status(400).json({ error: 'Missing therapistId, date, or time' });
        }
        const bookedSlots = db.getBookedSlotsForTherapist(therapistId);
        const isTaken = bookedSlots.some(s => s.date === date && s.time === time);
        if (isTaken) {
            return res.status(409).json({ error: 'This time slot is no longer available. Please select another time.' });
        }
        const bookingId = db.saveBooking(req.userId, booking);
        res.json({ booking: { ...booking, id: bookingId } });
    } catch (error) {
        console.error('Save booking error:', error);
        res.status(500).json({ error: 'Failed to save booking' });
    }
});

// Update booking
app.put('/api/user/bookings/:bookingId', requireAuth, (req, res) => {
    try {
        const { bookingId } = req.params;
        const updates = req.body;
        const bookings = db.getBookings(req.userId);
        const booking = bookings.find(b => String(b.id) === String(bookingId));
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        const success = db.updateBooking(req.userId, bookingId, updates);
        if (success && updates.status === 'cancelled' && booking.therapistId) {
            db.updatePsychologistBookingStatus(booking.therapistId, bookingId, 'cancelled');
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

// Therapist notes (things to discuss - stored in DB)
app.get('/api/user/therapist-notes', requireAuth, (req, res) => {
    try {
        const notes = db.getUserTherapistNotes(req.userId);
        const latest = notes.length > 0 ? notes[0].notes_text : null;
        res.json({ notes: latest, history: notes.map(n => ({ notes: n.notes_text, updatedAt: n.updated_at })) });
    } catch (error) {
        console.error('Get therapist notes error:', error);
        res.status(500).json({ error: 'Failed to get notes' });
    }
});

app.put('/api/user/therapist-notes', requireAuth, (req, res) => {
    try {
        const { notes, bookingId, therapistId } = req.body;
        db.saveOrUpdateUserTherapistNotes(req.userId, notes || '', therapistId, bookingId);
        res.json({ success: true });
    } catch (error) {
        console.error('Save therapist notes error:', error);
        res.status(500).json({ error: 'Failed to save notes' });
    }
});

// Delete account (removes all user data)
app.delete('/api/user/account', requireAuth, (req, res) => {
    try {
        db.deleteUserAccount(req.userId);
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (token) db.deleteSession(token);
        res.json({ success: true });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
});

// Get AI code message
app.get('/api/user/ai-code-message', requireAuth, (req, res) => {
    try {
        const codeMessage = db.getAiCodeMessage(req.userId);
        res.json({ codeMessage });
    } catch (error) {
        console.error('Get AI code message error:', error);
        res.status(500).json({ error: 'Failed to get AI code message' });
    }
});

// Save AI code message
app.put('/api/user/ai-code-message', requireAuth, (req, res) => {
    try {
        const { codeMessage } = req.body;
        db.saveAiCodeMessage(req.userId, codeMessage);
        res.json({ success: true });
    } catch (error) {
        console.error('Save AI code message error:', error);
        res.status(500).json({ error: 'Failed to save AI code message' });
    }
});

// Add booking to psychologist
app.post('/api/user/add-booking-to-psychologist', requireAuth, (req, res) => {
    try {
        const { therapistId, booking, patientName } = req.body;
        const success = db.addBookingToPsychologist(therapistId, booking, patientName);
        if (success) {
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'Therapist not found' });
        }
    } catch (error) {
        console.error('Add booking to psychologist error:', error);
        res.status(500).json({ error: 'Failed to add booking to psychologist' });
    }
});

// ===== PSYCHOLOGIST AUTH ROUTES =====

// Psychologist login
app.post('/api/psychologist/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        const psych = db.verifyPsychologistPassword(email, password);
        if (!psych) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = crypto.randomBytes(32).toString('hex');
        db.createPsychologistSession(psych.id, token);
        
        res.json({ token, psychologistId: psych.id });
    } catch (error) {
        console.error('Psychologist login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Psychologist logout
app.post('/api/psychologist/auth/logout', requirePsychologistAuth, (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader.substring(7);
    db.deletePsychologistSession(token);
    res.json({ success: true });
});

// Get psychologist data
app.get('/api/psychologist/me', requirePsychologistAuth, (req, res) => {
    try {
        const psych = db.getPsychologistById(req.psychologistId);
        if (!psych) {
            return res.status(404).json({ error: 'Psychologist not found' });
        }
        const therapist = ensureTherapistPhoto(JSON.parse(psych.therapist_json), psych.therapist_id);
        const patients = JSON.parse(psych.patients_json || '[]');
        res.json({
            id: psych.id,
            therapistId: psych.therapist_id,
            email: psych.email,
            therapist,
            patients
        });
    } catch (error) {
        console.error('Get psychologist error:', error);
        res.status(500).json({ error: 'Failed to get psychologist data' });
    }
});

// Get all therapists (for therapist-selection browse - single source of truth)
app.get('/api/therapists', (req, res) => {
    try {
        const rows = db.db.prepare('SELECT therapist_id, therapist_json FROM psychologist_accounts').all();
        const therapists = rows.map(p => {
            const t = JSON.parse(p.therapist_json);
            t.id = p.therapist_id;
            return ensureTherapistPhoto(t, p.therapist_id);
        });
        res.json({ therapists });
    } catch (error) {
        console.error('Get therapists error:', error);
        res.status(500).json({ error: 'Failed to get therapists' });
    }
});

// Get therapist by ID (for profile/booking - psychologists from DB)
app.get('/api/therapists/:therapistId', (req, res) => {
    try {
        const { therapistId } = req.params;
        const row = db.db.prepare('SELECT therapist_json FROM psychologist_accounts WHERE therapist_id = ?').get(therapistId);
        if (!row) {
            return res.status(404).json({ error: 'Therapist not found' });
        }
        const therapist = ensureTherapistPhoto(JSON.parse(row.therapist_json), therapistId);
        res.json({ therapist });
    } catch (error) {
        console.error('Get therapist error:', error);
        res.status(500).json({ error: 'Failed to get therapist' });
    }
});

// Get booked slots for a therapist (for calendar UI - prevents showing taken times)
app.get('/api/therapists/:therapistId/booked-slots', (req, res) => {
    try {
        const { therapistId } = req.params;
        const slots = db.getBookedSlotsForTherapist(therapistId);
        res.json({ slots });
    } catch (error) {
        console.error('Get booked slots error:', error);
        res.status(500).json({ error: 'Failed to get booked slots' });
    }
});

// ===== AI CHAT ROUTES =====

// Regular AI chat (initial assessment)
app.post('/api/ai/chat', async (req, res) => {
    try {
        if (!requireOpenAI(res)) return;
        const { message, conversationId, userProfile } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get or create conversation context
        let conversationHistory = conversationContexts.get(conversationId) || [];

        // Add user message
        conversationHistory.push({
            role: 'user',
            content: message
        });

        // Build context with user profile if available
        let messages = [
            {
                role: 'system',
                content: MATCHING_SYSTEM_PROMPT + (userProfile ? `\n\nUser Profile:\n- Age: ${userProfile.age}\n- Gender: ${userProfile.gender}\n- Location: ${userProfile.location}\n- Main Concerns: ${Array.isArray(userProfile.concerns) ? userProfile.concerns.join(', ') : userProfile.concerns}\n- Previous Therapy: ${userProfile.previousTherapy}\n- Communication Preference: ${userProfile.communicationStyle}` : '')
            },
            ...conversationHistory
        ];

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0.7,
            max_tokens: 800
        });

        const aiResponse = completion.choices[0].message.content;

        // Extract [MATCH_READY]... - handle both [/MATCH_READY] and missing closing tag (AI may omit it)
        let codeMessage = null;
        let responseText = aiResponse;
        const matchStart = aiResponse.search(/\[MATCH_READY\]/i);
        if (matchStart >= 0) {
            const afterTag = aiResponse.slice(matchStart + '[MATCH_READY]'.length);
            const closeIdx = afterTag.search(/\[\/MATCH_READY\]/i);
            const rawContent = closeIdx >= 0 ? afterTag.slice(0, closeIdx) : afterTag;
            const matchContent = rawContent.trim();
            try {
                codeMessage = JSON.parse(matchContent);
                if (codeMessage.psychologistInfo && codeMessage.psychologistInfo.includes('$')) {
                    const parts = codeMessage.psychologistInfo.split('$');
                    codeMessage.psychologistInfo = (parts[0] || parts[1] || '').trim();
                }
                console.log('\n--- more AI: Ideal Therapist Criteria ---');
                if (codeMessage.therapistParams) {
                    console.log(JSON.stringify(codeMessage.therapistParams, null, 2));
                }
                if (codeMessage.psychologistInfo) {
                    console.log('Summary:', codeMessage.psychologistInfo.substring(0, 120) + (codeMessage.psychologistInfo.length > 120 ? '...' : ''));
                }
                console.log('----------------------------------------\n');
            } catch (e) {
                console.error('Failed to parse MATCH_READY:', e);
            }
            // Strip block from user-facing response (with or without closing tag)
            const blockEnd = closeIdx >= 0 ? matchStart + '[MATCH_READY]'.length + closeIdx + '[/MATCH_READY]'.length : aiResponse.length;
            const before = aiResponse.slice(0, matchStart).trim();
            const after = aiResponse.slice(blockEnd).trim();
            responseText = (before + (after ? ' ' + after : '')).replace(/\s*,\s*$/, '').replace(/\s+$/, '');
        }

        // Add AI response to conversation history
        conversationHistory.push({
            role: 'assistant',
            content: aiResponse
        });

        // Store updated conversation
        conversationContexts.set(conversationId, conversationHistory);

        res.json({
            response: responseText.trim(),
            codeMessage: codeMessage,
            messageCount: conversationHistory.filter(m => m.role === 'user').length
        });

    } catch (error) {
        console.error('OpenAI API Error:', error);
        res.status(500).json({ 
            error: 'Failed to get AI response',
            message: error.message 
        });
    }
});

// Therapy mode AI chat (with context)
app.post('/api/ai/chat-therapy', requireAuth, async (req, res) => {
    try {
        if (!requireOpenAI(res)) return;
        const { message, conversationId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get user's therapy context
        const bookings = db.getBookings(req.userId);
        const now = new Date();
        const activeBookings = bookings.filter(b => {
            const bookingDate = new Date(`${b.date}T${b.time}`);
            return bookingDate > now && b.status === 'upcoming';
        }).sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });

        let therapyContext = '';
        if (activeBookings.length > 0) {
            const nextBooking = activeBookings[0];
            therapyContext = `\n\nUser is currently in therapy with ${nextBooking.therapistName}. Their next session is on ${nextBooking.date} at ${nextBooking.time}.`;
        }

        // Get or create conversation context
        let conversationHistory = conversationContexts.get(conversationId) || [];

        conversationHistory.push({
            role: 'user',
            content: message
        });

        const messages = [
            {
                role: 'system',
                content: SYSTEM_PROMPT + therapyContext + '\n\nYou are now providing support between therapy sessions. Be supportive and help them process their thoughts.'
            },
            ...conversationHistory
        ];

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0.7,
            max_tokens: 300
        });

        const aiResponse = completion.choices[0].message.content;

        conversationHistory.push({
            role: 'assistant',
            content: aiResponse
        });

        conversationContexts.set(conversationId, conversationHistory);

        res.json({
            response: aiResponse,
            messageCount: conversationHistory.filter(m => m.role === 'user').length
        });

    } catch (error) {
        console.error('Therapy chat error:', error);
        res.status(500).json({ error: 'Failed to get AI response' });
    }
});

/**
 * Normalize therapistParams from the LLM so matching works when users chatted in Chinese
 * or the model emitted Chinese/pinyin in JSON. DB therapists use English tags.
 */
function normalizeTherapistParamsForMatching(raw) {
    const p = raw && typeof raw === 'object' ? { ...raw } : {};
    const specPairs = [
        ['焦虑', 'anxiety'], ['焦躁', 'anxiety'], ['抑郁', 'depression'], ['忧鬱', 'depression'], ['忧郁', 'depression'],
        ['压力', 'stress'], ['紧张', 'stress'], ['关系', 'relationships'], ['感情', 'relationships'], ['恋爱', 'relationships'],
        ['婚姻', 'relationships'], ['失恋', 'relationships'], ['家庭', 'family'], ['亲子', 'family'], ['父母', 'family'],
        ['创伤', 'trauma'], ['工作', 'work'], ['职场', 'work'], ['哀伤', 'grief'], ['丧亲', 'grief'], ['成瘾', 'addiction'],
        ['饮食', 'eating disorders'], ['厌食', 'eating disorders'], ['暴食', 'eating disorders'], ['自尊', 'self-esteem'],
        ['双相', 'bipolar'], ['强迫', 'OCD'], ['强迫症', 'OCD'], ['伴侣', 'couples'], ['夫妻', 'couples'],
        ['失眠', 'stress'], ['睡眠', 'stress'], ['生活转变', 'life transitions'], ['丧恸', 'grief']
    ];
    const langPairs = [
        [['mandarin', '中文', '普通话', '国语', '汉语', '简体', '繁体', '華語'], 'Mandarin'],
        [['cantonese', '粤语', '广东话', '廣東話', '粵語'], 'Cantonese'],
        [['english', '英语', '英文'], 'English'],
        [['spanish', '西班牙语', '西班牙文'], 'Spanish'],
        [['german', '德语', '德文'], 'German'],
        [['french', '法语', '法文'], 'French'],
        [['japanese', '日语', '日文'], 'Japanese'],
        [['korean', '韩语', '韩文'], 'Korean'],
        [['russian', '俄语'], 'Russian'],
        [['portuguese', '葡萄牙语'], 'Portuguese'],
        [['italian', '意大利语'], 'Italian'],
        [['dutch', '荷兰语'], 'Dutch'],
        [['norwegian', '挪威语'], 'Norwegian'],
        [['polish', '波兰语'], 'Polish']
    ];
    function normalizeSpecialtyString(s) {
        const rawStr = String(s || '').trim();
        if (!rawStr) return [];
        const out = new Set();
        for (const [cn, en] of specPairs) {
            if (rawStr.includes(cn)) out.add(en);
        }
        if (out.size > 0) return [...out];
        const lower = rawStr.toLowerCase().replace(/\s+/g, ' ');
        const englishHints = ['anxiety', 'depression', 'stress', 'relationships', 'family', 'trauma', 'work', 'grief', 'addiction', 'ptsd', 'ocd', 'eating disorders', 'bipolar', 'self-esteem', 'couples', 'life transitions'];
        for (const h of englishHints) {
            if (lower.includes(h)) out.add(h);
        }
        if (out.size > 0) return [...out];
        if (/^[a-z][a-z\s-]+$/i.test(rawStr)) return [lower.replace(/\s+/g, '')];
        return [];
    }
    if (Array.isArray(p.specialty)) {
        const flat = [];
        for (const item of p.specialty) {
            flat.push(...normalizeSpecialtyString(item));
        }
        p.specialty = [...new Set(flat)];
    }
    if (Array.isArray(p.languages)) {
        const langs = [];
        for (const item of p.languages) {
            const rawStr = String(item || '').trim();
            if (!rawStr) continue;
            const lower = rawStr.toLowerCase();
            let hit = null;
            for (const [aliases, canonical] of langPairs) {
                if (aliases.some(a => lower === a.toLowerCase() || rawStr.includes(a) || lower.includes(a.toLowerCase()))) {
                    hit = canonical;
                    break;
                }
            }
            if (hit) {
                langs.push(hit);
            } else if (/[\u4e00-\u9fff]/.test(rawStr)) {
                // Unmapped Chinese language label — still allow matching HK therapists
                langs.push('Mandarin');
                langs.push('Cantonese');
            } else {
                langs.push(rawStr.charAt(0).toUpperCase() + rawStr.slice(1).toLowerCase());
            }
        }
        p.languages = [...new Set(langs)];
    }

    const g = String(p.gender || '').trim().toLowerCase();
    if (/^男|男性/.test(String(p.gender || ''))) p.gender = 'male';
    else if (/^女|女性/.test(String(p.gender || ''))) p.gender = 'female';
    else if (/不限|任意|无所谓|都可以/.test(String(p.gender || ''))) p.gender = 'any';

    const el = String(p.experienceLevel || '').trim().toLowerCase();
    if (/初级|初級/.test(String(p.experienceLevel || ''))) p.experienceLevel = 'junior';
    else if (/中级|中級|中等/.test(String(p.experienceLevel || ''))) p.experienceLevel = 'mid';
    else if (/高级|高級|资深|資深/.test(String(p.experienceLevel || ''))) p.experienceLevel = 'senior';
    const tt = String(p.therapyType || '').trim().toLowerCase();
    if (/线上|网络|远程|视频|網上|網路/.test(p.therapyType || '')) p.therapyType = 'online';
    else if (/线下|面对面|当面|面對面|實體/.test(String(p.therapyType || ''))) p.therapyType = 'face-to-face';
    else if (/都可以|均可|不限|随便|隨便|兩種/.test(String(p.therapyType || ''))) p.therapyType = 'both';
    else if (tt === 'in-person' || tt === 'in person' || tt === 'facetoface') p.therapyType = 'face-to-face';
    else if (tt === 'virtual' || tt === 'remote') p.therapyType = 'online';

    const loc = String(p.location || '').trim();
    if (/香港|hk\b|hong\s*kong|hongkong/i.test(loc)) p.location = 'hong-kong';
    return p;
}

// Therapist matching endpoint
app.post('/api/therapist/match', requireAuth, async (req, res) => {
    try {
        let { therapistParams } = req.body;
        therapistParams = normalizeTherapistParamsForMatching(therapistParams || {});
        
        // Get therapists with therapist_id for correct profile links
        const allPsychologists = db.db.prepare('SELECT therapist_id, therapist_json FROM psychologist_accounts').all();
        const therapists = allPsychologists.map(p => {
            const t = JSON.parse(p.therapist_json);
            t.id = p.therapist_id;
            return ensureTherapistPhoto(t, p.therapist_id);
        });
        
        // Normalize location for matching ("Hong Kong" <-> "hong-kong")
        const normalizeLoc = (loc) => !loc ? '' : String(loc).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const paramSpecs = (therapistParams.specialty || []).map(s => s.toLowerCase());
        const paramLoc = normalizeLoc(therapistParams.location);
        const wantFaceToFace = therapistParams.therapyType === 'face-to-face';
        
        const scored = therapists.map(therapist => {
            let score = 0;
            let specialtyMatches = 0;
            
            // SPECIALTY (primary - when specified, must have at least 1 match)
            const specs = therapist.specialization || [];
            if (paramSpecs.length > 0) {
                specialtyMatches = specs.filter(s => 
                    paramSpecs.some(ps => {
                        const sl = (s || '').toLowerCase();
                        return sl.includes(ps) || ps.includes(sl);
                    })
                ).length;
                if (specialtyMatches === 0) return { therapist, score: -1, specialtyMatches: 0 };
                score += (specialtyMatches / paramSpecs.length) * 50;
            }
            
            // Location (critical for face-to-face)
            if (wantFaceToFace && paramLoc) {
                const tLoc = normalizeLoc(therapist.location);
                if (tLoc === paramLoc) score += 25;
                else if (tLoc && (tLoc.includes(paramLoc) || paramLoc.includes(tLoc))) score += 10;
            }
            
            // Language (required)
            if (therapistParams.languages && therapistParams.languages.length > 0) {
                const langs = (therapist.languages || []).map(l => (l || '').toLowerCase());
                const langMatch = therapistParams.languages.some(pl => 
                    langs.some(l => l === pl.toLowerCase() || l.includes(pl.toLowerCase()))
                );
                if (!langMatch) return { therapist, score: -1, specialtyMatches: 0 };
                score += 10;
            }
            
            // Therapy type
            const tType = (therapist.therapyType || '').toLowerCase();
            if (therapistParams.therapyType) {
                const want = (therapistParams.therapyType || '').toLowerCase();
                if (tType === 'both' || want === 'both' || tType === want) score += 5;
            }
            
            // Gender
            if (therapistParams.gender && therapistParams.gender !== 'any') {
                if ((therapist.gender || '').toLowerCase() === therapistParams.gender.toLowerCase()) score += 5;
            }
            
            // Experience level
            if (therapistParams.experienceLevel && therapistParams.experienceLevel !== 'any') {
                const exp = therapist.experience || 0;
                const level = exp < 5 ? 'junior' : exp < 10 ? 'mid' : 'senior';
                if (level === therapistParams.experienceLevel) score += 5;
            }
            
            return { therapist, score, specialtyMatches };
        });
        
        const valid = scored.filter(s => s.score >= 0);
        valid.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return (b.specialtyMatches || 0) - (a.specialtyMatches || 0);
        });
        const top = valid.filter(s => s.score >= 15).slice(0, 5);
        
        const topMatches = top.map((item, index) => ({
            ...item.therapist,
            id: item.therapist.id,
            matchScore: Math.min(100, Math.round(item.score)),
            matchLabel: index === 0 ? 'best match' : 'good match'
        }));
        
        res.json({ matches: topMatches });
    } catch (error) {
        console.error('Therapist matching error:', error);
        res.status(500).json({ error: 'Failed to match therapists' });
    }
});

// ===== PSYCHOLOGIST SEEDING =====

function nameToEmail(name) {
    // "Dr. Sarah Johnson" -> "sarahjohnson" (lowercase, no spaces, no Dr., strip special chars)
    const base = name.replace(/^Dr\.\s*/i, '').replace(/\s+/g, '').replace(/[''-]/g, '').toLowerCase();
    return base.replace(/[^a-z0-9]/g, '');
}

function seedPsychologistAccounts() {
    // Force re-seed with new email/password format (firstnamelastname@more.com, 123456)
    if (process.env.RESEED_PSYCHOLOGISTS === '1') {
        db.db.prepare('DELETE FROM psychologist_accounts').run();
        console.log('Cleared psychologist accounts for re-seed.');
    }
    // Check if already seeded
    const existing = db.db.prepare('SELECT COUNT(*) as count FROM psychologist_accounts').get();
    if (existing.count > 0) {
        console.log(`Database already has ${existing.count} psychologist accounts. Skipping seed. (Set RESEED_PSYCHOLOGISTS=1 to re-seed with new format)`);
        return;
    }
    
    console.log('Seeding psychologist accounts...');
    const usedEmails = new Set();
    let created = 0;

    // Add 3 fixed test accounts with predictable credentials (sarahjohnson@more.com, 123456 etc.)
    const fixedTherapists = [
        { therapistId: 't1', name: 'Dr. Sarah Johnson', firstName: 'Sarah', lastName: 'Johnson', specialization: ['Anxiety', 'Depression', 'Stress'], languages: ['English', 'Spanish'], experience: 8, rating: 4.8, price: 120, bio: 'Licensed clinical psychologist with 8 years of experience specializing in anxiety and mood disorders. I use evidence-based approaches including CBT and mindfulness.', availability: [{ day: 'Monday', times: ['09:00', '10:00', '14:00', '15:00'] }, { day: 'Wednesday', times: ['09:00', '10:00', '14:00'] }, { day: 'Friday', times: ['10:00', '11:00', '14:00'] }] },
        { therapistId: 't2', name: 'Dr. Michael Chen', firstName: 'Michael', lastName: 'Chen', specialization: ['Relationships', 'Family', 'Trauma'], languages: ['English', 'Mandarin'], experience: 12, rating: 4.9, price: 150, bio: 'Experienced therapist focusing on relationship dynamics and family systems. I help individuals and couples navigate complex interpersonal challenges.', availability: [{ day: 'Tuesday', times: ['09:00', '10:00', '14:00', '15:00'] }, { day: 'Thursday', times: ['09:00', '10:00', '14:00'] }, { day: 'Saturday', times: ['10:00', '11:00'] }] },
        { therapistId: 't3', name: 'Dr. Emily Rodriguez', firstName: 'Emily', lastName: 'Rodriguez', specialization: ['Work', 'Stress', 'Anxiety'], languages: ['English', 'Spanish', 'Portuguese'], experience: 6, rating: 4.7, price: 110, bio: 'Career-focused therapist helping professionals manage work-related stress and achieve work-life balance. Specialized in workplace anxiety and burnout.', availability: [{ day: 'Monday', times: ['08:00', '09:00', '13:00', '14:00'] }, { day: 'Wednesday', times: ['08:00', '09:00', '13:00'] }, { day: 'Friday', times: ['09:00', '10:00', '14:00'] }] }
    ];
    for (const t of fixedTherapists) {
        const email = nameToEmail(t.name) + '@more.com';
        usedEmails.add(email);
        const therapistData = { id: t.therapistId, name: t.name, photo: therapistHeadshotFromTherapistId(t.therapistId), gender: 'female', age: 35, location: 'Hong Kong', therapyType: 'both', officeAddress: 'https://www.google.com/maps/search/University+of+Hong+Kong+HKU', specialization: t.specialization, languages: t.languages, experience: t.experience, experienceLevel: 'mid', rating: t.rating, price: t.price, bio: t.bio, availability: t.availability };
        try {
            db.createPsychologistAccount(t.therapistId, email, '123456', therapistData);
            created++;
        } catch (e) { console.error('Failed to create fixed therapist:', e.message); }
    }

    const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Quinn', 'Sage', 'River', 'Blake', 'Cameron', 'Dakota', 'Emery', 'Finley', 'Hayden', 'Indigo', 'Jules', 'Kai', 'Logan', 'Marley', 'Noah', 'Ocean', 'Parker', 'Reese', 'Skyler', 'Tatum', 'Winter', 'Zephyr', 'Adrian', 'Blair', 'Cary', 'Dale', 'Eden', 'Gale', 'Harley', 'Ivy', 'Jade', 'Kendall', 'Lane', 'Marlowe', 'Nico', 'Orion', 'Phoenix', 'Quinn', 'Rowan', 'Sloane', 'Tierney', 'Vale', 'Wren'];
    const lastNames = ['Anderson', 'Brown', 'Chen', 'Davis', 'Evans', 'Foster', 'Garcia', 'Harris', 'Ito', 'Johnson', 'Kim', 'Lee', 'Martinez', 'Nguyen', 'O\'Connor', 'Patel', 'Quinn', 'Rodriguez', 'Singh', 'Thompson', 'Ueda', 'Vargas', 'Wang', 'Xu', 'Yamamoto', 'Zhang', 'Adams', 'Baker', 'Clark', 'Diaz', 'Edwards', 'Fisher', 'Green', 'Hall', 'Ibrahim', 'Jackson', 'Kumar', 'Lewis', 'Moore', 'Nelson', 'Ortiz', 'Perez', 'Roberts', 'Scott', 'Taylor', 'White', 'Young', 'Zhou', 'Ahmed', 'Bennett'];
    
    const specializations = ['Anxiety', 'Depression', 'Stress', 'Relationships', 'Family', 'Trauma', 'Work', 'Grief', 'Addiction', 'Eating Disorders', 'PTSD', 'OCD', 'Bipolar', 'ADHD', 'Autism', 'Sleep', 'Anger', 'Self-Esteem', 'LGBTQ+', 'Couples', 'Teen', 'Elderly', 'Men\'s Issues', 'Women\'s Issues', 'Career', 'Life Transitions'];
    const languages = ['English', 'Spanish', 'Mandarin', 'Cantonese', 'French', 'German', 'Japanese', 'Korean', 'Portuguese', 'Hindi', 'Arabic', 'Russian', 'Italian', 'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish', 'Turkish'];
    const locations = ['los-angeles', 'new-york', 'chicago', 'houston', 'phoenix', 'philadelphia', 'san-antonio', 'san-diego', 'dallas', 'san-jose', 'austin', 'jacksonville', 'san-francisco', 'indianapolis', 'columbus', 'fort-worth', 'charlotte', 'seattle', 'denver', 'washington', 'boston', 'el-paso', 'detroit', 'nashville', 'portland', 'oklahoma-city', 'las-vegas', 'memphis', 'louisville', 'baltimore', 'milwaukee', 'albuquerque', 'tucson', 'fresno', 'sacramento', 'kansas-city', 'mesa', 'atlanta', 'omaha', 'colorado-springs', 'raleigh', 'virginia-beach', 'miami', 'oakland', 'minneapolis', 'tulsa', 'cleveland', 'wichita', 'arlington', 'hong-kong', 'london', 'toronto', 'sydney', 'singapore', 'tokyo', 'paris', 'berlin', 'amsterdam', 'dublin', 'vancouver', 'melbourne', 'auckland', 'zurich', 'stockholm', 'copenhagen', 'oslo', 'helsinki'];
    const therapyTypes = ['online', 'face-to-face', 'both'];
    const genders = ['male', 'female', 'non-binary'];
    
    const targetCount = 150;
    for (let i = 3; i < targetCount; i++) {  // t1,t2,t3 already created above
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `Dr. ${firstName} ${lastName}`;
        const gender = genders[Math.floor(Math.random() * genders.length)];
        const age = 28 + Math.floor(Math.random() * 35);
        const location = locations[Math.floor(Math.random() * locations.length)];
        const therapyType = therapyTypes[Math.floor(Math.random() * therapyTypes.length)];
        const experience = 3 + Math.floor(Math.random() * 20);
        const experienceLevel = experience < 5 ? 'junior' : experience < 10 ? 'mid' : 'senior';
        const rating = 4.0 + Math.random() * 1.0;
        const price = 80 + Math.floor(Math.random() * 9) * 10;
        
        const numSpecs = 1 + Math.floor(Math.random() * 4);
        const therapistSpecs = [];
        const availableSpecs = [...specializations];
        for (let j = 0; j < numSpecs; j++) {
            const idx = Math.floor(Math.random() * availableSpecs.length);
            therapistSpecs.push(availableSpecs.splice(idx, 1)[0]);
        }
        
        const numLangs = 1 + Math.floor(Math.random() * 3);
        const therapistLangs = [];
        const availableLangs = [...languages];
        for (let j = 0; j < numLangs; j++) {
            const idx = Math.floor(Math.random() * availableLangs.length);
            therapistLangs.push(availableLangs.splice(idx, 1)[0]);
        }
        
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const numDays = 2 + Math.floor(Math.random() * 3);
        const availableDays = [];
        const availableDayNames = [...days];
        for (let j = 0; j < numDays; j++) {
            const idx = Math.floor(Math.random() * availableDayNames.length);
            availableDays.push(availableDayNames.splice(idx, 1)[0]);
        }
        
        const availability = availableDays.map(day => {
            const numSlots = 3 + Math.floor(Math.random() * 4);
            const times = [];
            const startHour = 8 + Math.floor(Math.random() * 4);
            for (let k = 0; k < numSlots; k++) {
                const hour = startHour + k;
                if (hour < 18) {
                    times.push(`${String(hour).padStart(2, '0')}:00`);
                }
            }
            return { day, times };
        });
        
        const bio = `Licensed ${experienceLevel} therapist with ${experience} years of experience specializing in ${therapistSpecs.join(', ')}. I provide ${therapyType === 'online' ? 'online' : therapyType === 'face-to-face' ? 'in-person' : 'both online and in-person'} therapy sessions.`;
        
        const therapistId = `t${i + 1}`;
        const photo = therapistHeadshotFromTherapistId(therapistId);
        let email = nameToEmail(name) + '@more.com';
        let suffix = 0;
        while (usedEmails.has(email)) {
            email = nameToEmail(name) + (++suffix) + '@more.com';
        }
        usedEmails.add(email);
        const password = '123456';
        
        const therapistData = {
            id: therapistId,
            name,
            photo,
            gender,
            age,
            location,
            therapyType,
            officeAddress: 'https://www.google.com/maps/search/University+of+Hong+Kong+HKU',
            specialization: therapistSpecs,
            languages: therapistLangs,
            experience,
            experienceLevel,
            rating: Math.round(rating * 10) / 10,
            price,
            bio,
            availability
        };
        
        try {
            db.createPsychologistAccount(therapistId, email, password, therapistData);
            created++;
        } catch (error) {
            console.error(`Failed to create therapist ${therapistId}:`, error.message);
        }
    }
    
    console.log(`Created ${created + 3} psychologist accounts. Email: firstnamelastname@more.com, password: 123456. Test: sarahjohnson@more.com / 123456`);
}

// Endpoint to get conversation summary
app.get('/api/ai/summary/:conversationId', (req, res) => {
    const { conversationId } = req.params;
    const conversation = conversationContexts.get(conversationId) || [];
    
    res.json({
        summary: conversation.map(m => `${m.role}: ${m.content}`).join('\n'),
        messageCount: conversation.filter(m => m.role === 'user').length
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// ----- Static frontend (HTML/CSS/JS from project root) -----
// Do not expose server code, DB, or dependencies
function isBlockedPublicPath(reqPath) {
    const p = path.posix.normalize(reqPath.split('?')[0]);
    if (p.includes('..')) return true;
    const base = path.posix.basename(p);
    const blockedBasenames = new Set([
        'server.js',
        'db.js',
        'package.json',
        'package-lock.json',
        '.env',
        '.gitignore'
    ]);
    if (blockedBasenames.has(base)) return true;
    if (p.startsWith('/data') || p.startsWith('/node_modules')) return true;
    return false;
}

app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return next();
    if (req.path.startsWith('/api')) return next();
    if (isBlockedPublicPath(req.path)) {
        return res.status(404).end();
    }
    next();
});

app.use(express.static(__dirname, {
    dotfiles: 'deny',
    index: ['index.html']
}));

const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir, { dotfiles: 'deny' }));
}

// Fallback for client routes and root path behind reverse proxies
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') return next();
    if (isBlockedPublicPath(req.path)) return res.status(404).end();
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Seed psychologist accounts on startup
seedPsychologistAccounts();

app.listen(PORT, () => {
    console.log(`more AI server running on http://localhost:${PORT}`);
    console.log(`Website: http://localhost:${PORT}/`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Database: ${db.db.name}`);
});
