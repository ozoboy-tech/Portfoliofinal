"use strict";
// L'overlay n'est activé que si JavaScript peut ensuite le retirer.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('intro-ready');
  window.__introFailsafe = window.setTimeout(() => {
    if (typeof window.__finishIntro === 'function') window.__finishIntro();
    else document.documentElement.classList.remove('intro-ready');
  }, 5000);
}
