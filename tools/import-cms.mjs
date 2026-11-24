// Import the extracted npm distribution, retaining runtime chunks and their licences.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile, writeFile, readdir, mkdir, rm, cp} from 'node:fs/promises';
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
assert(original.includes('4.18.1') && !original.includes('"4.17.21"'), 'Unexpected Lodash version');
const storage = /storageKey="decap-cms-user";retrieve\(\)\{const (\w+)=window\.localStorage\.getItem\(this\.storageKey\);return \1&&JSON\.parse\(\1\)\}store\((\w+)\)\{window\.localStorage\.setItem\(this\.storageKey,JSON\.stringify\(\2\)\)\}logout\(\)\{window\.localStorage\.removeItem\(this\.storageKey\)\}/g;
assert.equal([...original.matchAll(storage)].length, 1, 'Review the upstream auth store before importing');
const memoryStore = 'currentUser=null;retrieve(){return this.currentUser}store(user){this.currentUser=user}logout(){this.currentUser=null}';
const patched = original.replace(storage, memoryStore);
assert(!patched.includes('decap-cms-user'), 'Unexpected second auth store');

const sha256 = data => createHash('sha256').update(data).digest('hex');
const entry = {
  package: pkg.name, version: pkg.version, license: pkg.license,
  source: 'https://registry.npmjs.org/decap-cms/-/decap-cms-3.18.0.tgz',
  archive_sha256: sha256(await readFile(archive)),
  upstream_bundle_sha256: sha256(original),
  patch: 'In-memory auth store (tools/import-cms.mjs)',
  files: []
};
async function inventory(directory, prefix) {
  for (const item of await readdir(directory, {withFileTypes:true})) {
    const path = join(directory, item.name);
    const name = prefix + item.name;
    if (item.isDirectory()) await inventory(path, name + '/');
    else {
      assert(item.isFile(), 'Unexpected file type in distribution');
      const data = await readFile(path);
      if (name.endsWith('.js')) assert(!data.includes('VERSION="4.17.21"'), name);
      entry.files.push({path: 'admin/vendor/' + name, sha256: sha256(name === 'decap-cms.js' ? patched : data)});
    }
  }
}
await inventory(dist, '');
entry.files.sort((a,b) => a.path.localeCompare(b.path,'en'));
const entries = JSON.parse(await readFile(manifest, 'utf8'));
assert.equal(entries.filter(item => item.package === pkg.name).length, 1);
await rm(vendor, {recursive:true,force:true});
await mkdir(vendor, {recursive:true});
await cp(dist, vendor, {recursive:true});
await writeFile(new URL('decap-cms.js', vendor), patched);
await writeFile(manifest, JSON.stringify(entries.map(item => item.package === pkg.name ? entry : item), null, 2) + '\n');
