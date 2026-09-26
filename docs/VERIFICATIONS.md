# Vérifications réellement effectuées

26 septembre 2026. Cette page distingue les contrôles exécutés des validations qui nécessitent votre navigateur ou vos comptes. Le détail machine se trouve dans `verification-automatique.json`.

| Contrôle | Résultat |
|---|---|
| Build Node.js 24.19.0 | Réussi ; 7 pages publiques dont la 404, plus l’administration |
| Suite Node incluse | **5 tests réussis, 0 échec** |
| Cycle des projets | Ajout, changement de statut, masquage et suppression testés dans une copie temporaire ; page, carte et sitemap régénérés |
| XSS et contenu | Rendu échappé d’un titre/contexte malveillant ; JSON-LD protégé contre `</script>` ; liens actifs et chemins non sûrs refusés |
| Médias importés | Refus d’un SVG actif et d’un faux PNG ; pas de fichiers exécutables publiés depuis les imports |
| Configuration admin | Dépôt GitHub explicite, branche main, état sans dépôt et désactivation en Deploy Preview vérifiés |
| Syntaxe JS/Node | 10 fichiers applicatifs/test vérifiés avec `node --check` |
| HTML | **8 documents valides** avec html-validate 11.16.0, règles recommandées adaptées aux éléments natifs |
| Références internes | **192 références** HTML/CSS/sitemap résolues ; IDs/ancres/labels/ARIA, ressources et dimensions des images contrôlés |
| CSS | Deux feuilles analysées sans erreur de syntaxe par PostCSS 8.5.28 |
| Simulation DOM | jsdom 30.1.1 : pause manuelle, préférence système initiale, contenu sans IntersectionObserver, formulaire non intercepté, préremplissage textuel, états admin non configuré/prévisualisation |
| HTTP local | **16 requêtes contrôlées** : pages, assets, PDF, robots et sitemap en 200 ; page inconnue en 404, MIME vérifiés |
| Métadonnées | Title, description, canonical, OG, JSON-LD cohérent et empreintes CSP contrôlés |
| Publication | Pas de `node_modules`, `.git`, contenu source ou configuration secrète dans `dist` |
| Intégrité des distributions | Empreintes des fichiers Decap et Fontsource identiques au manifeste d’import |
| Visuels et CV | Illustrations et image OG rendues et inspectées ; CV PDF d’une page rendu et inspecté |

Le vérificateur HTML conserve les contrôles structurels. Les règles de préférence stylistique `long-title` et `prefer-native-element` sont désactivées ; les éléments natifs dialog et landmarks sont utilisés dans le code. Ceci n’est pas une certification d’accessibilité.

## Contrastes calculés

| Usage | Couleurs | Rapport |
|---|---|---:|
| Texte principal | `#f2f0e9` / `#141615` | 15,94:1 |
| Texte secondaire | `#b2b7ad` / `#141615` | 8,89:1 |
| Accent | `#d4f58a` / `#141615` | 14,91:1 |
| Texte du bouton accent | `#151a10` / `#d4f58a` | 14,51:1 |
| Placeholder | `#a0a797` / `#141615` | 7,33:1 |
| Bordure de champ | `#89907f` / `#141615` | 5,50:1 |

Ce sont des calculs sur les couleurs du code. Les états rendus, superpositions et usages doivent encore être examinés dans le navigateur.

## Volumes locaux indicatifs

JavaScript public : 4 208 octets. CSS public : 23 479 octets. Illustrations projets : environ 1,1 à 1,3 Ko chacune. Deux polices WOFF2 : environ 47 Ko au total. Le décor vectoriel d’accueil pèse environ 95 Ko avant compression, environ 30 Ko en gzip indicatif. Le bundle d’administration est chargé uniquement sur `/admin/`.

Ces volumes ne sont ni une mesure du temps de chargement mobile ni un score Lighthouse. Le serveur et les conditions réseau peuvent changer la compression et les performances observées.

## Non exécuté ici

- Rendu du site dans un navigateur réel, responsive et zoom, parcours tactile, lecteur d’écran, focus natif du dialogue et raccourci Échap. L’environnement de préparation n’a pas permis un aperçu navigateur local ; la simulation DOM ne le remplace pas.
- Connexion OAuth à votre compte et opérations réelles du CMS sur votre GitHub.
- Envoi et réception d’un message Formspree ; aucune soumission réelle effectuée.
- Déploiement, en-têtes effectifs Netlify, conformité CSP en fonctionnement, indexation et aperçus des réseaux sociaux.
- Lighthouse, axe, mesures Web Vitals, scan exhaustif du dépôt distant ou des dépendances internes au bundle Decap.

Les étapes de validation sont dans `RECETTE.md`. Les tests automatiques inclus se relancent avec `npm test` et `npm run build`. Le fichier JSON précise les versions des outils complémentaires utilisés pour cette livraison.
