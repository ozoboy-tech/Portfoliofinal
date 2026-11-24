import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../content/site.json',import.meta.url)));
const manifest = JSON.parse(await readFile(new URL('../licenses/vendor-manifest.json',import.meta.url)));
const cms = manifest.find(entry => entry.package === 'decap-cms');
const get = path => fetch(new URL(path,site.url), {redirect:'error', signal:AbortSignal.timeout(12000)});
const [config, bundle, missing] = await Promise.all([
  get('/admin/cms-config.json'), get('/admin/vendor/decap-cms.js'),
  get('/verification-404-' + Date.now())
]);
assert.equal(config.status,200);
const settings = await config.json();
assert.equal(settings.enabled,true);
assert.equal(settings.config.backend.auth_scope,'public_repo');
assert.equal(settings.config.publish_mode,'editorial_workflow');
assert.equal(bundle.status,200);
const hash = createHash('sha256').update(Buffer.from(await bundle.arrayBuffer())).digest('hex');
assert.equal(hash,cms.files.find(file => file.path === 'admin/vendor/decap-cms.js').sha256);
assert.equal(missing.status,404);
const html = await missing.text();
const meta = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/i);
assert(meta && html.indexOf(meta[0]) < html.indexOf('<script'));
assert(meta[1].includes('default-src &#39;none&#39;') && !meta[1].includes('unsafe-eval'));
console.log('Production vérifiée : configuration OAuth, workflow éditorial, empreinte du CMS et CSP de la réponse 404.');
