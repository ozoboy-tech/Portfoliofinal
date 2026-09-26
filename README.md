# Portfolio — Ousmane Alou Coulibaly

Version 2 · 26 septembre 2026 · Français

Une refonte sombre, éditoriale et responsive, inspirée de l’agencement et du rythme de pamidordesign.co. Identité OC, palette sauge, polices locales, trois projets conservés, pages projets, parcours, contact et administration GitHub.

## Commencer sur votre ordinateur

1. Décompressez l’archive dans **un nouveau dossier**, séparé de votre ancienne version.
2. Ouvrez le dossier `Portfolio_Refonte` dans VS Code.
3. Avec Node.js 24 installé, ouvrez le terminal de ce dossier et lancez :

```sh
npm run dev
```

4. Ouvrez **http://127.0.0.1:4173/** dans votre navigateur. Ctrl+C arrête le serveur.

Aucune installation de dépendances n’est nécessaire pour le site ou le build. Ne double-cliquez pas sur `index.html` : les chemins du site partent de la racine du serveur. Relancez `npm run dev` après une modification de contenu ou de code ; ce petit serveur ne surveille pas les fichiers.

Le dossier **`dist/`** contient aussi le site déjà généré, prêt à être servi depuis la racine d’un hébergement statique. Les règles `_headers` et `_redirects` sont spécifiques à Netlify. Sur un autre hébergeur, leurs équivalents doivent être configurés.

## Déployer avec votre GitHub et Netlify

- Sauvegardez la version actuelle de votre dépôt avant de remplacer les fichiers du site par le contenu de ce dossier. Conservez votre historique Git. Ne recopiez pas l’ancien `node_modules/`, les anciennes pages publiques ou le CV original dans ce projet.
- Dans Netlify, conservez le dépôt GitHub lié et sa branche de production `main`.
- Commande de build : **`npm run build`**. Dossier publié : **`dist`**. Ces valeurs sont déjà dans `netlify.toml`.
- Le domaine configuré reste `https://ousmaneportfolio.netlify.app`. S’il change, modifiez `url` dans `content/site.json` puis reconstruisez.
- Pour activer l’administration, suivez **`docs/ADMINISTRATION.md`**. La partie publique ne dépend pas de cette activation.

Le simple téléversement de `dist/` affiche le portfolio, mais ne connecte pas à lui seul le CMS au dépôt. Le mode recommandé pour l’édition est le déploiement GitHub → Netlify.

## Où modifier quoi ?

| Besoin | Fichier ou dossier source |
|---|---|
| Coordonnées, domaine, portrait, identifiant Formspree | `content/site.json` |
| Ajouter, modifier, masquer, supprimer un projet | `/admin/` après activation, ou `content/projects/*.json` |
| Structure et textes de présentation | `src/templates.mjs` |
| Style et responsive | `assets/styles.css` |
| Menu, mouvement, préremplissage du contact | `assets/scripts.js` |
| Illustrations et identité | `assets/images/` |
| Images de projets ajoutées dans l’admin | `assets/uploads/` |
| CV public | `assets/documents/CV_Ousmane_Coulibaly.pdf` |
| Champs proposés dans l’administration | `src/cms.mjs` |
| Build, SEO, en-têtes et anciennes URL | `tools/build.mjs` |

Les fichiers de `dist/` sont générés : éditez les sources, puis lancez `npm run build`.

## Vérification et limites connues

```sh
npm test
npm run build
```

Les tests de contenu/sécurité, la génération, les références internes, le HTML et la syntaxe CSS ont été contrôlés. Le rapport détaille les résultats réels dans `docs/VERIFICATIONS.md`.

La recette visuelle, le clavier natif, les en-têtes servis par Netlify, la connexion GitHub et un envoi Formspree avec réception restent à effectuer dans votre navigateur. Aucun déploiement ni message réel n’a été envoyé pendant la préparation.

Le visuel d’accueil est une composition graphique originale : **ce n’est pas une photo d’Ousmane**. Il sera remplacé par un portrait préparé à partir d’une photo de référence à fournir. Les visuels projets sont des illustrations, identifiées comme telles. Le CV public a été reformulé à partir du CV fourni et du positionnement choisi ; ses données personnelles supplémentaires et les coordonnées des références ne sont pas publiées.

Guides : `docs/RECETTE.md`, `docs/SUIVI_AUDIT.md`, `docs/MAINTENANCE.md`.
