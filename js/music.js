/* ══════════════════════════════════════════════════════════════
   CLONE HUNT: HIDE & SEEK — music.js
   Floating music player:
   - Audio element (assets/audio/ambient-loop.mp3, looped)
   - Web Audio API graph: source → AnalyserNode → destination
   - 5 visualizer bars driven by analyser frequency data (rAF)
   - Play/pause on user interaction only (no autoplay)
   - Volume slider persisted to localStorage "clonehunt-volume"
   - Gracefully handles a missing audio file ("No track loaded")
   ══════════════════════════════════════════════════════════════ */

const AUDIO_SRC = 'assets/audio/ambient-loop.mp3';
const VOLUME_KEY = 'clonehunt-volume';
const DEFAULT_VOLUME = 50;
const IDLE_BAR_HEIGHT = 14; /* percent */
const STATUS_FLASH_MS = 1600;

export function initMusic() {
  const navToggle = document.getElementById('musicToggle');
  const playBtn = document.getElementById('playBtn');
  const volumeSlider = document.getElementById('volumeSlider');
  const statusEl = document.getElementById('playerStatus');
  const playerEl = document.getElementById('musicPlayer');
  const bars = Array.from(document.querySelectorAll('.vbar'));

  /* ── Audio element ───────────────────────────────────────── */
  const audio = new Audio(AUDIO_SRC);
  audio.loop = true;
  audio.preload = 'auto';

  let audioCtx = null;
  let analyser = null;
  let sourceNode = null;
  let freqData = null;
  let trackAvailable = true;
  let isPlaying = false;
  let statusTimer = null;

  /* ── Volume (persisted) ──────────────────────────────────── */
  function loadSavedVolume() {
    let volume = DEFAULT_VOLUME;
    try {
      const saved = parseInt(window.localStorage.getItem(VOLUME_KEY), 10);
      if (!Number.isNaN(saved) && saved >= 0 && saved <= 100) {
        volume = saved;
      }
    } catch (err) {
      /* localStorage unavailable (private mode etc.) — use default */
    }
    return volume;
  }

  function paintSlider(value) {
    if (volumeSlider) {
      volumeSlider.style.setProperty('--fill', `${value}%`);
    }
  }

  const initialVolume = loadSavedVolume();
  audio.volume = initialVolume / 100;

  if (volumeSlider) {
    volumeSlider.value = String(initialVolume);
    paintSlider(initialVolume);

    volumeSlider.addEventListener('input', () => {
      const value = Number(volumeSlider.value);
      audio.volume = value / 100;
      paintSlider(value);
      try {
        window.localStorage.setItem(VOLUME_KEY, String(value));
      } catch (err) {
        /* ignore storage failures */
      }
    });
  }

  /* ── Status line ─────────────────────────────────────────── */
  function setStatus(text, isError) {
    if (!statusEl) return;
    if (statusTimer) {
      window.clearTimeout(statusTimer);
      statusTimer = null;
    }
    statusEl.textContent = text;
    statusEl.classList.toggle('error', Boolean(isError));
  }

  function flashStatus(text) {
    setStatus(text, true);
    statusTimer = window.setTimeout(() => {
      setStatus('No track loaded', true);
    }, STATUS_FLASH_MS);
  }

  /* ── Missing-file handling (never crash) ─────────────────── */
  function markUnavailable() {
    trackAvailable = false;
    isPlaying = false;

    if (playBtn) {
      playBtn.disabled = true;
      playBtn.textContent = '▶';
      playBtn.setAttribute('aria-label', 'Play music (no track loaded)');
    }

    if (playerEl) playerEl.classList.remove('playing');
    if (navToggle) navToggle.textContent = '🔇';

    setStatus('No track loaded', true);
  }

  /* The browser fires "error" when the src 404s */
  audio.addEventListener('error', markUnavailable);

  /* ── Web Audio graph: source → analyser → destination ────── */
  function setupAudioGraph() {
    if (audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      audioCtx = new AudioContextClass();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.82;

      sourceNode = audioCtx.createMediaElementSource(audio);
      sourceNode.connect(analyser);
      analyser.connect(audioCtx.destination);

      freqData = new Uint8Array(analyser.frequencyBinCount);
    } catch (err) {
      /* Visualizer unavailable — playback still works */
      audioCtx = null;
      analyser = null;
      freqData = null;
    }
  }

  /* ── Visualizer loop (requestAnimationFrame) ─────────────── */
  function tickVisualizer() {
    window.requestAnimationFrame(tickVisualizer);

    if (isPlaying && analyser && freqData) {
      analyser.getByteFrequencyData(freqData);

      /* Use the lower ~75% of bins — the top end is usually dead */
      const usableBins = Math.max(1, Math.floor(freqData.length * 0.75));

      for (let i = 0; i < bars.length; i += 1) {
        const binIndex = Math.min(
          usableBins - 1,
          Math.floor(((i + 1) / (bars.length + 1)) * usableBins)
        );
        const level = freqData[binIndex] / 255;
        const height = IDLE_BAR_HEIGHT + level * (100 - IDLE_BAR_HEIGHT);
        bars[i].style.height = `${height}%`;
      }
    } else {
      /* Idle: gently decay to the resting height */
      for (let i = 0; i < bars.length; i += 1) {
        const current = parseFloat(bars[i].style.height);
        const base = Number.isNaN(current) ? IDLE_BAR_HEIGHT : current;
        const next = Math.max(IDLE_BAR_HEIGHT, base * 0.88);
        bars[i].style.height = `${next}%`;
      }
    }
  }

  /* ── Play / pause (user interaction only — no autoplay) ──── */
  function setPlayingState(playing) {
    isPlaying = playing;

    if (navToggle) navToggle.textContent = playing ? '🔊' : '🔇';
    if (playBtn) {
      playBtn.textContent = playing ? '⏸' : '▶';
      playBtn.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
    }
    if (playerEl) playerEl.classList.toggle('playing', playing);
  }

  async function toggleMusic() {
    if (!trackAvailable) {
      flashStatus('No track loaded');
      return;
    }

    if (isPlaying) {
      audio.pause();
      setPlayingState(false);
      setStatus('Paused — Ambient Loop');
      return;
    }

    /* Build the analyser graph lazily, inside the user gesture */
    setupAudioGraph();

    if (audioCtx && audioCtx.state === 'suspended') {
      try {
        await audioCtx.resume();
      } catch (err) {
        /* resume can reject if the gesture expired — play() will surface it */
      }
    }

    try {
      await audio.play();
      setPlayingState(true);
      setStatus('Now Playing — Ambient Loop');
    } catch (err) {
      /* Playback failed (missing/blocked file) — degrade gracefully */
      markUnavailable();
    }
  }

  if (playBtn) playBtn.addEventListener('click', toggleMusic);
  if (navToggle) navToggle.addEventListener('click', toggleMusic);

  /* ── Boot ────────────────────────────────────────────────── */
  setStatus('Ambient Loop — press play');
  tickVisualizer();
}
