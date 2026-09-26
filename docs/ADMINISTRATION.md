# Activer et utiliser l’administration

L’espace `/admin/` utilise **Decap CMS 3.16.3**, servi localement, avec GitHub comme stockage et fournisseur d’identité. Chaque publication modifie un fichier JSON du dépôt et déclenche le build Netlify. Aucun mot de passe d’administration, jeton personnel GitHub ou secret OAuth ne doit être placé dans le JavaScript.

## 1. Déployer le projet depuis GitHub

Le dépôt doit contenir les **sources complètes**, avec `content/projects/`, `assets/`, `src/`, `admin/` et `tools/`. Publier uniquement `dist/` sur GitHub ne permet pas au build d’effectuer les modifications.

Netlify fournit `REPOSITORY_URL` lors du build : le dépôt est détecté automatiquement. Le nom de votre dépôt n’était pas présent dans l’archive, donc aucune valeur fictive n’a été inscrite dans le livrable.

Si la détection n’est pas disponible, définissez **CMS_REPOSITORY** dans les variables de build Netlify, au format `votre-compte/votre-depot`. C’est un identifiant public de dépôt, pas un secret. Lancez un nouveau déploiement. Vous pouvez aussi renseigner `cmsRepository` dans `content/site.json`.

La branche par défaut est `main`. Si votre branche de production porte un autre nom, changez `cmsBranch` dans `content/site.json` ou définissez `CMS_BRANCH` dans Netlify. Adaptez également la branche du workflow GitHub Actions.

## 2. Configurer OAuth une seule fois

1. Dans GitHub : **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Donnez un nom explicite, par exemple « Administration du portfolio Ousmane ».
3. Homepage URL : `https://ousmaneportfolio.netlify.app`.
4. Authorization callback URL : **`https://api.netlify.com/auth/done`**.
5. GitHub fournit un **Client ID** et permet de générer un **Client Secret**.
6. Dans le projet Netlify : **Project configuration → Security → OAuth → Authentication Providers → Install provider → GitHub**. Renseignez ces deux valeurs dans les champs du fournisseur.
7. Ouvrez `https://ousmaneportfolio.netlify.app/admin/` et connectez-vous avec le compte GitHub ayant les droits d’écriture sur le dépôt.

Gardez le secret dans les réglages OAuth Netlify. Ne l’envoyez pas dans une conversation, ne le commitez pas et ne l’ajoutez pas au fichier de configuration du CMS. Si vous changez de domaine, ajustez `content/site.json`, l’application OAuth et les réglages Netlify.

## 3. Gérer les projets

- **Ajouter** : collection « Projets » → nouveau projet ; remplissez le nom, résumé, catégorie, contexte, objectif et description du visuel.
- **Statut** : En développement, Prototype, Terminé, En production ou En pause.
- **Afficher** : activez « Visible sur le portfolio », puis publiez. Un nouveau projet est masqué par défaut.
- **Masquer** : désactivez « Visible », puis publiez. Le fichier reste dans GitHub, la page et la carte sont retirées du prochain build.
- **Supprimer** : utilisez la suppression de l’entrée. Son fichier est supprimé dans GitHub ; l’historique Git permet de retrouver une version antérieure.
- **Ordre** : le plus petit nombre apparaît en premier. En cas d’égalité, l’identifiant du fichier départage.
- **Images** : PNG, JPEG, WebP ou AVIF, 2 Mo maximum. Noms simples sans espace ni accent. Privilégiez WebP/AVIF et environ 1200 × 800 px ; gardez un nom différent si vous remplacez une image mise en cache. Les SVG importés sont refusés par le build.
- **Liens code/démo** : HTTPS, à laisser vides si rien n’est encore partageable.
- **Rôle, technologies et résultats** : facultatifs, à renseigner seulement avec des informations exactes. Le texte saisi reste du texte, sans HTML exécutable.

« Publier » lance une modification du dépôt, pas une mise à jour instantanée du serveur. Attendez que le nouveau déploiement Netlify soit réussi, puis rechargez le portfolio. Si le build refuse un champ ou une image, l’ancienne version en ligne reste active : consultez son message d’erreur et corrigez le contenu.

Masquer un projet n’en rend pas le fichier confidentiel dans un dépôt public. Le CMS n’est pas un espace de stockage privé.

## Fonctionnement local et prévisualisations

En local, sans dépôt configuré, `/admin/` affiche les instructions de configuration. Il n’y a pas de faux écran de connexion avec un mot de passe enregistré dans le navigateur.

Dans les contextes Netlify autres que `production`, la gestion des projets est désactivée et les pages portent `noindex`. Connectez-vous sur le domaine principal pour éditer. Ceci évite de modifier le contenu de production depuis une prévisualisation.

La collection est en publication directe. Si votre branche interdit les écritures directes, utilisez la modification par pull request dans GitHub ou adaptez le workflow éditorial avant d’activer le CMS ; n’affaiblissez pas une protection existante sans raison.

## Premier essai après activation

Créez « Projet de test » avec une illustration par défaut et « Visible » activé. Attendez le build, vérifiez carte/page/statut, puis masquez-le. Vérifiez sa disparition et supprimez l’entrée de test. Cette recette distante n’a pas été effectuée pendant la préparation du ZIP.

## Sources officielles consultées le 26 septembre 2026

- [Decap — backend GitHub](https://decapcms.org/docs/github-backend/)
- [Netlify — OAuth provider tokens](https://docs.netlify.com/manage/security/secure-access-to-sites/oauth-provider-tokens/)
- [Netlify — variables de build](https://docs.netlify.com/build/configure-builds/environment-variables/)
- [Decap — initialisation manuelle](https://decapcms.org/docs/manual-initialization/)
- [Decap — images](https://decapcms.org/docs/widgets/image/)
