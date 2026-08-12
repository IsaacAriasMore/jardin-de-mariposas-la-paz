'use strict';

/* ==========================================================================
   Main JS — Jardín de Mariposas La Paz
   Motion system: scroll reveals, header state, nav, clip-path, stagger.
   La clase .js habilita los estados ocultos de reveal (progressive
   enhancement): sin JS el contenido permanece visible.
   ========================================================================== */

document.documentElement.classList.add('js');

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
    const setMenuState = (isOpen) => {
      toggle.setAttribute('aria-expanded', String(isOpen));
      navList.classList.toggle('is-open', isOpen);
      toggle.setAttribute(
        'aria-label',
        isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación',
      );
      if (!isOpen) toggle.focus();
    };

    toggle.addEventListener('click', () => {
      setMenuState(toggle.getAttribute('aria-expanded') !== 'true');
    });

    navList.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuState(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navList.classList.contains('is-open')) {
        setMenuState(false);
      }
    });

    document.addEventListener('click', (e) => {
      if (
        navList.classList.contains('is-open') &&
        !navList.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        setMenuState(false);
      }
    });
  }

  // --- Scroll reveal (IntersectionObserver) -------------------------------
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealElements = document.querySelectorAll(
      '.reveal, .reveal-clip, .reveal-stagger, .reveal-image',
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
        },
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
