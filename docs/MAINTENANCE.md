# Maintenance, architecture et choix

## Stack

Le site public est constitué de HTML généré, CSS et JavaScript natif. Il n’a pas de framework à télécharger pour afficher le contenu. Le générateur Node utilise uniquement la bibliothèque standard. Un fichier JSON par projet facilite l’édition et l’historique Git. Le rendu statique permet de lire chaque page et ses métadonnées sans exécuter JavaScript.

Les composants de page sont regroupés dans `src/templates.mjs`, les validations dans `src/schema.mjs`, le schéma du CMS dans `src/cms.mjs`. Pas de Tailwind ou de React ajouté au site public : le CSS natif suffit ici. Decap embarque ses propres dépendances dans `/admin/vendor/` uniquement.

## Visuel et contenu

Le travail reprend de la référence la grande typographie, l’asymétrie, les espacements et le contact mis en avant. Les couleurs, le logo OC et les illustrations sont originaux. Aucun portrait, logo ou texte de Pamidor n’a été réutilisé.

La composition d’accueil peut être remplacée en plaçant un portrait raster dans `assets/images/` et en renseignant `portrait` et `portraitAlt` dans `content/site.json`. Un fichier WebP vertical d’environ 800 × 1000 px est adapté. La création d’un portrait ressemblant à Ousmane attend une photo de référence.

Les anciens effets étoiles/loader et la modale de contact sont remplacés dans la refonte. Le formulaire est visible directement dans la page. Un dialogue natif assure le menu mobile. Les préférences système de mouvement sont prises en compte, avec un bouton de pause. Rien n’est caché en attendant une animation.

Le CV public est une nouvelle mise en page synthétique. Il n’inclut pas la date de naissance, l’adresse personnelle, les autres coordonnées ni les références privées présentes dans le document d’origine. Il ne prétend pas ajouter un diplôme de master non confirmé dans ce document. Le positionnement Data Science/MLOps/Full-Stack provient du choix exprimé pour ce portfolio.

## Sécurité

- Aucun SMTPJS, `Email.send`, mot de passe SMTP ou secret de serveur dans le code public.
- Contact natif vers l’identifiant Formspree déjà présent. Contraintes de saisie et honeypot côté navigateur ; le filtrage et les contrôles effectifs du service doivent être réglés chez Formspree. Une fonction serveur avec validation, quotas et anti-spam reste une évolution distincte.
- Contenus projets échappés ; pas de HTML libre ni de liens `javascript:` ; images importées limitées aux formats raster avec contrôle de signature et de taille au build.
- Administration par OAuth GitHub, autorisations d’écriture gérées par GitHub. Le Client Secret appartient aux paramètres OAuth Netlify.
- CSP **bloquante** générée pour les pages publiques : scripts locaux et empreintes JSON-LD, sans `unsafe-inline` ni `unsafe-eval`. Aucun CDN de script ou de police sur le parcours public.
- CSP différente sur `/admin/` : `unsafe-eval` pour la compilation de schéma de Decap/Ajv et styles inline nécessaires au CMS. Ces exceptions ne s’appliquent pas au portfolio. Ne recopiez pas cette politique sur les pages publiques.
- Publication limitée à `dist/`. Pas de `.git`, sources de contenu, variables d’environnement ni `node_modules/` publiés. Ne pas activer un fallback SPA qui renverrait l’accueil pour chaque URL inconnue.

Un dépôt et une session GitHub compromis restent des risques de gestion de compte : le build n’a pas vocation à isoler du code modifié par une personne disposant de droits d’écriture sur les sources.

## Dépendances et licences

- Decap CMS **3.16.3** : distribution npm locale, bundle et fragments nécessaires. Les cartes et pages publiques ne le chargent pas.
- Manrope variable **5.3.0**, Space Grotesk variable **5.3.0** via Fontsource : fichiers WOFF2 locaux, licences OFL fournies.
- `licenses/vendor-manifest.json` conserve provenance, versions et empreintes SHA-256. Les notices intégrées de Decap restent avec son bundle ; sa licence principale est également fournie.
- GitHub Actions utilise des commits épinglés ; Dependabot propose des mises à jour des actions. Les outils de validation temporaires utilisés pour la livraison ne sont pas nécessaires pour lancer le site.

Les distributions copiées ne sont pas des dépendances npm de ce projet : **un `npm audit` du package vide ne les analyse pas**. Pour les mettre à jour, examiner les notes officielles et avis de sécurité, remplacer le bundle complet avec ses fragments/notices, actualiser le manifeste puis tester toute l’administration sur un environnement prévu à cet effet. Ne pas simplement changer le nom de la version. Aucun résultat de scan complet des dépendances internes au bundle n’est revendiqué.

## Confidentialité et référencement

La page de confidentialité explique les traitements connus. Il reste à préciser la conservation réelle des demandes et les paramètres du compte Formspree avant de considérer la politique complète. Aucun outil d’audience, publicité ou télémétrie applicative n’a été activé.

Le sitemap liste les pages publiques effectivement générées. Une entrée masquée ne crée pas de page. Les pages projets supprimées répondent ensuite 404, hors redirection historique explicitement ajoutée. La page 404 et l’admin sont `noindex`. Les déploiements de prévisualisation sont aussi `noindex`.

Le changement de domaine nécessite de modifier le paramètre central puis le CV PDF, les textes intégrés au visuel de partage et les réglages OAuth. Ne pas annoncer un nouveau domaine tant qu’il n’est pas configuré.
