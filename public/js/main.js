'use strict';

/* ==========================================================================
   Main JS — Jardín de Mariposas La Paz
   Motion system: scroll reveals, header state, nav, clip-path, stagger.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Header scroll state ------------------------------------------------
  const header = document.querySelector('.site-header');
  if (header) {
    let lastScroll = 0;
    const onScroll = () => {
      const scrollY = window.scrollY;
      header.classList.toggle('is-scrolled', scrollY > 40);
      lastScroll = scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // --- Mobile nav toggle --------------------------------------------------
  const toggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('nav-list');

  if (toggle && navList) {
    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!isOpen));
      navList.classList.toggle('is-open', !isOpen);
      toggle.setAttribute(
        'aria-label',
        isOpen ? 'Abrir menú de navegación' : 'Cerrar menú de navegación'
      );
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navList.classList.contains('is-open')) {
        toggle.setAttribute('aria-expanded', 'false');
        navList.classList.remove('is-open');
        toggle.setAttribute('aria-label', 'Abrir menú de navegación');
        toggle.focus();
      }
    });

    document.addEventListener('click', (e) => {
      if (
        navList.classList.contains('is-open') &&
        !navList.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        toggle.setAttribute('aria-expanded', 'false');
        navList.classList.remove('is-open');
        toggle.setAttribute('aria-label', 'Abrir menú de navegación');
      }
    });
  }

  // --- Scroll reveal (IntersectionObserver) -------------------------------
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealElements = document.querySelectorAll(
      '.reveal, .reveal-clip, .reveal-stagger, .reveal-image'
    );

    if (revealElements.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.08,
          rootMargin: '0px 0px -60px 0px',
        }
      );

      revealElements.forEach((el) => observer.observe(el));
    }
  } else {
    // Reduced motion: show everything immediately
    document
      .querySelectorAll('.reveal, .reveal-clip, .reveal-stagger, .reveal-image')
      .forEach((el) => {
        el.classList.add('is-visible');
      });
  }
});
