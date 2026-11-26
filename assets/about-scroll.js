"use strict";
(() => {
  const paragraphs = [...document.querySelectorAll('#profil [data-approach-reveal]')];
  if (!paragraphs.length || !('IntersectionObserver' in window)) return;
  const root = document.documentElement;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => motion.matches || root.dataset.motion === 'reduced';
  if (reduced()) return;

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: .1, rootMargin: '0px 0px -8% 0px' });

  // Le contenu reste lisible pendant l'arrivée progressive.
  for (const paragraph of paragraphs) {
    paragraph.classList.add('approach-reveal');
    observer.observe(paragraph);
  }

  function revealAll() {
    if (!reduced()) return;
    for (const paragraph of paragraphs) paragraph.classList.add('is-visible');
    observer.disconnect();
    preferenceObserver.disconnect();
    motion.removeEventListener('change', revealAll);
  }
  const preferenceObserver = new MutationObserver(revealAll);
  preferenceObserver.observe(root, { attributes: true, attributeFilter: ['data-motion'] });
  motion.addEventListener('change', revealAll);
})();
