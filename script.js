document.addEventListener('DOMContentLoaded', () => {
    // Reveal animations on scroll
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    // Elements to animate
    const animateElements = document.querySelectorAll('.hero-content, .hero-visual, .section-number, .work-card, .feature-card, h2, p');
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });

    // Custom CSS for active state
    const style = document.createElement('style');
    style.innerHTML = `
        .active {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // Header scroll effect
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Mobile hamburger nav
    const navToggle = document.querySelector('.nav-toggle');
    const navContent = document.querySelector('.nav-content');
    if (navToggle && navContent) {
        const closeMenu = () => {
            navContent.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Open menu');
            document.body.classList.remove('menu-open');
        };
        navToggle.addEventListener('click', () => {
            const isOpen = navContent.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
            document.body.classList.toggle('menu-open', isOpen);
        });
        navContent.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
        document.addEventListener('click', (e) => {
            if (!navContent.classList.contains('open')) return;
            if (navContent.contains(e.target)) return;
            closeMenu();
        });
    }

    // Metrics: count-up animation
    function countUp(el, target, prefix, suffix, duration) {
        const start = performance.now();
        const update = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = prefix + Math.round(eased * target) + suffix;
            if (p < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    }

    const metricEls = document.querySelectorAll('.metric-number');
    const metricsObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            metricEls.forEach((el, i) => {
                const target = parseInt(el.dataset.target);
                const prefix = el.dataset.prefix;
                const suffix = el.dataset.suffix;
                setTimeout(() => {
                    el.classList.add('visible');
                    countUp(el, target, prefix, suffix, 1200);
                }, i * 150);
            });
            metricsObserver.disconnect();
        }
    }, { threshold: 0.5 });
    if (metricEls.length) metricsObserver.observe(metricEls[0]);

    // Platform preview - feature list clicks
    const platformFeatures = document.querySelectorAll('.platform-feature, .tab-item');
    const previewScreens = document.querySelectorAll('.preview-screen');
    const calloutGroups = document.querySelectorAll('.callout-group');

    platformFeatures.forEach(feature => {
        feature.addEventListener('click', () => {
            const target = feature.dataset.tab;
            
            // Toggle active classes for nav items
            platformFeatures.forEach(f => f.classList.remove('active'));
            feature.classList.add('active');

            // Toggle screens
            previewScreens.forEach(s => s.classList.remove('active'));
            const screen = document.querySelector(`.preview-screen[data-tab="${target}"]`);
            if (screen) screen.classList.add('active');

            // Toggle callout groups
            calloutGroups.forEach(g => g.classList.remove('active'));
            const group = document.querySelector(`.callout-group[data-tab="${target}"]`);
            if (group) group.classList.add('active');
        });
    });

    // Module cards: staggered entrance
    const moduleCards = document.querySelectorAll('.module-card');
    const cardObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            moduleCards.forEach((card, i) => {
                setTimeout(() => card.classList.add('card-visible'), i * 130);
            });
            cardObserver.disconnect();
        }
    }, { threshold: 0.1 });
    if (moduleCards.length) cardObserver.observe(moduleCards[0]);

    // Mouse-reactive spotlight on callout cards
    document.querySelectorAll('.v9-ig-cell').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
            const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%';
            card.style.setProperty('--mouse-x', x);
            card.style.setProperty('--mouse-y', y);
        });
    });
    // Dominant Visualization Hotspots
    const hotspots = document.querySelectorAll('.platform-hotspot');
    const visTitle = document.getElementById('vis-title');
    const visDesc = document.getElementById('vis-desc');

    hotspots.forEach(hotspot => {
        hotspot.addEventListener('mouseenter', () => {
            const title = hotspot.dataset.title;
            const desc = hotspot.dataset.desc;
            
            visTitle.textContent = title;
            visDesc.textContent = desc;
            
            visTitle.style.transform = 'translateY(-5px)';
            setTimeout(() => {
                visTitle.style.transform = 'translateY(0)';
            }, 200);
        });
    });
});
