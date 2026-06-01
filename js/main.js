/* ============================================================
   BeanHive — Main JavaScript
   ============================================================ */
(function () {
  'use strict';

  // ---- Nav scroll state ----
  const nav = document.getElementById('nav');
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        nav.classList.toggle('is-scrolled', window.scrollY > 40);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // ---- Mobile hamburger menu ----
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('is-open');
    navLinks.classList.toggle('is-open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  navLinks.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('is-open');
      navLinks.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && navLinks.classList.contains('is-open')) {
      hamburger.classList.remove('is-open');
      navLinks.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // ---- Scroll-reveal (Intersection Observer) ----
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el    = entry.target;
      const delay = parseInt(el.dataset.delay || 0, 10);
      setTimeout(() => el.classList.add('is-visible'), delay);
      revealObserver.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ---- Animated stat counters ----
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('[data-count]').forEach(el => {
        const target   = parseInt(el.dataset.count, 10);
        const duration = 1400;
        const start    = performance.now();
        const tick = now => {
          const elapsed = Math.min((now - start) / duration, 1);
          // ease-out cubic
          const eased = 1 - Math.pow(1 - elapsed, 3);
          el.textContent = Math.round(eased * target);
          if (elapsed < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  const statsEl = document.querySelector('.about__stats');
  if (statsEl) counterObserver.observe(statsEl);

  // ---- Menu tabs ----
  const tabs   = document.querySelectorAll('.menu__tab');
  const panels = document.querySelectorAll('.menu__panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t  => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      panels.forEach(p => p.classList.remove('is-active'));

      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      const panelId = 'panel-' + tab.dataset.filter;
      const panel   = document.getElementById(panelId);
      if (!panel) return;

      panel.classList.add('is-active');

      // Re-trigger reveal animations for newly shown panel items
      panel.querySelectorAll('.reveal').forEach(el => {
        el.classList.remove('is-visible');
        void el.offsetWidth; // force reflow
        revealObserver.observe(el);
      });
    });
  });

  // ---- Smooth scroll (supplement CSS scroll-behavior for nav offset) ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href   = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ---- Contact form ----
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.textContent;

      // Simple validation
      const required = form.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#c0392b';
          field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
          valid = false;
        }
      });
      if (!valid) return;

      btn.disabled = true;
      btn.textContent = 'Sending…';

      // Simulate async send — replace with your API endpoint
      setTimeout(() => {
        btn.textContent = 'Message sent ✓';
        btn.classList.add('btn--success');
        form.reset();
        setTimeout(() => {
          btn.textContent = orig;
          btn.classList.remove('btn--success');
          btn.disabled = false;
        }, 3500);
      }, 1200);
    });
  }

})();
