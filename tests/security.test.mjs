import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateProject,validateImage,validateURL,escapeHTML,jsonForHTML,githubRepository} from '../src/schema.mjs';
import {cmsConfiguration} from '../src/cms.mjs';
import {projectpage} from '../src/templates.mjs';
const project=JSON.parse(await readFile(new URL('../content/projects/pharmaguard.json',import.meta.url)));
const site=JSON.parse(await readFile(new URL('../content/site.json',import.meta.url)));
test('Les textes de projets sont rendus comme du texte, pas du code',()=>{
  const payload='</script><img src=x onerror="alert(1)">';
  const p=validateProject({...project,title:payload,summary:payload,context:payload},'exemple');
  const html=projectpage(site,p,null,false);
  assert(!html.includes(payload));assert(html.includes(escapeHTML(payload)));
  assert(!jsonForHTML({x:payload}).includes('</script>'));
  const data=html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1];
  assert.equal(JSON.parse(data).name,payload);
});
test('Les liens actifs, identifiants et chemins non sûrs sont refusés',()=>{
  for(const url of ['javascript:alert(1)','data:text/html,ok','http://example.org','https://user:secret@example.org']) assert.throws(()=>validateURL(url));
  for(const path of ['/assets/uploads/../payload.png','https://a.test/a.png','/assets/uploads/payload.svg','/assets/uploads/a.html','/assets/uploads/a\\b.png']) assert.throws(()=>validateImage(path));
  assert.equal(validateURL('https://github.com/owner/project'),'https://github.com/owner/project');
  for(const slug of ['../x','a/b','<img>','A B']) assert.throws(()=>validateProject(project,slug));
  assert.throws(()=>validateProject({...project,status:'invented'},'test'));
  assert.throws(()=>validateProject({...project,published:'false'},'test'));
});
test('L’administration cible un dépôt explicite et reste fermée en prévisualisation',()=>{
  assert.equal(githubRepository('git@github.com:owner/project.git'),'owner/project');
  assert.equal(githubRepository('https://github.com/owner/project.git'),'owner/project');
  assert.equal(githubRepository('https://token@github.com/owner/project'),'');
  assert.equal(cmsConfiguration({...site,cmsRepository:''},{}).enabled,false);
  assert.equal(cmsConfiguration(site,{}).config.backend.repo,'ozoboy-tech/Portfoliofinal');
  const env={CONTEXT:'production',CMS_REPOSITORY:'owner/project'};
  const cms=cmsConfiguration(site,env);assert.equal(cms.config.backend.repo,'owner/project');
  assert.equal(cms.config.backend.branch,'main');
  assert.equal(cms.config.collections[0].create,true);assert.equal(cms.config.collections[0].delete,true);
  assert.equal(cmsConfiguration(site,{...env,CONTEXT:'deploy-preview'}).enabled,false);
  assert.throws(()=>cmsConfiguration(site,{CMS_REPOSITORY:'https://other.example/project'}));
});
