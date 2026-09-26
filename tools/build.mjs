import {readFile,writeFile,mkdir,readdir,rm,copyFile,lstat} from 'node:fs/promises';
import {resolve,dirname,relative,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {validateProject,validateURL,validateImage,escapeHTML} from '../src/schema.mjs';
import {homepage,projectpage,resumepage,privacypage,notfound} from '../src/templates.mjs';
import {cmsConfiguration} from '../src/cms.mjs';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)),'..');
const originalSVG = new Set(['monogram.svg','signal.svg','pharmaguard.svg','planora.svg','afribus.svg','project-default.svg','og-cover.svg']);
async function json(path) { return JSON.parse(await readFile(path,'utf8')); }
function validateSite(site) {
  for (const key of ['name','title','description','phoneLabel','portraitAlt']) assert(typeof site[key]==='string' && site[key].length<500,`${key} invalide`);
  validateURL(site.url,false);
  const url = new URL(site.url);
  assert(url.origin===site.url,'url doit être une origine HTTPS sans chemin ni barre finale');
  assert(/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(site.email),'E-mail invalide');
  assert(/^\+[1-9][0-9]{7,14}$/.test(site.phone),'Téléphone international invalide');
  assert(/^[a-z0-9]{6,30}$/.test(site.formspreeId),'Identifiant Formspree invalide');
  validateImage(site.portrait);
  if(site.portrait) assert(site.portraitAlt.trim(),'Texte alternatif du portrait requis');
  return site;
}
async function copyTree(source,destination,assets=false) {
  for(const entry of await readdir(source,{withFileTypes:true})) {
    if(entry.name.startsWith('.')) continue;
    assert(!entry.isSymbolicLink(),`Lien symbolique refusé : ${entry.name}`);
    const from=resolve(source,entry.name),to=resolve(destination,entry.name);
    const normalized=from.split(sep).join('/');
    if(entry.isDirectory()) { await mkdir(to,{recursive:true}); await copyTree(from,to,assets); continue; }
    assert(entry.isFile(),`Type de fichier refusé : ${entry.name}`);
    if(assets) {
      assert(/^[A-Za-z0-9_.-]+$/.test(entry.name),`Nom de média sans espace/accent attendu : ${entry.name}`);
      const ext=extname(entry.name).toLowerCase();
      assert(['.svg','.png','.jpg','.jpeg','.webp','.avif','.woff2','.css','.js','.pdf'].includes(ext),`Type de ressource refusé : ${entry.name}`);
      const buffer=await readFile(from);
      if (ext==='.svg') {
        assert(originalSVG.has(entry.name) && dirname(from).split(sep).join('/').endsWith('/assets/images'),'Les SVG importés ne sont pas publiés');
        assert(!/<(?:script|foreignObject|iframe)|\bon\w+\s*=|(?:href|src)\s*=\s*["'](?:https?:|data:|javascript:)/i.test(buffer.toString()),'SVG actif refusé');
      }
      if (normalized.includes('/uploads/')) {
        assert(['.png','.jpg','.jpeg','.webp','.avif'].includes(ext),'Les imports doivent être des images raster');
        assert(buffer.length<=2097152,'Image trop lourde : 2 Mo maximum');
        const valid = ext==='.png' ? buffer.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) : ['.jpg','.jpeg'].includes(ext) ? buffer[0]===255&&buffer[1]===216&&buffer[2]===255 : ext==='.webp' ? buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP' : buffer.toString('ascii',4,8)==='ftyp' && /avif|avis/.test(buffer.toString('ascii',8,32));
        assert(valid,'Le contenu du fichier ne correspond pas au format de l’image');
      }
    }
    await copyFile(from,to);
  }
}
export function securityHeaders(pages,noindex=false) {
  const hashes = new Set();
  for(const html of pages.values()) for(const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) hashes.add(`'sha256-${createHash('sha256').update(match[1]).digest('base64')}'`);
  const publicCSP=`default-src 'none'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; script-src 'self' ${[...hashes].join(' ')}; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'none'; form-action https://formspree.io; upgrade-insecure-requests`;
  // Decap/Ajv utilise la compilation de schémas et des styles à l’exécution.
  // Ces exceptions sont confinées à /admin/, jamais appliquées au site public.
  const adminCSP="default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://avatars.githubusercontent.com https://raw.githubusercontent.com https://media.githubusercontent.com; font-src 'self' data:; connect-src 'self' https://api.github.com https://github.com https://api.netlify.com https://raw.githubusercontent.com https://media.githubusercontent.com; frame-src 'self' blob: https://api.netlify.com; worker-src 'self' blob:; form-action 'self' https://github.com https://api.netlify.com; upgrade-insecure-requests";
  let result=`/*\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()\n  Cross-Origin-Opener-Policy: same-origin-allow-popups\n  Strict-Transport-Security: max-age=31536000\n${noindex?'  X-Robots-Tag: noindex, nofollow\n':''}`;
  for (const pattern of ['/','/index.html','/parcours','/parcours/*','/confidentialite','/confidentialite/*','/projets/*','/404.html']) result+=`\n${pattern}\n  Content-Security-Policy: ${publicCSP}\n  Cache-Control: public, max-age=0, must-revalidate\n`;
  result+=`\n/admin/*\n  Content-Security-Policy: ${adminCSP}\n  X-Robots-Tag: noindex, nofollow\n  Cache-Control: no-store\n\n/admin\n  X-Robots-Tag: noindex, nofollow\n\n/assets/*\n  Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; sandbox\n  Cache-Control: public, max-age=3600\n`;
  return result;
}
export async function build({root=ROOT,out=resolve(root,'dist'),env=process.env}={}) {
  root=resolve(root); out=resolve(out);
  assert(out===resolve(root,'dist'),'La sortie doit être le dossier dist du projet');
  try { assert(!(await lstat(out)).isSymbolicLink(),'Sortie symbolique refusée'); } catch(error) { if(error.code!=='ENOENT') throw error; }
  const site=validateSite(await json(resolve(root,'content/site.json')));
  const projectDirectory=resolve(root,'content/projects');
  const files=(await readdir(projectDirectory)).filter(n=>n.endsWith('.json'));
  const allProjects=await Promise.all(files.map(async name=>{
    assert(!(await lstat(resolve(projectDirectory,name))).isSymbolicLink(),'Projet symbolique refusé');
    return validateProject(await json(resolve(projectDirectory,name)),name.slice(0,-5));
  }));
  const projects=allProjects.filter(p=>p.published).sort((a,b)=>a.order-b.order||a.slug.localeCompare(b.slug));
  const noindex=Boolean(env.CONTEXT && env.CONTEXT!=='production');
  const cms=cmsConfiguration(site,env);
  const pages=new Map([
    ['index.html',homepage(site,projects,noindex)],
    ['parcours/index.html',resumepage(site,noindex)],
    ['confidentialite/index.html',privacypage(site,noindex)],
    ['404.html',notfound(site)]
  ]);
  for(let i=0;i<projects.length;i++) pages.set(`projets/${projects[i].slug}/index.html`,projectpage(site,projects[i],projects.length>1?projects[(i+1)%projects.length]:null,noindex));
  // Valider les médias avant de remplacer le dernier build local.
  for(const path of [site.portrait,...projects.map(p=>p.image)].filter(Boolean)) {
    const stat=await lstat(resolve(root,path.slice(1)));
    assert(stat.isFile()&&!stat.isSymbolicLink(),`Média manquant/invalide : ${path}`);
  }
  await rm(out,{recursive:true,force:true}); await mkdir(out,{recursive:true});
  for(const [name,html] of pages) { const path=resolve(out,name);await mkdir(dirname(path),{recursive:true});await writeFile(path,html); }
  for(const name of ['assets','admin']) { await mkdir(resolve(out,name),{recursive:true});await copyTree(resolve(root,name),resolve(out,name),name==='assets'); }
  await writeFile(resolve(out,'admin/cms-config.json'),JSON.stringify(cms,null,2)+'\n');
  const paths=['/','/parcours/','/confidentialite/',...projects.map(p=>`/projets/${p.slug}/`)];
  await writeFile(resolve(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(path=>`  <url><loc>${escapeHTML(site.url+path)}</loc></url>`).join('\n')}\n</urlset>\n`);
  await writeFile(resolve(out,'robots.txt'),noindex?'User-agent: *\nDisallow: /\n':`User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${site.url}/sitemap.xml\n`);
  await writeFile(resolve(out,'_headers'),securityHeaders(pages,noindex));
  await writeFile(resolve(out,'_redirects'),['PHARMAGUARD','PLANORA','AFRIBUS'].flatMap(name=>['','/','/index.html'].map(suffix=>`/public/Projects/${name}${suffix} /projets/${name.toLowerCase()}/ 301`)).join('\n')+'\n/admin /admin/ 301\n');
  return {pages:pages.size,projects:projects.length,hidden:allProjects.length-projects.length,adminConfigured:cms.enabled,noindex,output:relative(root,out)};
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const result=await build();console.log(JSON.stringify(result,null,2));
}
