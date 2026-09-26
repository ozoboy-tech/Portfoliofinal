import {readdir,readFile,stat} from 'node:fs/promises';
import {resolve,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../dist');
const portable=path=>path.split(sep).join('/');
async function walk(dir) {
  const result=[];
  for(const entry of await readdir(dir,{withFileTypes:true})) {
    const path=resolve(dir,entry.name);result.push(...entry.isDirectory()?await walk(path):[path]);
  }
  return result;
}
const files=await walk(root), pages=new Map(), headers=await readFile(resolve(root,'_headers'),'utf8');
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
for(const path of files.filter(f=>f.endsWith('.html'))) {
  const html=await readFile(path,'utf8'), ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert(ids.length===new Set(ids).size,`ID dupliqué : ${path}`);
  assert(/<html lang="fr">/.test(html),`Langue absente : ${path}`);
  assert((html.match(/<h1\b/g)||[]).length===1,`Un seul h1 attendu : ${path}`);
  assert(/<title>[^<]+<\/title>/.test(html)&&/<meta name="description" content="[^"]+">/.test(html),`Métadonnées absentes : ${path}`);
  assert(!/\son[a-z]+\s*=|javascript:|smtpjs\.com|Email\.send\s*\(/i.test(html),`Code client non attendu : ${path}`);
  for(const match of html.matchAll(/<(input|textarea|select)\b([^>]*)>/g)) {
    const id=/\bid="([^"]+)"/.exec(match[2])?.[1];
    assert(id&&html.includes(`for="${id}"`),`Champ sans label : ${path}`);
  }
  for(const match of html.matchAll(/<img\b([^>]*)>/g)) assert(/\balt="[^"]*"/.test(match[1])&&/\bwidth="\d+"/.test(match[1])&&/\bheight="\d+"/.test(match[1]),`Image sans alt/dimensions : ${path}`);
  for(const match of html.matchAll(/\b(?:aria-labelledby|aria-describedby)="([^"]+)"/g)) for(const id of match[1].split(' ')) assert(ids.includes(id),`Référence ARIA manquante : ${id}`);
  for(const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if(match[1].includes('application/ld+json')) {
      JSON.parse(match[2]);
      assert(headers.includes(`'sha256-${createHash('sha256').update(match[2]).digest('base64')}'`),'Empreinte CSP JSON-LD absente');
    } else assert(/\bsrc="\//.test(match[1]) && !match[2].trim(),'Script inline ou tiers non attendu');
  }
  if(!portable(path).includes('/admin/')) assert(/rel="canonical"/.test(html)&&/property="og:image"/.test(html),'Canonical/OG absents');
  pages.set(path,{html,ids});
}
let internalLinks=0;
async function checkLink(value,page) {
  if(!value || /^(?:https?:|mailto:|tel:|data:)/.test(value))return;
  const base='https://portfolio.example'+portable(page.slice(root.length)).replace(/index\.html$/,'');
  const url=new URL(decode(value),base);
  let path=resolve(root,'.'+decodeURIComponent(url.pathname));
  assert(path===root||path.startsWith(root+sep),'Chemin hors site');
  if(url.pathname.endsWith('/'))path=resolve(path,'index.html');
  assert(files.includes(path),`Lien ou ressource absent(e) : ${value} depuis ${page}`);
  if(url.hash) assert(pages.get(path)?.ids.includes(decodeURIComponent(url.hash.slice(1))),`Ancre absente : ${value}`);
  internalLinks++;
}
for(const [path,{html}] of pages) for(const match of html.matchAll(/\b(?:src|href|action)="([^"]+)"/g)) await checkLink(match[1],path);
for(const path of files.filter(p=>p.endsWith('.css')&&!portable(p).includes('/vendor/'))) {
  const css=await readFile(path,'utf8');
  for(const m of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g))await checkLink(m[1],path);
}
const sitemap=await readFile(resolve(root,'sitemap.xml'),'utf8');
for(const match of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) await checkLink(new URL(decode(match[1])).pathname,resolve(root,'index.html'));
assert(!sitemap.includes('/admin/'),'Administration présente dans le sitemap');
assert(!files.some(p=>/\/(?:node_modules|content|src|tests|\.git)\//.test(portable(p))),'Sources privées dans dist');
const home=pages.get(resolve(root,'index.html')).html;
assert(/<form[^>]+action="https:\/\/formspree.io\/f\/[a-z0-9]+" method="POST"/.test(home),'Contact Formspree natif absent');
const js=await readFile(resolve(root,'assets/scripts.js'),'utf8');
assert(!/Email\.send|smtpjs|setInterval|innerHTML\s*=|preventDefault\s*\(/.test(js),'Régression JavaScript public');
console.log(JSON.stringify({htmlPages:pages.size,internalReferences:internalLinks,files:files.length,checks:'structure, liens, métadonnées, JSON-LD, CSP, images, formulaire, exclusions : OK'},null,2));
