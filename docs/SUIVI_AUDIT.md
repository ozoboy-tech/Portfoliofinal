# Suivi de la liste exhaustive de l’audit

Audit de référence : 25 septembre 2026. Refonte : 26 septembre 2026.

Les 25 points sont conservés dans leur ordre initial. « Implémenté » décrit le code livré, pas une certification ni une validation en production. Les étapes déjà validées dans l’ancienne version doivent être retestées après la refonte.

| Nº | Priorité | Point initial | État et suite |
|---:|:---:|---|---|
| 01 | P0 | Supprimer SMTPJS et le SMTP client | **Implémenté.** Aucun SMTP client ; Formspree natif conservé. Contrôler destinataire, envoi et réception. Fonction serveur robuste future. |
| 02 | P0 | Corriger le crash du loader | **Implémenté.** Aucun loader ni import orphelin dans la nouvelle architecture. Console navigateur à vérifier. |
| 03 | P0 | Corriger le système d’étoiles | **Remplacé par la refonte.** Les particules sont retirées ; décor SVG et animations CSS, aucun intervalle ni croissance du DOM. Les tests de 60 étoiles de l’ancienne version ne s’appliquent plus. |
| 04 | P0 | Compresser PharmaGuard | **Implémenté autrement.** Ancienne grande image remplacée par une illustration SVG légère et locale. Pas de capture produit inventée. |
| 05 | P0 | Modale clavier, ARIA et focus | **Adapté.** Contact directement dans la page ; menu mobile en dialogue natif. Focus de fermeture et destination d’ancre prévus ; Tab/Échap/lecteur d’écran à tester dans un navigateur. |
| 06 | P1 | Reduced motion et focus visible | **Implémenté.** Styles système, changement à chaud, bouton de pause, onglet masqué et contours de focus. Logique DOM contrôlée ; rendu à tester. |
| 07 | P1 | Contraste violet/noir | **Remplacé par la nouvelle palette.** Fond sombre, texte ivoire, accent sauge ; ratios principaux calculés dans le rapport. Vérifier tous les états rendus. |
| 08 | P1 | HTML et liens morts | **Vérifié localement.** Huit documents HTML valides dans l’outil utilisé, 192 références internes vérifiées. Vérifications HTTP locales et liens externes décrits séparément. |
| 09 | P1 | Title, description, canonical et OG | **Implémenté.** Métadonnées propres aux pages, visuel de partage local 1200 × 630. Vérifier l’aperçu social après publication. |
| 10 | P1 | Pages d’études de cas | **Partiel.** Trois pages avec contexte, objectif, fonctionnalités, approche et statut. Champs prêts pour rôle, stack, résultats, démo et code ; preuves non fournies à compléter sans inventer. |
| 11 | P1 | Robots et sitemap | **Implémenté.** Sitemap généré selon les projets visibles ; admin/404 exclus, prévisualisations non indexables. Réponses Netlify et Search Console à contrôler. |
| 12 | P1 | JSON-LD Person/ProfilePage | **Implémenté.** ProfilePage/Person sur accueil et parcours, WebPage ailleurs ; JSON et empreintes CSP vérifiés. Outil de résultats enrichis à vérifier après publication. |
| 13 | P1 | Confidentialité et mention formulaire | **Partiel.** Notice et page dédiées, uniquement coordonnées autorisées. Compléter durées réelles, modalités de conservation et configuration du fournisseur. |
| 14 | P1 | Netlify et en-têtes versionnés | **Préparé.** Build `dist`, CSP bloquantes séparées public/admin, en-têtes de base et redirections. En-têtes réellement servis et OAuth à tester sur Netlify. |
| 15 | P1 | Retirer scripts/CDN tiers inutiles | **Implémenté.** Polices, JS, logo et visuels locaux ; Decap uniquement sous `/admin/`. Formspree reste le service d’envoi. |
| 16 | P1 | GitHub Actions et Dependabot | **Partiel.** Workflow tests/build, actions épinglées et mises à jour d’actions fournis. Exécution distante, scan complet des dépendances vendoriées/secrets, axe/E2E/Lighthouse restent à effectuer/intégrer. |
| 17 | P1 | Ne plus publier node_modules | **Vérifié pour le nouveau build.** Aucun `node_modules/` ou `.git/` dans `dist`. Nettoyage éventuel des fichiers déjà suivis dans l’ancien dépôt à faire lors de l’intégration. |
| 18 | P2 | CDN d’images et srcset sur tous médias | **Partiel/adapté.** Illustrations vectorielles légères, dimensions et chargement différé des cartes. Pas de CDN ni transformation automatique des futures images raster. |
| 19 | P2 | Analytics respectueux de la vie privée | **À faire si retenu.** Aucun service activé ; définir les événements utiles sans données de formulaire. |
| 20 | P2 | Monitoring des erreurs JS | **À faire.** Aucun compte/collecteur configuré ; définir filtrage et suppression des données sensibles. |
| 21 | P2 | Design tokens et composants | **Implémenté.** Palette/espacement/polices centralisés, composants de rendu, schéma de données et CMS séparés. Recette visuelle finale à faire. |
| 22 | P2 | Domaine et e-mail professionnel | **À faire si retenu.** Domaine Netlify et Gmail demandés conservés. Achat, DNS et fournisseur restent une décision distincte. |
| 23 | P3 | Migration Astro/TypeScript | **Choix adapté à cette version.** Générateur Node simple, HTML/CSS/JS natif ; pas de migration Astro/TypeScript présentée comme réalisée. Réévaluer si la complexité augmente. |
| 24 | P3 | Français/anglais avec hreflang | **Différé à ta demande.** Version française uniquement ; aucun `hreflang` annonçant une traduction inexistante. |
| 25 | P3 | Fonctions différenciantes 2027 | **À planifier.** Pistes conservées ci-dessous, hors périmètre de cette première refonte. |

## Pistes 2027 conservées

1. Études de cas enrichies par de vraies preuves et captures.
2. Version anglaise.
3. Parcours recruteur « 60 secondes » et filtres de disciplines.
4. Palette de commandes accessible ou mini CLI.
5. Explorateur d’architecture et décisions techniques.
6. Mini-démos interactives Planora/Afribus.
7. Assistant IA fondé sur le contenu public, avec appels serveur et quotas.
8. Tableau public de qualité alimenté par les vrais résultats de CI.
9. Constellation des compétences accessible et respectueuse du mouvement réduit.
10. Changelog et progression publique.

Un espace recruteur privé reste une option distincte de l’administration des projets.

## Éléments demandés en plus de l’audit

Administration d’ajout/suppression/statut : code livré, activation OAuth et test réel en attente. Illustration d’accueil : composition originale livrée, portrait ressemblant en attente d’une photo de référence. CV : version publique reformulée et vérifiée visuellement, à relire pour confirmer les informations. Trois projets : contenus conservés et structurés, statut initial « En développement » à confirmer selon leur état actuel.

## Objectifs, pas scores obtenus

LCP p75 ≤ 2,5 s ; INP p75 ≤ 200 ms ; CLS p75 ≤ 0,1. Lighthouse mobile performance ≥ 95, accessibilité visée 100, SEO ≥ 95 ; aucune erreur axe serious/critical ni erreur console nominale. Ces objectifs ne sont pas des résultats de mesure. Les mesures terrain, le réseau mobile, les réponses fournisseur et l’administration réelle nécessitent l’hébergement et un navigateur.
