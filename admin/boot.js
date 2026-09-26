'use strict';
window.CMS_MANUAL_INIT = true;
(async () => {
  const splash = document.getElementById('admin-start');
  const status = document.getElementById('admin-status');
  const help = document.getElementById('admin-help');
  try {
    const response = await fetch('/admin/cms-config.json', {cache:'no-store'});
    if (!response.ok) throw new Error('Configuration indisponible');
    const settings = await response.json();
    if (!settings.enabled) {
      status.textContent = settings.reason === 'preview' ? 'La gestion des projets est accessible sur le site principal.' : 'L’administration est prête à être reliée à votre dépôt GitHub.';
      help.hidden = false;
      help.textContent = settings.reason === 'preview' ? 'Cette prévisualisation permet de consulter le site. Pour modifier son contenu, ouvrez /admin/ sur le domaine principal.' : 'Suivez le guide docs/ADMINISTRATION.md fourni avec le projet. Une connexion GitHub autorisée sera ensuite nécessaire pour publier des modifications.';
      return;
    }
    await new Promise((resolve,reject) => {
      const script = document.createElement('script');
      script.src = '/admin/vendor/decap-cms.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Chargement du module impossible'));
      document.head.append(script);
    });
    if (!window.CMS || typeof window.CMS.init !== 'function') throw new Error('Module indisponible');
    window.CMS.init({config:settings.config});
    splash.hidden = true;
  } catch {
    splash.hidden = false;
    status.textContent = 'L’administration n’a pas pu se charger.';
    help.hidden = false;
    help.textContent = 'Vérifiez votre connexion puis rechargez la page. Si le problème persiste, consultez le guide d’administration et les journaux du dernier déploiement.';
  }
})();
