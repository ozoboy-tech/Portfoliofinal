import assert from 'node:assert/strict';
import {githubRepository, statuses} from './schema.mjs';

const field = (name, label, widget='string', extra={}) => ({name,label,widget,...extra});
const text = (name,label,max,required=true) => field(name,label,max>300?'text':'string',{required,pattern:[`^[\\s\\S]{${required?1:0},${max}}$`,`${max} caractères maximum.`]});

export function cmsConfiguration(site, env={}) {
  const candidate = env.CMS_REPOSITORY || site.cmsRepository || env.REPOSITORY_URL || '';
  const repository = githubRepository(candidate);
  assert(!candidate || repository, 'Le dépôt CMS doit être un dépôt GitHub valide (propriétaire/nom).');
  const branch = env.CMS_BRANCH || site.cmsBranch || 'main';
  assert(/^[A-Za-z0-9][A-Za-z0-9._/-]{0,100}$/.test(branch) && !branch.includes('..') && !branch.endsWith('/'), 'Branche CMS invalide');
  const preview = Boolean(env.CONTEXT && env.CONTEXT !== 'production');
  if (preview) return {enabled:false,reason:'preview'};
  if (!repository) return {enabled:false,reason:'repository'};
  return {enabled:true, config:{
    load_config_file:false, locale:'fr', local_backend:false,
    backend:{name:'github',repo:repository,branch,base_url:'https://api.netlify.com',auth_endpoint:'auth',site_domain:new URL(site.url).hostname},
    site_url:site.url, display_url:site.url,
    logo_url:`${site.url}/assets/images/monogram.svg`,
    media_folder:'assets/uploads', public_folder:'/assets/uploads',
    slug:{encoding:'ascii',clean_accents:true,sanitize_replacement:'-'},
    editor:{preview:false},
    collections:[{
      name:'projects',label:'Projets',label_singular:'Projet',folder:'content/projects',
      create:true,delete:true,format:'json',extension:'json',slug:'{{slug}}',
      identifier_field:'title',summary:'{{title}} · {{status}}',sortable_fields:['order','title'],
      description:'Publier enregistre le projet dans GitHub et déclenche sa mise en ligne. Désactivez « Visible » pour le conserver sans l’afficher.',
      fields:[
        text('title','Nom du projet',90),
        text('summary','Résumé',260),
        text('category','Domaine / catégorie',90),
        field('status','Statut','select',{default:'development',options:Object.entries(statuses).map(([value,label])=>({value,label}))}),
        field('published','Visible sur le portfolio','boolean',{default:false, hint:'Un projet masqué est absent du site généré ; son fichier reste dans GitHub. Ne stockez pas de données confidentielles dans un dépôt public.'}),
        field('order','Ordre d’affichage','number',{default:10,value_type:'int',min:0,max:999}),
        field('theme','Couleur du visuel','select',{
          default:'ink',
          options:[
            {value:'sage',label:'Gris rosé'},
            {value:'lilac',label:'Rose corail'},
            {value:'clay',label:'Rouge brique'},
            {value:'ink',label:'Bordeaux'}
          ]
        }),
        field('image','Image','image',{required:false,choose_url:false,media_library:{allow_multiple:false,config:{max_file_size:2097152}},hint:'PNG, JPG, WebP ou AVIF ; 2 Mo maximum. Nom sans espace ni accent. Une illustration par défaut est utilisée si ce champ est vide.',pattern:['^(/assets/images/(pharmaguard|planora|afribus|project-default)\\.svg|/assets/(images|uploads)/[a-zA-Z0-9_./-]+\\.(png|jpe?g|webp|avif))?$','Utilisez une image locale PNG, JPG, WebP ou AVIF.']}),
        text('imageAlt','Description de l’image (accessibilité)',300,true),
        {...text('imageCaption','Légende du visuel',100,false),hint:'Précisez « Illustration de projet » si ce n’est pas une capture du produit.'},
        text('context','Contexte / besoin initial',5000),
        text('objective','Objectif',3000),
        field('features','Fonctionnalités visées','list',{required:false,allow_add:true,minimize_collapsed:true,field:text('item','Fonctionnalité',500),max:30}),
        text('approach','Approche et décisions',5000,false),
        text('statusNote','Point d’avancement',1200,false),
        text('role','Votre rôle',200,false),
        field('technologies','Technologies réellement utilisées','list',{required:false,field:text('item','Technologie',60),max:30}),
        text('result','Résultats et enseignements vérifiables',5000,false),
        field('repository','Lien vers le code','string',{required:false,pattern:['^https://[^\\s]+$','URL HTTPS attendue.']}),
        field('demo','Lien vers la démonstration','string',{required:false,pattern:['^https://[^\\s]+$','URL HTTPS attendue.']})
      ]
    }]
  }};
}
