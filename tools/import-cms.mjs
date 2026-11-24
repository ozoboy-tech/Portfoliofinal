// Import the extracted npm distribution, retaining runtime chunks and their licences.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile, writeFile, readdir, mkdir, rm, copyFile} from 'node:fs/promises';
import {join, resolve} from 'node:path';

const [source, archive] = process.argv.slice(2);
const root = new URL('../', import.meta.url);
const vendor = new URL('admin/vendor/', root);
const manifest = new URL('licenses/vendor-manifest.json', root);
const pkg = JSON.parse(await readFile(join(source, 'package.json'), 'utf8'));
assert.equal(pkg.name, 'decap-cms');
assert.equal(pkg.version, '3.18.0');
const dist = resolve(source, 'dist');
const bundle = join(dist, 'decap-cms.js');
const original = await readFile(bundle, 'utf8');

const storage = /storageKey="decap-cms-user";retrieve\(\)\{const (\w+)=window\.localStorage\.getItem\(this\.storageKey\);return \1&&JSON\.parse\(\1\)\}store\((\w+)\)\{window\.localStorage\.setItem\(this\.storageKey,JSON\.stringify\(\2\)\)\}logout\(\)\{window\.localStorage\.removeItem\(this\.storageKey\)\}/g;
assert.equal([...original.matchAll(storage)].length, 1, 'Review the upstream auth store before importing');
const memoryStore = 'currentUser=null;retrieve(){return this.currentUser}store(user){this.currentUser=user}logout(){this.currentUser=null}';
const patched = original.replace(storage, memoryStore);
assert(!patched.includes('"decap-cms-user"'), 'Unexpected second auth store');

const sha256 = data => createHash('sha256').update(data).digest('hex');
const entry = {
  package: pkg.name, version: pkg.version, license: pkg.license,
  source: 'https://registry.npmjs.org/decap-cms/-/decap-cms-3.18.0.tgz',
  archive_sha256: sha256(await readFile(archive)),
  upstream_bundle_sha256: sha256(original),
  patch: 'In-memory auth store (tools/import-cms.mjs)',
  files: []
};
// Check each Lodash module in the webpack source maps against the patched npm releases.
const references = new Map();
for (const name of ['lodash','lodash-es']) {
  const reference = resolve(source, '..', name);
  const metadata = JSON.parse(await readFile(join(reference,'package.json'),'utf8'));
  assert.equal(metadata.name,name);
  assert.equal(metadata.version,'4.18.1');
  references.set(name,reference);
}
const files = (await readdir(dist)).filter(name =>
  /(?:^|\.)decap-cms\.js(?:\.LICENSE\.txt)?$/.test(name) || /\.(?:wasm|css)$/.test(name));
const modules = new Set();
for (const name of files) {
  const data = await readFile(join(dist,name));
  if (name.endsWith('.js')) {
    assert(!data.includes('VERSION="4.17.21"'), name);
    const map = JSON.parse(await readFile(join(dist,name+'.map'),'utf8'));
    for (const [i, path] of map.sources.entries()) {
      const match = path.match(/\/node_modules\/(lodash(?:-es)?)\/([\w./-]+\.js)(?:\?.*)?$/);
      if (!match) continue;
      const [,lib,file] = match;
      assert(!file.includes('..'));
      const expected = await readFile(join(references.get(lib),file),'utf8');
      assert.equal(sha256(map.sourcesContent[i].trim()),sha256(expected.trim()),lib+'/'+file);
      modules.add(lib+'/'+file);
    }
  }
  entry.files.push({path:'admin/vendor/'+name,sha256:sha256(name === 'decap-cms.js' ? patched : data)});
}
assert(modules.size > 0, 'No Lodash modules identified in source maps');
entry.verified_lodash_version = '4.18.1';
entry.verified_lodash_modules = modules.size;
entry.files.sort((a,b) => a.path.localeCompare(b.path,'en'));
const entries = JSON.parse(await readFile(manifest, 'utf8'));
assert.equal(entries.filter(item => item.package === pkg.name).length, 1);
await rm(vendor, {recursive:true,force:true});
await mkdir(vendor, {recursive:true});
for (const name of files) await copyFile(join(dist,name),new URL(name,vendor));
await writeFile(new URL('decap-cms.js', vendor), patched);
await writeFile(manifest, JSON.stringify(entries.map(item => item.package === pkg.name ? entry : item), null, 2) + '\n');
