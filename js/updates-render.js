/* ══════════════════════════════════════════════════════════════
   CLONE HUNT: HIDE & SEEK — updates-render.js
   Renders the patch-notes timeline from updates-data.js into
   the #updates-timeline container. Each entry gets the "reveal"
   class so it animates in on scroll.
   ══════════════════════════════════════════════════════════════ */

import { updates } from './updates-data.js';

export function renderUpdates() {
  const container = document.getElementById('updates-timeline');
  if (!container) return;

  container.innerHTML = '';

  updates.forEach((update) => {
    /* Entry wrapper: dot on the timeline + glass card */
    const entry = document.createElement('div');
    entry.className = 'timeline-entry reveal';

    const dot = document.createElement('div');
    dot.className = 'timeline-dot';

    const card = document.createElement('div');
    card.className = 'timeline-card';

    /* Version badge + date on one row */
    const meta = document.createElement('div');
    meta.className = 'timeline-meta';

    const version = document.createElement('span');
    version.className = 'version';
    version.textContent = update.version;

    const date = document.createElement('span');
    date.className = 'date';
    date.textContent = update.date;

    meta.appendChild(version);
    meta.appendChild(date);

    const title = document.createElement('h3');
    title.className = 'title';
    title.textContent = update.title;

    const body = document.createElement('p');
    body.className = 'body';
    body.textContent = update.body;

    card.appendChild(meta);
    card.appendChild(title);
    card.appendChild(body);

    entry.appendChild(dot);
    entry.appendChild(card);

    container.appendChild(entry);
  });
}
