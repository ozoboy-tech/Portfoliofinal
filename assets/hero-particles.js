import * as THREE from 'three';

// Le nuage tire sa silhouette des pixels colorés de la référence OC.
const CONFIG = Object.freeze({
  count: 40000, countMobile: 15000, pointSizePx: 2.1, pointAlpha: 0.58,
  depthZ: 0.42, rotationSpeed: 0.12, repelRadiusRel: 0.12,
  trailLength: 5, trailLifeSec: 0.28, trailDecaySec: 0.52,
  palette: ['#58f8f8', '#23a7fb', '#3a65ed', '#a46cff'],
  highlight: '#7ff5f5', rimColor: '#58f8f8', bg: '#05081a'
});

const art = document.querySelector('[data-particle-art]');
if (art) {
  const canvas = art.querySelector('canvas');
  const pauseButton = art.querySelector('.particle-hero-pause');
  const root = document.documentElement;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  const mobile = matchMedia('(max-width: 700px)');
  let renderer;
  let scene;
  let camera;
  let geometry;
  let material;
  let points;
  let observer;
  let resizeObserver;
  let mutationObserver;
  let frame = 0;
  let visible = true;
  let paused = false;
  let disposed = false;
  let lastTime = 0;
  let elapsed = 0;
  let cursor;
  let cursorDot;
  let pointerSeen = false;
  const pointer = new THREE.Vector2(-10, -10);
  const smoothPointer = new THREE.Vector2(-10, -10);
  const screenPointer = new THREE.Vector2(-50, -50);
  const smoothScreenPointer = new THREE.Vector2(-50, -50);
  const samples = Array.from({length: CONFIG.trailLength}, () => new THREE.Vector2(-10, -10));
  const palette = CONFIG.palette.map(color => new THREE.Color(color));
  const highlight = new THREE.Color(CONFIG.highlight);
  const rimColor = new THREE.Color(CONFIG.rimColor);
  const reduced = () => reducedMotion.matches || root.dataset.motion === 'reduced';
  const canRun = () => visible && !document.hidden && !paused && !reduced() && !root.classList.contains('intro-ready');
  const random = (() => { let seed = 48123; return () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296); })();

  function makeGeometry(image) {
    const probe = document.createElement('canvas');
    probe.width = image.naturalWidth;
    probe.height = image.naturalHeight;
    const context = probe.getContext('2d', {willReadFrequently: true});
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, probe.width, probe.height).data;
    const candidates = [];
    for (let y = 12; y < probe.height - 12; y += 2) {
      for (let x = 25; x < probe.width - 25; x += 2) {
        const index = (y * probe.width + x) * 4;
        const r = pixels[index], g = pixels[index + 1], b = pixels[index + 2];
        if (b > 65 && b > r * 1.32 && (g > 48 || r > 62)) candidates.push([x, y, r, g, b]);
      }
    }
    if (candidates.length < 500) throw new Error('Silhouette OC introuvable');
    const count = mobile.matches ? CONFIG.countMobile : CONFIG.count;
    const positions = new Float32Array((count + 90) * 3);
    const colors = new Float32Array((count + 90) * 3);
    const seeds = new Float32Array(count + 90);
    const aspect = probe.width / probe.height;
    for (let i = 0; i < count + 90; i++) {
      if (i >= count) {
        positions.set([(random() - .5) * 5.2 * aspect, (random() - .5) * 3.4, (random() - .5) * .6], i * 3);
        colors.set([.05, .3, .5], i * 3);
        seeds[i] = random();
        continue;
      }
      const [px, py, r, g, b] = candidates[Math.floor(random() * candidates.length)];
      const x = (px / probe.width - .5) * 4.35 * aspect;
      const y = (.5 - py / probe.height) * 4.35;
      const isC = px > 340 && (b > g * 1.13 || px > 490);
      const bridge = isC ? .13 * Math.sin((py / probe.height) * Math.PI * 4) : -.08;
      const z = bridge + (random() - .5) * CONFIG.depthZ + .07 * Math.sin(x * 2.2 + y * 1.5);
      positions.set([x + (random() - .5) * .022, y + (random() - .5) * .022, z], i * 3);
      const mix = Math.min(.999, Math.max(0, px / probe.width));
      const stop = Math.min(2, Math.floor(mix * 3));
      const color = palette[stop].clone().lerp(palette[stop + 1], mix * 3 - stop);
      if (g > r * 1.5 && random() < .13) color.lerp(highlight, .45);
      const light = .65 + Math.min(.45, b / 650) + random() * .28;
      colors.set([color.r * light, color.g * light, color.b * light], i * 3);
      seeds[i] = random();
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    result.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    result.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    return result;
  }

  function makeMaterial() {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: {value: 0}, uPointSize: {value: CONFIG.pointSizePx}, uAlpha: {value: CONFIG.pointAlpha},
        uResolution: {value: new THREE.Vector2(1, 1)}, uPointer: {value: smoothPointer},
        uTrail: {value: samples}, uRadius: {value: CONFIG.repelRadiusRel},
        uRim: {value: rimColor}, uReduced: {value: 0}
      },
      vertexShader: `
        attribute vec3 color;
        attribute float aSeed;
        uniform float uTime, uPointSize, uRadius, uReduced;
        uniform vec2 uResolution, uPointer;
        uniform vec2 uTrail[5];
        varying vec3 vColor;
        varying float vRim, vDust;
        void main() {
          vec3 local = position;
          float dust = step(3.0, abs(local.x)) * step(1.25, abs(local.y));
          vec4 projected = projectionMatrix * modelViewMatrix * vec4(local, 1.0);
          vec2 screen = (projected.xy / projected.w * 0.5 + 0.5) * uResolution;
          vec2 cursor = uPointer * uResolution;
          float radius = uRadius * min(uResolution.x, uResolution.y);
          float distancePx = distance(screen, cursor);
          float influence = (1.0 - smoothstep(0.0, radius, distancePx)) * (1.0 - uReduced);
          vec2 direction = normalize(screen - cursor + vec2(0.001));
          vec2 displacement = direction * influence * radius * (0.29 + 0.18 * aSeed);
          for (int i = 0; i < 5; i++) {
            vec2 trailCursor = uTrail[i] * uResolution;
            float trailWeight = float(5 - i) / 5.0;
            float trailInfluence = (1.0 - smoothstep(0.0, radius * 0.75, distance(screen, trailCursor))) * trailWeight;
            displacement += normalize(screen - trailCursor + vec2(0.001)) * trailInfluence * radius * 0.025 * (1.0 - uReduced);
          }
          projected.xy += displacement / uResolution * 2.0 * projected.w;
          gl_Position = projected;
          gl_PointSize = uPointSize * (0.7 + aSeed * 0.6) * min(2.0, uResolution.y / 550.0);
          vRim = smoothstep(radius * 0.45, radius * 0.78, distancePx) * (1.0 - smoothstep(radius * 0.78, radius, distancePx)) * (1.0 - uReduced);
          vColor = color;
          vDust = dust;
        }`,
      fragmentShader: `
        uniform float uAlpha;
        uniform vec3 uRim;
        varying vec3 vColor;
        varying float vRim, vDust;
        void main() {
          float radius = length(gl_PointCoord - 0.5);
          float shape = 1.0 - smoothstep(0.22, 0.5, radius);
          float alpha = shape * uAlpha * mix(1.0, 0.35, vDust);
          gl_FragColor = vec4(mix(vColor, uRim, vRim * 0.62), alpha);
        }`,
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true
    });
  }

  function resize() {
    if (!renderer || !camera) return;
    const {width, height} = art.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Garde les deux lettres dans le cadre même pendant la légère rotation.
    camera.position.z = Math.max(8.1, 11.2 / camera.aspect);
    camera.updateProjectionMatrix();
    material.uniforms.uResolution.value.set(width, height);
    draw();
  }
  function draw() {
    if (!renderer) return;
    material.uniforms.uTime.value = elapsed;
    material.uniforms.uReduced.value = reduced() ? 1 : 0;
    points.rotation.y = reduced() ? 0 : Math.sin(elapsed * CONFIG.rotationSpeed) * .17;
    points.rotation.x = reduced() ? 0 : Math.sin(elapsed * CONFIG.rotationSpeed * .7) * .065;
    renderer.render(scene, camera);
  }
  function animate(now) {
    frame = 0;
    if (!canRun()) return;
    const dt = lastTime ? Math.min((now - lastTime) / 1000, .05) : 0;
    lastTime = now;
    elapsed += dt;
    if (hover.matches) {
      const k = 1 - Math.exp(-dt / CONFIG.trailDecaySec);
      smoothPointer.lerp(pointer, k);
      for (let i = samples.length - 1; i > 0; i--) samples[i].lerp(samples[i - 1], Math.min(1, dt / CONFIG.trailLifeSec * samples.length));
      samples[0].copy(smoothPointer);
      smoothScreenPointer.lerp(screenPointer, k);
      if (pointerSeen) cursor.style.transform = `translate3d(${smoothScreenPointer.x}px, ${smoothScreenPointer.y}px, 0)`;
    }
    draw();
    frame = requestAnimationFrame(animate);
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    if (reduced()) { pointer.set(-10, -10); smoothPointer.copy(pointer); samples.forEach(sample => sample.copy(pointer)); }
    pauseButton.hidden = reduced();
    pauseButton.textContent = paused ? 'Reprendre l’animation' : 'Mettre l’animation en pause';
    pauseButton.setAttribute('aria-pressed', String(paused));
    if (cursor) cursor.hidden = !pointerSeen || !hover.matches || reduced() || !visible || document.hidden;
    if (cursorDot) cursorDot.hidden = !pointerSeen || !hover.matches || reduced() || !visible || document.hidden;
    draw();
    if (canRun()) frame = requestAnimationFrame(animate);
  }
  function move(event) {
    if (!hover.matches || reduced()) return;
    pointerSeen = true;
    if (cursor) cursor.hidden = false;
    if (cursorDot) cursorDot.hidden = false;
    const rect = art.getBoundingClientRect();
    pointer.set((event.clientX - rect.left) / rect.width, 1 - (event.clientY - rect.top) / rect.height);
    screenPointer.set(event.clientX, event.clientY);
    if (smoothScreenPointer.x < 0) smoothScreenPointer.copy(screenPointer);
    if (cursorDot) { cursorDot.style.left = `${event.clientX}px`; cursorDot.style.top = `${event.clientY}px`; }
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer?.disconnect(); resizeObserver?.disconnect(); mutationObserver?.disconnect();
    window.removeEventListener('pointermove', move);
    document.removeEventListener('visibilitychange', sync);
    reducedMotion.removeEventListener('change', sync);
    hover.removeEventListener('change', sync);
    window.removeEventListener('pagehide', dispose);
    pauseButton.removeEventListener('click', togglePause);
    cursor?.remove(); cursorDot?.remove();
    geometry?.dispose(); material?.dispose(); renderer?.dispose();
    renderer?.forceContextLoss();
  }
  function togglePause() { paused = !paused; sync(); }
  async function start() {
    try {
      const image = new Image();
      image.src = '/assets/images/oc-particles-reference.png';
      await image.decode();
      if (disposed) return;
      renderer = new THREE.WebGLRenderer({canvas, alpha: true, antialias: false, powerPreference: 'high-performance'});
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(35, 1, .1, 100);
      geometry = makeGeometry(image);
      material = makeMaterial();
      points = new THREE.Points(geometry, material);
      scene.add(points);
      cursor = document.createElement('span');
      cursor.className = 'particle-cursor';
      cursorDot = document.createElement('span');
      cursorDot.className = 'particle-cursor-dot';
      document.body.append(cursor, cursorDot);
      window.addEventListener('pointermove', move, {passive: true});
      document.addEventListener('visibilitychange', sync);
      reducedMotion.addEventListener('change', sync);
      hover.addEventListener('change', sync);
      window.addEventListener('pagehide', dispose, {once: true});
      pauseButton.addEventListener('click', togglePause);
      mutationObserver = new MutationObserver(sync);
      mutationObserver.observe(root, {attributes: true, attributeFilter: ['data-motion', 'class']});
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(art);
      observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
      observer.observe(art);
      resize();
      art.classList.add('is-ready');
      sync();
    } catch (error) {
      console.warn('Monogramme WebGL indisponible', error);
      dispose();
    }
  }
  start();
}
