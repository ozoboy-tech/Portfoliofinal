"use strict";

(() => {
  const track = document.querySelector('#profil .about-scroll-track');
  const stage = track?.querySelector('.about-scroll-stage');
  const text = track?.querySelector('[data-about-reveal]');
  if (!track || !stage || !text || text.dataset.aboutReady) return;

  const root = document.documentElement;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const original = text.textContent.replace(/\s+/g, ' ').trim();
  const readable = document.createElement('span');
  readable.className = 'sr-only';
  readable.textContent = original;

  const visual = document.createElement('span');
  visual.setAttribute('aria-hidden', 'true');
  const characters = [];

  original.split(/(\s+)/).forEach(token => {
    if (/^\s+$/.test(token)) {
      visual.append(document.createTextNode(token));
      return;
    }
    const word = document.createElement('span');
    word.className = 'about-word';
    Array.from(token).forEach(letter => {
      const character = document.createElement('span');
      character.className = 'about-char';
      character.textContent = letter;
      word.append(character);
      characters.push(character);
    });
    visual.append(word);
  });

  text.replaceChildren(readable, visual);
  text.dataset.aboutReady = 'true';

  let previousCount = 0;
  let frame = 0;
  let viewHeight = window.innerHeight;
  const reduced = () => motion.matches || root.dataset.motion === 'reduced';
  const clamp = value => Math.max(0, Math.min(1, value));

  function draw() {
    frame = 0;
    let progress = 1;
    if (!reduced()) {
      if (track.classList.contains('is-pinned')) {
        const travel = Math.max(1, track.offsetHeight - stage.offsetHeight);
        progress = clamp(-track.getBoundingClientRect().top / travel);
      } else {
        const rect = text.getBoundingClientRect();
        progress = clamp((viewHeight * .82 - rect.top) /
          (rect.height + viewHeight * .27));
      }
    }

    const count = Math.floor(progress * characters.length);
    for (let i = Math.min(count, previousCount); i < Math.max(count, previousCount); i++) {
      characters[i].classList.toggle('is-lit', i < count);
    }
    previousCount = count;
  }

  function schedule() {
    if (!frame) frame = window.requestAnimationFrame(draw);
  }

  function measure() {
    viewHeight = window.innerHeight;
    track.style.setProperty('--about-viewport', viewHeight + 'px');
    const animate = !reduced();
    track.classList.toggle('is-animated', animate);
    // Une section plus haute que l’écran reste dans le défilement normal.
    track.classList.toggle('is-pinned', animate && stage.offsetHeight <= viewHeight + 1);
    schedule();
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('pageshow', measure);
  motion.addEventListener('change', measure);
  new MutationObserver(measure).observe(root, {
    attributes: true,
    attributeFilter: ['data-motion']
  });
  document.fonts?.ready.then(measure);
  measure();
})();
