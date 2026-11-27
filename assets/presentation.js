"use strict";

(() => {
  const text = document.querySelector("#profil [data-profile-text]");

  if (!text) return;

  const root = document.documentElement;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const content = text.textContent.trim().split(/\s+/);

  if (!content.length) return;

  const fragment = document.createDocumentFragment();

  const words = content.map(word => {
    const span = document.createElement("span");

    span.className = "portox-about-word";
    span.textContent = word;

    fragment.append(span, document.createTextNode(" "));

    return span;
  });

  text.replaceChildren(fragment);

  let frame = 0;

  function reducedMotion() {
    return motion.matches || root.dataset.motion === "reduced";
  }

  function update() {
    frame = 0;

    let progress = 1;

    if (!reducedMotion()) {
      const rect = text.getBoundingClientRect();
      const viewport = window.innerHeight;

      const start = viewport * 0.85;
      const end = viewport * 0.45 - rect.height;

      progress = Math.max(
        0,
        Math.min(1, (start - rect.top) / (start - end))
      );
    }

    const visibleWords = Math.ceil(progress * words.length);

    words.forEach((word, index) => {
      word.classList.toggle("is-read", index < visibleWords);
    });
  }

  function scheduleUpdate() {
    if (frame) return;

    frame = window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", scheduleUpdate, {
    passive: true,
  });

  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("pageshow", scheduleUpdate);

  motion.addEventListener("change", scheduleUpdate);

  const preferenceObserver = new MutationObserver(scheduleUpdate);

  preferenceObserver.observe(root, {
    attributes: true,
    attributeFilter: ["data-motion"],
  });

  text.classList.add("is-enhanced");

  update();
})();