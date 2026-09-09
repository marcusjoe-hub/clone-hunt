/* ══════════════════════════════════════════════════════════════
   CLONE HUNT: HIDE & SEEK — ui.js
   - Scroll progress bar
   - FAQ accordion
   - Mobile hamburger menu
   - Back-to-top button (appears after 500px)
   - Preloader dismissal (2.5s → fade → display:none)
   - Smooth scroll for all anchor links
   ══════════════════════════════════════════════════════════════ */

const PRELOADER_DELAY_MS = 2500;
const PRELOADER_FADE_MS = 600;
const BACK_TO_TOP_THRESHOLD = 500;
const MOBILE_BREAKPOINT = 768;

export function initUI() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');

  /* ── Preloader ───────────────────────────────────────────── */
  function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    window.setTimeout(() => {
      /* CSS: opacity 0 + pointer-events none over 0.5s */
      preloader.classList.add('hidden');

      /* Once the fade completes, drop it from the layout */
      window.setTimeout(() => {
        preloader.style.display = 'none';
      }, PRELOADER_FADE_MS);
    }, PRELOADER_DELAY_MS);
  }

  /* ── Mobile nav ──────────────────────────────────────────── */
  function closeMobileNav() {
    if (!nav || !hamburger) return;
    nav.classList.remove('nav-open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  function initMobileNav() {
    if (!nav || !hamburger) return;

    hamburger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('nav-open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    /* Auto-close if the viewport grows past the mobile breakpoint */
    window.addEventListener('resize', () => {
      if (window.innerWidth > MOBILE_BREAKPOINT) {
        closeMobileNav();
      }
    });
  }

  /* ── Scroll effects: progress bar + back-to-top + nav state ─ */
  function initScrollEffects() {
    const progressBar = document.getElementById('scrollProgress');
    const backToTopBtn = document.getElementById('backToTop');

    function handleScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollMax =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollMax > 0 ? (scrollTop / scrollMax) * 100 : 0;

      if (progressBar) {
        progressBar.style.width = `${progress}%`;
      }

      if (backToTopBtn) {
        backToTopBtn.classList.toggle('visible', scrollTop > BACK_TO_TOP_THRESHOLD);
      }

      if (nav) {
        nav.classList.toggle('scrolled', scrollTop > 30);
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* ── FAQ accordion ───────────────────────────────────────── */
  function initFaq() {
    const items = document.querySelectorAll('.faq-item');

    items.forEach((item) => {
      const question = item.querySelector('.faq-question');
      if (!question) return;

      question.addEventListener('click', () => {
        const wasActive = item.classList.contains('active');

        /* Close every item… */
        items.forEach((other) => {
          other.classList.remove('active');
          const otherBtn = other.querySelector('.faq-question');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        });

        /* …then reopen this one only if it wasn't already open */
        if (!wasActive) {
          item.classList.add('active');
          question.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ── Smooth scroll for anchor links ──────────────────────── */
  function initSmoothScroll() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach((link) => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        if (!href) return;

        closeMobileNav();

        if (href === '#') {
          /* Logo — back to the very top */
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ── Back to top ─────────────────────────────────────────── */
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Boot ────────────────────────────────────────────────── */
  initPreloader();
  initMobileNav();
  initScrollEffects();
  initFaq();
  initSmoothScroll();
  initBackToTop();
}
