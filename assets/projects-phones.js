"use strict";

(() => {
  const section = document.querySelector("[data-phone-showcase]");

  if (!section) return;

  const story = section.querySelector("[data-phone-story]");
  const stack = section.querySelector("[data-phone-stack]");
  const cards = [...section.querySelectorAll("[data-phone-project]")];
  const controls = section.querySelector("[data-phone-controls]");
  const previous = section.querySelector("[data-phone-prev]");
  const next = section.querySelector("[data-phone-next]");
  const counter = section.querySelector("[data-phone-counter]");
  const link = section.querySelector("[data-phone-link]");

  if (!cards.length) return;

  const desktop = window.matchMedia(
    "(min-width: 901px) and (min-height: 650px)"
  );

  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const root = document.documentElement;
  const stickyTop = 112;

  let stacked = false;
  let active = -1;
  let step = 0;
  let frame = 0;

  const reduced = () =>
    motion.matches || root.dataset.motion === "reduced";

  const clampIndex = index =>
    Math.max(0, Math.min(cards.length - 1, index));

  function select(index, force = false) {
    index = clampIndex(index);

    if (active === index && !force) return;

    active = index;

    cards.forEach((card, position) => {
      const depth = (position - active + cards.length) % cards.length;

      card.style.setProperty("--phone-depth", String(depth));
      card.style.zIndex = String(cards.length - depth);
      card.inert = stacked && position !== active;
      card.classList.toggle("is-active", position === active);
    });

    const number = String(active + 1).padStart(2, "0");
    const total = String(cards.length).padStart(2, "0");

    counter.textContent = number + " / " + total;
    previous.disabled = active === 0;
    next.disabled = active === cards.length - 1;

    link.href = cards[active].querySelector("a").href;
    link.textContent = "Explorer " + cards[active].dataset.title + " ↗";
  }

  function update() {
    frame = 0;

    if (stacked) {
      const progress =
        (stickyTop - story.getBoundingClientRect().top) / step;

      select(Math.round(progress));
      return;
    }

    const bounds = stack.getBoundingClientRect();
    const center = bounds.left + stack.clientWidth / 2;

    let nearest = 0;
    let distance = Infinity;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const current = Math.abs(rect.left + rect.width / 2 - center);

      if (current < distance) {
        distance = current;
        nearest = index;
      }
    });

    select(nearest);
  }

  function schedule() {
    if (!frame) {
      frame = window.requestAnimationFrame(update);
    }
  }

  function layout() {
    stacked = desktop.matches && !reduced() && cards.length > 1;
    step = Math.max(360, window.innerHeight * 0.75);

    story.style.setProperty(
      "--phone-stage",
      Math.min(760, window.innerHeight - 128) + "px"
    );

    story.style.setProperty(
      "--phone-travel",
      (cards.length - 1) * step + "px"
    );

    section.classList.toggle("is-stacked", stacked);
    controls.hidden = cards.length < 2;

    select(Math.max(active, 0), true);
    schedule();
  }

  function move(direction) {
    const index = clampIndex(active + direction);

    if (stacked) {
      const top =
        window.scrollY +
        story.getBoundingClientRect().top -
        stickyTop +
        index * step;

      window.scrollTo({
        top,
        behavior: reduced() ? "auto" : "smooth",
      });

      return;
    }

    const card = cards[index].getBoundingClientRect();
    const bounds = stack.getBoundingClientRect();

    stack.scrollTo({
      left:
        stack.scrollLeft +
        card.left -
        bounds.left -
        (stack.clientWidth - card.width) / 2,
      behavior: reduced() ? "auto" : "smooth",
    });
  }

  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));

  stack.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("scroll", schedule, { passive: true });

  window.addEventListener("resize", layout);
  window.addEventListener("pageshow", layout);

  desktop.addEventListener("change", layout);
  motion.addEventListener("change", layout);

  new MutationObserver(layout).observe(root, {
    attributes: true,
    attributeFilter: ["data-motion"],
  });

  layout();
})();