"use strict";
(() => {
  const art = document.querySelector('[data-particle-art]');
  if (!art) return;
  const canvas = art.querySelector('canvas');
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;
  const button = art.querySelector('button');
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(pointer: fine)');
  let width = 0;
  let height = 0;
  let visible = true;
  let paused = false;
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let pointerX = 0;
  let pointerY = 0;
  let tiltX = 0;
  let tiltY = 0;
  let seed = 48123;
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  // Deux anneaux volumétriques : O fermé, C ouvert vers la droite.
  // Les coordonnées restent en 3D jusqu'à la projection perspective.
  const points = [];
  const count = matchMedia('(max-width: 700px)').matches ? 3200 : 6400;
  for (let i = 0; i < count; i++) {
    const isC = i >= count / 2;
    const angle = isC ? Math.PI / 4 + random() * Math.PI * 1.5 : random() * Math.PI * 2;
    const tube = random() * Math.PI * 2;
    const radius = .86 + .19 * Math.cos(tube);
    const x = Math.cos(angle) * radius + (isC ? .78 : -.78);
    const y = Math.sin(angle) * radius * 1.22;
    const z = .19 * Math.sin(tube) + (isC ? .16 : -.16);
    points.push({ x, y, z, size: .45 + random() * .65,
      color: 'hsl(' + (185 + (x + 1.85) * 22) + ' 95% ' + (52 + random() * 25) + '%)',
      brightness: .45 + .55 * (Math.sin(tube) + 1) / 2 });
  }
  const dust = Array.from({ length: 100 }, () => ({
    x: (random() - .5) * 4.7, y: (random() - .5) * 3.3,
    z: (random() - .5) * 1.4, size: .35 + random() * .7,
    color: '#32b8f5', brightness: .18 + random() * .35
  }));
  const allPoints = [...dust, ...points];
  function reduced() {
    return reducedMotion.matches || root.dataset.motion === 'reduced';
  }
  function draw() {
    if (!width || !height) return;
    context.clearRect(0, 0, width, height);
    const time = reduced() ? 0 : elapsed;
    const yaw = -.23 + Math.sin(time * .2) * .23 + tiltX;
    const pitch = -.12 + Math.cos(time * .17) * .06 + tiltY;
    const cy = Math.cos(yaw), sy = Math.sin(yaw);
    const cx = Math.cos(pitch), sx = Math.sin(pitch);
    const scale = Math.min(width / 4.6, height / 3.6);
    const entrance = reduced() ? 1 : Math.min(1, .2 + time / 1.6);
    for (const point of allPoints) {
      const x = point.x * cy + point.z * sy;
      const depth = -point.x * sy + point.z * cy;
      const y = point.y * cx - depth * sx;
      const z = point.y * sx + depth * cx;
      const perspective = 5 / (5 - z);
      const px = width / 2 + x * scale * perspective;
      const py = height / 2 - y * scale * perspective;
      const size = point.size * perspective * Math.max(.8, width / 650);
      context.globalAlpha = point.brightness * entrance;
      context.fillStyle = point.color;
      context.beginPath();
      context.arc(px, py, size, 0, Math.PI * 2);
      context.fill();
    }
    context.globalAlpha = 1;
    art.classList.add('is-ready');
  }
  function running() {
    return visible && !document.hidden && !paused && !reduced() &&
      !root.classList.contains('intro-ready');
  }
  function animate(now) {
    frame = 0;
    if (!running()) return;
    // Limite à 30 images/s et évite les sauts après un onglet masqué.
    if (!lastTime || now - lastTime >= 1000 / 30) {
      elapsed += lastTime ? Math.min((now - lastTime) / 1000, .05) : 0;
      lastTime = now;
      tiltX += (pointerX - tiltX) * .06;
      tiltY += (pointerY - tiltY) * .06;
      draw();
    }
    frame = requestAnimationFrame(animate);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (reduced()) { tiltX = 0; tiltY = 0; }
    button.hidden = reduced();
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = paused ? 'Reprendre l’animation' : 'Mettre l’animation en pause';
    draw();
    if (running()) frame = requestAnimationFrame(animate);
  }
  function resize() {
    const rect = art.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }
  button.addEventListener('click', () => { paused = !paused; sync(); });
  art.addEventListener('pointermove', event => {
    if (!finePointer.matches || reduced() || paused) return;
    const rect = art.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - .5) * .35;
    pointerY = ((event.clientY - rect.top) / rect.height - .5) * .22;
  });
  art.addEventListener('pointerleave', () => { pointerX = 0; pointerY = 0; });
  reducedMotion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pageshow', sync);
  window.addEventListener('pagehide', () => cancelAnimationFrame(frame));
  new MutationObserver(sync).observe(root, {
    attributes: true, attributeFilter: ['data-motion', 'class']
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      sync();
    }).observe(art);
  }
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(art);
  else window.addEventListener('resize', resize);
  resize();
  sync();
})();
