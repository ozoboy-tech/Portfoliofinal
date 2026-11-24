import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {mkdtemp, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const [cms] = JSON.parse(await readFile(new URL('../licenses/vendor-manifest.json', import.meta.url)));
assert.equal(cms.package, 'decap-cms');
const temporary = await mkdtemp(join(tmpdir(), 'portfolio-cms-audit-'));
const packages = new Map();
function record(name, version) {
  packages.set(name + '@' + version, {package:{ecosystem:'npm', name}, version});
}
try {
  const response = await fetch(cms.source, {signal:AbortSignal.timeout(60000)});
  assert(response.ok, 'Téléchargement npm impossible');
  const archive = Buffer.from(await response.arrayBuffer());
  assert.equal(createHash('sha256').update(archive).digest('hex'), cms.archive_sha256);
  await writeFile(join(temporary,'cms.tgz'), archive);
  execFileSync('tar', ['-xzf', 'cms.tgz'], {cwd:temporary});
  const dist = join(temporary, 'package', 'dist');
  record(cms.package, cms.version);
  for (const {path} of cms.files.filter(file => file.path.endsWith('.js'))) {
    const map = JSON.parse(await readFile(join(dist, path.split('/').pop() + '.map')));
    for (const source of map.sources) {
      const match = source.match(/\/\.pnpm\/((?:@[^/+]+\+)?[^/@+]+)@(\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?)(?:[_(/])/);
      if (match) record(match[1].replace('+','/'), match[2]);
    }
  }
  assert(packages.has('lodash@' + cms.verified_lodash_version), 'Inventaire Lodash incomplet');
  const queries = [...packages.values()];
  console.log(queries.length + ' versions identifiées dans les fichiers distribués.');
  for (let start=0; start<queries.length; start+=100) {
    const batch = queries.slice(start,start+100);
    const result = await fetch('https://api.osv.dev/v1/querybatch', {
      method:'POST', headers:{'content-type':'application/json'},
      body:JSON.stringify({queries:batch}), signal:AbortSignal.timeout(60000)
    });
    assert(result.ok, 'Consultation OSV impossible');
    const {results} = await result.json();
    assert.equal(results.length, batch.length);
    for (const [i, item] of results.entries()) {
      if (item.vulns?.length) {
        console.error(batch[i].package.name, batch[i].version, item.vulns.map(v => v.id).join(', '));
        process.exitCode = 1;
      }
    }
  }
} finally {
  await rm(temporary, {recursive:true, force:true});
}
