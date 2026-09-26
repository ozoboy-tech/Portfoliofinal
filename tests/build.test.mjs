import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,cp,readFile,writeFile,rm,stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {build,ROOT} from '../tools/build.mjs';
const exists=async path=>{try{await stat(path);return true;}catch{return false;}};
test('Ajout, changement de statut, masquage et suppression régénèrent pages et sitemap',async()=>{
  const root=await mkdtemp(join(tmpdir(),'portfolio-test-'));
  try {
    for(const name of ['content','assets','admin']) await cp(join(ROOT,name),join(root,name),{recursive:true});
    const path=join(root,'content/projects/test-projet.json');
    const base=JSON.parse(await readFile(join(root,'content/projects/pharmaguard.json')));
    const project={...base,title:'Projet test',status:'prototype',order:0};
    await writeFile(path,JSON.stringify(project));
    const first=await build({root,env:{}});assert.equal(first.projects,4);
    assert((await readFile(join(root,'dist/index.html'),'utf8')).includes('Projet test'));
    assert((await readFile(join(root,'dist/projets/test-projet/index.html'),'utf8')).includes('Prototype'));
    assert((await readFile(join(root,'dist/sitemap.xml'),'utf8')).includes('/projets/test-projet/'));
    project.status='production';await writeFile(path,JSON.stringify(project));await build({root,env:{}});
    assert((await readFile(join(root,'dist/projets/test-projet/index.html'),'utf8')).includes('En production'));
    project.published=false;await writeFile(path,JSON.stringify(project));await build({root,env:{}});
    assert(!(await exists(join(root,'dist/projets/test-projet/index.html'))));
    assert(!(await readFile(join(root,'dist/index.html'),'utf8')).includes('Projet test'));
    assert(!(await readFile(join(root,'dist/sitemap.xml'),'utf8')).includes('/projets/test-projet/'));
    await rm(path);assert.equal((await build({root,env:{}})).projects,3);
    await build({root,env:{CONTEXT:'deploy-preview'}});
    assert((await readFile(join(root,'dist/index.html'),'utf8')).includes('noindex, nofollow'));
    assert((await readFile(join(root,'dist/robots.txt'),'utf8')).includes('Disallow: /'));
    assert(!(await exists(join(root,'dist/content'))));
  } finally {await rm(root,{recursive:true,force:true});}
});
test('Un média importé actif ou mal typé arrête la publication',async()=>{
  const root=await mkdtemp(join(tmpdir(),'portfolio-media-test-'));
  try {
    for(const name of ['content','assets','admin']) await cp(join(ROOT,name),join(root,name),{recursive:true});
    await writeFile(join(root,'assets/uploads/unsafe.svg'),'<svg onload="alert(1)"></svg>');
    await assert.rejects(build({root,env:{}}),/SVG importés/);
    await rm(join(root,'assets/uploads/unsafe.svg'));
    await writeFile(join(root,'assets/uploads/pretend.png'),'<script>alert(1)</script>');
    await assert.rejects(build({root,env:{}}),/format de l’image/);
  } finally {await rm(root,{recursive:true,force:true});}
});
