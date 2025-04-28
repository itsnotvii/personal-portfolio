document.addEventListener('DOMContentLoaded', () => {
    createTileGrid();
    setupContactForm();
    setupSmoothScrolling();
    setupProjectDropdowns();
    setupGoToTopButton();
    setupAboutAnimation();
    setupGallery(); // Handles both gallery grid and lightbox
});

function createTileGrid() {
    const grid = document.getElementById('tile-grid');
    if (!grid) return;

    const columns = 8;
    const rows = 5;
    const totalTiles = columns * rows;
    
    grid.style.setProperty('--columns', columns);
    grid.style.setProperty('--rows', rows);
    grid.innerHTML = '';
    
    for (let i = 0; i < totalTiles; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.style.opacity = '0';
        setTimeout(() => {
            tile.style.opacity = '1';
        }, 100 + (i * 20));
        grid.appendChild(tile);
    }
}

function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        try {
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            console.log('Form data:', Object.fromEntries(formData));
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            alert('Thank you for your message!');
            form.reset();
        } catch (error) {
            console.error('Error:', error);
            alert('There was an error sending your message.');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    });
}

function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function setupProjectDropdowns() {
    const projects = document.querySelectorAll('.project-item');
    
    projects.forEach(project => {
        const header = project.querySelector('.project-header');
        const toggle = project.querySelector('.dropdown-toggle');
        
        project.setAttribute('data-expanded', 'false');
        
        const toggleProject = (e) => {
            if (e) e.stopPropagation();
            const isExpanded = project.getAttribute('data-expanded') === 'true';
            project.setAttribute('data-expanded', !isExpanded);
        };
        
        if (toggle) {
            toggle.addEventListener('click', toggleProject);
        }
        
        if (header) {
            header.addEventListener('click', (e) => {
                if (!e.target.closest('.dropdown-toggle')) {
                    toggleProject();
                }
            });
        }
    });
}

function setupGoToTopButton() {
    const goToTopButton = document.getElementById('go-to-top');
    if (!goToTopButton) return;

    toggleGoToTopButton();
    
    window.addEventListener('scroll', toggleGoToTopButton);

    goToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    function toggleGoToTopButton() {
        if (window.pageYOffset > 300) {
            goToTopButton.classList.add('visible');
        } else {
            goToTopButton.classList.remove('visible');
        }
    }
}

function setupAboutAnimation() {
    const aboutSection = document.querySelector('.about');
    const animatedParagraphs = document.querySelectorAll('.about-text p[data-animate]');
    
    if (!aboutSection || !animatedParagraphs.length) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animatedParagraphs.forEach((p, index) => {
                    setTimeout(() => {
                        p.setAttribute('data-animate', 'true');
                    }, index * 150);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    observer.observe(aboutSection);
}

function setupGallery() {
    // DOM Elements
    const viewport = document.querySelector('.gallery-container');
    const track = document.querySelector('.gallery-track');
    const items = document.querySelectorAll('.gallery-item');
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');
    const dotsContainer = document.querySelector('.gallery-dots');
    
    if (!track || items.length === 0) return;

    // 1. Setup Grid Layout
    function initGridLayout() {
        viewport.style.display = 'grid';
        viewport.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
        viewport.style.gap = '2rem';
        viewport.style.padding = '1rem';
        track.style.display = 'contents';
        
        items.forEach(item => {
            item.style.flex = 'unset';
            item.style.width = 'unset';
            item.style.aspectRatio = '16/9';
        });
    }

    // 2. Initialize Lightbox
    function initLightbox() {
        const lightboxHTML = `
            <div class="lightbox">
                <button class="close-lightbox">&times;</button>
                <div class="lightbox-content">
                    <img src="" alt="" id="lightbox-image">
                    <div class="lightbox-caption"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);

        const lightbox = document.querySelector('.lightbox');
        const lightboxImg = document.getElementById('lightbox-image');
        const lightboxCaption = document.querySelector('.lightbox-caption');
        const closeBtn = document.querySelector('.close-lightbox');

        // Image click handlers
        items.forEach(item => {
            const img = item.querySelector('img');
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightboxCaption.textContent = img.alt || '';
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        // Close handlers
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => e.target === lightbox && closeLightbox());
        document.addEventListener('keydown', (e) => e.key === 'Escape' && closeLightbox());

        function closeLightbox() {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // 3. Setup Gallery Navigation
    function initNavigation() {
        const dotCount = Math.ceil(items.length / 3);
        dotsContainer.innerHTML = '';
        
        // Create dots
        for (let i = 0; i < dotCount; i++) {
            const dot = document.createElement('div');
            dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }

        // Navigation controls
        prevBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            navigate(-1);
        });
        
        nextBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            navigate(1);
        });
    }

    // State Management
    let currentIndex = 0;
    let isDragging = false;
    let startX = 0;
    const dots = document.querySelectorAll('.gallery-dot');

    function navigate(direction) {
        const maxIndex = Math.ceil(items.length / 3) - 1;
        currentIndex = Math.max(0, Math.min(currentIndex + direction, maxIndex));
        updateGalleryPosition();
    }

    function goToSlide(index) {
        currentIndex = index;
        updateGalleryPosition();
    }

    function updateGalleryPosition() {
        const containerWidth = viewport.offsetWidth;
        track.style.transform = `translateX(-${currentIndex * containerWidth}px)`;
        updateDots();
    }

    function updateDots() {
        dots.forEach((dot, index) => dot.classList.toggle('active', index === currentIndex));
    }

    function updateGalleryLayout() {
        const itemWidth = viewport.offsetWidth / 3 - parseFloat(getComputedStyle(track).gap);
        track.style.width = `${items.length * (itemWidth + parseFloat(getComputedStyle(track).gap))}px`;
        
        items.forEach(item => {
            item.style.flex = `0 0 ${itemWidth}px`;
            item.style.transform = 'translateX(0)';
        });
    }

    function setupGalleryTilt() {
        items.forEach(item => {
            const originalTransform = window.getComputedStyle(item).transform;
            
            item.addEventListener('mousemove', (e) => {
                if (!isDragging) {
                    const rect = item.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    const tiltX = (centerY - y) / 15; 
                    const tiltY = (x - centerX) / 15; 
                    
                    item.style.transform = `${originalTransform} perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
                }
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = originalTransform;
            });
        });
    }

    function handleTouchStart(e) {
        startX = e.touches[0].clientX;
        isDragging = true;
        track.style.transition = 'none';
        items.forEach(item => {
            item.style.transform = 'translateX(0)';
        });
    }
    
    function handleTouchMove(e) {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.touches[0].clientX;
        const diff = startX - x;
        track.style.transform = `translateX(calc(-${currentIndex * 100}% - ${diff}px))`;
    }
    
    function handleTouchEnd(e) {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = 'transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)';
        
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        
        if (Math.abs(diff) > 50) {
            navigate(diff > 0 ? 1 : -1);
        } else {
            updateGalleryPosition();
        }
    }
    
    function handleMouseDown(e) {
        startX = e.clientX;
        isDragging = true;
        track.style.transition = 'none';
        track.style.cursor = 'grabbing';
        items.forEach(item => {
            item.style.transform = 'translateX(0)';
        });
    }
    
    function handleMouseMove(e) {
        if (!isDragging) return;
        const x = e.clientX;
        const diff = startX - x;
        track.style.transform = `translateX(calc(-${currentIndex * 100}% - ${diff}px))`;
    }
    
    function handleMouseUp() {
        if (!isDragging) return;
        isDragging = false;
        track.style.transition = 'transform 0.6s cubic-bezier(0.33, 1, 0.68, 1)';
        track.style.cursor = 'grab';
        updateGalleryPosition();
    }

    // Initialize all systems
    initGridLayout();
    initLightbox();
    initNavigation();
    updateGalleryLayout();
    updateDots();
    setupGalleryTilt();

    // Event Listeners
    window.addEventListener('resize', updateGalleryLayout);
    track.addEventListener('touchstart', handleTouchStart, { passive: true });
    track.addEventListener('touchmove', handleTouchMove, { passive: false });
    track.addEventListener('touchend', handleTouchEnd);
    track.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
}