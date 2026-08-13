'use strict';

/* Motion is progressive enhancement: all editorial content is visible without JS. */
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const storageKey = 'jmlp-motion-preference-v2';
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const heroVideo = document.querySelector('.hero__video');
  const heroMotionToggle = document.querySelector('[data-hero-motion-toggle]');
  const revealSelector = '.reveal';
  const revealElements = [...document.querySelectorAll(revealSelector)];
  const tiltElements = [...document.querySelectorAll('[data-tilt]')];
  let preference = readPreference();
  let observer;
  let revealGroups = [];
  let scrollFrame;
  let resizeFrame;
  let tiltFrame;
  let tiltTarget;
  let tiltEnabled = false;
  let playState = { status: 'idle', errorName: '', errorMessage: '' };

  function readPreference() {
    try {
      const value = window.localStorage.getItem(storageKey);
      return ['full', 'reduced'].includes(value) ? value : 'full';
    } catch {
      return 'full';
    }
  }

  function savePreference(value) {
    preference = value;
    try {
      window.localStorage.setItem(storageKey, value);
    } catch {
      // Private or embedded contexts can deny storage; the session still works.
    }
  }

  function hasFullMotion() {
    return preference === 'full';
  }

  function setVideoState(status, error) {
    playState = {
      status,
      errorName: error?.name || '',
      errorMessage: error?.message || '',
    };
    if (heroVideo) heroVideo.dataset.videoState = status;
    root.dataset.videoState = status;
  }

  function setHeroToggle() {
    if (!heroMotionToggle) return;
    const full = hasFullMotion();
    const blocked = playState.status === 'blocked' || playState.status === 'error';
    const label = blocked ? 'Reproducir video' : full ? 'Pausar movimiento' : 'Activar movimiento';
    heroMotionToggle.setAttribute('aria-pressed', String(full));
    heroMotionToggle.setAttribute('aria-label', label);
    heroMotionToggle.setAttribute('title', label);
    heroMotionToggle.dataset.mode = full ? 'full' : 'reduced';
    heroMotionToggle.dataset.videoState = playState.status;
    const text = heroMotionToggle.querySelector('.hero__motion-toggle-label');
    if (text) text.textContent = label;
  }

  function requestHeroPlayback() {
    if (!heroVideo) return;
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.playsInline = true;
    setVideoState('loading');
    const playPromise = heroVideo.play();
    if (!playPromise) return;
    playPromise
      .then(() => setVideoState('playing'))
      .catch((error) => {
        setVideoState('blocked', error);
        setHeroToggle();
      });
  }

  function syncHeroVideo({ forcePlay = false } = {}) {
    if (!heroVideo) return;
    if (!hasFullMotion()) {
      heroVideo.pause();
      heroVideo.removeAttribute('src');
      heroVideo.dataset.activeSource = '';
      heroVideo.load();
      setVideoState('paused');
      return;
    }

    const suffix = window.innerWidth >= 769 ? 'Desktop' : 'Mobile';
    const webm = heroVideo.dataset[`source${suffix}Webm`];
    const mp4 = heroVideo.dataset[`source${suffix}Mp4`];
    const supportsWebm = heroVideo.canPlayType('video/webm; codecs="vp9"') !== '';
    const source = supportsWebm && webm ? webm : mp4;
    if (!source) {
      setVideoState('error', new Error('No hay fuente de video disponible.'));
      return;
    }

    if (heroVideo.dataset.activeSource !== source) {
      heroVideo.src = source;
      heroVideo.dataset.activeSource = source;
      heroVideo.load();
      setVideoState('loading');
    }
    if (forcePlay || heroVideo.paused) requestHeroPlayback();
  }

  function bindVideoEvents() {
    if (!heroVideo) return;
    heroVideo.addEventListener('loadstart', () => setVideoState('loading'));
    heroVideo.addEventListener('loadedmetadata', () => setVideoState('loading'));
    heroVideo.addEventListener('canplay', () => {
      if (heroVideo.paused) setVideoState('paused');
    });
    heroVideo.addEventListener('playing', () => setVideoState('playing'));
    heroVideo.addEventListener('pause', () => {
      if (hasFullMotion() && !heroVideo.ended) setVideoState('paused');
    });
    heroVideo.addEventListener('waiting', () => setVideoState('loading'));
    heroVideo.addEventListener('stalled', () => setVideoState('loading'));
    heroVideo.addEventListener('error', () => {
      const mediaError = heroVideo.error;
      const error = mediaError
        ? new Error(`MediaError ${mediaError.code}`)
        : new Error('Error de video.');
      error.name = 'MediaError';
      setVideoState('error', error);
      setHeroToggle();
    });
  }

  function getRevealGroups() {
    return revealElements.filter((element) => !element.parentElement.closest(revealSelector));
  }

  function getGroupItems(group) {
    const declaredItems = [...group.querySelectorAll('[data-motion-item]')];
    return declaredItems.length ? declaredItems : [group];
  }

  function prepareAnimation(target, keyframes, options, image) {
    const animation = target.animate(keyframes, { fill: 'both', ...options });
    animation.pause();
    animation.currentTime = 0;
    target.dataset.revealState = 'prepared';
    return { animation, image, target };
  }

  function createItemAnimations(item) {
    const kind = item.dataset.motionItem || 'copy';
    const easing = 'cubic-bezier(0.23, 1, 0.32, 1)';
    const mobile = window.innerWidth < 769;
    const startOffset = mobile ? 'translateY(32px)' : 'translateX(-24px)';
    const endOffset = mobile ? 'translateY(32px)' : 'translateX(24px)';
    const isGalleryStagger = kind === 'gallery-stagger';
    if (kind === 'stagger' || isGalleryStagger) {
      return [...item.children].flatMap((child, index) => {
        const delay = Math.min(index, 5) * 70;
        const image = child.querySelector('img');
        return [
          prepareAnimation(
            child,
            [
              { opacity: 0, transform: 'translateY(24px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 600, delay, easing },
            image,
          ),
          ...(isGalleryStagger && image
            ? [
                prepareAnimation(
                  image,
                  [{ transform: 'scale(1.035)' }, { transform: 'scale(1)' }],
                  { duration: 600, delay, easing },
                ),
              ]
            : []),
        ];
      });
    }
    if (kind === 'clip') {
      return [
        prepareAnimation(
          item,
          [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }],
          { duration: 680, easing },
        ),
      ];
    }
    if (kind === 'image' || kind === 'media' || kind === 'media-start' || kind === 'media-end') {
      const image = item.querySelector('img');
      const offset =
        kind === 'media-start'
          ? startOffset
          : kind === 'media-end'
            ? endOffset
            : 'translateY(32px)';
      return [
        prepareAnimation(
          item,
          [
            { opacity: 0, transform: offset },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 700, delay: 140, easing },
          image,
        ),
        ...(image
          ? [
              prepareAnimation(image, [{ transform: 'scale(1.035)' }, { transform: 'scale(1)' }], {
                duration: 700,
                delay: 140,
                easing,
              }),
            ]
          : []),
      ];
    }
    const offset =
      kind === 'copy-start' ? startOffset : kind === 'copy-end' ? endOffset : 'translateY(32px)';
    const delay = kind === 'actions' ? 220 : kind === 'heading' ? 70 : 0;
    return [
      prepareAnimation(
        item,
        [
          { opacity: 0, transform: offset },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 650, delay, easing },
      ),
    ];
  }

  function waitForImage(image) {
    if (!image || image.complete) return Promise.resolve();
    if (image.decode) return image.decode().catch(() => undefined);
    return new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    });
  }

  async function playPreparedAnimation(entry, group) {
    await waitForImage(entry.image);
    if (group.cancelled) return;
    entry.target.dataset.revealState = 'playing';
    entry.animation.play();
    try {
      await entry.animation.finished;
    } catch {
      return;
    }
    if (group.cancelled) return;
    entry.animation.cancel();
    entry.target.dataset.revealState = 'complete';
  }

  function showAllReveals() {
    revealGroups.forEach((group) => {
      group.cancelled = true;
      group.animations.forEach((entry) => {
        entry.animation.cancel();
        entry.target.dataset.revealState = 'complete';
      });
      group.element.dataset.revealState = 'complete';
    });
    revealElements.forEach((element) => {
      element.dataset.revealState = 'complete';
    });
  }

  function stopReveals() {
    if (observer) observer.disconnect();
    observer = undefined;
    revealGroups.forEach((group) => {
      group.cancelled = true;
      group.animations.forEach((entry) => entry.animation.cancel());
    });
    revealGroups = [];
  }

  function isSafelyBelowViewport(element) {
    return element.getBoundingClientRect().top > window.innerHeight + 32;
  }

  function playGroup(group) {
    if (group.started || group.cancelled) return;
    group.started = true;
    group.element.dataset.revealState = 'playing';
    group.element.dataset.revealStartedAt = String(performance.now());
    Promise.all(group.animations.map((entry) => playPreparedAnimation(entry, group))).then(() => {
      if (!group.cancelled) group.element.dataset.revealState = 'complete';
    });
  }

  function setupReveals() {
    stopReveals();
    if (!hasFullMotion() || !('IntersectionObserver' in window) || !Element.prototype.animate) {
      showAllReveals();
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const group = revealGroups.find((candidate) => candidate.element === entry.target);
          if (!group) return;
          observer.unobserve(entry.target);
          playGroup(group);
        });
      },
      { threshold: 0.22, rootMargin: '0px 0px -8% 0px' },
    );

    getRevealGroups().forEach((element) => {
      if (!isSafelyBelowViewport(element)) {
        element.dataset.revealState = 'complete';
        return;
      }
      const group = {
        animations: getGroupItems(element).flatMap(createItemAnimations),
        cancelled: false,
        element,
        started: false,
      };
      element.dataset.revealState = 'prepared';
      revealGroups.push(group);
      observer.observe(element);
    });
  }

  function resetTilt() {
    if (tiltFrame) window.cancelAnimationFrame(tiltFrame);
    tiltFrame = undefined;
    tiltTarget = undefined;
    tiltElements.forEach((element) => {
      element.classList.remove('is-tilting');
      element.style.transform = '';
    });
  }

  tiltElements.forEach((element) => {
    element.addEventListener('pointerenter', () => {
      if (
        tiltEnabled &&
        (!element.dataset.revealState || element.dataset.revealState === 'complete')
      )
        element.classList.add('is-tilting');
    });
    element.addEventListener('pointerleave', resetTilt);
    element.addEventListener('pointermove', (event) => {
      if (
        !tiltEnabled ||
        (element.dataset.revealState && element.dataset.revealState !== 'complete')
      )
        return;
      tiltTarget = { element, event };
      if (tiltFrame) return;
      tiltFrame = window.requestAnimationFrame(() => {
        const { element: target, event: pointer } = tiltTarget;
        const bounds = target.getBoundingClientRect();
        const x = (pointer.clientX - bounds.left) / bounds.width - 0.5;
        const y = (pointer.clientY - bounds.top) / bounds.height - 0.5;
        target.style.transform = `perspective(1050px) translate3d(0, -4px, 0) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg)`;
        tiltFrame = undefined;
      });
    });
  });

  function setupTilt() {
    resetTilt();
    tiltEnabled = hasFullMotion() && finePointer.matches && window.innerWidth >= 769;
  }

  function applyMotion({ restartHero = false, forcePlay = false } = {}) {
    const full = hasFullMotion();
    root.dataset.motionPreference = preference;
    root.dataset.motion = full ? 'full' : 'reduced';
    root.classList.toggle('motion-ready', full);
    syncHeroVideo({ forcePlay });
    setupReveals();
    setupTilt();
    if (full && restartHero) {
      root.classList.remove('motion-ready');
      window.requestAnimationFrame(() => root.classList.add('motion-ready'));
    }
    setHeroToggle();
  }

  const header = document.querySelector('.site-header');
  function syncScrollState() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 40);
    scrollFrame = undefined;
  }
  window.addEventListener(
    'scroll',
    () => {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(syncScrollState);
    },
    { passive: true },
  );
  syncScrollState();

  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('nav-list');
  if (navToggle && navList) {
    const setMenuState = (isOpen, returnFocus = false) => {
      navToggle.setAttribute('aria-expanded', String(isOpen));
      navList.classList.toggle('is-open', isOpen);
      navToggle.setAttribute(
        'aria-label',
        isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación',
      );
      if (returnFocus && !isOpen) navToggle.focus();
    };
    navToggle.addEventListener('click', () =>
      setMenuState(navToggle.getAttribute('aria-expanded') !== 'true'),
    );
    navList
      .querySelectorAll('a')
      .forEach((link) => link.addEventListener('click', () => setMenuState(false)));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navList.classList.contains('is-open'))
        setMenuState(false, true);
    });
    document.addEventListener('click', (event) => {
      if (
        navList.classList.contains('is-open') &&
        !navList.contains(event.target) &&
        !navToggle.contains(event.target)
      ) {
        setMenuState(false);
      }
    });
  }

  if (heroMotionToggle) {
    heroMotionToggle.addEventListener('click', () => {
      if (playState.status === 'blocked' || playState.status === 'error') {
        savePreference('full');
        applyMotion({ restartHero: true, forcePlay: true });
        return;
      }
      savePreference(hasFullMotion() ? 'reduced' : 'full');
      applyMotion({ restartHero: true, forcePlay: true });
    });
  }
  window.addEventListener('resize', () => {
    if (resizeFrame) return;
    resizeFrame = window.requestAnimationFrame(() => {
      resizeFrame = undefined;
      syncHeroVideo({ forcePlay: false });
      setupTilt();
    });
  });

  bindVideoEvents();
  applyMotion({ restartHero: true, forcePlay: true });
});
