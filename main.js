/* main.js — Ini Abimbola, DBA — Shared across all pages */

// Header scroll + transparent hero 
const header = document.getElementById('header');
const isHeroPage = header && header.classList.contains('hero-transparent');

function handleScroll() {
    if (!header) return;
    const scrolled = window.scrollY > 60;
    header.classList.toggle('scrolled', scrolled);
    if (isHeroPage) {
        if (scrolled) {
            header.style.background = 'rgba(17,24,39,0.97)';
            header.style.borderBottomColor = 'rgba(184,152,109,0.15)';
        } else {
            header.style.background = 'transparent';
            header.style.borderBottomColor = 'transparent';
        }
    }
}
window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

// Mobile nav 
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

function openNav() {
    hamburger.classList.add('active');
    navLinks.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
}
function closeNav() {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}
if (hamburger) {
    hamburger.addEventListener('click', () =>
        navLinks.classList.contains('active') ? closeNav() : openNav()
    );
    hamburger.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); hamburger.click(); }
    });
}
if (navLinks) {
    navLinks.addEventListener('click', e => { if (e.target.tagName === 'A') closeNav(); });
}
document.addEventListener('click', e => {
    if (navLinks && navLinks.classList.contains('active') &&
        !navLinks.contains(e.target) && hamburger && !hamburger.contains(e.target)) {
        closeNav();
    }
}, { passive: true });

// Hero Slider (home page only) 
const slides       = document.querySelectorAll('.hero-slide');
const indicatorBox = document.getElementById('heroIndicators');
let current  = 0;
let autoTimer;

if (slides.length > 0 && indicatorBox) {
    // Build dots
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => goToSlide(i));
        indicatorBox.appendChild(dot);
    });

    function goToSlide(n) {
        slides[current].classList.remove('active');
        indicatorBox.children[current].classList.remove('active');
        current = (n + slides.length) % slides.length;
        slides[current].classList.add('active');
        indicatorBox.children[current].classList.add('active');
    }

    function startAuto() {
        autoTimer = setInterval(() => goToSlide(current + 1), 5000);
    }
    function stopAuto() { clearInterval(autoTimer); }

    startAuto();

    // Pause on hover
    const heroEl = document.getElementById('hero');
    if (heroEl) {
        heroEl.addEventListener('mouseenter', stopAuto);
        heroEl.addEventListener('mouseleave', startAuto);
    }

    // Touch swipe
    let touchStartX = 0;
    document.getElementById('hero')?.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    document.getElementById('hero')?.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) goToSlide(diff > 0 ? current + 1 : current - 1);
    }, { passive: true });
}

// Scroll reveal (IntersectionObserver) 
const revealTargets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

if (revealTargets.length) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealTargets.forEach(el => revealObserver.observe(el));
}

// Newsletter form 
const nlForm    = document.getElementById('newsletterForm');
const nlSuccess = document.getElementById('nlSuccess');

if (nlForm) {
    nlForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('nlEmail');
        if (!email || !isValidEmail(email.value.trim())) {
            email.style.borderColor = '#e74c3c';
            setTimeout(() => email.style.borderColor = '', 2000);
            return;
        }
        nlForm.style.display = 'none';
        if (nlSuccess) nlSuccess.style.display = 'block';
    });
}

// Contact form (general + speaking) 
function setupForm(formId, btnId) {
    const form = document.getElementById(formId);
    const btn  = document.getElementById(btnId);
    if (!form || !btn) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        let valid = true;
        form.querySelectorAll('[required]').forEach(field => {
            const grp = field.closest('.form-group');
            const val = field.value.trim();
            const emailFail = field.type === 'email' && !isValidEmail(val);
            if (!val || emailFail) {
                grp.classList.add('error'); valid = false;
            } else {
                grp.classList.remove('error');
            }
        });
        if (!valid) return;

        const btnText = btn.querySelector('.btn-text');
        const orig = btnText.textContent;
        btnText.textContent = 'Sending…';
        btn.disabled = true;

        setTimeout(() => {
            btnText.textContent = '✓ Sent Successfully!';
            btn.style.background = '#27ae60';
            btn.style.borderColor = '#27ae60';
            setTimeout(() => {
                btnText.textContent = orig;
                btn.disabled = false;
                btn.style.background = '';
                btn.style.borderColor = '';
                form.reset();
            }, 3500);
        }, 1200);
    });

    // Live validation cleanup
    form.querySelectorAll('[required]').forEach(field => {
        field.addEventListener('input', () => {
            const grp = field.closest('.form-group');
            if (grp.classList.contains('error')) {
                const val = field.value.trim();
                const ok  = field.type === 'email' ? isValidEmail(val) : !!val;
                if (ok) grp.classList.remove('error');
            }
        });
    });
}

setupForm('generalForm', 'gSubmit');
setupForm('speakingForm', 'sSubmit');

// Form mode toggle (connect page) 
window.switchForm = function(mode) {
    document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.form-toggle-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`form${mode.charAt(0).toUpperCase() + mode.slice(1)}`)?.classList.add('active');
    document.getElementById(`tab${mode.charAt(0).toUpperCase() + mode.slice(1)}`)?.classList.add('active');
};

// Utility 
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Page fade-in
document.addEventListener('DOMContentLoaded', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.4s ease';
    requestAnimationFrame(() => {
        document.body.style.opacity = '1';
    });
});
