/**
 * home.js — Ini Abimbola Website
 * Handles: header scroll, mobile nav, carousels, form validation
 */

//  Header scroll shadow 
const header = document.getElementById('header');

function onScroll() {
    if (window.scrollY > 20) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

window.addEventListener('scroll', onScroll, { passive: true });

//  Active nav link on scroll 
const navLinks  = document.querySelectorAll('.nav-links a');
const sections  = document.querySelectorAll('section[id]');

function highlightNav() {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', highlightNav, { passive: true });
highlightNav();

//  Mobile hamburger menu  
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navLinks');

function openMenu() {
    hamburger.classList.add('active');
    navMenu.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
}

function closeMenu() {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

function toggleMenu() {
    if (navMenu.classList.contains('active')) {
        closeMenu();
    } else {
        openMenu();
    }
}

hamburger.addEventListener('click', toggleMenu);
hamburger.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMenu();
    }
});

// Close menu on nav link click
navMenu.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
        closeMenu();
    }
});

// Close on outside click
document.addEventListener('click', e => {
    if (navMenu.classList.contains('active') &&
        !navMenu.contains(e.target) &&
        !hamburger.contains(e.target)) {
        closeMenu();
    }
}, { passive: true });

//  Generic Carousel factory    
function createCarousel({ trackId, prevBtnId, nextBtnId, indicatorsId }) {
    const track      = document.getElementById(trackId);
    const prevBtn    = document.getElementById(prevBtnId);
    const nextBtn    = document.getElementById(nextBtnId);
    const indicators = document.getElementById(indicatorsId);

    if (!track || !prevBtn || !nextBtn || !indicators) return;

    const items  = track.children;
    const total  = items.length;
    let current  = 0;
    let startX   = 0;
    let isDragging = false;

    // Build indicator dots
    for (let i = 0; i < total; i++) {
        const dot = document.createElement('button');
        dot.classList.add('indicator');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goTo(i));
        indicators.appendChild(dot);
    }

    function goTo(index) {
        current = Math.max(0, Math.min(index, total - 1));
        track.style.transform = `translateX(-${current * 100}%)`;

        // Update dots
        indicators.querySelectorAll('.indicator').forEach((dot, i) => {
            dot.classList.toggle('active', i === current);
        });

        // Update buttons
        prevBtn.disabled = current === 0;
        nextBtn.disabled = current === total - 1;
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    // Keyboard navigation
    track.parentElement.setAttribute('tabindex', '0');
    track.parentElement.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') goTo(current - 1);
        if (e.key === 'ArrowRight') goTo(current + 1);
    });

    // Touch / swipe support
    track.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        isDragging = true;
    }, { passive: true });

    track.addEventListener('touchend', e => {
        if (!isDragging) return;
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            goTo(diff > 0 ? current + 1 : current - 1);
        }
        isDragging = false;
    }, { passive: true });

    // Initialise
    goTo(0);
}

//  Init carousels 
createCarousel({
    trackId:      'timelineTrack',
    prevBtnId:    'prevTimeline',
    nextBtnId:    'nextTimeline',
    indicatorsId: 'timelineIndicators',
});

createCarousel({
    trackId:      'achievementsTrack',
    prevBtnId:    'prevAchievement',
    nextBtnId:    'nextAchievement',
    indicatorsId: 'achievementIndicators',
});

//  Contact form validation 
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', e => {
        e.preventDefault();
        let isValid = true;

        const fields = contactForm.querySelectorAll('[required]');

        fields.forEach(field => {
            const group = field.closest('.form-group');
            const value = field.value.trim();

            if (!value || (field.type === 'email' && !isValidEmail(value))) {
                group.classList.add('error');
                isValid = false;
            } else {
                group.classList.remove('error');
            }

            field.addEventListener('input', () => {
                if (group.classList.contains('error')) {
                    const v = field.value.trim();
                    if (v && (field.type !== 'email' || isValidEmail(v))) {
                        group.classList.remove('error');
                    }
                }
            }, { once: false });
        });

        if (isValid) {
            const btn      = document.getElementById('submitBtn');
            const btnText  = btn.querySelector('.btn-text');
            const original = btnText.textContent;

            btnText.textContent = 'Sending…';
            btn.disabled = true;

            // Simulate send (replace with real fetch/EmailJS/etc.)
            setTimeout(() => {
                btnText.textContent = '✓ Message Sent!';
                btn.style.background = '#27ae60';
                btn.style.borderColor = '#27ae60';

                setTimeout(() => {
                    btnText.textContent = original;
                    btn.disabled = false;
                    btn.style.background = '';
                    btn.style.borderColor = '';
                    contactForm.reset();
                }, 3000);
            }, 1200);
        }
    });
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
