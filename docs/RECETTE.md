# Recette progressive de la refonte

Faites les contrôles dans cet ordre. Notez « OK » ou le comportement observé. On corrige le point en échec avant de poursuivre. Les validations de l’ancienne version ne remplacent pas cette recette.

1. **Démarrage local** — `npm run dev`, puis http://127.0.0.1:4173/. Le nom, le décor, les trois cartes et le contact apparaissent ; aucune erreur JavaScript applicative dans la console.
2. **Responsive** — largeurs 1440, 1024, 768, 390 et 320 px. Aucun défilement horizontal, chevauchement ou champ coupé ; zoom texte à 200 %. Vérifier aussi un téléphone réel.
3. **Navigation** — ancres Projets, Profil, Expertises, Contact ; trois pages de projets ; Parcours ; Confidentialité ; téléchargement du CV et retour en haut.
4. **Clavier** — Tab révèle « Aller au contenu ». Focus visible. Sur mobile, Menu ouvre le dialogue, Tab reste dedans, Échap et Fermer le referment, le focus revient au déclencheur. Activer un lien du menu amène à la bonne section.
5. **Mouvement** — le bouton du pied de page suspend les animations. L’option système « réduire les animations » les désactive, y compris si elle est changée sans recharger. Le contenu reste visible. Un onglet masqué met le décor en pause.
6. **Sans JavaScript** — désactiver JavaScript et recharger : présentation, projets, navigation, CV et formulaire restent utilisables. Seule l’administration nécessite JavaScript.
7. **Contact, sans envoi** — champs requis et e-mail invalide bloquent l’envoi ; message de moins de 10 caractères refusé. Le lien « Échanger sur ce projet » préremplit le message. Modifier ce texte reste possible.
8. **Contact réel** — après accord pour envoyer un message de test, vérifier confirmation Formspree ET réception dans la boîte configurée dans le tableau de bord Formspree. L’adresse publique est `ozoboy100@gmail.com` ; elle ne modifie pas automatiquement le destinataire historique du formulaire `xvggoglp`. Vérifier ce réglage avant mise en production.
9. **Netlify** — sur le déploiement de test, vérifier `/robots.txt`, `/sitemap.xml`, les URLs et les redirections anciennes. Les prévisualisations doivent être `noindex`, le domaine principal indexable.
10. **En-têtes et SEO** — inspecter les réponses réelles et les éventuelles violations CSP. Vérifier les images de partage, JSON-LD et canonical. Contrôler `X-Content-Type-Options`, CSP, HSTS, Referrer-Policy et X-Frame-Options. Tester Lighthouse/axe et le rendu lecteur d’écran ; aucun score de ces outils n’est annoncé dans ce livrable.
11. **Administration** — activer GitHub/Netlify selon le guide, puis tester connexion, ajout, statut, masquage et suppression. Contrôler qu’un compte sans droits ne peut pas publier. Se déconnecter après le test.
12. **Contenu** — relire le CV public et les descriptions ; confirmer les statuts réels. Fournir une photo de référence pour remplacer la composition graphique d’accueil. Compléter les résultats, stacks, liens et captures seulement lorsqu’ils sont disponibles.

Le serveur local sert les fichiers mais n’émule pas les en-têtes ni l’authentification Netlify. Les vérifications 8 à 11 nécessitent l’environnement réel et ne peuvent pas être déduites de la réussite du build.
