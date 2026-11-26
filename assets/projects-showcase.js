"use strict";
(() => {
  const section = document.querySelector('.showcase-section');
  if (!section) return;
  const gallery = section.querySelector('[data-gallery]');
  const controls = section.querySelector('[data-gallery-controls]');
  const previous = controls?.querySelector('[data-gallery-prev]');
  const next = controls?.querySelector('[data-gallery-next]');
  const figure = section.querySelector('[data-feature-figure]');
  const frame = section.querySelector('[data-feature-frame]');
  const firstMedia = gallery?.querySelector('.showcase-card-media');
  const firstImage = firstMedia?.querySelector('img');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 900px)');
  let frameRequest = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  const reduced = () => reducedMotion.matches || document.documentElement.dataset.motion === 'reduced';

  function updateControls() {
    if (!gallery || !controls) return;
    controls.hidden = gallery.scrollWidth <= gallery.clientWidth + 2;
    const maxScroll = gallery.scrollWidth - gallery.clientWidth;
    previous.disabled = gallery.scrollLeft <= 2;
    next.disabled = gallery.scrollLeft >= maxScroll - 2;
  }

  function move(direction) {
    const card = gallery.querySelector('.showcase-card');
    if (!card) return;
    const gap = parseFloat(getComputedStyle(gallery).gap) || 0;
    gallery.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap),
      behavior: reduced() ? 'instant' : 'smooth' });
  }

  previous?.addEventListener('click', () => move(-1));
  next?.addEventListener('click', () => move(1));
  gallery?.addEventListener('scroll', updateControls, { passive: true });

  function resetTransition() {
    if (frame) { frame.style.transform = ''; frame.style.opacity = ''; }
    if (firstImage) firstImage.style.opacity = '';
  }

  function drawTransition() {
    frameRequest = 0;
    if (!figure || !firstMedia || !frame || !firstImage || reduced() || compact.matches) {
      resetTransition();
      return;
    }
    // Both rectangles move with the document, so their difference remains stable.
    const source = figure.getBoundingClientRect();
    const target = firstMedia.getBoundingClientRect();
    const start = innerHeight * .92;
    const end = innerHeight * .48;
    const progress = clamp((start - target.top) / (start - end));
    if (progress === 0) { resetTransition(); return; }
    const deltaX = (target.left - source.left) * progress;
    const deltaY = (target.top - source.top) * progress;
    const scale = 1 + (target.width / source.width - 1) * progress;
    frame.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale}) rotateY(${-8 * (1 - progress)}deg) rotateX(${3 * (1 - progress)}deg)`;
    frame.style.opacity = String(progress < .85 ? 1 : (1 - progress) / .15);
    firstImage.style.opacity = String(progress < .85 ? 0 : (progress - .85) / .15);
  }

  function schedule() {
    if (!frameRequest) frameRequest = requestAnimationFrame(drawTransition);
  }
  function layoutChanged() { updateControls(); schedule(); }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', layoutChanged);
  window.addEventListener('pageshow', layoutChanged);
  reducedMotion.addEventListener('change', layoutChanged);
  compact.addEventListener('change', layoutChanged);
  new MutationObserver(layoutChanged).observe(document.documentElement, {
    attributes: true, attributeFilter: ['data-motion']
  });
  document.fonts?.ready.then(layoutChanged);
  layoutChanged();
})();
