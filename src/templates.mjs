import {
  escapeHTML as e,
  jsonForHTML,
  statuses,
} from './schema.mjs';

const arrow = '<span aria-hidden="true">↗</span>';

const paragraph = value =>
  String(value || '')
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map(part => `<p>${e(part)}</p>`)
    .join('\n');

const external = (href, label) => {
  if (!href) {
    return '';
  }

  return `
    <a
      class="button button-outline"
      href="${e(href)}"
      target="_blank"
      rel="noopener noreferrer"
    >
      ${e(label)}
      ${arrow}
      <span class="sr-only"> (nouvel onglet)</span>
    </a>
  `;
};

function header(path, site) {
  const home = path === '/';

  const contactHref =
    home || path === '/projets/'
      ? '#contact'
      : '/#contact';

  const currentPage =
    path.startsWith('/projets/') && path !== '/projets/'
      ? 'location'
      : 'page';

  const sections = [
    ['Accueil', home ? '#haut' : '/', home],
    ['Projets', '/projets/', path.startsWith('/projets/')],
    ['Parcours', '/parcours/', path === '/parcours/'],
    [
      'Expertises',
      home ? '#expertises' : '/#expertises',
      false,
    ],
  ];

  const items = sections
    .map(([label, href, current]) => {
      const currentAttribute = current
        ? ` aria-current="${currentPage}"`
        : '';

      return `
        <a href="${e(href)}"${currentAttribute}>
          ${e(label)}
        </a>
      `;
    })
    .join('\n');

  return `
    <a class="skip-link" href="#contenu">
      Aller au contenu
    </a>

    <div id="haut"></div>

    <header class="site-header wrap portox-header">
      <a
        class="brand"
        href="/"
        aria-label="Ousmane Coulibaly — Accueil"
      >
        <span class="hero-brand-mark" aria-hidden="true">
          OC
        </span>
      </a>

      <nav class="header-nav" aria-label="Navigation principale">
        ${items}
      </nav>

      <a class="header-contact" href="${contactHref}">
        Parlons-en
        ${arrow}
      </a>

      <button
        class="menu-open"
        type="button"
        aria-haspopup="dialog"
        aria-controls="menu-dialog"
        hidden
      >
        <span>Menu</span>
        <span class="menu-lines" aria-hidden="true"></span>
      </button>
    </header>

    <dialog
      class="menu-dialog portox-menu"
      id="menu-dialog"
      aria-label="Menu du portfolio"
    >
      <div class="menu-top">
        <a
          class="hero-brand-mark"
          href="/"
          aria-label="Accueil"
        >
          Ousmane
        </a>

        <button
          type="button"
          class="menu-close"
          autofocus
        >
          Fermer
          <span aria-hidden="true">×</span>
        </button>
      </div>

      <div class="menu-layout">
        <div class="menu-invite">
          <p class="kicker">Contact</p>

          <p>
            Un projet en tête ?
            <br>
            <strong>Parlons-en.</strong>
          </p>

          <a class="blue-button" href="${contactHref}">
            Prendre contact
          </a>
        </div>

        <nav aria-label="Toutes les rubriques">
          ${items}
          <a href="${contactHref}">Contact</a>
        </nav>
      </div>

      <div class="menu-foot">
        <a href="mailto:${e(site.email)}">
          ${e(site.email)}
        </a>

        <a href="tel:${e(site.phone)}">
          ${e(site.phoneLabel)}
        </a>
      </div>
    </dialog>
  `;
}

function footer(site) {
  return `
    <footer class="site-footer signature-footer">
      <div class="signature-footer-inner">
        <div class="signature-footer-top">
          <div class="signature-footer-identity">
            <p class="signature-footer-name">${e(site.name)}</p>
            <p>Développeur &amp; Data Engineer</p>
            <p>Basé au Mali</p>
          </div>

          <nav class="signature-footer-column" aria-label="Explorer le portfolio">
            <p class="signature-footer-label">Explorer</p>
            <a href="/projets/">Projets</a>
            <a href="/parcours/">Parcours &amp; CV</a>
            <a href="/#expertises">Expertises</a>
          </nav>

          <div class="signature-footer-column">
            <p class="signature-footer-label">Contact</p>
            <a href="/#contact">M’écrire <span aria-hidden="true">↗</span></a>
            <a href="https://github.com/ozoboy-tech">
              GitHub <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <p class="signature-footer-word" aria-hidden="true">Ousmane</p>

        <div class="signature-footer-bottom">
          <small>&copy; ${new Date().getFullYear()} ${e(site.name)}</small>

          <nav aria-label="Liens pratiques">
            <a href="/confidentialite/">Confidentialité</a>
            <a href="/admin/">Administration</a>
          </nav>

          <button
            class="motion-toggle"
            type="button"
            aria-pressed="false"
            hidden
          >
            Réduire les animations
          </button>

          <a class="signature-footer-back" href="#haut">
            Haut de page <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  `;
}

export function page({
  site,
  title,
  description = site.description,
  path = '/',
  body,
  home = false,
  noindex = false,
  structured,
}) {
  const canonical = `${site.url}${path}`;
  const isProfilePage = home || path === '/parcours/';

  const defaultStructuredData = isProfilePage
    ? {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        '@id': `${canonical}#profile`,
        url: canonical,
        name: title,
        inLanguage: 'fr',
        mainEntity: {
          '@type': 'Person',
          '@id': `${site.url}/#person`,
          name: site.name,
          url: `${site.url}/`,
          jobTitle: site.title,
        },
      }
    : {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        url: canonical,
        name: title,
        inLanguage: 'fr',
      };

  const data = structured || defaultStructuredData;

  const robotsMeta = noindex
    ? '<meta name="robots" content="noindex, nofollow">'
    : '';

  const homeStyles = home
    ? `
      <link
        rel="stylesheet"
               href="/assets/about-scroll.css?v=4"
      >
      <link
        rel="stylesheet"
        href="/assets/hero.css?v=3"
      >
       <link
        rel="stylesheet"
        href="/assets/hero-portrait.css?v=1"
      >
            <link
        rel="stylesheet"
        href="/assets/projects-phones.css?v=1"
      >
            <link
        rel="stylesheet"
        href="/assets/expertises.css?v=1"
      >
    `
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    >
    <meta name="color-scheme" content="dark">
    <meta
      name="theme-color"
      content="${home ? '#000000' : '#06071a'}"
    >

    <title>${e(title)}</title>

    <meta name="description" content="${e(description)}">
    <meta name="author" content="${e(site.name)}">
    ${robotsMeta}

    <link rel="canonical" href="${e(canonical)}">

    <meta property="og:type" content="website">
    <meta property="og:locale" content="fr_FR">
    <meta
      property="og:site_name"
      content="Ousmane Coulibaly — Portfolio"
    >
    <meta property="og:title" content="${e(title)}">
    <meta property="og:description" content="${e(description)}">
    <meta property="og:url" content="${e(canonical)}">
    <meta
      property="og:image"
      content="${e(site.url)}/assets/images/og-cover.png"
    >
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta
      property="og:image:alt"
      content="Ousmane Coulibaly — Data Science, MLOps et développement Full-Stack"
    >

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${e(title)}">
    <meta name="twitter:description" content="${e(description)}">
    <meta
      name="twitter:image"
      content="${e(site.url)}/assets/images/og-cover.png"
    >

    <link
      rel="icon"
      href="/assets/images/monogram.svg"
      type="image/svg+xml"
    >
    <link
      rel="apple-touch-icon"
      href="/assets/images/icon-192.png"
    >
    <link
      rel="preload"
      href="/assets/fonts/space-grotesk-latin.woff2"
      as="font"
      type="font/woff2"
      crossorigin
    >

    <link
      rel="stylesheet"
      href="/assets/styles.css?v=20260927-4"
    >

    ${homeStyles}

    <link
      rel="stylesheet"
      href="/assets/portfolio.css?v=1"
    >
          <link
      rel="stylesheet"
      href="/assets/navigation.css?v=1"
    >

    <script type="application/ld+json">${jsonForHTML(data)}</script>
    <script src="/assets/scripts.js?v=2" defer></script>
        ${home ? '<script src="/assets/presentation.js?v=1" defer></script>' : ''}
            ${home ? '<script src="/assets/projects-phones.js?v=1" defer></script>' : ''}
  </head>

  <body${home ? ' class="home-page"' : ''}>
    ${header(path, site)}

    <main id="contenu" tabindex="-1">
      ${body}
    </main>

    ${footer(site)}
  </body>
</html>`;
}

export function projectCard(project, index) {
  const image =
    project.image || '/assets/images/project-default.svg';

  const imageAlt =
    project.imageAlt ||
    'Composition graphique évoquant un projet numérique';

  const projectNumber = String(index + 1).padStart(2, '0');

  return `
    <article
      class="project-card theme-${e(project.theme)}"
      data-reveal
    >
      <a
        class="project-link"
        href="/projets/${e(project.slug)}/"
        aria-labelledby="project-${e(project.slug)}"
      >
        <div class="project-visual">
          <img
            src="${e(image)}"
            width="1200"
            height="800"
            loading="lazy"
            decoding="async"
            alt="${e(imageAlt)}"
          >

          <span class="project-index" aria-hidden="true">
            ${projectNumber}
          </span>

          <span class="project-arrow" aria-hidden="true">
            ↗
          </span>
        </div>

        <div class="project-meta">
          <div>
            <p class="eyebrow">${e(project.category)}</p>

            <h3 id="project-${e(project.slug)}">
              ${e(project.title)}
            </h3>
          </div>

          <span class="status status-${e(project.status)}">
            ${e(statuses[project.status])}
          </span>
        </div>

        <p class="project-summary">
          ${e(project.summary)}
        </p>
      </a>
    </article>
  `;
}

function showcaseCard(project, index) {
  const image = project.image || '/assets/images/project-default.svg';

  return `
    <article
      class="phone-project"
      data-phone-project
      data-title="${e(project.title)}"
    >
      <a
        class="phone-device"
        href="/projets/${e(project.slug)}/"
        aria-labelledby="phone-title-${e(project.slug)}"
      >
        <div class="phone-screen">
          <div class="phone-screen-bar" aria-hidden="true">
            <span>OC</span>
            <span>PORTFOLIO</span>
          </div>

          <p class="phone-project-category">
            ${String(index + 1).padStart(2, '0')} / ${e(project.category)}
          </p>

          <h3 id="phone-title-${e(project.slug)}">
            ${e(project.title)}
          </h3>

          <div class="phone-project-image">
            <img
              src="${e(image)}"
              width="1200"
              height="800"
              loading="lazy"
              decoding="async"
              alt="${e(project.imageAlt || 'Illustration du projet')}"
            >
          </div>

          <p class="phone-project-summary">
            ${e(project.summary)}
          </p>

          <p class="phone-project-status">
            ${e(statuses[project.status])}
          </p>

          <span class="phone-project-open">
            Découvrir le projet
            <span aria-hidden="true">&#8599;</span>
          </span>
        </div>
      </a>
    </article>
  `;
}

function contact(site) {
  const subjects = [
    ['Mission', 'Un projet ou une mission'],
    ['Recrutement', 'Une opportunité professionnelle'],
    ['Un projet du portfolio', 'Échanger sur un projet du portfolio'],
    ['Autre', 'Autre demande'],
  ];

  const subjectOptions = subjects
    .map(([label, value], index) => `
      <label for="subject-${index}">
        <input
          id="subject-${index}"
          type="radio"
          name="subject"
          value="${e(value)}"
          ${index === 0 ? 'checked' : ''}
        >
        <span>${e(label)}</span>
      </label>
    `)
    .join('\n');

  return `
    <section
      class="contact-section wrap"
      id="contact"
      aria-labelledby="contact-title"
    >
      <div class="contact-grid">
        <div class="contact-details">
          <p class="kicker">Contact</p>

          <h2 id="contact-title">
            Un projet en tête ?
            <br>
            <span class="spectrum">Parlons-en.</span>
          </h2>

          <p>
            Une mission, une opportunité professionnelle
            ou une idée à explorer ensemble.
          </p>

          <a class="email-link" href="mailto:${e(site.email)}">
            ${e(site.email)}
          </a>

          <a class="phone-link" href="tel:${e(site.phone)}">
            ${e(site.phoneLabel)}
          </a>
        </div>

        <form
          id="contact-form"
          action="https://formspree.io/f/${e(site.formspreeId)}"
          method="POST"
          aria-describedby="contact-privacy"
        >
          <div class="form-row">
            <div class="form-field">
              <label for="name">
                Votre nom
                <span aria-hidden="true">*</span>
              </label>

              <input
                type="text"
                id="name"
                name="name"
                autocomplete="name"
                maxlength="100"
                required
                placeholder="Comment vous appelez-vous ?"
              >
            </div>

            <div class="form-field">
              <label for="email">
                Votre e-mail
                <span aria-hidden="true">*</span>
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                maxlength="254"
                required
                placeholder="vous@exemple.com"
              >
            </div>
          </div>

          <fieldset class="subjects">
            <legend>Vous me contactez pour</legend>

            <div>
              ${subjectOptions}
            </div>
          </fieldset>

          <div class="form-field">
            <label for="message">
              Votre message
              <span aria-hidden="true">*</span>
            </label>

            <textarea
              id="message"
              name="message"
              rows="4"
              minlength="10"
              maxlength="5000"
              required
              aria-describedby="message-help"
              placeholder="Quelques mots sur votre besoin, votre équipe ou votre idée…"
            ></textarea>

            <p id="message-help" class="field-help">
              10 caractères minimum.
              Les champs marqués * sont obligatoires.
            </p>
          </div>

          <div hidden>
            <label for="website">Laissez ce champ vide</label>

            <input
              type="text"
              id="website"
              name="_gotcha"
              tabindex="-1"
              autocomplete="off"
            >
          </div>

          <div class="form-bottom">
            <p id="contact-privacy">
              Vos informations servent à répondre à votre demande,
              via Formspree.
              <a href="/confidentialite/">Données personnelles</a>.
              Une confirmation s’affiche après l’envoi.
            </p>

            <button
              class="button button-accent"
              type="submit"
            >
              Envoyer le message
              ${arrow}
            </button>
          </div>
        </form>
      </div>
    </section>
  `;
}

export function homepage(site, projects, noindex) {
  const projectPhones = projects.map(showcaseCard).join('\n');
  

  const body = `
    <section class="portrait-hero" aria-labelledby="hero-title">
      <div class="portrait-hero-media">
        <img
          src="/assets/images/ousmane-hero.png"
          width="1200"
          height="1500"
          alt="Portrait d’Ousmane Coulibaly, vêtu d’un sweat noir"
          fetchpriority="high"
          decoding="async"
        >
        </div>

        <div class="portrait-hero-copy">
        <p class="portrait-hero-greeting">
          Hey <span aria-hidden="true">👋</span> I’m Ousmane
        </p>

        <h1 id="hero-title">
          Développeur
          <span>&amp; Data Engineer</span>
        </h1>

        <a class="portrait-hero-button" href="#contact">
          Travaillons ensemble
          <span aria-hidden="true">↗</span>
        </a>
      </div>

      <aside
        class="portrait-hero-expertise"
        aria-labelledby="hero-expertise-title"
      >
        <h2 id="hero-expertise-title">Mes outils</h2>

        <ul>
          <li>Python</li>
          <li>SQL</li>
          <li>React</li>
          <li>FastAPI</li>
        </ul>
      </aside>

      <div class="portrait-hero-footer">
        <p class="portrait-hero-description">
          Basé au Mali, je conçois des applications et des
          solutions data adaptées aux besoins du terrain.
        </p>

        <dl class="portrait-hero-highlights">
          <div>
            <dt>Projets présentés</dt>
            <dd>${String(projects.length).padStart(2, '0')}</dd>
          </div>

          <div>
            <dt>Web &amp; applications</dt>
            <dd>Full-Stack</dd>
          </div>

          <div>
            <dt>Pipelines &amp; modèles</dt>
            <dd>Data</dd>
          </div>
        </dl>
      </div>
    </section>
        <section
      class="portox-about"
      id="profil"
      aria-labelledby="about-title"
    >
      <div class="portox-about-inner">
        <div class="portox-about-label">
          <p class="portox-about-status">
            <span aria-hidden="true"></span>
            Ouvert aux collaborations
          </p>

          <h2 id="about-title">Une approche transversale</h2>
        </div>

        <div class="portox-about-content">
          <p class="portox-about-text" data-profile-text>
            Je suis Ousmane Alou Coulibaly, développeur et Data Engineer
            basé au Mali. Mon parcours en génie logiciel et en Data Science
            me permet de relier le code, les données et les besoins du terrain.
            Je conçois des applications et des solutions data avec une idée
            simple : comprendre le problème, construire une solution fiable
            et la rendre utile à ceux qui l’utilisent.
          </p>

          <div class="portox-about-links">
            <a class="portox-about-primary" href="#projets">
              Découvrir mes projets
              <span aria-hidden="true">&#8599;</span>
            </a>

            <a class="portox-about-secondary" href="/parcours/">
              Parcours &amp; CV
            </a>
          </div>
        </div>
      </div>
    </section>

    <section
      class="phone-projects"
      id="projets"
      aria-labelledby="projects-title"
      data-phone-showcase
    >
      <div class="phone-story" data-phone-story>
        <div class="phone-projects-layout">
          <div class="phone-projects-copy">
            <p class="phone-projects-eyebrow">
              Sélection de projets
            </p>

            <h2 id="projects-title">
              Des idées.
              <span>Des produits.</span>
            </h2>

            <p class="phone-projects-description">
              Des applications pensées pour répondre à des besoins
              concrets. Explore mes projets, leur conception
              et les choix techniques qui les font avancer.
            </p>

            <a
              class="phone-projects-link"
              href="${projects[0] ? '/projets/' + e(projects[0].slug) + '/' : '#contact'}"
              data-phone-link
            >
              Explorer un projet
              <span aria-hidden="true">&#8599;</span>
            </a>

            <div
              class="phone-projects-controls"
              data-phone-controls
              hidden
            >
              <button
                type="button"
                data-phone-prev
                aria-label="Projet précédent"
              >
                &#8592;
              </button>

              <p
                data-phone-counter
                aria-live="polite"
                aria-atomic="true"
              >
                01 / ${String(projects.length).padStart(2, '0')}
              </p>

              <button
                type="button"
                data-phone-next
                aria-label="Projet suivant"
              >
                &#8594;
              </button>
            </div>

            <a class="phone-projects-all" href="/projets/">
              Tous les projets
            </a>
          </div>

          <div class="phone-projects-stack" data-phone-stack>
            ${projectPhones || '<p>De nouveaux projets à venir.</p>'}
          </div>
        </div>
      </div>
    </section>

    ${expertises(projects)}
    ${contact(site)}
  `;

  return page({
    site,
    title: `${site.name} — Data Science, MLOps & Full-Stack`,
    body,
    home: true,
    noindex,
  });
}

function expertises(projects) {
  const app =
    projects.find(project => project.slug === 'planora') ||
    projects[0];

  const visuals = {
    science: `
      <div
        class="expertise-visual expertise-visual--science"
        aria-hidden="true"
      >
        <span class="expertise-orbit">
          <span>DATA</span>
        </span>
      </div>
    `,

    engineering: `
      <div
        class="expertise-visual expertise-visual--pipeline"
        aria-hidden="true"
      >
        <span>Collecter</span>
        <i>&#8594;</i>
        <span>Structurer</span>
        <i>&#8594;</i>
        <span>Exploiter</span>
      </div>
    `,

    development: `
      <div
        class="expertise-visual expertise-visual--interface"
        aria-hidden="true"
      >
        <div class="expertise-window-bar">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div class="expertise-window-grid">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `,
  };

  const skills = [
    {
      type: 'science',
      title: 'Data Science',
      text:
        'Explorer les données, tester des hypothèses et construire ' +
        'des modèles évalués avec méthode pour éclairer les décisions.',
      tags: ['Python', 'Pandas', 'Machine learning'],
    },
    {
      type: 'engineering',
      title: 'Data Engineering',
      text:
        'Collecter et structurer les données, puis relier leur traitement ' +
        'aux applications avec une attention portée à la fiabilité.',
      tags: ['SQL', 'ETL', 'API', 'MLOps'],
    },
    {
      type: 'development',
      title: 'Développement Full-Stack',
      text:
        'Transformer un besoin en application : une interface lisible, ' +
        'une logique métier cohérente et des données bien organisées.',
      tags: ['React', 'Next.js', 'FastAPI', 'MySQL'],
      project: app,
    },
  ];

  const cards = skills.map((skill, index) => {
    const tags = skill.tags
      .map(tag => `<li>${e(tag)}</li>`)
      .join('\n');

    const projectLink = skill.project
      ? `
        <a
          class="expertise-project-link"
          href="/projets/${e(skill.project.slug)}/"
        >
          Explorer ${e(skill.project.title)}
          <span aria-hidden="true">&#8599;</span>
        </a>
      `
      : '';

    return `
      <article class="expertise-card expertise-card--${skill.type}">
        <p class="expertise-card-number">
          ${String(index + 1).padStart(2, '0')}
        </p>

        <h3>${e(skill.title)}</h3>

        <p class="expertise-card-description">
          ${e(skill.text)}
        </p>

        <ul class="expertise-tags" aria-label="Outils et méthodes">
          ${tags}
        </ul>

        ${visuals[skill.type]}
        ${projectLink}
      </article>
    `;
  }).join('\n');

  return `
    <section
      class="expertise-section"
      id="expertises"
      aria-labelledby="skills-title"
    >
      <div class="expertise-inner">
        <header class="expertise-heading">
          <div>
            <p class="expertise-eyebrow">Savoir-faire</p>

            <h2 id="skills-title">
              Du code aux données.
              <span>Une même exigence.</span>
            </h2>
          </div>

          <p class="expertise-introduction">
            Comprendre le besoin, organiser l’information et construire
            des outils qui servent réellement leurs utilisateurs.
          </p>
        </header>

        <div class="expertise-grid">
          ${cards}
        </div>

        <div class="expertise-footer">
          <p>Un projet à construire ou une équipe à rejoindre ?</p>

          <a href="#contact">
            Parlons-en
            <span aria-hidden="true">&#8599;</span>
          </a>
        </div>
      </div>
    </section>
  `;
}

export function projectIndex(site, projects, noindex) {
  const cards = projects.length
    ? projects.map(projectCard).join('\n')
    : '<p>De nouveaux projets à venir.</p>';

  const body = `
    <section class="work-index wrap">
      <header>
        <p class="kicker">Les réalisations</p>

        <h1>
          Mes <span class="spectrum">projets.</span>
        </h1>

        <p class="page-intro">
          Du besoin de terrain aux choix de conception,
          découvrez l’histoire de chaque produit.
        </p>
      </header>

      <div class="work-grid">
        ${cards}
      </div>
    </section>

    ${contact(site)}
  `;

  return page({
    site,
    path: '/projets/',
    title: `Projets — ${site.name}`,
    body,
    noindex,
  });
}

export function projectpage(site, project, next, noindex) {
  const image =
    project.image || '/assets/images/project-default.svg';

  const imageAlt =
    project.imageAlt ||
    'Composition graphique évoquant un projet numérique';

  const caption = project.imageCaption
    ? `<figcaption>${e(project.imageCaption)}</figcaption>`
    : '';

  const role = project.role
    ? `
      <dt>Mon rôle</dt>
      <dd>${e(project.role)}</dd>
    `
    : '';

  const technologies = project.technologies.length
    ? `
      <h2 class="eyebrow">TECHNOLOGIES</h2>

      <ul class="tags">
        ${project.technologies
          .map(technology => `<li>${e(technology)}</li>`)
          .join('\n')}
      </ul>
    `
    : '';

  const features = project.features.length
    ? `
      <ul class="feature-list">
        ${project.features
          .map(feature => `<li>${e(feature)}</li>`)
          .join('\n')}
      </ul>
    `
    : '';

  const approach = project.approach
    ? `
      <section aria-labelledby="approach-title">
        <p class="eyebrow">03 / APPROCHE</p>
        <h2 id="approach-title">La logique du produit.</h2>

        ${paragraph(project.approach)}
      </section>
    `
    : '';

  const result = project.result
    ? `
      <section aria-labelledby="result-title">
        <p class="eyebrow">RÉSULTATS</p>
        <h2 id="result-title">Ce que j’en retiens.</h2>

        ${paragraph(project.result)}
      </section>
    `
    : '';

  const statusNote = project.statusNote
    ? `
      <section class="case-status" aria-labelledby="status-title">
        <h2 id="status-title">Aujourd’hui</h2>

        ${paragraph(project.statusNote)}
      </section>
    `
    : '';

  const contactHref =
    `/?projet=${encodeURIComponent(project.title)}#contact`;

  const nextLink = next
    ? `
      <a href="/projets/${e(next.slug)}/">
        ${e(next.title)}
        ${arrow}
      </a>
    `
    : `
      <a href="/#contact">
        Parlons de votre projet
        ${arrow}
      </a>
    `;

  const body = `
    <section class="case-hero wrap">
      <a class="breadcrumb" href="/projets/">
        ← Tous les projets
      </a>

      <div class="section-heading">
        <p class="eyebrow">${e(project.category)}</p>

        <span class="status status-${e(project.status)}">
          ${e(statuses[project.status])}
        </span>
      </div>

      <h1>
        ${e(project.title)}<span class="accent">.</span>
      </h1>

      <p class="case-summary">
        ${e(project.summary)}
      </p>

      <figure class="case-cover theme-${e(project.theme)}">
        <img
          src="${e(image)}"
          width="1200"
          height="800"
          fetchpriority="high"
          alt="${e(imageAlt)}"
        >

        ${caption}
      </figure>
    </section>

    <div class="case-content wrap">
      <aside class="case-aside">
        <p class="eyebrow">LE PROJET EN BREF</p>

        <dl>
          <dt>Domaine</dt>
          <dd>${e(project.category)}</dd>

          <dt>Statut</dt>
          <dd>${e(statuses[project.status])}</dd>

          ${role}
        </dl>

        ${technologies}

        <a class="text-link" href="${e(contactHref)}">
          Échanger sur ce projet
          ${arrow}
        </a>
      </aside>

      <div class="case-prose">
        <section aria-labelledby="context-title">
          <p class="eyebrow">01 / CONTEXTE</p>
          <h2 id="context-title">Le point de départ.</h2>

          ${paragraph(project.context)}
        </section>

        <section aria-labelledby="objective-title">
          <p class="eyebrow">02 / INTENTION</p>
          <h2 id="objective-title">Ce que le projet vise.</h2>

          ${paragraph(project.objective)}
          ${features}
        </section>

        ${approach}
        ${result}
        ${statusNote}

        <div class="case-actions">
          ${external(project.repository, 'Voir le code')}
          ${external(project.demo, 'Ouvrir la démo')}
        </div>
      </div>
    </div>

    <section class="next-project wrap">
      <p class="eyebrow">
        ${next ? 'POURSUIVRE LA DÉCOUVERTE' : 'UNE IDÉE EN TÊTE ?'}
      </p>

      <h2>${nextLink}</h2>
    </section>
  `;

  return page({
    site,
    title: `${project.title} — ${site.name}`,
    description: project.summary,
    path: `/projets/${project.slug}/`,
    body,
    noindex,
    structured: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: project.title,
      description: project.summary,
      url: `${site.url}/projets/${project.slug}/`,
      inLanguage: 'fr',
      author: {
        '@type': 'Person',
        name: site.name,
      },
    },
  });
}

export function resumepage(site, noindex) {
  const portrait = site.portrait
    ? `
      <figure>
        <img
          src="${e(site.portrait)}"
          alt="${e(site.portraitAlt)}"
          width="760"
          height="900"
          fetchpriority="high"
        >

        <figcaption>${e(site.name)}</figcaption>
      </figure>
    `
    : '';

  const body = `
    <section class="profile-intro wrap">
      <a class="breadcrumb" href="/">← Accueil</a>

      <div class="profile-grid">
        ${portrait}

        <div>
          <p class="kicker">Mon parcours</p>

          <h1>
            La curiosité.
            <br>
            Et le <span class="spectrum">concret.</span>
          </h1>

          <p class="page-intro">
            Je suis ${e(site.name)}.
            La Data Science, le MLOps et le développement Full-Stack
            me donnent trois angles pour comprendre un besoin
            et construire une réponse utile.
          </p>

          <a
            class="blue-button"
            href="/assets/documents/CV_Ousmane_Coulibaly.pdf"
            download
          >
            Télécharger mon CV
          </a>
        </div>
      </div>
    </section>

    <section
      class="resume-section wrap"
      aria-labelledby="training-title"
    >
      <h2 id="training-title">Formation</h2>

      <div class="timeline">
        <article>
          <p class="eyebrow">2021 — 2024</p>
          <h3>Licence en génie logiciel</h3>
          <p>SUP MANAGEMENT</p>
        </article>

        <article>
          <p class="eyebrow">2019 — 2021</p>
          <h3>Baccalauréat économique</h3>
          <p>Lycée Castors</p>
        </article>
      </div>
    </section>

    <section
      class="resume-section wrap"
      aria-labelledby="experience-title"
    >
      <h2 id="experience-title">Expérience</h2>

      <div class="timeline">
        <article>
          <p class="eyebrow">2023 / STAGE</p>
          <h3>EDM-SA</h3>

          <p>
            Participation à la conception de sites et d’applications
            internes, recueil des besoins auprès des utilisateurs,
            démonstrations et suivi des corrections.
          </p>

          <p>
            Une expérience qui relie développement, échanges avec
            les équipes et qualité du service.
          </p>
        </article>
      </div>
    </section>

    <section
      class="resume-section wrap"
      aria-labelledby="languages-title"
    >
      <h2 id="languages-title">Langues &amp; approche</h2>

      <div class="timeline">
        <article>
          <h3>Échanger avec clarté</h3>
          <p>
            Français et bamanakan courants.
            Anglais intermédiaire.
          </p>
        </article>

        <article>
          <h3>Construire ensemble</h3>
          <p>
            Écoute, organisation, autonomie et esprit d’équipe.
            Je m’intéresse autant au fonctionnement d’un produit
            qu’aux personnes qui l’utilisent.
          </p>
        </article>
      </div>
    </section>

    <section class="next-project wrap">
      <p class="eyebrow">UNE MISSION OU UNE OPPORTUNITÉ ?</p>

      <h2>
        <a href="/#contact">
          Faisons connaissance
          ${arrow}
        </a>
      </h2>
    </section>
  `;

  return page({
    site,
    title: `Parcours & CV — ${site.name}`,
    description:
      'Le parcours d’Ousmane Alou Coulibaly : génie logiciel, ' +
      'expérience à EDM-SA et approche Data Science, MLOps et Full-Stack.',
    path: '/parcours/',
    body,
    noindex,
  });
}

export function privacypage(site, noindex) {
  const body = `
    <section class="page-heading wrap">
      <a class="breadcrumb" href="/">← Accueil</a>

      <p class="eyebrow">CONTACT / DONNÉES PERSONNELLES</p>

      <h1>
        Un échange
        <br>
        en <span class="serif-word">confiance.</span>
      </h1>

      <p class="page-intro">
        Voici comment fonctionne le formulaire de ce portfolio.
      </p>
    </section>

    <div class="legal-prose wrap">
      <section>
        <h2>Les informations envoyées</h2>

        <p>
          Le formulaire transmet votre nom, votre adresse e-mail,
          le sujet choisi et votre message à ${e(site.name)},
          afin de répondre à votre demande.
          N’y incluez pas de mot de passe ni d’information
          confidentielle inutile à l’échange.
        </p>
      </section>

      <section>
        <h2>Le service de formulaire</h2>

        <p>
          L’envoi est traité par Formspree.
          Ce prestataire intervient dans l’acheminement et le filtrage
          des messages et peut traiter des informations techniques
          associées à la requête.
          Ses conditions de traitement et de conservation sont
          décrites dans sa
          <a
            href="https://formspree.io/legal/privacy-policy/"
            target="_blank"
            rel="noopener noreferrer"
          >politique de confidentialité<span class="sr-only"> (nouvel onglet)</span></a>.
        </p>
      </section>

      <section>
        <h2>Vos demandes concernant les données</h2>

        <p>
          Pour poser une question sur un message envoyé, demander
          l’accès aux informations associées, leur rectification
          ou leur suppression, vous pouvez écrire à
          <a href="mailto:${e(site.email)}">${e(site.email)}</a>.
          Les modalités applicables dépendent de la demande
          et du traitement concerné.
        </p>
      </section>

      <section>
        <h2>Navigation et administration</h2>

        <p>
          Cette version du portfolio n’intègre aucun outil
          de publicité ou de mesure d’audience.
          Les polices et illustrations sont hébergées avec le site.
          L’hébergeur peut conserver des journaux techniques
          nécessaires au fonctionnement du service.
        </p>

        <p>
          L’espace d’administration utilise une authentification
          GitHub réservée aux personnes disposant des droits
          d’écriture sur le dépôt.
          Cette connexion n’est pas nécessaire pour consulter
          le portfolio ou envoyer un message.
        </p>
      </section>

      <p class="legal-date">
        Informations mises à jour le 26 septembre 2026.
      </p>
    </div>
  `;

  return page({
    site,
    title: `Données personnelles — ${site.name}`,
    description:
      'Informations sur le formulaire de contact, Formspree ' +
      'et les données transmises depuis le portfolio.',
    path: '/confidentialite/',
    body,
    noindex,
  });
}

export function notfound(site) {
  const body = `
    <section class="not-found wrap">
      <p class="eyebrow">ERREUR 404</p>

      <h1>
        Un détour
        <br>
        imprévu<span class="accent">.</span>
      </h1>

      <p>Cette page n’existe pas ou a changé d’adresse.</p>

      <a class="button button-accent" href="/">
        Revenir au portfolio
        ${arrow}
      </a>
    </section>
  `;

  return page({
    site,
    title: `Page introuvable — ${site.name}`,
    description:
      'Retrouvez les projets et le parcours d’Ousmane Coulibaly.',
    path: '/404.html',
    noindex: true,
    body,
  });
}