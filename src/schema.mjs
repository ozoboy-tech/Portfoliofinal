import assert from 'node:assert/strict';

export const statuses = Object.freeze({
  development: 'En développement', prototype: 'Prototype',
  completed: 'Terminé', production: 'En production', paused: 'En pause'
});
export const themes = ['sage', 'lilac', 'clay', 'ink'];

export function escapeHTML(value = '') {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}
export function jsonForHTML(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}
export function validateURL(value, optional = true) {
  if (optional && (value === '' || value == null)) return '';
  assert(typeof value === 'string' && value.length < 1500, 'URL invalide');
  const url = new URL(value);
  assert(url.protocol === 'https:' && !url.username && !url.password, 'Utiliser une URL HTTPS sans identifiants');
  return value;
}
export function validateImage(value = '') {
  if (!value) return '';

  assert(typeof value === 'string', 'Chemin image invalide');

  let image = value.trim();

  // Decap CMS peut retourner l'URL absolue du média.
  // On ne conserve que son chemin local.
  if (/^https:\/\//i.test(image)) {
    const url = new URL(image);

    assert(
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash,
      'URL image invalide'
    );

    image = url.pathname;
  }

  assert(
    !image.includes('..') &&
    !image.includes('\\'),
    'Chemin image invalide'
  );

  const original =
    /^\/assets\/images\/(pharmaguard|planora|afribus|project-default)\.svg$/;

  const uploaded =
    /^\/assets\/(uploads|images)\/[a-zA-Z0-9_./-]+\.(png|jpe?g|webp|avif)$/i;

  assert(
    original.test(image) || uploaded.test(image),
    'Image locale PNG, JPEG, WebP ou AVIF attendue'
  );

  return image;
}
function text(value, name, max, required = false) {
  if (value == null && !required) return '';
  assert(typeof value === 'string', `${name} doit être du texte`);
  const result = value.trim();
  assert(result.length <= max && (!required || result.length > 0), `${name} : longueur invalide`);
  return result;
}
export function validateProject(raw, slug) {
  assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 80, 'Identifiant de projet invalide');
  assert(raw && typeof raw === 'object' && !Array.isArray(raw), 'Objet projet attendu');
  assert(Object.hasOwn(statuses, raw.status), 'Statut inconnu');
  assert(themes.includes(raw.theme), 'Thème inconnu');
  assert(typeof raw.published === 'boolean', 'Visibilité booléenne attendue');
  assert(Number.isInteger(raw.order) && raw.order >= 0 && raw.order <= 999, 'Ordre entre 0 et 999 attendu');
  const project = { slug, status: raw.status, theme: raw.theme, published: raw.published, order: raw.order };
  for (const [key, max] of Object.entries({title:90, summary:260, category:90, imageAlt:300, imageCaption:100, context:5000, objective:3000, approach:5000, statusNote:1200, role:200, result:5000})) {
    project[key] = text(raw[key], key, max, ['title','summary','category','context','objective'].includes(key));
  }
  project.image = validateImage(raw.image);
  if (project.image) assert(project.imageAlt.length, 'Description alternative de l’image obligatoire');
  for (const key of ['repository', 'demo']) project[key] = validateURL(raw[key]);
  for (const key of ['features', 'technologies']) {
    const list = raw[key] ?? [];
    assert(Array.isArray(list) && list.length <= 30, `${key} : liste trop longue`);
    project[key] = list.map(value => text(value, key, key === 'features' ? 500 : 60, true));
  }
  return project;
}
export function githubRepository(value = '') {
  if (/^[\w.-]+\/[\w.-]+$/.test(value)) return value.replace(/\.git$/, '');
  const ssh = /^git@github\.com:([\w.-]+\/[\w.-]+?)(?:\.git)?$/.exec(value);
  if (ssh) return ssh[1];
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.username || url.password) return '';
    const candidate = url.pathname.replace(/^\//, '').replace(/\.git$/, '');
    return /^[\w.-]+\/[\w.-]+$/.test(candidate) ? candidate : '';
  } catch { return ''; }
}
