/* ══════════════════════════════════════════════════════════════
   CLONE HUNT: HIDE & SEEK — countdown.js
   The 90-second round timer. Counts 90 → 0, loops back to 90.
   Color phases: > 30s red, 10–30s amber, < 10s flashing red.
   ══════════════════════════════════════════════════════════════ */

const ROUND_TIME = 90;
const TICK_MS = 1000;

export function initCountdown() {
  const timerEl = document.getElementById('timer');
  if (!timerEl) return;

  let timeLeft = ROUND_TIME;

  /* Format seconds as M:SS */
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  }

  /* Apply text + color phase classes */
  function render() {
    timerEl.textContent = formatTime(timeLeft);

    timerEl.classList.remove('warning', 'critical');

    if (timeLeft < 10) {
      /* Final seconds — flashing red, fast pulse */
      timerEl.classList.add('critical');
    } else if (timeLeft <= 30) {
      /* Warning phase — amber */
      timerEl.classList.add('warning');
    }
    /* > 30s stays default red */
  }

  render();

  window.setInterval(() => {
    timeLeft -= 1;

    /* Hit zero → start a fresh round */
    if (timeLeft < 0) {
      timeLeft = ROUND_TIME;
    }

    render();
  }, TICK_MS);
}
