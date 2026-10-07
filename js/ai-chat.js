// AI Chat interface logic

const MIN_CONVERSATION_LENGTH = 5;
const MAX_CONVERSATION_LENGTH = 10;

// API Configuration
const API_BASE_URL = ((typeof window !== 'undefined' && window.MORE_API_BASE) ? window.MORE_API_BASE.replace(/\/$/, '') : '') + '/api/ai';

let conversationCount = 0;
let isWaitingForResponse = false;
let conversationId = null;
let isTherapyMode = false;
let hasTriggeredModal = false; // Prevent multiple modal triggers

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

function translateSpecialization(value) {
    if (!value) return value;
    return tt(`taxonomy.specialization.${normalizeKey(value)}`, value);
}

// Generate unique conversation ID
function generateConversationId() {
    return 'conv-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

async function initAIChat() {
    // Check if user is logged in
    if (typeof getSessionToken === 'function' && !getSessionToken()) {
        window.location.href = 'user-login.html';
        return;
    }

    // Check if user has completed onboarding
    await DataManager.redirectIfNotOnboarded();

    // Check if user has active therapy (upcoming booking)
    isTherapyMode = await DataManager.hasActiveTherapy();

    // Check: if user completed initial conversation (has aiCodeMessage) but hasn't started therapy (no upcoming bookings)
    let hasCodeMessage = false;
    if (typeof UserDataAPI !== 'undefined') {
        try {
            const codeMsg = await UserDataAPI.getAiCodeMessage();
            hasCodeMessage = !!codeMsg;
        } catch (e) {
            // Ignore errors
        }
    }
    const hasUpcomingTherapy = await DataManager.hasActiveTherapy();
    if (hasCodeMessage && !hasUpcomingTherapy && !isTherapyMode) {
        showContinueTherapyModal();
        initSidebar();
        return;
    }

    // User has booked a session but hasn't attended yet -- therapy mode AI isn't available yet
    if (isTherapyMode && hasCodeMessage) {
        const bookings = await DataManager.getBookings();
        const now = new Date();
        const hasCompletedSession = bookings.some(b => b.status === 'completed');
        const nextUpcoming = bookings
            .filter(b => b.status === 'upcoming' && new Date(`${b.date}T${b.time}`) > now)
            .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))[0];

        if (!hasCompletedSession && nextUpcoming) {
            showAwaitingSessionState(nextUpcoming);
            initSidebar();
            return;
        }
    }

    // Get conversation from server
    const { messages, conversationId: serverConvId } = await DataManager.getConversation();
    const conversation = messages;
    conversationId = serverConvId || generateConversationId();
    conversationCount = conversation.filter(m => m.sender === 'user').length;

    // Render conversation history
    renderConversation(conversation);

    // Check if we have messages - if yes, hide header and make full screen
    if (conversation.length > 0) {
        hideChatHeader();
        expandChatToFullScreen();
    }

    // Check for pending message from main page
    const pendingMessage = localStorage.getItem('pendingAIMessage') || sessionStorage.getItem('pendingAIMessage');
    
    // First-time intro: show "Chat with more AI" text centered, fly up and disappear, then show first AI message
    const introSeen = sessionStorage.getItem('aiChatIntroSeen') === '1';
    if (conversation.length === 0 && !introSeen) {
        await showIntroAndGreeting(pendingMessage);
        checkConversationComplete();
        setupEventListeners();
        return;
    }
    
    // Add initial AI greeting if no conversation exists (returning user, intro already seen)
    if (conversation.length === 0) {
        setTimeout(async () => {
            const greeting = tt('chat.greeting', "Hello! I'm here to help you. I've reviewed your information, and I'd like to understand more about what brings you here today. Can you tell me what you're hoping to get help with?");
            addMessageToUI('ai', greeting);
            await DataManager.addMessage('ai', greeting, conversationId);
            
            if (pendingMessage) {
                setTimeout(() => {
                    localStorage.removeItem('pendingAIMessage');
                    sessionStorage.removeItem('pendingAIMessage');
                    hideChatHeader();
                    expandChatToFullScreen();
                    const messageInput = document.getElementById('message-input');
                    if (messageInput) {
                        messageInput.value = pendingMessage;
                        handleSendMessage();
                    }
                }, 1500);
            }
        }, 500);
    } else if (pendingMessage) {
        // If conversation already exists, still send pending message
        localStorage.removeItem('pendingAIMessage');
        sessionStorage.removeItem('pendingAIMessage');
        
        setTimeout(() => {
            const messageInput = document.getElementById('message-input');
            if (messageInput) {
                messageInput.value = pendingMessage;
                handleSendMessage();
            }
        }, 500);
    }

    // Check if conversation is complete
    checkConversationComplete();

    // Setup event listeners
    setupEventListeners();
}

async function showIntroAndGreeting(pendingMessage) {
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    
    // Hide only chat history; keep input + send visible for design
    if (chatMessages) chatMessages.style.visibility = 'hidden';
    if (messageInput) { messageInput.disabled = true; messageInput.style.opacity = '0.6'; }
    if (sendBtn) { sendBtn.disabled = true; sendBtn.style.opacity = '0.6'; }
    
    // Intro overlay: centered in viewport (middle of screen)
    const introEl = document.createElement('div');
    introEl.id = 'ai-chat-intro';
    introEl.className = 'ai-chat-intro-text';
    introEl.innerHTML = `<h1 class="chat-page-title">${tt('chat.introTitle', 'Chat with more AI')}</h1><p class="chat-page-subtitle">${tt('chat.introSubtitle', "I'm here to understand your needs and help you find the right therapist")}</p>`;
    introEl.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center; z-index:1000; opacity:1; transition:none; pointer-events:none;';
    document.body.appendChild(introEl);
    
    // Show in middle for 2.5 seconds
    await new Promise(r => setTimeout(r, 2500));
    
    introEl.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    introEl.style.transform = 'translate(-50%, -150%)';
    introEl.style.opacity = '0';
    
    await new Promise(r => setTimeout(r, 850));
    introEl.remove();
    
    // Show chat history, re-enable input + send
    if (chatMessages) chatMessages.style.visibility = '';
    if (messageInput) { messageInput.disabled = false; messageInput.style.opacity = ''; }
    if (sendBtn) { sendBtn.disabled = false; sendBtn.style.opacity = ''; }
    
    sessionStorage.setItem('aiChatIntroSeen', '1');
    
    const greeting = tt('chat.greeting', "Hello! I'm here to help you. I've reviewed your information, and I'd like to understand more about what brings you here today. Can you tell me what you're hoping to get help with?");
    addMessageToUI('ai', greeting);
    await DataManager.addMessage('ai', greeting, conversationId);
    
    hideChatHeader();
    expandChatToFullScreen();
    
    if (pendingMessage) {
        localStorage.removeItem('pendingAIMessage');
        sessionStorage.removeItem('pendingAIMessage');
        setTimeout(() => {
            const messageInput = document.getElementById('message-input');
            if (messageInput) {
                messageInput.value = pendingMessage;
                handleSendMessage();
            }
        }, 800);
    }
}

async function initSidebar() {
    const calendarContent = document.getElementById('sidebar-calendar-content');
    const notesInput = document.getElementById('sidebar-notes-input');
    const notesSaveBtn = document.getElementById('sidebar-notes-save');
    const notesSection = document.getElementById('sidebar-notes');
    
    if (!calendarContent) return;
    
    let bookings = [];
    try {
        bookings = await DataManager.getBookings();
    } catch (e) { /* ignore */ }
    
    const now = new Date();
    const upcoming = bookings
        .filter(b => b.status === 'upcoming' && new Date(`${b.date}T${b.time}`) > now)
        .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
    
    if (upcoming.length === 0) {
        calendarContent.innerHTML = `
            <div class="sidebar-empty">
                <p>${tt('chat.noUpcomingSessions', 'No upcoming sessions')}</p>
                <p><a href="therapist-selection.html">${tt('chat.findTherapist', 'Find a therapist')}</a> ${tt('chat.toBookFirstSession', 'to book your first session')}</p>
            </div>
        `;
    } else {
        calendarContent.innerHTML = upcoming.slice(0, 5).map(b => {
        const d = new Date(`${b.date}T${b.time}`);
        const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const isInPerson = b.sessionType === 'in-person' || b.isOnline === false;
        const actionUrl = isInPerson ? (b.officeAddress || 'https://www.google.com/maps/search/University+of+Hong+Kong+HKU') : (b.meetingLink || '#');
        const actionLabel = isInPerson ? tt('chat.address', 'Address') : tt('chat.join', 'Join');
        return `
            <div class="sidebar-calendar-day" data-booking-id="${b.id}">
                <div class="day-date">${dateStr}</div>
                <div class="day-time">${timeStr}</div>
                <div class="day-therapist">${b.therapistName || tt('chat.session', 'Session')}</div>
                <a href="${actionUrl}" target="_blank" class="sidebar-session-action">${actionLabel}</a>
            </div>
        `;
        }).join('');
    }
    
    const nextBooking = upcoming[0];
    if (notesInput && notesSaveBtn) {
        try {
            const savedNotes = await (typeof UserDataAPI !== 'undefined' && UserDataAPI.getTherapistNotes ? UserDataAPI.getTherapistNotes() : null);
            notesInput.value = savedNotes || (nextBooking && nextBooking.notesForTherapist) || '';
        } catch (e) { notesInput.value = nextBooking?.notesForTherapist || ''; }
        notesInput.dataset.bookingId = nextBooking ? nextBooking.id : '';
        notesInput.dataset.therapistId = nextBooking ? (nextBooking.therapistId || '') : '';
        notesSaveBtn.onclick = async () => {
            const notes = notesInput.value.trim();
            const bookingId = notesInput.dataset.bookingId || null;
            const therapistId = notesInput.dataset.therapistId || null;
            try {
                await DataManager.saveNotesForTherapist(bookingId, notes, therapistId);
                notesSaveBtn.textContent = tt('chat.saved', 'Saved!');
                setTimeout(() => { notesSaveBtn.textContent = tt('chat.save', 'Save'); }, 2000);
            } catch (e) {
                notesSaveBtn.textContent = tt('common.error', 'Error');
                setTimeout(() => { notesSaveBtn.textContent = tt('chat.save', 'Save'); }, 2000);
            }
        };
    }
}

function setupEventListeners() {
    initSidebar();
    
    const sendBtn = document.getElementById('send-btn');
    const messageInput = document.getElementById('message-input');

    if (sendBtn) {
        sendBtn.addEventListener('click', handleSendMessage);
    }

    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
            }
        });
    }

    // Modal continue button
    const modalContinueBtn = document.getElementById('modal-continue-btn');
    if (modalContinueBtn) {
        modalContinueBtn.addEventListener('click', () => {
            hideModal();
            window.location.href = 'therapist-selection.html';
        });
    }

    // Modal close button
    const modalCloseBtn = document.getElementById('modal-close-btn');
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => {
            hideModal();
        });
    }

    // Close modal on overlay click
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                hideModal();
            }
        });
    }
}

function renderConversation(conversation) {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;

    chatContainer.innerHTML = '';

    conversation.forEach(msg => {
        addMessageToUI(msg.sender, msg.message, false);
    });

    scrollToBottom();
}

function addMessageToUI(sender, message, animate = true) {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${sender}`;
    
    if (animate) {
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(10px)';
    }

    messageDiv.innerHTML = `
        <div class="message-content">${escapeHtml(message)}</div>
        <div class="message-time">${formatTime(new Date())}</div>
    `;

    chatContainer.appendChild(messageDiv);

    if (animate) {
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.3s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 10);
    }

    scrollToBottom();
}

async function handleSendMessage() {
    const messageInput = document.getElementById('message-input');
    if (!messageInput) return;

    // Don't allow sending if modal is shown
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay && modalOverlay.style.display !== 'none') {
        return;
    }

    const message = messageInput.value.trim();
    if (!message || isWaitingForResponse) return;

    // Clear input immediately for responsiveness
    messageInput.value = '';

    // Hide header and expand chat on first message
    if (conversationCount === 0) {
        hideChatHeader();
        expandChatToFullScreen();
    }

    // Add user message
    addMessageToUI('user', message);
    try {
        await DataManager.addMessage('user', message, conversationId);
    } catch (e) {
        console.warn('Save message failed:', e);
    }
    conversationCount++;

    // Show typing indicator
    showTypingIndicator();

    // Generate AI response via API
    try {
        await generateAIResponse(message);
    } finally {
        hideTypingIndicator();
    }
}

async function generateAIResponse(userMessage) {
    try {
        // Check if modal is already shown - don't respond if it is
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay && modalOverlay.style.display !== 'none') {
            hideTypingIndicator();
            return;
        }

        // Get user profile for context
        const userProfile = await DataManager.getUserProfile();

        // Determine which endpoint to use
        const endpoint = isTherapyMode ? '/chat-therapy' : '/chat';
        const requestBody = {
            message: userMessage,
            conversationId: conversationId,
            userProfile: userProfile
        };

        // Add therapy context if in therapy mode
        if (isTherapyMode) {
            requestBody.therapyContext = await DataManager.getTherapyContext();
        }

        // Call the API
        const headers = { 'Content-Type': 'application/json' };
        const token = typeof getSessionToken === 'function' ? getSessionToken() : null;
        if (token) headers.Authorization = 'Bearer ' + token;
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestBody)
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const err = new Error(data.error || `API error: ${response.status}`);
            err.status = response.status;
            throw err;
        }
        
        hideTypingIndicator();
        
        // In therapy mode, always add response (no "enough info" check)
        if (isTherapyMode) {
            addMessageToUI('ai', data.response);
            await DataManager.addMessage('ai', data.response, conversationId);
            conversationCount = data.messageCount || conversationCount + 1;
        } else {
            // ALWAYS show AI response first
            if (data.response && data.response.trim()) {
                addMessageToUI('ai', data.response);
                await DataManager.addMessage('ai', data.response, conversationId);
            }
            
            conversationCount = data.messageCount || conversationCount + 1;
            
            // Check for code-message - ONLY trigger modal when we have a valid code-message
            if (data.codeMessage && data.codeMessage.therapistParams && !hasTriggeredModal) {
                console.log('Code-message received from AI:', data.codeMessage);
                
                // Store code-message for matching process
                if (typeof UserDataAPI !== 'undefined' && typeof getSessionToken === 'function' && getSessionToken()) {
                    await UserDataAPI.saveAiCodeMessage(data.codeMessage);
                }
                
                // Mark that we've triggered the modal
                hasTriggeredModal = true;
                isWaitingForResponse = false;
                
                // Trigger the matching process and show modal
                triggerTherapistMatching(data.codeMessage);
            } else {
                // No code-message - continue conversation
                // Log assessment info for debugging
                const assessment = data.completenessAssessment;
                if (assessment) {
                    console.log('Assessment:', assessment.completenessScore + '%', 
                        assessment.isComplete ? '(Complete)' : '(Incomplete)',
                        'Missing:', assessment.missingAreas?.join(', ') || 'None');
                }
            }
        }

    } catch (error) {
        console.error('Error calling AI API:', error);
        hideTypingIndicator();
        
        // Only show error if modal is not already shown
        const modalOverlay = document.getElementById('modal-overlay');
        if (!modalOverlay || modalOverlay.style.display === 'none') {
            // Fallback to a helpful error message
            const errorMessage = error && error.message && error.message !== 'Failed to fetch'
                ? error.message
                : tt('chat.connectionIssue', "I'm having trouble connecting right now. Please try again in a moment, or feel free to continue sharing.");
            addMessageToUI('ai', errorMessage);
            await DataManager.addMessage('ai', errorMessage, conversationId);
            
            // Show error notification
            showErrorNotification(tt('chat.connectionIssueDetail', 'Connection issue. Please check if the server is running.'));
        }
    }
}

function showTypingIndicator() {
    isWaitingForResponse = true;
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;

    // Remove existing typing indicator if any
    const existing = document.getElementById('typing-indicator');
    if (existing) existing.remove();

    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'message message-ai typing-indicator';
    typingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    chatContainer.appendChild(typingDiv);
    scrollToBottom();
}

function showAwaitingSessionState(nextBooking) {
    const chatMessages = document.getElementById('chat-messages');
    const inputSection = document.getElementById('chat-input-section');
    if (!chatMessages) return;

    hideChatHeader();
    expandChatToFullScreen();

    const d = new Date(`${nextBooking.date}T${nextBooking.time}`);
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const therapistName = nextBooking.therapistName || tt('chat.yourTherapist', 'your therapist');

    chatMessages.innerHTML = `
        <div class="awaiting-session-wrap">
            <div class="awaiting-session-icon">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#6ab12f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
            </div>
            <h2 class="awaiting-session-title">${tt('chat.awaitingSessionTitle', 'Your session is coming up')}</h2>
            <p class="awaiting-session-text">
                ${typeof tParam === 'function' ? tParam('chat.awaitingSessionText', { therapist: therapistName }) : `Please attend your first therapy session with ${therapistName} before continuing with more AI.`}
                ${tt('chat.awaitingSessionAfter', "After your session, I'll be here to help you reflect, process your thoughts, and support you between appointments.")}
            </p>
            <div class="awaiting-session-card">
                <div class="awaiting-session-date">${dateStr}</div>
                <div class="awaiting-session-time">${timeStr}</div>
                <div class="awaiting-session-therapist">${tt('chat.withTherapist', 'with')} ${therapistName}</div>
            </div>
            <a href="dashboard.html" class="btn btn-primary awaiting-session-btn">${tt('chat.goToDashboard', 'Go to Dashboard')}</a>
        </div>
    `;

    if (inputSection) {
        inputSection.style.display = 'none';
    }
}

// Modal: Continue therapy first
function showContinueTherapyModal() {
    const existing = document.getElementById('continue-therapy-modal');
    if (existing) return; // Already shown

    const modal = document.createElement('div');
    modal.id = 'continue-therapy-modal';
    modal.className = 'dash-modal-overlay';
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="dash-modal" style="max-width:500px;">
            <div class="dash-modal-header">
                <h2>${tt('chat.continueTherapyTitle', 'Continue Your Therapy First')}</h2>
                <button class="dash-modal-close">&times;</button>
            </div>
            <p style="margin:16px 0;color:#555;line-height:1.6;">
                ${tt('chat.continueTherapyBody', "Please continue your initial therapy first so more AI can assist you in long-term therapy with your therapist. After you've started your therapy sessions, you can use more AI for ongoing support between sessions.")}
            </p>
            <div class="dash-modal-footer">
                <a href="therapist-selection.html" class="btn btn-primary btn-sm">${tt('chat.bookSession', 'Book Session')}</a>
                <a href="dashboard.html" class="btn btn-outline btn-sm">${tt('chat.goToDashboard', 'Go to Dashboard')}</a>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('open'));

    const close = () => {
        modal.classList.remove('open');
        setTimeout(() => { 
            modal.remove(); 
            document.body.style.overflow = '';
            window.location.href = 'dashboard.html';
        }, 200);
    };
    modal.querySelector('.dash-modal-close').onclick = close;
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
}

function hideTypingIndicator() {
    isWaitingForResponse = false;
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// New function to handle therapist matching when code-message is received
async function triggerTherapistMatching(codeMessage) {
    console.log('Triggering therapist matching...');
    
    try {
        if (!codeMessage) {
            console.error('No code-message provided');
            renderTherapistCardsInModal([]);
            showModal();
            return;
        }
        console.log('Using code-message for matching:', codeMessage.therapistParams);
        
        // Call matching API (server uses psychologist_accounts from DB)
        const token = typeof getSessionToken === 'function' ? getSessionToken() : null;
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = 'Bearer ' + token;
        const response = await fetch(`${API_BASE_URL.replace('/ai', '')}/therapist/match`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                therapistParams: codeMessage.therapistParams
            })
        });
        
        if (!response.ok) {
            throw new Error(`Matching API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Matching results:', data);
        
        const matchedTherapists = data.matches || [];
        
        // Render and show modal (no localStorage - data is from server)
        renderTherapistCardsInModal(matchedTherapists);
        showModal();
        
    } catch (error) {
        console.error('Error in therapist matching:', error);
        // Show modal with error state
        renderTherapistCardsInModal([]);
        showModal();
    }
}

function checkConversationComplete() {
    // This function is kept for backward compatibility but should not be called directly
    // Use triggerTherapistMatching() instead
    console.log('checkConversationComplete called - this should only happen via triggerTherapistMatching');
}

function hideChatHeader() {
    const headerSection = document.getElementById('chat-header-section');
    if (headerSection) {
        headerSection.style.display = 'none';
    }
}

function expandChatToFullScreen() {
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) {
        chatContainer.classList.add('full-screen');
    }
}

function renderTherapistCardsInModal(recommendations) {
    const cardsContainer = document.getElementById('therapist-match-cards');
    const bookTopMatchBtn = document.getElementById('book-top-match-btn');
    
    if (!cardsContainer) return;
    
    if (!recommendations || recommendations.length === 0) {
        cardsContainer.innerHTML = `
            <div class="no-recommendations">
                <p>${tt('chat.findingBestTherapists', "We're finding the best therapists for you. Please continue to see all available therapists.")}</p>
            </div>
        `;
        return;
    }
    
    // Server returns full therapist objects with matchScore, matchLabel
    cardsContainer.innerHTML = recommendations.map((rec, index) => {
        const therapistId = rec.id || rec.therapistId;
        const matchLabel = index === 0 ? tt('chat.match.best', 'Best Match') : 
                          rec.matchScore >= 80 ? tt('chat.match.great', 'Great Match') : 
                          rec.matchScore >= 60 ? tt('chat.match.good', 'Good Match') : tt('chat.match.default', 'Match');
        const photoRaw = typeof therapistPhotoUrl === 'function'
            ? therapistPhotoUrl({ ...rec, id: therapistId })
            : (rec.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent((rec.name || '').replace(/^Dr\.\s*/, ''))}&background=6ab12f&color=fff&size=200`);
        const photo = typeof escapeHtmlAttr === 'function' ? escapeHtmlAttr(photoRaw) : String(photoRaw).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
        const specs = Array.isArray(rec.specialization) ? rec.specialization : [];
        
        return `
            <div class="therapist-match-card" data-therapist-id="${therapistId}">
                <div class="match-badge ${index === 0 ? 'best-match' : ''}">${matchLabel}</div>
                <div class="therapist-match-photo">
                    <img src="${photo}" alt="${rec.name || tt('chat.therapist', 'Therapist')}" loading="lazy" onerror="this.onerror=null;this.src='https://ui-avatars.com/api/?name='+encodeURIComponent((this.alt||'T').replace(/^Dr\.\s*/i,''))+'&background=6ab12f&color=fff&size=200'">
                </div>
                <div class="therapist-match-info">
                    <h3 class="therapist-match-name">${rec.name || tt('chat.therapist', 'Therapist')}</h3>
                    <div class="therapist-match-specializations">
                        ${specs.slice(0, 2).map(spec => 
                            `<span class="specialization-chip">${translateSpecialization(spec)}</span>`
                        ).join('')}
                    </div>
                    <p class="therapist-match-reason">${rec.matchReason || tt('chat.matchReasonFallback', 'Good match based on your needs')}</p>
                    <div class="therapist-match-meta">
                        <span class="match-rating">⭐ ${rec.rating || '—'}</span>
                        <span class="match-price">$${rec.price || '—'}/${tt('booking.session', 'session')}</span>
                    </div>
                </div>
                <button class="btn btn-outline therapist-view-profile-btn" data-therapist-id="${therapistId}">
                    ${tt('selection.viewProfile', 'View Profile')}
                </button>
            </div>
        `;
    }).join('');
    
    // Add click handlers
    cardsContainer.querySelectorAll('.therapist-match-card').forEach(card => {
        const therapistId = card.dataset.therapistId;
        const viewBtn = card.querySelector('.therapist-view-profile-btn');
        
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.location.href = `therapist-profile.html?id=${therapistId}`;
            });
        }
        
        card.addEventListener('click', (e) => {
            if (e.target !== viewBtn && !viewBtn.contains(e.target)) {
                window.location.href = `therapist-profile.html?id=${therapistId}`;
            }
        });
    });
    
    // Show book button for top match
    if (bookTopMatchBtn && recommendations.length > 0) {
        const top = recommendations[0];
        const topTherapistId = top.id || top.therapistId;
        bookTopMatchBtn.textContent = typeof tParam === 'function'
            ? tParam('chat.bookSessionWith', { name: top.name || tt('chat.topMatch', 'Top Match') })
            : `Book Session with ${top.name || 'Top Match'}`;
        bookTopMatchBtn.style.display = 'inline-block';
        bookTopMatchBtn.onclick = () => {
            window.location.href = `therapist-profile.html?id=${topTherapistId}`;
        };
    }
}

function showModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'flex';
        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden';
    }
}

function hideModal() {
    const modalOverlay = document.getElementById('modal-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function scrollToBottom() {
    const chatContainer = document.getElementById('chat-messages');
    if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showErrorNotification(message) {
    // Create a temporary error notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background-color: #f54e29;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        font-size: 14px;
        max-width: 300px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transition = 'opacity 0.3s';
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAIChat);
} else {
    initAIChat();
}

window.addEventListener('i18n-updated', () => {
    initSidebar();
});
