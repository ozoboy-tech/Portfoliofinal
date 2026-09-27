import { escapeHTML as e, jsonForHTML, statuses } from './schema.mjs';

const arrow = '<span aria-hidden="true">↗</span>';
const paragraph = value => String(value || '').split(/\n\s*\n/).filter(Boolean).map(part => `<p>${e(part)}</p>`).join('');
const link = (href, text, className = '') => `<a class="${className}" href="${e(href)}">${text}</a>`;
const external = (href, label) => href ? `<a class="button button-outline" href="${e(href)}" target="_blank" rel="noopener noreferrer">${e(label)} ${arrow}<span class="sr-only"> (nouvel onglet)</span></a>` : '';

function header(home) {
  const prefix = home ? '' : '/';
  const items = `<a href="${prefix}#projets">Projets</a><a href="${prefix}#profil">Profil</a><a href="${prefix}#expertises">Expertises</a>`;
  return `<a class="skip-link" href="#contenu">Aller au contenu</a>
  <header class="site-header wrap" id="haut">
    <a class="brand" href="/" aria-label="Ousmane Coulibaly — Accueil"><img src="/assets/images/monogram.svg" width="44" height="44" alt=""><span>OUSMANE<br>COULIBALY<span class="brand-dot">.</span></span></a>
    <nav class="header-nav" aria-label="Navigation principale">${items}</nav>
    <a class="header-contact" href="${prefix}#contact">Échangeons ${arrow}</a>
    <button class="menu-open" type="button" aria-haspopup="dialog" aria-controls="menu-dialog" hidden><span>Menu</span><span class="menu-lines" aria-hidden="true"></span></button>
  </header>
  <dialog class="menu-dialog" id="menu-dialog" aria-labelledby="menu-title">
    <div class="menu-top"><p id="menu-title" class="eyebrow">Explorer le portfolio</p><button type="button" class="menu-close" autofocus>Fermer <span aria-hidden="true">×</span></button></div>
    <nav aria-label="Navigation mobile">${items}<a href="${prefix}#contact">Contact</a><a href="/parcours/">Mon parcours</a></nav>
    <p class="menu-signature">Données. Code. Usages.</p>
  </dialog>`;
}

function footer(site) {
  return `<footer class="site-footer wrap">
    <div class="footer-top"><p>De la curiosité.<br>Du code. Du concret.</p><a class="back-top" href="#haut">Retour en haut <span aria-hidden="true">↑</span></a></div>
    <p class="footer-name" aria-hidden="true">Ousmane<span>.</span></p>
    <div class="footer-bottom"><small>© ${new Date().getFullYear()} ${e(site.name)}</small><nav aria-label="Liens utiles"><a href="/parcours/">Parcours &amp; CV</a><a href="/confidentialite/">Confidentialité</a><a href="/admin/">Administration</a></nav><button class="motion-toggle" type="button" aria-pressed="false" hidden>Réduire les animations</button></div>
  </footer>`;
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
  <meta name="theme-color" content="#64242F">
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
  ${home ? '<script src="/assets/intro-init.js?v=20260927-3"></script>' : ''}
  <link rel="stylesheet" href="/assets/styles.css?v=20260927-3">
  <script type="application/ld+json">${jsonForHTML(data)}</script>
  <script src="/assets/scripts.js?v=20260927-3" defer></script>
</head>
<body>${home ? intro() : ''}${header(home)}<main id="contenu" tabindex="-1">${body}</main>${footer(site)}</body>
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

function contact(site) {
  return `<section class="contact-section wrap" id="contact" aria-labelledby="contact-title">
    <div class="section-heading"><p class="eyebrow">04 / PRENONS CONTACT</p><p class="section-side-note">Une mission, un recrutement<br>ou une idée à explorer.</p></div>
    <h2 id="contact-title" class="contact-title">Parlons de<br>la <span>suite.</span> ${arrow}</h2>
    <div class="contact-grid"><div class="contact-details"><p>Les projets commencent<br>par une conversation.</p><a class="email-link" href="mailto:${e(site.email)}">${e(site.email)}</a><a class="phone-link" href="tel:${e(site.phone)}">${e(site.phoneLabel).replaceAll(" ", "&nbsp;")}</a><p class="contact-caption">Vous préférez écrire directement ?<br>Ma boîte mail est ouverte.</p></div>
      <form id="contact-form" action="https://formspree.io/f/${e(site.formspreeId)}" method="POST" aria-describedby="contact-privacy">
        <div class="form-row"><div class="form-field"><label for="name">Votre nom <span aria-hidden="true">*</span></label><input type="text" id="name" name="name" autocomplete="name" maxlength="100" required placeholder="Comment vous appelez-vous ?"></div><div class="form-field"><label for="email">Votre e-mail <span aria-hidden="true">*</span></label><input id="email" name="email" type="email" autocomplete="email" maxlength="254" required placeholder="vous@exemple.com"></div></div>
        <div class="form-field"><label for="subject">Vous me contactez pour</label><select id="subject" name="subject"><option value="Un projet ou une mission">Un projet ou une mission</option><option value="Une opportunité professionnelle">Une opportunité professionnelle</option><option value="Échanger sur un projet du portfolio">Échanger sur un projet du portfolio</option><option value="Autre demande">Autre demande</option></select></div>
        <div class="form-field"><label for="message">Votre message <span aria-hidden="true">*</span></label><textarea id="message" name="message" rows="4" minlength="10" maxlength="5000" required aria-describedby="message-help" placeholder="Quelques mots sur votre besoin, votre équipe ou votre idée…"></textarea><p id="message-help" class="field-help">10 caractères minimum. Les champs marqués * sont obligatoires.</p></div>
        <div hidden><label for="website">Laissez ce champ vide</label><input type="text" id="website" name="_gotcha" tabindex="-1" autocomplete="off"></div>
        <div class="form-bottom"><p id="contact-privacy">Vos informations servent à répondre à votre demande, via Formspree. <a href="/confidentialite/">Données personnelles</a>. Une confirmation s’affiche après l’envoi.</p><button class="button button-accent" type="submit">Envoyer le message ${arrow}</button></div>
      </form>
    </div>
  </section>`;
}

export function homepage(site, projects, noindex) {
  const portrait = site.portrait ? `<img class="portrait" src="${e(site.portrait)}" width="800" height="1000" fetchpriority="high" alt="${e(site.portraitAlt)}">` : `<img class="signal-art" src="/assets/images/signal.svg" width="800" height="1000" fetchpriority="high" alt="">`;
  const body = `<section class="hero wrap" aria-labelledby="hero-title">
    <div class="hero-topline"><p class="eyebrow">DATA SCIENCE / MLOPS / FULL-STACK</p><p class="eyebrow hero-location">BAMAKO, MALI <span class="live-dot" aria-hidden="true"></span></p></div>
    <div class="hero-grid"><div class="hero-copy"><h1 id="hero-title">Ousmane<br>Coulibaly<span class="accent">.</span></h1><p class="hero-role">Data Scientist &amp; développeur Full-Stack<br><span>avec une approche MLOps.</span></p><p class="hero-description">Comprendre la donnée.<br>Construire des produits utiles.</p><div class="hero-actions"><a class="button button-accent" href="#projets">Explorer mes projets ${arrow}</a><a class="text-link" href="/parcours/">Mon parcours <span aria-hidden="true">↗</span></a></div></div>
      <figure class="hero-art">${portrait}<span class="art-corner" aria-hidden="true">OC / 01</span><figcaption><span>ANALYSER</span><span>CONSTRUIRE</span><span>DÉPLOYER</span></figcaption></figure>
    </div><div class="hero-bottom"><p>À la croisée de la donnée,<br>du logiciel et des usages.</p><a href="#projets" class="scroll-link">Découvrir <span aria-hidden="true">↓</span></a><p class="hero-number" aria-hidden="true">PORTFOLIO / 2026</p></div>
  </section>
  <div class="discipline-band" aria-hidden="true"><span>DATA</span><i>✳</i><span>CODE</span><i>✳</i><span>IMPACT</span><i>✳</i><span>DATA</span><i>✳</i></div>
  <section class="projects-section wrap section-space" id="projets" aria-labelledby="projects-title"><div class="section-heading"><p class="eyebrow">01 / PROJETS CHOISIS</p><p class="section-side-note">Des idées ancrées<br>dans des besoins concrets.</p></div><div class="section-title-row"><h2 id="projects-title">Du besoin<br>au <span class="serif-word">produit.</span></h2><p>${projects.length ? `${String(projects.length).padStart(2,'0')} projets à découvrir` : 'De nouveaux projets à venir'}</p></div><div class="project-grid">${projects.map(projectCard).join('')}</div></section>
  <section class="about-section wrap section-space" id="profil" aria-labelledby="about-title"><div class="section-heading"><p class="eyebrow">02 / UNE APPROCHE TRANSVERSALE</p><a class="text-link" href="/parcours/">Parcours &amp; CV ${arrow}</a></div><div class="about-grid"><div class="about-mark" aria-hidden="true"><img src="/assets/images/monogram.svg" width="220" height="220" alt=""><span>CURIEUX PAR NATURE.<br>CONCRET PAR CHOIX.</span></div><div><h2 id="about-title">Faire le lien entre<br>la donnée et <span class="serif-word">le terrain.</span></h2><p class="about-lead">Je suis Ousmane Alou Coulibaly. J’associe le développement logiciel à la Data Science et au MLOps pour donner une forme utile aux idées.</p><p>Mon parcours en génie logiciel m’a appris à relier les besoins des utilisateurs aux choix techniques. Du premier échange à l’application, j’accorde de l’importance à la clarté, à la fiabilité et à ce que le produit apporte réellement.</p><p>Pour une équipe qui recrute comme pour un client qui porte un projet, mon point de départ reste le même : comprendre le problème avant de construire la solution.</p><div class="about-links"><a class="text-link" href="/assets/documents/CV_Ousmane_Coulibaly.pdf" download>Télécharger mon CV ${arrow}</a><a class="text-link" href="#contact">Faire connaissance ${arrow}</a></div></div></div></section>
  <section class="expertise-section wrap section-space" id="expertises" aria-labelledby="expertise-title"><div class="section-heading"><p class="eyebrow">03 / DOMAINES D’INTERVENTION</p><p class="section-side-note">Un regard sur la technique.<br>Un autre sur l’usage.</p></div><h2 id="expertise-title">La donnée rencontre<br>le <span class="serif-word">développement.</span></h2><div class="expertise-list">
    <article class="expertise"><span class="expertise-number">01</span><h3>Data Science</h3><div><p>Explorer les données, faire émerger des questions utiles et évaluer les modèles avec méthode.</p><ul class="tags"><li>Python</li><li>Analyse</li><li>Machine learning</li></ul></div><span class="expertise-symbol" aria-hidden="true">✳</span></article>
    <article class="expertise"><span class="expertise-number">02</span><h3>Ingénierie MLOps</h3><div><p>Relier l’expérimentation à des services reproductibles, avec une attention portée aux tests et au déploiement.</p><ul class="tags"><li>Git</li><li>API</li><li>Tests &amp; pipelines</li></ul></div><span class="expertise-symbol" aria-hidden="true">↗</span></article>
    <article class="expertise"><span class="expertise-number">03</span><h3>Full-Stack</h3><div><p>Concevoir des interfaces et les relier à la logique métier, aux données et aux besoins des utilisateurs.</p><ul class="tags"><li>JavaScript · React</li><li>PHP · MySQL</li><li>HTML · CSS</li></ul></div><span class="expertise-symbol" aria-hidden="true">⌘</span></article>
  </div></section>${contact(site)}`;
  return page({site,title:`${site.name} — Data Science, MLOps & Full-Stack`,body,home:true,noindex});
}

export function projectpage(site, project, next, noindex) {
  const body = `<section class="case-hero wrap"><a class="breadcrumb" href="/#projets">← Tous les projets</a><div class="section-heading"><p class="eyebrow">${e(project.category)}</p><span class="status status-${project.status}">${e(statuses[project.status])}</span></div><h1>${e(project.title)}<span class="accent">.</span></h1><p class="case-summary">${e(project.summary)}</p><figure class="case-cover theme-${e(project.theme)}"><img src="${e(project.image || '/assets/images/project-default.svg')}" width="1200" height="800" fetchpriority="high" alt="${e(project.imageAlt || 'Composition graphique évoquant un projet numérique')}">${project.imageCaption ? `<figcaption>${e(project.imageCaption)}</figcaption>` : ''}</figure></section>
  <div class="case-content wrap"><aside class="case-aside"><p class="eyebrow">LE PROJET EN BREF</p><dl><dt>Domaine</dt><dd>${e(project.category)}</dd><dt>Statut</dt><dd>${e(statuses[project.status])}</dd>${project.role ? `<dt>Mon rôle</dt><dd>${e(project.role)}</dd>` : ''}</dl>${project.technologies.length ? `<h2 class="eyebrow">TECHNOLOGIES</h2><ul class="tags">${project.technologies.map(t=>`<li>${e(t)}</li>`).join('')}</ul>`:''}<a class="text-link" href="/?projet=${e(encodeURIComponent(project.title))}#contact">Échanger sur ce projet ${arrow}</a></aside><div class="case-prose"><section aria-labelledby="context-title"><p class="eyebrow">01 / CONTEXTE</p><h2 id="context-title">Le point de départ.</h2>${paragraph(project.context)}</section><section aria-labelledby="objective-title"><p class="eyebrow">02 / INTENTION</p><h2 id="objective-title">Ce que le projet vise.</h2>${paragraph(project.objective)}${project.features.length ? `<ul class="feature-list">${project.features.map(f=>`<li>${e(f)}</li>`).join('')}</ul>` : ''}</section>${project.approach ? `<section aria-labelledby="approach-title"><p class="eyebrow">03 / APPROCHE</p><h2 id="approach-title">La logique du produit.</h2>${paragraph(project.approach)}</section>` : ''}${project.result ? `<section aria-labelledby="result-title"><p class="eyebrow">RÉSULTATS</p><h2 id="result-title">Ce que j’en retiens.</h2>${paragraph(project.result)}</section>` : ''}${project.statusNote ? `<section class="case-status" aria-labelledby="status-title"><h2 id="status-title">Aujourd’hui</h2>${paragraph(project.statusNote)}</section>`:''}<div class="case-actions">${external(project.repository,'Voir le code')}${external(project.demo,'Ouvrir la démo')}</div></div></div>
  <section class="next-project wrap"><p class="eyebrow">${next ? 'POURSUIVRE LA DÉCOUVERTE' : 'UNE IDÉE EN TÊTE ?'}</p><h2>${next ? `<a href="/projets/${next.slug}/">${e(next.title)} ${arrow}</a>` : `<a href="/#contact">Parlons de votre projet ${arrow}</a>`}</h2></section>`;
  return page({site,title:`${project.title} — ${site.name}`,description:project.summary,path:`/projets/${project.slug}/`,body,noindex,structured:{'@context':'https://schema.org','@type':'WebPage',name:project.title,description:project.summary,url:`${site.url}/projets/${project.slug}/`,inLanguage:'fr',author:{'@type':'Person',name:site.name}}});
}

export function resumepage(site,noindex) {
  const body = `<section class="page-heading wrap"><a class="breadcrumb" href="/">← Accueil</a><p class="eyebrow">PROFIL / PARCOURS</p><h1>La curiosité.<br>Et le <span class="serif-word">concret.</span></h1><p class="page-intro">Data Science, MLOps et développement Full-Stack : trois angles pour comprendre un besoin et construire une réponse utile.</p><a class="button button-accent" href="/assets/documents/CV_Ousmane_Coulibaly.pdf" download>Télécharger mon CV ${arrow}</a></section>
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
