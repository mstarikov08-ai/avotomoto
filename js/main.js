(function () {
    'use strict';

    const html = document.documentElement;
    const nav = document.getElementById('nav');
    const menuToggle = document.getElementById('menuToggle');
    const langButtons = document.querySelectorAll('.lang-btn');
    const joinForm = document.getElementById('joinForm');

    // Language switching
    function setLanguage(lang) {
        if (!translations[lang]) return;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                if (el.tagName === 'TITLE') {
                    document.title = translations[lang][key];
                } else if (el.tagName === 'OPTION') {
                    el.textContent = translations[lang][key];
                } else {
                    el.textContent = translations[lang][key];
                }
            }
        });

        html.lang = lang === 'zh' ? 'zh-CN' : lang;

        langButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
            btn.setAttribute('aria-pressed', btn.dataset.lang === lang);
        });

        try {
            localStorage.setItem('site-lang', lang);
        } catch (e) {
            // ignore
        }
    }

    function getSavedLang() {
        try {
            return localStorage.getItem('site-lang');
        } catch (e) {
            return null;
        }
    }

    const savedLang = getSavedLang();
    const initialLang = savedLang && translations[savedLang] ? savedLang : 'ru';
    setLanguage(initialLang);

    langButtons.forEach(btn => {
        btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });

    // Mobile menu
    function toggleMenu() {
        const isOpen = nav.classList.toggle('active');
        menuToggle.classList.toggle('active', isOpen);
        menuToggle.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', toggleMenu);

        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (nav.classList.contains('active')) toggleMenu();
            });
        });
    }

    // Header scroll effect
    const header = document.getElementById('header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            header.style.background = 'rgba(11, 15, 20, 0.96)';
            header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.2)';
        } else {
            header.style.background = 'rgba(11, 15, 20, 0.85)';
            header.style.boxShadow = 'none';
        }
        lastScroll = currentScroll;
    }, { passive: true });

    // Animated counters
    const counters = document.querySelectorAll('[data-count]');
    const observerOptions = { threshold: 0.5 };

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count, 10);
                const suffix = el.dataset.suffix || '+';
                const duration = 1500;
                const startTime = performance.now();

                function update(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const ease = 1 - Math.pow(1 - progress, 3);
                    const value = Math.floor(ease * target);
                    el.textContent = value + suffix;

                    if (progress < 1) {
                        requestAnimationFrame(update);
                    }
                }

                requestAnimationFrame(update);
                observer.unobserve(el);
            }
        });
    }, observerOptions);

    counters.forEach(counter => counterObserver.observe(counter));

    // Scroll reveal
    const revealElements = document.querySelectorAll('.section__header, .direction-card, .route-card, .event-card, .about__card, .feature');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        revealObserver.observe(el);
    });

    // Form handling
    if (joinForm) {
        joinForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = joinForm.querySelector('#name').value.trim();
            const email = joinForm.querySelector('#email').value.trim();
            const submitBtn = joinForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            if (!name || !email) {
                alert(translations[html.lang === 'zh-CN' ? 'zh' : html.lang]['join.labelName'] + ' / ' + translations[html.lang === 'zh-CN' ? 'zh' : html.lang]['join.labelEmail']);
                return;
            }

            submitBtn.disabled = true;
            submitBtn.textContent = '...';

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = html.lang === 'zh-CN' ? '已发送' : (html.lang === 'en' ? 'Sent' : 'Отправлено');
                joinForm.reset();

                setTimeout(() => {
                    submitBtn.textContent = originalText;
                }, 2000);
            }, 1200);
        });
    }

    // Smooth scroll polyfill for Safari / old browsers
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
})();
