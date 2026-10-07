// Onboarding questionnaire logic

// Countries with flags (alphabetical, excluding statistically unlikely ones)
const countriesWithFlags = [
    { name: 'Argentina', flag: '🇦🇷', code: 'AR' },
    { name: 'Australia', flag: '🇦🇺', code: 'AU' },
    { name: 'Austria', flag: '🇦🇹', code: 'AT' },
    { name: 'Belgium', flag: '🇧🇪', code: 'BE' },
    { name: 'Brazil', flag: '🇧🇷', code: 'BR' },
    { name: 'Canada', flag: '🇨🇦', code: 'CA' },
    { name: 'Chile', flag: '🇨🇱', code: 'CL' },
    { name: 'China', flag: '🇨🇳', code: 'CN' },
    { name: 'Colombia', flag: '🇨🇴', code: 'CO' },
    { name: 'Czech Republic', flag: '🇨🇿', code: 'CZ' },
    { name: 'Denmark', flag: '🇩🇰', code: 'DK' },
    { name: 'Finland', flag: '🇫🇮', code: 'FI' },
    { name: 'France', flag: '🇫🇷', code: 'FR' },
    { name: 'Germany', flag: '🇩🇪', code: 'DE' },
    { name: 'Greece', flag: '🇬🇷', code: 'GR' },
    { name: 'Hong Kong', flag: '🇭🇰', code: 'HK' },
    { name: 'India', flag: '🇮🇳', code: 'IN' },
    { name: 'Ireland', flag: '🇮🇪', code: 'IE' },
    { name: 'Israel', flag: '🇮🇱', code: 'IL' },
    { name: 'Italy', flag: '🇮🇹', code: 'IT' },
    { name: 'Japan', flag: '🇯🇵', code: 'JP' },
    { name: 'Malaysia', flag: '🇲🇾', code: 'MY' },
    { name: 'Mexico', flag: '🇲🇽', code: 'MX' },
    { name: 'Netherlands', flag: '🇳🇱', code: 'NL' },
    { name: 'New Zealand', flag: '🇳🇿', code: 'NZ' },
    { name: 'Norway', flag: '🇳🇴', code: 'NO' },
    { name: 'Philippines', flag: '🇵🇭', code: 'PH' },
    { name: 'Poland', flag: '🇵🇱', code: 'PL' },
    { name: 'Portugal', flag: '🇵🇹', code: 'PT' },
    { name: 'Russia', flag: '🇷🇺', code: 'RU' },
    { name: 'Singapore', flag: '🇸🇬', code: 'SG' },
    { name: 'South Africa', flag: '🇿🇦', code: 'ZA' },
    { name: 'South Korea', flag: '🇰🇷', code: 'KR' },
    { name: 'Spain', flag: '🇪🇸', code: 'ES' },
    { name: 'Sweden', flag: '🇸🇪', code: 'SE' },
    { name: 'Switzerland', flag: '🇨🇭', code: 'CH' },
    { name: 'Taiwan', flag: '🇹🇼', code: 'TW' },
    { name: 'Thailand', flag: '🇹🇭', code: 'TH' },
    { name: 'Turkey', flag: '🇹🇷', code: 'TR' },
    { name: 'Ukraine', flag: '🇺🇦', code: 'UA' },
    { name: 'United Arab Emirates', flag: '🇦🇪', code: 'AE' },
    { name: 'United Kingdom', flag: '🇬🇧', code: 'GB' },
    { name: 'United States', flag: '🇺🇸', code: 'US' },
    { name: 'Vietnam', flag: '🇻🇳', code: 'VN' }
];

const onboardingQuestions = [
    {
        id: 'age',
        question: 'What is your age?',
        type: 'number',
        placeholder: 'Enter your age',
        required: true,
        validation: (value) => {
            const age = parseInt(value);
            return age >= 13 && age <= 120;
        },
        errorMessage: 'Please enter a valid age between 13 and 120'
    },
    {
        id: 'gender',
        question: 'What is your gender?',
        type: 'select',
        options: ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'],
        required: true
    },
    {
        id: 'location',
        question: 'What is your location or country?',
        type: 'country',
        required: true
    },
    {
        id: 'concerns',
        question: 'What are your main concerns? (Select all that apply)',
        type: 'multiselect',
        options: ['Anxiety', 'Depression', 'Stress', 'Relationships', 'Work', 'Family', 'Trauma', 'Other'],
        required: true,
        validation: (value) => value.length > 0,
        errorMessage: 'Please select at least one concern'
    },
    {
        id: 'previousTherapy',
        question: 'Have you had previous therapy experience?',
        type: 'radio',
        options: ['Yes', 'No', 'Somewhat'],
        required: true
    },
    {
        id: 'communicationStyle',
        question: 'What is your preferred communication style?',
        type: 'radio',
        options: ['Text-based', 'Video calls', 'Phone calls', 'In-person'],
        required: true
    },
    {
        id: 'financial',
        question: 'Any insurance or financial considerations we should know about?',
        type: 'textarea',
        placeholder: 'Optional: Share any relevant information',
        required: false
    }
];

let currentQuestionIndex = 0;
let userAnswers = {};

function tt(key, fallback) {
    return typeof t === 'function' ? t(key) : fallback;
}

function getLocalizedQuestionTemplate(id) {
    const map = {
        age: {
            question: tt('onboarding.q.age.question', 'What is your age?'),
            placeholder: tt('onboarding.q.age.placeholder', 'Enter your age'),
            errorMessage: tt('onboarding.q.age.error', 'Please enter a valid age between 13 and 120')
        },
        gender: {
            question: tt('onboarding.q.gender.question', 'What is your gender?'),
            options: [
                tt('onboarding.opt.gender.male', 'Male'),
                tt('onboarding.opt.gender.female', 'Female'),
                tt('onboarding.opt.gender.nonBinary', 'Non-binary'),
                tt('onboarding.opt.gender.preferNot', 'Prefer not to say'),
                tt('onboarding.opt.gender.other', 'Other')
            ]
        },
        location: {
            question: tt('onboarding.q.location.question', 'What is your location or country?')
        },
        concerns: {
            question: tt('onboarding.q.concerns.question', 'What are your main concerns? (Select all that apply)'),
            options: [
                tt('onboarding.opt.concern.anxiety', 'Anxiety'),
                tt('onboarding.opt.concern.depression', 'Depression'),
                tt('onboarding.opt.concern.stress', 'Stress'),
                tt('onboarding.opt.concern.relationships', 'Relationships'),
                tt('onboarding.opt.concern.work', 'Work'),
                tt('onboarding.opt.concern.family', 'Family'),
                tt('onboarding.opt.concern.trauma', 'Trauma'),
                tt('onboarding.opt.concern.other', 'Other')
            ],
            errorMessage: tt('onboarding.q.concerns.error', 'Please select at least one concern')
        },
        previousTherapy: {
            question: tt('onboarding.q.previousTherapy.question', 'Have you had previous therapy experience?'),
            options: [
                tt('onboarding.opt.previousTherapy.yes', 'Yes'),
                tt('onboarding.opt.previousTherapy.no', 'No'),
                tt('onboarding.opt.previousTherapy.somewhat', 'Somewhat')
            ]
        },
        communicationStyle: {
            question: tt('onboarding.q.communicationStyle.question', 'What is your preferred communication style?'),
            options: [
                tt('onboarding.opt.communication.text', 'Text-based'),
                tt('onboarding.opt.communication.video', 'Video calls'),
                tt('onboarding.opt.communication.phone', 'Phone calls'),
                tt('onboarding.opt.communication.inPerson', 'In-person')
            ]
        },
        financial: {
            question: tt('onboarding.q.financial.question', 'Any insurance or financial considerations we should know about?'),
            placeholder: tt('onboarding.q.financial.placeholder', 'Optional: Share any relevant information')
        }
    };
    return map[id] || {};
}

function getQuestionWithLocale(baseQuestion) {
    const localized = getLocalizedQuestionTemplate(baseQuestion.id);
    return { ...baseQuestion, ...localized };
}

async function initOnboarding() {
    // Check if already completed (use server when logged in to avoid stale localStorage)
    if (typeof getSessionToken === 'function' && getSessionToken() && typeof UserDataAPI !== 'undefined') {
        try {
            const profile = await UserDataAPI.getProfile();
            if (profile) {
                window.location.href = 'ai-chat.html';
                return;
            }
        } catch (e) {
            // Not logged in or API error - continue to show questionnaire
        }
    }

    // No localStorage - questionnaire progress is in-memory only (fresh per account/session)

    renderQuestion();
    updateProgress();
}

function renderQuestion() {
    const question = getQuestionWithLocale(onboardingQuestions[currentQuestionIndex]);
    const container = document.getElementById('question-container');
    
    if (!container) return;

    container.innerHTML = `
        <div class="question-card">
            <h2 class="question-text">${question.question}</h2>
            <div class="question-input-container">
                ${renderInput(question)}
            </div>
            <div class="error-message" id="error-message"></div>
            <div class="question-actions">
                ${currentQuestionIndex > 0 ? `<button class="btn btn-outline" id="prev-btn">${tt('onboarding.prev', 'Previous')}</button>` : ''}
                <button class="btn btn-primary" id="next-btn">${tt('onboarding.next', 'Next')}</button>
            </div>
        </div>
    `;

    // Attach event listeners
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    
    if (nextBtn) {
        nextBtn.addEventListener('click', handleNext);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', handlePrevious);
    }

    // Load saved answer if exists
    if (userAnswers[question.id] !== undefined) {
        loadAnswer(question, userAnswers[question.id]);
    }
    // If not logged in, they can still view/fill questionnaire but must log in to complete

    initDropdowns();

    // Handle Enter key for text inputs
    const input = container.querySelector('input[type="text"], input[type="number"]');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleNext();
            }
        });
    }
}

function renderInput(question) {
    const savedValue = userAnswers[question.id];

    switch (question.type) {
        case 'number':
            return `<input type="number" id="answer-input" class="form-input" placeholder="${question.placeholder || ''}" min="13" max="120" value="${savedValue || ''}" required>`;
        
        case 'text':
            return `<input type="text" id="answer-input" class="form-input" placeholder="${question.placeholder || ''}" value="${savedValue || ''}" required>`;
        
        case 'textarea':
            return `<textarea id="answer-input" class="form-textarea" placeholder="${question.placeholder || ''}" rows="4">${savedValue || ''}</textarea>`;
        
        case 'select':
            return `
                <div class="onboarding-dropdown" data-type="select">
                    <input type="hidden" id="answer-input" value="${savedValue || ''}" required>
                    <button type="button" class="onboarding-dropdown-trigger" aria-haspopup="listbox" aria-expanded="false">
                        <span class="dropdown-label ${savedValue ? '' : 'placeholder'}">${savedValue ? savedValue : tt('onboarding.selectOption', 'Select an option')}</span>
                        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="onboarding-dropdown-panel" role="listbox">
                        ${question.options.map(opt => 
                            `<div class="onboarding-dropdown-option ${savedValue === opt ? 'selected' : ''}" role="option" data-value="${opt}" ${savedValue === opt ? 'aria-selected="true"' : ''}>${opt}</div>`
                        ).join('')}
                    </div>
                </div>
            `;
        
        case 'country':
            return `
                <div class="onboarding-dropdown" data-type="country">
                    <input type="hidden" id="answer-input" value="${savedValue || ''}" required>
                    <button type="button" class="onboarding-dropdown-trigger" aria-haspopup="listbox" aria-expanded="false">
                        <span class="dropdown-label ${savedValue ? '' : 'placeholder'}">${savedValue ? savedValue : tt('onboarding.selectCountry', 'Select your country')}</span>
                        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                    <div class="onboarding-dropdown-panel" role="listbox">
                        ${countriesWithFlags.map(country => 
                            `<div class="onboarding-dropdown-option ${savedValue === country.name ? 'selected' : ''}" role="option" data-value="${country.name}" ${savedValue === country.name ? 'aria-selected="true"' : ''}>${country.flag} ${country.name}</div>`
                        ).join('')}
                    </div>
                </div>
            `;
        
        case 'radio':
            return `
                <div class="radio-group">
                    ${question.options.map(opt => `
                        <label class="radio-label">
                            <input type="radio" name="answer" value="${opt}" ${savedValue === opt ? 'checked' : ''} required>
                            <span>${opt}</span>
                        </label>
                    `).join('')}
                </div>
            `;
        
        case 'multiselect':
            return `
                <div class="checkbox-group">
                    ${question.options.map(opt => `
                        <label class="checkbox-label">
                            <input type="checkbox" name="answer" value="${opt}" ${(savedValue || []).includes(opt) ? 'checked' : ''}>
                            <span>${opt}</span>
                        </label>
                    `).join('')}
                </div>
            `;
        
        case 'range':
            return `
                <div class="range-container">
                    <input type="range" id="answer-input" class="form-range" min="${question.min}" max="${question.max}" value="${savedValue || question.min}" step="1">
                    <div class="range-value">
                        <span id="range-display">${savedValue || question.min}</span> / ${question.max}
                    </div>
                </div>
            `;
        
        default:
            return `<input type="text" id="answer-input" class="form-input" value="${savedValue || ''}">`;
    }
}

function initDropdowns() {
    document.querySelectorAll('.onboarding-dropdown').forEach(dropdown => {
        const trigger = dropdown.querySelector('.onboarding-dropdown-trigger');
        const panel = dropdown.querySelector('.onboarding-dropdown-panel');
        const hiddenInput = dropdown.querySelector('#answer-input');
        const label = dropdown.querySelector('.dropdown-label');

        if (!trigger || !panel || !hiddenInput) return;

        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = panel.classList.contains('open');
            document.querySelectorAll('.onboarding-dropdown-panel').forEach(p => p.classList.remove('open'));
            document.querySelectorAll('.onboarding-dropdown-trigger').forEach(t => t.classList.remove('open'));
            document.querySelectorAll('.onboarding-dropdown-trigger').forEach(t => t.setAttribute('aria-expanded', 'false'));
            if (!isOpen) {
                panel.classList.add('open');
                trigger.classList.add('open');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });

        panel.querySelectorAll('.onboarding-dropdown-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = opt.dataset.value;
                hiddenInput.value = value;
                label.textContent = value;
                label.classList.remove('placeholder');
                panel.querySelectorAll('.onboarding-dropdown-option').forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');
                panel.querySelectorAll('.onboarding-dropdown-option').forEach(o => o.setAttribute('aria-selected', 'false'));
                opt.setAttribute('aria-selected', 'true');
                panel.classList.remove('open');
                trigger.classList.remove('open');
                trigger.setAttribute('aria-expanded', 'false');
            });
        });
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.onboarding-dropdown')) {
            document.querySelectorAll('.onboarding-dropdown-panel').forEach(p => p.classList.remove('open'));
            document.querySelectorAll('.onboarding-dropdown-trigger').forEach(t => {
                t.classList.remove('open');
                t.setAttribute('aria-expanded', 'false');
            });
        }
    });
}

function loadAnswer(question, value) {
    if (question.type === 'select' || question.type === 'country') {
        const dropdown = document.querySelector('.onboarding-dropdown');
        if (dropdown) {
            const hiddenInput = dropdown.querySelector('#answer-input');
            const label = dropdown.querySelector('.dropdown-label');
            const options = dropdown.querySelectorAll('.onboarding-dropdown-option');
            if (hiddenInput && label && value) {
                hiddenInput.value = value;
                label.textContent = value;
                label.classList.remove('placeholder');
                options.forEach(o => {
                    o.classList.toggle('selected', o.dataset.value === value);
                    o.setAttribute('aria-selected', o.dataset.value === value ? 'true' : 'false');
                });
            }
        }
        return;
    }
    if (question.type === 'range') {
        const rangeInput = document.getElementById('answer-input');
        const rangeDisplay = document.getElementById('range-display');
        if (rangeInput && rangeDisplay) {
            rangeInput.value = value;
            rangeDisplay.textContent = value;
            rangeInput.addEventListener('input', (e) => {
                rangeDisplay.textContent = e.target.value;
            });
        }
    }
}

function getAnswer(question) {
    const input = document.getElementById('answer-input');
    
    if (!input && question.type !== 'radio' && question.type !== 'multiselect') {
        return null;
    }

    switch (question.type) {
        case 'number':
        case 'text':
        case 'textarea':
            return input.value.trim();
        
        case 'select':
        case 'country':
            return input.value;
        
        case 'radio':
            const radioInput = document.querySelector('input[name="answer"]:checked');
            return radioInput ? radioInput.value : null;
        
        case 'multiselect':
            const checkedBoxes = Array.from(document.querySelectorAll('input[name="answer"]:checked'));
            return checkedBoxes.map(cb => cb.value);
        
        case 'range':
            const rangeValue = input.value;
            const rangeDisplay = document.getElementById('range-display');
            if (rangeDisplay) {
                rangeDisplay.textContent = rangeValue;
            }
            return parseInt(rangeValue);
        
        default:
            return input ? input.value : null;
    }
}

function validateAnswer(question, answer) {
    if (question.required && (answer === null || answer === '' || (Array.isArray(answer) && answer.length === 0))) {
        return { valid: false, message: tt('onboarding.required', 'This field is required') };
    }

    if (question.validation && answer !== null && answer !== '') {
        const validationResult = question.validation(answer);
        if (!validationResult) {
            return { valid: false, message: question.errorMessage || tt('onboarding.invalid', 'Invalid input') };
        }
    }

    return { valid: true };
}

function handleNext() {
    const question = onboardingQuestions[currentQuestionIndex];
    const answer = getAnswer(question);
    const validation = validateAnswer(question, answer);

    if (!validation.valid) {
        showError(validation.message);
        return;
    }

    hideError();
    userAnswers[question.id] = answer;

    // Move to next question or complete
    if (currentQuestionIndex < onboardingQuestions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
        updateProgress();
    } else {
        completeOnboarding();
    }
}

function handlePrevious() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
        updateProgress();
    }
}

function updateProgress() {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if (progressBar) {
        const progress = ((currentQuestionIndex + 1) / onboardingQuestions.length) * 100;
        progressBar.style.width = `${progress}%`;
    }
    
    if (progressText) {
        if (typeof tParam === 'function') {
            progressText.textContent = tParam('onboarding.questionOf', { current: currentQuestionIndex + 1, total: onboardingQuestions.length });
        } else {
            progressText.textContent = `Question ${currentQuestionIndex + 1} of ${onboardingQuestions.length}`;
        }
    }
}

function showError(message) {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
}

function hideError() {
    const errorEl = document.getElementById('error-message');
    if (errorEl) {
        errorEl.style.display = 'none';
    }
}

async function completeOnboarding() {
    const userProfile = {
        ...userAnswers,
        completedAt: new Date().toISOString()
    };
    
    // Save to server - must succeed before redirect
    if (typeof getSessionToken === 'function' && getSessionToken() && typeof UserDataAPI !== 'undefined') {
        try {
            await UserDataAPI.saveProfile(userProfile);
        } catch (e) {
            console.error('Save profile failed:', e);
            showError(e.data?.error || e.message || tt('onboarding.saveProfileFailed', 'Failed to save profile. Please try again.'));
            return;
        }
    } else {
        showError(tt('onboarding.loginToSave', 'Please log in to save your profile.'));
        window.location.href = 'user-login.html';
        return;
    }
    
    // Clear logged-out flag since user is actively using the app
    if (typeof AccountManager !== 'undefined') {
        AccountManager.clearLoggedOutFlag();
    }
    
    // Redirect to AI chat
    window.location.href = 'ai-chat.html';
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initOnboarding());
} else {
    initOnboarding();
}

window.addEventListener('i18n-updated', () => {
    renderQuestion();
    updateProgress();
});
