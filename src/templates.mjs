import { escapeHTML as e, jsonForHTML, statuses } from './schema.mjs';

const arrow = '<span aria-hidden="true">↗</span>';
const paragraph = value => String(value || '').split(/\n\s*\n/).filter(Boolean).map(part => `<p>${e(part)}</p>`).join('');
const link = (href, text, className = '') => `<a class="${className}" href="${e(href)}">${text}</a>`;
const external = (href, label) => href ? `<a class="button button-outline" href="${e(href)}" target="_blank" rel="noopener noreferrer">${e(label)} ${arrow}<span class="sr-only"> (nouvel onglet)</span></a>` : '';

function header(path, site) {
  const home = path === '/';
  const contactHref = home || path === '/projets/' ? '#contact' : '/#contact';
  const currentPage = path.startsWith('/projets/') && path !== '/projets/' ? 'location' : 'page';
  const sections = [
    ['Accueil', home ? '#haut' : '/', home],
    ['Projets', '/projets/', path.startsWith('/projets/')],
    ['Parcours', '/parcours/', path === '/parcours/'],
    ['Expertises', home ? '#expertises' : '/#expertises', false]
  ];
  const items = sections.map(([label, href, current]) =>
    `<a href="${href}"${current ? ` aria-current="${currentPage}"` : ''}>${label}</a>`).join('');
  return `<a class="skip-link" href="#contenu">Aller au contenu</a><div id="haut"></div>
  <header class="site-header wrap">
    <a class="brand" href="/" aria-label="Ousmane Coulibaly — Accueil"><span class="hero-brand-mark" aria-hidden="true">OC</span></a>
    <nav class="header-nav" aria-label="Navigation principale">${items}</nav>
    <a class="header-contact" href="${contactHref}">Contact ${arrow}</a>
    <button class="menu-open" type="button" aria-haspopup="dialog" aria-controls="menu-dialog" hidden><span>Menu</span><span class="menu-lines" aria-hidden="true"></span></button>
  </header>
  <dialog class="menu-dialog" id="menu-dialog" aria-label="Menu du portfolio">
    <div class="menu-top"><a class="hero-brand-mark" href="/" aria-label="Accueil">OC</a><button type="button" class="menu-close" autofocus>Fermer <span aria-hidden="true">×</span></button></div>
    <div class="menu-layout"><div class="menu-invite"><p class="kicker">Contact</p><p>Un projet en tête ?<br><strong>Parlons-en.</strong></p><a class="blue-button" href="${contactHref}">Prendre contact</a></div>
    <nav aria-label="Toutes les rubriques">${items}<a href="${contactHref}">Contact</a></nav></div>
    <div class="menu-foot"><a href="mailto:${e(site.email)}">${e(site.email)}</a><a href="tel:${e(site.phone)}">${e(site.phoneLabel)}</a></div>
  </dialog>`;
}

function footer(site) {
  return `<footer class="site-footer wrap"><div class="footer-bottom"><small>© ${new Date().getFullYear()} ${e(site.name)}</small>
    <nav aria-label="Liens utiles"><a href="/parcours/">Parcours &amp; CV</a><a href="/confidentialite/">Confidentialité</a><a href="/admin/">Administration</a></nav>
    <button class="motion-toggle" type="button" aria-pressed="false" hidden>Réduire les animations</button><a class="back-top" href="#haut">Haut de page ↑</a></div></footer>`;
}

function intro() {
  const letters = 'OUSMANE'.split('').map((letter,index) =>
    `${index===3 ? `<span class="intro-art" aria-hidden="true"><span class="intro-art-inner"><img src="/assets/images/monogram.svg" alt="" width="128" height="128"><img src="/assets/images/pharmaguard.svg" alt="" width="1200" height="800"><img src="/assets/images/planora.svg" alt="" width="1200" height="800"></span></span>` : ''}<span class="intro-letter intro-index-${index}"><span>${letter}</span></span>`
  ).join('');
  return `<div class="site-intro"><div class="intro-stage" aria-hidden="true"><div class="intro-name"><div class="intro-word">${letters}</div><div class="intro-lastname">COULIBALY</div></div><p class="intro-welcome">Bienvenue.</p></div><p class="intro-signature" aria-hidden="true">DATA <span>·</span> CODE <span>·</span> IMPACT</p><button class="intro-skip" type="button" aria-label="Passer l’introduction">Passer <span aria-hidden="true">↗</span></button></div>`;
}

export function page({site, title, description = site.description, path = '/', body, home = false, noindex = false, structured}) {
  const canonical = `${site.url}${path}`;
  const data = structured || ((home || path === '/parcours/') ? {
    '@context':'https://schema.org', '@type':'ProfilePage', '@id':`${canonical}#profile`,
    url:canonical, name:title, inLanguage:'fr',
    mainEntity:{'@type':'Person', '@id':`${site.url}/#person`, name:site.name, url:`${site.url}/`, jobTitle:site.title}
  } : {'@context':'https://schema.org','@type':'WebPage',url:canonical,name:title,inLanguage:'fr'});
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="dark">
  <meta name="theme-color" content="#06071a">
  <title>${e(title)}</title>
  <meta name="description" content="${e(description)}">
  <meta name="author" content="${e(site.name)}">
${noindex ? '<meta name="robots" content="noindex, nofollow">' : ''}
  <link rel="canonical" href="${e(canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="fr_FR">
  <meta property="og:site_name" content="Ousmane Coulibaly — Portfolio">
  <meta property="og:title" content="${e(title)}">
  <meta property="og:description" content="${e(description)}">
  <meta property="og:url" content="${e(canonical)}">
  <meta property="og:image" content="${e(site.url)}/assets/images/og-cover.png">
  <meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Ousmane Coulibaly — Data Science, MLOps et développement Full-Stack">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${e(title)}">
  <meta name="twitter:description" content="${e(description)}">
  <meta name="twitter:image" content="${e(site.url)}/assets/images/og-cover.png">
  <link rel="icon" href="/assets/images/monogram.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/images/icon-192.png">
  <link rel="preload" href="/assets/fonts/space-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>
  ${home ? '<script src="/assets/intro-init.js?v=2"></script>' : ''}
  <link rel="stylesheet" href="/assets/styles.css?v=20260927-4">
  ${home ? '<link rel="stylesheet" href="/assets/about-scroll.css?v=3">' : ''}
  ${home ? '<link rel="stylesheet" href="/assets/hero.css?v=2"><link rel="stylesheet" href="/assets/projects-showcase.css?v=1"><script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js"}}</script><script type="module" src="/assets/hero-particles.js?v=3"></script><script src="/assets/projects-showcase.js?v=1" defer></script>' : ''}
  <link rel="stylesheet" href="/assets/portfolio.css?v=1">
  <script type="application/ld+json">${jsonForHTML(data)}</script>
  <script src="/assets/scripts.js?v=2" defer></script>
  ${home ? '<script src="/assets/about-scroll.js?v=3" defer></script><script type="module" src="/assets/oc3d/oc-monogram.js?v=1"></script>' : ''}
</head>
<body${home ? ' class="home-page"' : ''}>${home ? intro() : ''}${header(path, site)}<main id="contenu" tabindex="-1">${body}</main>${footer(site)}</body>
</html>`;
}

export function projectCard(project, index) {
  return `<article class="project-card theme-${e(project.theme)}" data-reveal>
    <a class="project-link" href="/projets/${project.slug}/" aria-labelledby="project-${project.slug}">
      <div class="project-visual"><img src="${e(project.image || '/assets/images/project-default.svg')}" width="1200" height="800" loading="lazy" decoding="async" alt="${e(project.imageAlt || 'Composition graphique évoquant un projet numérique')}"><span class="project-index" aria-hidden="true">${String(index+1).padStart(2,'0')}</span><span class="project-arrow" aria-hidden="true">↗</span></div>
      <div class="project-meta"><div><p class="eyebrow">${e(project.category)}</p><h3 id="project-${project.slug}">${e(project.title)}</h3></div><span class="status status-${project.status}">${e(statuses[project.status])}</span></div>
      <p class="project-summary">${e(project.summary)}</p>
    </a>
  </article>`;
}

function showcaseCard(project) {
  return `<article class="showcase-card" data-showcase-card>
    <a class="showcase-card-link" href="/projets/${e(project.slug)}/" aria-label="Découvrir le projet ${e(project.title)}">
      <div class="showcase-card-media">
        <img src="${e(project.image || '/assets/images/project-default.svg')}" width="1200" height="800" loading="lazy" decoding="async" alt="${e(project.imageAlt || 'Illustration du projet')}">
      </div>
      <div class="showcase-card-caption"><span>${e(project.imageCaption || 'Illustration du projet')}</span></div>
      <div class="showcase-card-details"><div><h3>${e(project.title)}</h3><p>${e(statuses[project.status])}</p></div><span aria-hidden="true">↗</span></div>
    </a>
  </article>`;
}

function contact(site) {
  return `<section class="contact-section wrap" id="contact" aria-labelledby="contact-title">
    <div class="contact-grid"><div class="contact-details"><p class="kicker">Contact</p>
      <h2 id="contact-title">Un projet en tête ?<br><span class="spectrum">Parlons-en.</span></h2>
      <p>Une mission, une opportunité professionnelle ou une idée à explorer ensemble.</p>
      <a class="email-link" href="mailto:${e(site.email)}">${e(site.email)}</a><a class="phone-link" href="tel:${e(site.phone)}">${e(site.phoneLabel)}</a></div>
      <form id="contact-form" action="https://formspree.io/f/${e(site.formspreeId)}" method="POST" aria-describedby="contact-privacy">
        <div class="form-row"><div class="form-field"><label for="name">Votre nom <span aria-hidden="true">*</span></label><input type="text" id="name" name="name" autocomplete="name" maxlength="100" required placeholder="Comment vous appelez-vous ?"></div><div class="form-field"><label for="email">Votre e-mail <span aria-hidden="true">*</span></label><input id="email" name="email" type="email" autocomplete="email" maxlength="254" required placeholder="vous@exemple.com"></div></div>
        <fieldset class="subjects"><legend>Vous me contactez pour</legend><div>${[
          ['Mission', 'Un projet ou une mission'], ['Recrutement', 'Une opportunité professionnelle'],
          ['Un projet du portfolio', 'Échanger sur un projet du portfolio'], ['Autre', 'Autre demande']
        ].map(([label, value], i) => `<label for="subject-${i}"><input id="subject-${i}" type="radio" name="subject" value="${value}"${i === 0 ? ' checked' : ''}><span>${label}</span></label>`).join('')}</div></fieldset>
        <div class="form-field"><label for="message">Votre message <span aria-hidden="true">*</span></label><textarea id="message" name="message" rows="4" minlength="10" maxlength="5000" required aria-describedby="message-help" placeholder="Quelques mots sur votre besoin, votre équipe ou votre idée…"></textarea><p id="message-help" class="field-help">10 caractères minimum. Les champs marqués * sont obligatoires.</p></div>
        <div hidden><label for="website">Laissez ce champ vide</label><input type="text" id="website" name="_gotcha" tabindex="-1" autocomplete="off"></div>
        <div class="form-bottom"><p id="contact-privacy">Vos informations servent à répondre à votre demande, via Formspree. <a href="/confidentialite/">Données personnelles</a>. Une confirmation s’affiche après l’envoi.</p><button class="button button-accent" type="submit">Envoyer le message ${arrow}</button></div>
      </form>
    </div>
  </section>`;
}

export function homepage(site, projects, noindex) {
  const featured = projects.find(project => project.title === 'PharmaGuard') || projects[0];
  const featuredLink = featured ? `/projets/${e(featured.slug)}/` : '#contact';
  const featuredImage = featured?.image || '/assets/images/project-default.svg';
  const projectCards = featured ? [featured, ...projects.filter(project => project !== featured)] : [];
  const body = `<section class="particle-hero" aria-labelledby="hero-title">
    <div class="particle-hero-inner">
      <div class="particle-hero-copy">
        <p class="particle-hero-name">Ousmane Coulibaly</p>
        <h1 id="hero-title">Comprendre la donnée.<br>Construire des<br><span>produits utiles.</span></h1>
        <p class="particle-hero-role">Data Scientist &amp; Développeur Full-Stack</p>
        <p class="particle-hero-description">De l’analyse des données à la création d’applications,<br class="hero-desktop-break"> je transforme les idées en solutions concrètes.</p>
        <div class="particle-hero-actions">
          <a class="particle-hero-primary" href="#projets">Découvrir mes projets <span aria-hidden="true">↗</span></a>
          <a class="particle-hero-secondary" href="#contact">Échanger avec moi <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div class="particle-hero-art" data-particle-art>
        <img class="particle-hero-fallback" src="/assets/images/oc-particles-reference.png" width="784" height="567" alt="" aria-hidden="true">
        <canvas class="particle-hero-canvas" aria-hidden="true"></canvas>
        <button class="particle-hero-pause" type="button" aria-pressed="false" hidden>Mettre l’animation en pause</button>
      </div>
    </div>
    <a class="particle-hero-scroll" href="#profil">Défiler <span aria-hidden="true">↓</span></a>
  </section>
  <section class="approach-section" id="profil" aria-labelledby="about-title">
    <div class="approach-inner">
      <header class="approach-heading">
        <p class="approach-eyebrow">Une approche transversale</p>
        <h2 id="about-title">Faire le lien entre<br>la donnée et <span>le terrain.</span></h2>
      </header>
      <div class="approach-grid">
        <div class="approach-copy">
          <p class="approach-lead" data-approach-reveal>Je suis Ousmane Alou Coulibaly. J’associe le développement logiciel à la Data Science et au MLOps pour donner une forme utile aux idées.</p>
          <p data-approach-reveal>Mon parcours en génie logiciel m’a appris à relier les besoins des utilisateurs aux choix techniques. Du premier échange à l’application, j’accorde de l’importance à la clarté, à la fiabilité et à ce que le produit apporte réellement.</p>
          <p data-approach-reveal>Pour une équipe qui recrute comme pour un client qui porte un projet, mon point de départ reste le même : comprendre le problème avant de construire la solution.</p>
          <div class="approach-links">
            <a class="approach-primary-link" href="/parcours/">Découvrir mon parcours <span aria-hidden="true">↗</span></a>
            <a href="/assets/documents/CV_Ousmane_Coulibaly.pdf" download>Télécharger mon CV <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <aside class="approach-art" aria-label="Monogramme OC interactif">
          <oc-monogram finish="silver" color="#82cbea" motion="float" role="group" aria-label="Monogramme OC interactif en trois dimensions">
            <img src="/assets/oc3d/oc-poster.png" alt="Monogramme OC" width="880" height="492" loading="lazy">
          </oc-monogram>
        </aside>
      </div>
      <a class="approach-next" href="#projets">Découvrir mes réalisations <span aria-hidden="true">↓</span></a>
    </div>
  </section>
  <section class="showcase-section" id="projets" aria-labelledby="projects-title">
    <div class="showcase-inner">
      <div class="showcase-overline"><p>Projets</p><p>Des idées ancrées dans des besoins concrets.</p></div>
      <h2 id="projects-title" class="showcase-title">Du besoin<br><span>au produit.</span></h2>
      ${featured ? `<div class="showcase-feature">
        <div class="showcase-feature-copy"><span class="showcase-rule" aria-hidden="true"></span>
          <h3>${e(featured.title)}</h3>
          <p class="showcase-meta">${e(featured.category)} · ${e(statuses[featured.status])}</p>
          <p class="showcase-summary">${e(featured.summary)}</p>
          <a class="showcase-feature-link" href="${featuredLink}">Explorer le projet <span aria-hidden="true">↗</span></a>
        </div>
        <figure class="showcase-feature-figure" data-feature-figure>
          <div class="showcase-feature-frame" data-feature-frame><img src="${e(featuredImage)}" width="1200" height="800" decoding="async" alt="${e(featured.imageAlt || 'Illustration du projet')}"></div>
          <figcaption>${e(featured.imageCaption || 'Illustration du projet')}</figcaption>
        </figure>
      </div>` : '<p>De nouveaux projets à venir.</p>'}
      ${projectCards.length ? `<div class="showcase-gallery-heading"><p><a href="/projets/">Tous les projets ↗</a> <span>· ${String(projectCards.length).padStart(2, '0')}</span></p>
        <div class="showcase-controls" data-gallery-controls hidden><button type="button" data-gallery-prev aria-label="Projet précédent">←</button><button type="button" data-gallery-next aria-label="Projet suivant">→</button></div></div>
      <div class="showcase-gallery" data-gallery aria-label="Galerie des projets">${projectCards.map(showcaseCard).join('')}</div>` : ''}
    </div>
  </section>



  ${expertises(projects)}${contact(site)}`;
  return page({site,title:`${site.name} — Data Science, MLOps & Full-Stack`,body,home:true,noindex});
}

function expertises(projects) {
  const app = projects.find(project => project.slug === 'planora') || projects[0];
  const skills = [
    {title: 'Data Science', text: 'Explorer les données, faire émerger des questions utiles et évaluer les modèles avec méthode.', tags: ['Python', 'Analyse', 'Machine learning'], image: '/assets/images/signal.svg'},
    {title: 'Ingénierie MLOps', text: 'Relier l’expérimentation à des services reproductibles, avec une attention portée aux tests et au déploiement.', tags: ['Git', 'API', 'Tests et pipelines'], image: '/assets/oc3d/oc-poster.png'},
    {title: 'Développement Full-Stack', text: 'Concevoir des interfaces et les relier à la logique métier, aux données et aux besoins des utilisateurs.', tags: ['JavaScript · React', 'PHP · MySQL', 'HTML · CSS'], image: app?.image || '/assets/images/project-default.svg', project: app}
  ];
  return `<section id="expertises" class="skills wrap" aria-labelledby="skills-title">
    <header><p class="kicker">Savoir-faire</p><h2 id="skills-title">Mes <span class="spectrum">expertises.</span></h2></header>
    <div class="skill-list">${skills.map((skill, i) => `<details class="skill" name="expertise"${i === 0 ? ' open' : ''}><summary>${skill.title}</summary>
      <div class="skill-copy"><p>${skill.text}</p><ul class="tags">${skill.tags.map(tag => `<li>${tag}</li>`).join('')}</ul>
      ${skill.project ? `<a class="text-link" href="/projets/${e(skill.project.slug)}/">Explorer ${e(skill.project.title)} ${arrow}</a>` : ''}</div>
      <img class="skill-image" src="${e(skill.image)}" alt="" loading="lazy" width="800" height="520"></details>`).join('')}</div>
  </section>`;
}

export function projectIndex(site, projects, noindex) {
  const body = `<section class="work-index wrap"><header><p class="kicker">Les réalisations</p>
    <h1>Mes <span class="spectrum">projets.</span></h1><p class="page-intro">Du besoin de terrain aux choix de conception, découvrez l’histoire de chaque produit.</p></header>
    <div class="work-grid">${projects.length ? projects.map(projectCard).join('') : '<p>De nouveaux projets à venir.</p>'}</div></section>${contact(site)}`;
  return page({site, path:'/projets/', title:`Projets — ${site.name}`, body, noindex});
}

export function projectpage(site, project, next, noindex) {
  const body = `<section class="case-hero wrap"><a class="breadcrumb" href="/projets/">← Tous les projets</a><div class="section-heading"><p class="eyebrow">${e(project.category)}</p><span class="status status-${project.status}">${e(statuses[project.status])}</span></div><h1>${e(project.title)}<span class="accent">.</span></h1><p class="case-summary">${e(project.summary)}</p><figure class="case-cover theme-${e(project.theme)}"><img src="${e(project.image || '/assets/images/project-default.svg')}" width="1200" height="800" fetchpriority="high" alt="${e(project.imageAlt || 'Composition graphique évoquant un projet numérique')}">${project.imageCaption ? `<figcaption>${e(project.imageCaption)}</figcaption>` : ''}</figure></section>
  <div class="case-content wrap"><aside class="case-aside"><p class="eyebrow">LE PROJET EN BREF</p><dl><dt>Domaine</dt><dd>${e(project.category)}</dd><dt>Statut</dt><dd>${e(statuses[project.status])}</dd>${project.role ? `<dt>Mon rôle</dt><dd>${e(project.role)}</dd>` : ''}</dl>${project.technologies.length ? `<h2 class="eyebrow">TECHNOLOGIES</h2><ul class="tags">${project.technologies.map(t=>`<li>${e(t)}</li>`).join('')}</ul>`:''}<a class="text-link" href="/?projet=${e(encodeURIComponent(project.title))}#contact">Échanger sur ce projet ${arrow}</a></aside><div class="case-prose"><section aria-labelledby="context-title"><p class="eyebrow">01 / CONTEXTE</p><h2 id="context-title">Le point de départ.</h2>${paragraph(project.context)}</section><section aria-labelledby="objective-title"><p class="eyebrow">02 / INTENTION</p><h2 id="objective-title">Ce que le projet vise.</h2>${paragraph(project.objective)}${project.features.length ? `<ul class="feature-list">${project.features.map(f=>`<li>${e(f)}</li>`).join('')}</ul>` : ''}</section>${project.approach ? `<section aria-labelledby="approach-title"><p class="eyebrow">03 / APPROCHE</p><h2 id="approach-title">La logique du produit.</h2>${paragraph(project.approach)}</section>` : ''}${project.result ? `<section aria-labelledby="result-title"><p class="eyebrow">RÉSULTATS</p><h2 id="result-title">Ce que j’en retiens.</h2>${paragraph(project.result)}</section>` : ''}${project.statusNote ? `<section class="case-status" aria-labelledby="status-title"><h2 id="status-title">Aujourd’hui</h2>${paragraph(project.statusNote)}</section>`:''}<div class="case-actions">${external(project.repository,'Voir le code')}${external(project.demo,'Ouvrir la démo')}</div></div></div>
  <section class="next-project wrap"><p class="eyebrow">${next ? 'POURSUIVRE LA DÉCOUVERTE' : 'UNE IDÉE EN TÊTE ?'}</p><h2>${next ? `<a href="/projets/${next.slug}/">${e(next.title)} ${arrow}</a>` : `<a href="/#contact">Parlons de votre projet ${arrow}</a>`}</h2></section>`;
  return page({site,title:`${project.title} — ${site.name}`,description:project.summary,path:`/projets/${project.slug}/`,body,noindex,structured:{'@context':'https://schema.org','@type':'WebPage',name:project.title,description:project.summary,url:`${site.url}/projets/${project.slug}/`,inLanguage:'fr',author:{'@type':'Person',name:site.name}}});
}

export function resumepage(site,noindex) {
  const body = `<section class="profile-intro wrap"><a class="breadcrumb" href="/">← Accueil</a>
    <div class="profile-grid">${site.portrait ? `<figure><img src="${e(site.portrait)}" alt="${e(site.portraitAlt)}" width="760" height="900" fetchpriority="high"><figcaption>${e(site.name)}</figcaption></figure>` : ''}
    <div><p class="kicker">Mon parcours</p><h1>La curiosité.<br>Et le <span class="spectrum">concret.</span></h1><p class="page-intro">Je suis ${e(site.name)}. La Data Science, le MLOps et le développement Full-Stack me donnent trois angles pour comprendre un besoin et construire une réponse utile.</p>
    <a class="blue-button" href="/assets/documents/CV_Ousmane_Coulibaly.pdf" download>Télécharger mon CV</a></div></div></section>
  <section class="resume-section wrap" aria-labelledby="training-title"><h2 id="training-title">Formation</h2><div class="timeline"><article><p class="eyebrow">2021 — 2024</p><h3>Licence en génie logiciel</h3><p>SUP MANAGEMENT</p></article><article><p class="eyebrow">2019 — 2021</p><h3>Baccalauréat économique</h3><p>Lycée Castors</p></article></div></section>
  <section class="resume-section wrap" aria-labelledby="experience-title"><h2 id="experience-title">Expérience</h2><div class="timeline"><article><p class="eyebrow">2023 / STAGE</p><h3>EDM-SA</h3><p>Participation à la conception de sites et d’applications internes, recueil des besoins auprès des utilisateurs, démonstrations et suivi des corrections.</p><p>Une expérience qui relie développement, échanges avec les équipes et qualité du service.</p></article></div></section>
  <section class="resume-section wrap" aria-labelledby="languages-title"><h2 id="languages-title">Langues &amp; approche</h2><div class="timeline"><article><h3>Échanger avec clarté</h3><p>Français et bamanakan courants. Anglais intermédiaire.</p></article><article><h3>Construire ensemble</h3><p>Écoute, organisation, autonomie et esprit d’équipe. Je m’intéresse autant au fonctionnement d’un produit qu’aux personnes qui l’utilisent.</p></article></div></section><section class="next-project wrap"><p class="eyebrow">UNE MISSION OU UNE OPPORTUNITÉ ?</p><h2><a href="/#contact">Faisons connaissance ${arrow}</a></h2></section>`;
  return page({site,title:`Parcours & CV — ${site.name}`,description:`Le parcours d’Ousmane Alou Coulibaly : génie logiciel, expérience à EDM-SA et approche Data Science, MLOps et Full-Stack.`,path:'/parcours/',body,noindex});
}

export function privacypage(site,noindex) {
  const body=`<section class="page-heading wrap"><a class="breadcrumb" href="/">← Accueil</a><p class="eyebrow">CONTACT / DONNÉES PERSONNELLES</p><h1>Un échange<br>en <span class="serif-word">confiance.</span></h1><p class="page-intro">Voici comment fonctionne le formulaire de ce portfolio.</p></section><div class="legal-prose wrap"><section><h2>Les informations envoyées</h2><p>Le formulaire transmet votre nom, votre adresse e-mail, le sujet choisi et votre message à ${e(site.name)}, afin de répondre à votre demande. N’y incluez pas de mot de passe ni d’information confidentielle inutile à l’échange.</p></section><section><h2>Le service de formulaire</h2><p>L’envoi est traité par Formspree. Ce prestataire intervient dans l’acheminement et le filtrage des messages et peut traiter des informations techniques associées à la requête. Ses conditions de traitement et de conservation sont décrites dans sa <a href="https://formspree.io/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">politique de confidentialité<span class="sr-only"> (nouvel onglet)</span></a>.</p></section><section><h2>Vos demandes concernant les données</h2><p>Pour poser une question sur un message envoyé, demander l’accès aux informations associées, leur rectification ou leur suppression, vous pouvez écrire à <a href="mailto:${e(site.email)}">${e(site.email)}</a>. Les modalités applicables dépendent de la demande et du traitement concerné.</p></section><section><h2>Navigation et administration</h2><p>Cette version du portfolio n’intègre aucun outil de publicité ou de mesure d’audience. Les polices et illustrations sont hébergées avec le site. L’hébergeur peut conserver des journaux techniques nécessaires au fonctionnement du service.</p><p>L’espace d’administration utilise une authentification GitHub réservée aux personnes disposant des droits d’écriture sur le dépôt. Cette connexion n’est pas nécessaire pour consulter le portfolio ou envoyer un message.</p></section><p class="legal-date">Informations mises à jour le 26 septembre 2026.</p></div>`;
  return page({site,title:`Données personnelles — ${site.name}`,description:'Informations sur le formulaire de contact, Formspree et les données transmises depuis le portfolio.',path:'/confidentialite/',body,noindex});
}

export function notfound(site) {
  return page({site,title:`Page introuvable — ${site.name}`,description:'Retrouvez les projets et le parcours d’Ousmane Coulibaly.',path:'/404.html',noindex:true,body:`<section class="not-found wrap"><p class="eyebrow">ERREUR 404</p><h1>Un détour<br>imprévu<span class="accent">.</span></h1><p>Cette page n’existe pas ou a changé d’adresse.</p><a class="button button-accent" href="/">Revenir au portfolio ${arrow}</a></section>`});
}
