// Therapist selection and filtering logic

let allTherapists = [];
let filteredTherapists = [];
let currentFilters = {
    specialization: '',
    language: '',
    therapyType: '',
    experience: '',
    maxPrice: null,
    minRating: 0,
    sort: ''
};

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

function translateLanguage(value) {
    if (!value) return value;
    return tt(`taxonomy.language.${normalizeKey(value)}`, value);
}

function therapistPhotoImgHtml(therapist) {
    const rawSrc = typeof therapistPhotoUrl === 'function' ? therapistPhotoUrl(therapist) : (therapist.photo || '');
    const src = typeof escapeHtmlAttr === 'function' ? escapeHtmlAttr(rawSrc) : rawSrc.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    const nameEsc = String(therapist.name || 'Therapist').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    return `<img src="${src}" alt="${nameEsc}" loading="lazy" onerror="this.onerror=null;if(typeof therapistPhotoUrl==='function'){this.src=therapistPhotoUrl({name:this.alt||'T',photo:''});}">`;
}

function translateBio(bio) {
    if (!bio) return '';
    const raw = String(bio).trim();
    const knownBioKey = `bio.${normalizeKey(raw)}`;
    // t() returns the key itself when missing — do not compare to raw English text
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

async function initTherapistSelection() {
    // Load therapists from API (DB only - no mock fallback)
    try {
        const res = await fetch('/api/therapists');
        if (res.ok) {
            const data = await res.json();
            allTherapists = (data.therapists || []).map(t => ({ ...t, id: t.id || t.therapistId }));
        }
    } catch (e) { console.warn('Failed to load therapists:', e); }
    if (allTherapists.length === 0) {
        const container = document.getElementById('therapists-container');
        const resultsCount = document.getElementById('results-count');
        if (container) container.innerHTML = `<div class="no-results-modern"><h3>${tt('selection.unableToLoad', 'Unable to load therapists')}</h3><p>${tt('selection.ensureServer', 'Please ensure the server is running and try again.')}</p></div>`;
        if (resultsCount) resultsCount.textContent = tt('selection.noneLoaded', 'No therapists loaded');
        return;
    }
    filteredTherapists = [...allTherapists];

    renderTherapists();
    setupFilters();
    setupSearch();
}

function setupFilters() {
    const specializationFilter = document.getElementById('specialization-filter');
    const languageFilter = document.getElementById('language-filter');
    const therapyTypeFilter = document.getElementById('therapy-type-filter');
    const experienceFilter = document.getElementById('experience-filter');
    const priceFilter = document.getElementById('price-filter');
    const ratingFilter = document.getElementById('rating-filter');
    const sortFilter = document.getElementById('sort-filter');
    const clearFiltersBtn = document.getElementById('clear-filters');

    const specializations = [...new Set(allTherapists.flatMap(t => t.specialization))].sort();
    if (specializationFilter) {
        specializationFilter.innerHTML = `<option value="">${tt('selection.specialization', 'Specialization')}</option>` +
            specializations.map(s => `<option value="${s}">${translateSpecialization(s)}</option>`).join('');
        specializationFilter.addEventListener('change', handleFilterChange);
    }

    const languages = [...new Set(allTherapists.flatMap(t => t.languages || []))].sort();
    if (languageFilter) {
        languageFilter.innerHTML = `<option value="">${tt('selection.language', 'Language')}</option>` +
            languages.map(l => `<option value="${l}">${translateLanguage(l)}</option>`).join('');
        languageFilter.addEventListener('change', handleFilterChange);
    }

    if (therapyTypeFilter) {
        therapyTypeFilter.innerHTML = `
            <option value="">${tt('selection.sessionType', 'Session Type')}</option>
            <option value="online">${tt('booking.online', 'Online')}</option>
            <option value="face-to-face">${tt('booking.inPerson', 'In-person')}</option>
            <option value="both">${tt('selection.both', 'Both')}</option>
        `;
        therapyTypeFilter.addEventListener('change', handleFilterChange);
    }

    if (experienceFilter) experienceFilter.addEventListener('change', handleFilterChange);
    if (sortFilter) sortFilter.addEventListener('change', handleFilterChange);

    if (priceFilter) {
        const maxPrice = allTherapists.length ? Math.max(200, ...allTherapists.map(t => t.price || 0)) : 200;
        priceFilter.max = maxPrice;
        priceFilter.value = maxPrice;
        priceFilter.addEventListener('input', handleFilterChange);
        updatePriceDisplay(maxPrice);
    }

    if (ratingFilter) {
        ratingFilter.addEventListener('input', handleFilterChange);
        updateRatingDisplay(0);
    }

    if (clearFiltersBtn) clearFiltersBtn.addEventListener('click', clearFilters);
}

function setupSearch() {
    const searchInput = document.getElementById('therapist-search');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

function handleFilterChange() {
    const get = id => { const el = document.getElementById(id); return el ? el.value : ''; };
    currentFilters.specialization = get('specialization-filter');
    currentFilters.language = get('language-filter');
    currentFilters.therapyType = get('therapy-type-filter');
    currentFilters.experience = get('experience-filter');
    currentFilters.maxPrice = get('price-filter') ? parseInt(get('price-filter')) : null;
    currentFilters.minRating = get('rating-filter') ? parseFloat(get('rating-filter')) : 0;
    currentFilters.sort = get('sort-filter');

    if (currentFilters.maxPrice !== null) updatePriceDisplay(currentFilters.maxPrice);
    updateRatingDisplay(currentFilters.minRating);

    applyFilters();
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredTherapists = [...allTherapists];
    } else {
        filteredTherapists = allTherapists.filter(therapist => {
            return therapist.name.toLowerCase().includes(searchTerm) ||
                   therapist.specialization.some(spec => spec.toLowerCase().includes(searchTerm)) ||
                   therapist.bio.toLowerCase().includes(searchTerm);
        });
    }

    applyFilters();
}

function applyFilters() {
    let therapists = [...filteredTherapists];

    if (currentFilters.specialization) {
        therapists = therapists.filter(t => t.specialization.includes(currentFilters.specialization));
    }
    if (currentFilters.language) {
        therapists = therapists.filter(t => (t.languages || []).includes(currentFilters.language));
    }
    if (currentFilters.therapyType) {
        therapists = therapists.filter(t => t.therapyType === currentFilters.therapyType || t.therapyType === 'both');
    }
    if (currentFilters.experience) {
        therapists = therapists.filter(t => {
            const exp = t.experience || 0;
            if (currentFilters.experience === 'junior') return exp >= 1 && exp <= 5;
            if (currentFilters.experience === 'mid') return exp > 5 && exp <= 10;
            if (currentFilters.experience === 'senior') return exp > 10;
            return true;
        });
    }
    if (currentFilters.maxPrice !== null) {
        therapists = therapists.filter(t => t.price <= currentFilters.maxPrice);
    }
    if (currentFilters.minRating > 0) {
        therapists = therapists.filter(t => t.rating >= currentFilters.minRating);
    }

    if (currentFilters.sort) {
        therapists.sort((a, b) => {
            if (currentFilters.sort === 'rating') return (b.rating || 0) - (a.rating || 0);
            if (currentFilters.sort === 'price-low') return (a.price || 0) - (b.price || 0);
            if (currentFilters.sort === 'price-high') return (b.price || 0) - (a.price || 0);
            if (currentFilters.sort === 'experience') return (b.experience || 0) - (a.experience || 0);
            return 0;
        });
    }

    renderTherapists(therapists);
}

function clearFilters() {
    currentFilters = {
        specialization: '', language: '', therapyType: '', experience: '',
        maxPrice: null, minRating: 0, sort: ''
    };

    const ids = ['specialization-filter', 'language-filter', 'therapy-type-filter', 'experience-filter', 'sort-filter', 'therapist-search'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) {
        const maxPrice = allTherapists.length ? Math.max(200, ...allTherapists.map(t => t.price || 0)) : 200;
        priceFilter.value = maxPrice;
        updatePriceDisplay(maxPrice);
    }
    const ratingFilter = document.getElementById('rating-filter');
    if (ratingFilter) {
        ratingFilter.value = 0;
        updateRatingDisplay(0);
    }

    filteredTherapists = [...allTherapists];
    applyFilters();
}

function updatePriceDisplay(value) {
    const priceDisplay = document.getElementById('price-display');
    if (priceDisplay) {
        priceDisplay.textContent = `$${value}`;
    }
}

function updateRatingDisplay(value) {
    const ratingDisplay = document.getElementById('rating-display');
    if (ratingDisplay) {
        ratingDisplay.textContent = value === 0 ? tt('selection.any', 'Any') : value.toFixed(1) + '+';
    }
}

function renderTherapists(therapists = filteredTherapists) {
    const container = document.getElementById('therapists-container');
    const resultsCount = document.getElementById('results-count');
    if (!container) return;

    // Update results count
    if (resultsCount) {
        if (typeof tParam === 'function') {
            if (therapists.length === 0) {
                resultsCount.textContent = (typeof t === 'function' ? t('selection.noTherapists') : 'No therapists found');
            } else if (therapists.length === allTherapists.length) {
                resultsCount.textContent = tParam('selection.showingAllCount', { count: therapists.length });
            } else {
                resultsCount.textContent = tParam('selection.showingCountOf', { count: therapists.length, total: allTherapists.length });
            }
        } else {
            if (therapists.length === 0) {
                resultsCount.textContent = 'No therapists found';
            } else if (therapists.length === allTherapists.length) {
                resultsCount.textContent = `Showing all ${therapists.length} therapists`;
            } else {
                resultsCount.textContent = `Showing ${therapists.length} of ${allTherapists.length} therapists`;
            }
        }
    }

    if (therapists.length === 0) {
        const noTherapists = typeof t === 'function' ? t('selection.noTherapists') : 'No therapists found';
        const tryAdjusting = typeof t === 'function' ? t('selection.tryAdjusting') : 'Try adjusting your filters or search terms.';
        const clearFiltersText = typeof t === 'function' ? t('selection.clearFilters') : 'Clear Filters';
        container.innerHTML = `
            <div class="no-results-modern">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <h3>${noTherapists}</h3>
                <p>${tryAdjusting}</p>
                <button class="btn btn-outline btn-sm" id="clear-filters-inline">${clearFiltersText}</button>
            </div>
        `;
        const clearBtn = document.getElementById('clear-filters-inline');
        if (clearBtn) {
            clearBtn.addEventListener('click', clearFilters);
        }
        return;
    }

    container.innerHTML = therapists.map(therapist => `
        <div class="therapist-card-modern" data-therapist-id="${therapist.id}">
            <div class="therapist-card-modern-image">
                ${therapistPhotoImgHtml(therapist)}
            </div>
            <div class="therapist-card-modern-content">
                <h3 class="therapist-card-modern-name">${therapist.name}</h3>
                <div class="therapist-card-modern-specs">
                    ${therapist.specialization.slice(0, 3).map(spec => `<span class="spec-chip-modern">${translateSpecialization(spec)}</span>`).join('')}
                    ${therapist.specialization.length > 3 ? `<span class="spec-chip-modern spec-more">+${therapist.specialization.length - 3}</span>` : ''}
                </div>
                <p class="therapist-card-modern-bio">${translateBio(therapist.bio).substring(0, 100)}${translateBio(therapist.bio).length > 100 ? '...' : ''}</p>
                <div class="therapist-card-modern-footer">
                    <div class="therapist-card-modern-meta">
                        <span class="therapist-rating-modern">⭐ ${therapist.rating}</span>
                        <span class="therapist-exp-modern">${therapist.experience} ${tt('selection.yearsShort', 'yrs')}</span>
                        <span class="therapist-lang-modern">${therapist.languages.slice(0, 2).map(translateLanguage).join(', ')}</span>
                    </div>
                    <div class="therapist-card-modern-price">$${therapist.price}</div>
                </div>
                <button class="btn btn-primary btn-sm therapist-view-btn-modern">${tt('selection.viewProfile', 'View Profile')}</button>
            </div>
        </div>
    `).join('');

    // Add click handlers
    container.querySelectorAll('.therapist-card-modern').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('therapist-view-btn-modern')) {
                const therapistId = card.dataset.therapistId;
                window.location.href = `therapist-profile.html?id=${therapistId}`;
            }
        });

        const viewBtn = card.querySelector('.therapist-view-btn-modern');
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const therapistId = card.dataset.therapistId;
                window.location.href = `therapist-profile.html?id=${therapistId}`;
            });
        }
    });
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '★';
    }
    if (hasHalfStar) {
        stars += '☆';
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '☆';
    }

    return stars;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTherapistSelection);
} else {
    initTherapistSelection();
}

window.addEventListener('i18n-updated', () => {
    setupFilters();
    renderTherapists();
});
