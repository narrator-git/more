// Therapist masonry layout (only for landing page)
document.addEventListener('DOMContentLoaded', () => {
    const masonryContainer = document.getElementById('therapist-masonry');
    
    // Only initialize masonry if container exists (landing page)
    if (masonryContainer && typeof mockTherapists !== 'undefined') {
        
        function createTherapistCard(therapist, size = 'medium') {
            const card = document.createElement('div');
            card.className = `therapist-masonry-card therapist-card-${size}`;
            card.dataset.therapistId = therapist.id;
            
            // Create card content
            const rawPhoto = typeof therapistPhotoUrl === 'function' ? therapistPhotoUrl(therapist) : therapist.photo;
            const photoSrc = typeof escapeHtmlAttr === 'function' ? escapeHtmlAttr(rawPhoto) : String(rawPhoto).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
            const nameEsc = String(therapist.name || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');
            card.innerHTML = `
                <div class="therapist-card-image-wrapper">
                    <img src="${photoSrc}" alt="${nameEsc}" loading="lazy" onerror="this.onerror=null;if(typeof therapistPhotoUrl==='function'){this.src=therapistPhotoUrl({name:this.alt||'T',photo:''});}">
                    <div class="therapist-card-overlay">
                        <div class="therapist-card-overlay-content">
                            <div class="therapist-card-name">${therapist.name}</div>
                            <div class="therapist-card-specialties">${therapist.specialization.slice(0, 2).join(' • ')}</div>
                            <div class="therapist-card-meta">
                                <span class="therapist-rating">Rating: ${therapist.rating}</span>
                                <span class="therapist-experience">${therapist.experience} years</span>
                            </div>
                            <div class="therapist-card-price">$${therapist.price}/session</div>
                            <div class="therapist-card-bio-preview">${therapist.bio.substring(0, 100)}...</div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add click handler
            card.addEventListener('click', () => {
                window.location.href = 'therapist-selection.html';
            });
            
            return card;
        }
        
        function createMasonry() {
            masonryContainer.innerHTML = '';
            
            // Shuffle therapists for variety
            const shuffled = [...mockTherapists].sort(() => Math.random() - 0.5);
            
            // Limit to 10-15 therapists for main page preview
            const limit = Math.min(15, shuffled.length);
            const previewTherapists = shuffled.slice(0, limit);
            
            // Create cards with uniform size - use therapist's own photo (UI Avatars)
            previewTherapists.forEach((therapist) => {
                // All cards same size (small)
                const size = 'small';
                
                const card = createTherapistCard(therapist, size);
                masonryContainer.appendChild(card);
            });
        }
        
        // Initialize masonry
        createMasonry();
        
        // Recreate on resize for better responsiveness
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(createMasonry, 300);
        });
    }
});

// Animated word typing effect
document.addEventListener('DOMContentLoaded', () => {
    const words = ['therapy', 'ai', 'platform'];
    let currentWordIndex = 0;
    let isDeleting = false;
    let currentText = '';
    const animatedWordEl = document.getElementById('animated-word');
    
    if (!animatedWordEl) return;
    
    const typingSpeed = 150; // milliseconds per letter when typing
    const deletingSpeed = 100; // milliseconds per letter when deleting
    const delayAfterWord = 1500; // delay after completing a word before deleting
    
    function animateText() {
        const fullWord = words[currentWordIndex];
        
        if (!isDeleting) {
            // Typing mode: add one letter at a time
            currentText = fullWord.substring(0, currentText.length + 1);
            animatedWordEl.textContent = currentText;
            
            if (currentText === fullWord) {
                // Word is complete, wait then start deleting
                setTimeout(() => {
                    isDeleting = true;
                    animateText();
                }, delayAfterWord);
                return;
            }
        } else {
            // Deleting mode: remove one letter at a time
            currentText = fullWord.substring(0, currentText.length - 1);
            animatedWordEl.textContent = currentText;
            
            if (currentText === '') {
                // Word is deleted, move to next word
                isDeleting = false;
                currentWordIndex = (currentWordIndex + 1) % words.length;
            }
        }
        
        // Continue animation
        setTimeout(animateText, isDeleting ? deletingSpeed : typingSpeed);
    }
    
    // Start the animation
    animateText();
});
