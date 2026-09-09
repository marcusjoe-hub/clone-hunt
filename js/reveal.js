/* ══════════════════════════════════════════════════════════════
   CLONE HUNT: HIDE & SEEK — reveal.js
   1) IntersectionObserver scroll-reveal for every .reveal element.
   2) 3D tilt on .twist-card — rotateX/rotateY (±8°) tracking the
      cursor, perspective 1000px, reset on mouseleave.
   ══════════════════════════════════════════════════════════════ */

const REVEAL_THRESHOLD = 0.15;
const MAX_TILT_DEGREES = 8;

export function initReveal() {
  initScrollReveal();
  initCardTilt();
}

/* ── Scroll reveal ─────────────────────────────────────────── */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length === 0) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: REVEAL_THRESHOLD }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    /* Very old browser — show everything immediately */
    revealElements.forEach((el) => el.classList.add('revealed'));
  }
}

/* ── 3D tilt on twist cards ────────────────────────────────── */
function initCardTilt() {
  const cards = document.querySelectorAll('.twist-card');
  if (cards.length === 0) return;

  /* Only attach mouse-driven tilt on devices with a real pointer */
  const canHover =
    window.matchMedia &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (!canHover) return;

  cards.forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      const rect = card.getBoundingClientRect();

      /* Cursor position within the card, normalized to 0…1 */
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;

      /* Map to ±MAX_TILT_DEGREES around the card center */
      const rotateY = (px - 0.5) * MAX_TILT_DEGREES * 2;
      const rotateX = (0.5 - py) * MAX_TILT_DEGREES * 2;

      card.style.transform =
        `perspective(1000px) ` +
        `rotateX(${rotateX.toFixed(2)}deg) ` +
        `rotateY(${rotateY.toFixed(2)}deg) ` +
        `translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
