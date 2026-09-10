/* ══════════════════════════════════════════════════════════════
   CLONE HUNT: HIDE & SEEK — gallery-render.js
   Renders the screenshot gallery from gallery-data.js into
   #gallery-grid. Shows ONLY the last 9 images (newest); falls
   back to 6 "Coming Soon" placeholders when the data is empty.
   ══════════════════════════════════════════════════════════════ */

import { galleryImages } from './gallery-data.js';

export function renderGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    grid.innerHTML = '';

    // Take ONLY the last 9 images (newest)
    const displayImages = galleryImages.slice(-9);

    if (displayImages.length === 0) {
        // Fallback placeholders if empty
        for (let i = 0; i < 6; i++) {
            grid.innerHTML += `
                <div class="gallery-item reveal" style="display:flex; align-items:center; justify-content:center; background: rgba(255,255,255,0.05); border-radius: 12px; min-height: 200px;">
                    <span style="color: var(--text-muted);">📸 Coming Soon</span>
                </div>`;
        }
        return;
    }

    // Render real images
    displayImages.forEach(src => {
        grid.innerHTML += `
            <div class="gallery-item reveal" style="border-radius: 12px; overflow: hidden; height: 100%; min-height: 200px;">
                <img src="${src}" alt="Clone Hunt Screenshot" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;">
            </div>
        `;
    });
}
