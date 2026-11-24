import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {runInNewContext} from 'node:vm';

const root = new URL('../', import.meta.url);
test('La distribution Decap correspond au manifeste et emploie la dépendance corrigée', async () => {
  const packages = JSON.parse(await readFile(new URL('licenses/vendor-manifest.json', root)));
  const cms = packages.find(item => item.package === 'decap-cms');
  assert.equal(cms.version, '3.18.0');
  for (const {path, sha256} of cms.files) {
    const bytes = await readFile(new URL(path, root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), sha256, path);
    if (path.endsWith('.js')) assert(!bytes.includes('VERSION="4.17.21"'), path);
  }
  const source = await readFile(new URL('admin/vendor/decap-cms.js', root), 'utf8');
  assert.equal(cms.verified_lodash_version,'4.18.1');
  assert(cms.verified_lodash_modules > 0);
  assert(!source.includes('"decap-cms-user"'));
  const store = source.match(/class [\w$]+\{retrieve\(\)\{[^{}]*\}store\(user\)\{[^{}]*\}logout\(\)\{[^{}]*\}\}/);
  assert(store, 'Stockage de session introuvable dans le bundle');
  const newTab = () => runInNewContext('const portfolioAuthSession={user:null};new (' + store[0] + ')()');
  const first = newTab();
  first.store({token:'test-only'});
  assert.equal(first.retrieve().token, 'test-only');
  assert.equal(newTab().retrieve(), null);
  first.logout();
  assert.equal(first.retrieve(), null);
});
