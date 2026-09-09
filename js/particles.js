/* ══════════════════════════════════════════════════════════════
   CLONE HUNT: HIDE & SEEK — particles.js
   Canvas background: 60 floating purple dots with slow drift,
   wrapping around the edges. Pure Canvas 2D + requestAnimationFrame.
   ══════════════════════════════════════════════════════════════ */

const PARTICLE_COUNT = 60;

export function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const particles = [];

  /* ── Helpers ─────────────────────────────────────────────── */

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: random(0, canvas.width),
      y: random(0, canvas.height),
      radius: random(0.5, 2.5),
      dx: random(-0.4, 0.4),
      dy: random(-0.4, 0.4),
      opacity: random(0.1, 0.5)
    };
  }

  function updateParticle(p) {
    p.x += p.dx;
    p.y += p.dy;

    /* Wrap around the edges */
    if (p.x < -p.radius) {
      p.x = canvas.width + p.radius;
    } else if (p.x > canvas.width + p.radius) {
      p.x = -p.radius;
    }

    if (p.y < -p.radius) {
      p.y = canvas.height + p.radius;
    } else if (p.y > canvas.height + p.radius) {
      p.y = -p.radius;
    }
  }

  function drawParticle(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(167, 139, 250, ${p.opacity})`;
    ctx.fill();
  }

  /* ── Animation loop ──────────────────────────────────────── */

  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const particle of particles) {
      updateParticle(particle);
      drawParticle(particle);
    }
  }

  /* ── Boot ────────────────────────────────────────────────── */

  resize();

  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    particles.push(createParticle());
  }

  animate();

  window.addEventListener('resize', resize);
}
