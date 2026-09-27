const base = new URL('.', import.meta.url);

class OCMonogram extends HTMLElement {
  static get observedAttributes() { return ['finish', 'color', 'motion']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._paused = false;
    this._interactive = false;
  }

  connectedCallback() {
    if (this._generation) return;
    this._generation = Symbol('OC');
    this._loading = false;
    this._systemMotion = matchMedia('(prefers-reduced-motion: reduce)');
    this.shadowRoot.innerHTML = '<link rel="stylesheet"><div class="poster"><img alt="Monogramme OC" width="880" height="492" decoding="async"></div><div class="stage"></div><div class="tools" role="group" aria-label="Commandes du monogramme" hidden><button type="button" data-action="interact">Manipuler</button><button type="button" data-action="pause">Pause</button><button type="button" data-action="left" aria-label="Tourner vers la gauche" hidden>←</button><button type="button" data-action="right" aria-label="Tourner vers la droite" hidden>→</button><button type="button" data-action="reset" hidden>Recentrer</button></div><span class="status" role="status"></span>';
    this.shadowRoot.querySelector('link').href = new URL('oc-monogram.css', base).href;
    this.shadowRoot.querySelector('img').src = this.getAttribute('poster') || new URL('oc-poster.png', base).href;
    this.shadowRoot.querySelector('.tools').addEventListener('click', event => this._act(event));
    this._onMotion = () => this._syncMotion();
    this._systemMotion.addEventListener('change', this._onMotion);
    this._motionObserver = new MutationObserver(this._onMotion);
    this._motionObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
    if ('IntersectionObserver' in window) {
      this._observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          this._observer.disconnect();
          this._load();
        }
      }, { rootMargin: '220px' });
      this._observer.observe(this);
    } else this._load();
  }

  _reduced() {
    return this._systemMotion.matches || document.documentElement.dataset.motion === 'reduced';
  }

  async _load() {
    if (this._loading || this.viewer) return;
    this._loading = true;
    const generation = this._generation;
    try {
      const { createViewer } = await import('./oc-engine.js');
      if (this._generation !== generation) return;
      const viewer = await createViewer(this.shadowRoot.querySelector('.stage'), {
        src: this.getAttribute('src') || new URL('oc-monogram.glb', base).href,
        finish: this.getAttribute('finish') || 'champagne',
        color: this.getAttribute('color'),
        motion: this._reduced() ? 'none' : (this.getAttribute('motion') || 'float'),
        interactive: false,
        onError: () => { if (this._generation === generation) this._fallback(); }
      });
      if (this._generation !== generation) { viewer.dispose(); return; }
      this.viewer = viewer;
      this.shadowRoot.querySelector('.poster').hidden = true;
      this.shadowRoot.querySelector('.tools').hidden = false;
      this._syncMotion();
      this.dispatchEvent(new CustomEvent('oc-ready', { detail: viewer, bubbles: true }));
    } catch (error) {
      if (this._generation === generation) {
        this._fallback();
        console.warn('Monogramme OC :', error.message);
      }
    } finally {
      if (this._generation === generation) this._loading = false;
    }
  }

  _syncMotion() {
    if (!this.viewer) return;
    this.viewer.setMotion(this._reduced() || this._paused ? 'none' : (this.getAttribute('motion') || 'float'));
    this._buttons();
  }

  _buttons() {
    const pause = this.shadowRoot.querySelector('[data-action="pause"]');
    pause.disabled = this._reduced();
    pause.textContent = this.viewer.motion === 'none' ? 'Animer' : 'Pause';
    if (pause.disabled) pause.textContent = 'Arrêté';
  }

  _act(event) {
    const button = event.target.closest('button');
    if (!button || !this.viewer) return;
    const action = button.dataset.action;
    if (action === 'interact') {
      this._interactive = !this._interactive;
      this.viewer.setInteractive(this._interactive);
      this.toggleAttribute('data-interactive', this._interactive);
      button.textContent = this._interactive ? 'Terminer' : 'Manipuler';
      for (const name of ['left', 'right', 'reset']) {
        this.shadowRoot.querySelector('[data-action="' + name + '"]').hidden = !this._interactive;
      }
    }
    if (action === 'pause') {
      this._paused = this.viewer.motion !== 'none';
      if (!this._paused && this.getAttribute('motion') === 'none') this.setAttribute('motion', 'float');
      this._syncMotion();
    }
    if (action === 'left' || action === 'right') {
      this._paused = true;
      this.viewer.turn(action === 'left' ? -.3 : .3);
    }
    if (action === 'reset') {
      this._paused = false;
      this.viewer.reset();
      this.viewer.setFinish(this.getAttribute('finish') || 'champagne');
      this._syncMotion();
    }
    this._buttons();
  }

  _fallback() {
    this.shadowRoot.querySelector('.poster').hidden = false;
    this.shadowRoot.querySelector('.tools').hidden = true;
    this.shadowRoot.querySelector('.status').textContent = 'Vue statique du monogramme';
    this.viewer?.dispose();
    this.viewer = null;
  }

  attributeChangedCallback(name, oldValue, value) {
    if (oldValue === value || !this.viewer) return;
    if (name === 'finish') this.viewer.setFinish(value);
    if (name === 'color' && value) this.viewer.setMaterial({ color: value, edgeColor: value });
    if (name === 'motion') this._syncMotion();
  }

  disconnectedCallback() {
    this._generation = null;
    this._observer?.disconnect();
    this._motionObserver?.disconnect();
    this._systemMotion?.removeEventListener('change', this._onMotion);
    this.viewer?.dispose();
    this.viewer = null;
  }
}

if (!customElements.get('oc-monogram')) customElements.define('oc-monogram', OCMonogram);
