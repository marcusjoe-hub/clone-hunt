/* ══════════════════════════════════════════════════════════════
   CLONE HUNT: HIDE & SEEK — main.js
   Entry point. Imports and initializes every module.
   ══════════════════════════════════════════════════════════════ */

import { initParticles } from './particles.js';
import { initCountdown } from './countdown.js';
import { initReveal } from './reveal.js';
import { initMusic } from './music.js';
import { renderUpdates } from './updates-render.js';
import { renderGallery } from './gallery-render.js';
import { initUI } from './ui.js';

function init() {
  /* Render dynamic content (updates timeline + gallery) BEFORE
     wiring up the reveal observer, so the entries created here
     are picked up along with the static ones. */
  renderUpdates();
  renderGallery();

  initParticles();
  initCountdown();
  initReveal();
  initMusic();
  initUI();
}

/* ES modules are deferred, so the DOM is already parsed when
   this runs — but guard anyway in case of early execution. */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
