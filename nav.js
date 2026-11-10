// Mobile menu for pages that don't load script.js (blog, tools, privacy, 404).
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navContent = document.querySelector('.nav-content');
    if (!navToggle || !navContent) return;
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
    navContent.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('click', (e) => {
        if (navContent.classList.contains('open') && !navContent.contains(e.target)) closeMenu();
    });
});
