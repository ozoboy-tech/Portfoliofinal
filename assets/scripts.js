"use strict";
(() => {
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = document.querySelector('.motion-toggle');
  let paused = false;
  function updateMotion() {
    const reduced = media.matches || paused;
    root.dataset.motion = reduced ? 'reduced' : 'full';
    root.toggleAttribute('data-page-hidden', document.hidden);
    if (motionButton) {
      motionButton.hidden = false;
      motionButton.disabled = media.matches;
      motionButton.setAttribute('aria-pressed', String(reduced));
      motionButton.textContent = media.matches ? 'Animations réduites — réglage système' : paused ? 'Réactiver les animations' : 'Réduire les animations';
    }
  }
  motionButton?.addEventListener('click', () => { paused = !paused; updateMotion(); });
  media.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', updateMotion);
  window.addEventListener('pageshow', updateMotion);
  updateMotion();

  const heroPortrait = document.querySelector('.hero-art.has-portrait');

  function revealHeroPortrait() {
    heroPortrait?.classList.add('is-visible');
  }

  const intro = document.querySelector('.site-intro');
  if (intro) {
    const skip = intro.querySelector('.intro-skip');
    const background = [...document.body.children].filter(element => element !== intro);
    let timer;
    let finished = false;

    function finishIntro(focusContent = false) {
      if (finished) return;
      finished = true;
      window.clearTimeout(timer);
      window.clearTimeout(window.__introFailsafe);
      root.classList.remove('intro-ready');
      background.forEach(element => { element.inert = false; });
      const shouldFocus = focusContent || document.activeElement === skip;
      intro.remove();

      revealHeroPortrait();

      if (shouldFocus) {
        document.getElementById('contenu')?.focus({ preventScroll: true });
      }

      delete window.__finishIntro;
    }

    window.__finishIntro = finishIntro;

    if (root.classList.contains('intro-ready') && !media.matches) {
      background.forEach(element => { element.inert = true; });
      timer = window.setTimeout(finishIntro, 6250);
      skip.addEventListener('click', () => finishIntro(true));
      media.addEventListener('change', () => {
        if (media.matches) finishIntro();
      });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) finishIntro();
      });
    } else {
      finishIntro();
    }
  } else {
    revealHeroPortrait();
  }

  // Le contenu est visible par défaut, même sans JavaScript ou observer.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        if (!media.matches && !paused) entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: .08 });
    document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
  }

  const menu = document.getElementById('menu-dialog');
  const openButton = document.querySelector('.menu-open');
  const closeButton = document.querySelector('.menu-close');
  if (menu && openButton && closeButton && typeof menu.showModal === 'function') {
    root.classList.add('enhanced');
    openButton.hidden = false;
    let backdropStart = false;
    let navigationTarget = null;
    openButton.addEventListener('click', () => {
      if (menu.open) return;
      menu.showModal();
      document.body.classList.add('dialog-open');
      closeButton.focus();
    });
    closeButton.addEventListener('click', () => menu.close());
    menu.addEventListener('close', () => {
      document.body.classList.remove('dialog-open');
      if (navigationTarget) {
        const target = navigationTarget;
        navigationTarget = null;
        const hadTabindex = target.hasAttribute('tabindex');
        if (!hadTabindex) target.setAttribute('tabindex','-1');
        target.focus({preventScroll:true});
        if (!hadTabindex) target.addEventListener('blur',()=>target.removeAttribute('tabindex'),{once:true});
      } else openButton.focus({preventScroll:true});
    });
    menu.querySelectorAll('a').forEach(anchor => anchor.addEventListener('click', () => {
      const url = new URL(anchor.href);
      if (url.pathname === window.location.pathname && url.hash) navigationTarget = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      menu.close();
    }));
    menu.addEventListener('pointerdown', event => { backdropStart = event.target === menu; });
    menu.addEventListener('click', event => {
      const rect = menu.getBoundingClientRect();
      const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
      if (outside && backdropStart && event.target === menu) menu.close();
      backdropStart = false;
    });
    window.matchMedia('(min-width: 761px)').addEventListener('change', event => {
      if (event.matches && menu.open) menu.close();
    });
  }

  // Préremplissage textuel seulement : aucun HTML injecté ni stockage du message.
  const projectName = new URLSearchParams(window.location.search).get('projet');
  const message = document.getElementById('message');
  if (projectName && projectName.length <= 90 && message && !message.value) {
    message.value = `Bonjour Ousmane, j’aimerais échanger sur le projet ${projectName}.`;
    const subject = document.getElementById('subject');
    if (subject) subject.value = 'Échanger sur un projet du portfolio';
  }
  // La soumission du formulaire reste native vers Formspree.
})();
