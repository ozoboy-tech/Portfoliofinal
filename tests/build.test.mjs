import test from 'node:test';
import assert from 'node:assert/strict';

import {
  cp,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';

import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { build, ROOT } from '../tools/build.mjs';

async function exists(path) {
  try {
    await stat(path);

    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

async function copySourceDirectories(root) {
  const directories = ['content', 'assets', 'admin'];

  for (const directory of directories) {
    await cp(
      join(ROOT, directory),
      join(root, directory),
      { recursive: true },
    );
  }
}

test(
  'Ajout, changement de statut, masquage et suppression régénèrent pages et sitemap',
  async () => {
    const root = await mkdtemp(
      join(tmpdir(), 'portfolio-test-'),
    );

    try {
      await copySourceDirectories(root);

      const projectPath = join(
        root,
        'content/projects/test-projet.json',
      );

      const baseProjectPath = join(
        root,
        'content/projects/pharmaguard.json',
      );

      const baseProject = JSON.parse(
        await readFile(baseProjectPath, 'utf8'),
      );

      const project = {
        ...baseProject,
        title: 'Projet test',
        status: 'prototype',
        order: 0,
      };

      const homePath = join(root, 'dist/index.html');
      const projectIndexPath = join(root, 'dist/projets/index.html');
      const sitemapPath = join(root, 'dist/sitemap.xml');

      const projectPagePath = join(
        root,
        'dist/projets/test-projet/index.html',
      );

      // Vérifier la publication du nouveau projet.
      await writeFile(
        projectPath,
        JSON.stringify(project),
        'utf8',
      );

      const firstBuild = await build({
        root,
        env: {},
      });

      assert.equal(firstBuild.projects, 4);

      const home = await readFile(homePath, 'utf8');
      const projectIndex = await readFile(projectIndexPath, 'utf8');
      const projectPage = await readFile(projectPagePath, 'utf8');
      const sitemap = await readFile(sitemapPath, 'utf8');

      assert(home.includes('Projet test'));

      assert(
        projectIndex.includes('href="/projets/test-projet/"'),
      );

      assert(projectPage.includes('Prototype'));
      assert(sitemap.includes('/projets/test-projet/'));

      // Vérifier la cohérence de la CSP de la page 404.
      const errorPage = await readFile(
        join(root, 'dist/404.html'),
        'utf8',
      );

      const metaMatch = errorPage.match(
        /<meta http-equiv="Content-Security-Policy"[^>]+>/,
      );

      assert(
        metaMatch,
        'La page 404 doit contenir une balise CSP.',
      );

      const [meta] = metaMatch;
      const firstScriptIndex = errorPage.indexOf('<script');

      assert(
        firstScriptIndex !== -1 &&
          errorPage.indexOf(meta) < firstScriptIndex,
        'La balise CSP doit apparaître avant le premier script.',
      );

      const headers = await readFile(
        join(root, 'dist/_headers'),
        'utf8',
      );

      const httpPolicyMatch = headers.match(
        /\/404\.html\n  Content-Security-Policy: ([^\n]+)/,
      );

      assert(
        httpPolicyMatch,
        'Les en-têtes doivent définir une CSP pour la page 404.',
      );

      const metaContentMatch = meta.match(/content="([^"]+)"/);

      assert(
        metaContentMatch,
        'La balise CSP doit contenir un attribut content.',
      );

      const metaPolicy = metaContentMatch[1].replaceAll(
        '&#39;',
        "'",
      );

      const httpPolicy = httpPolicyMatch[1].replace(
        "frame-ancestors 'none'; ",
        '',
      );

      assert.equal(metaPolicy, httpPolicy);

      // Vérifier la mise à jour du statut.
      project.status = 'production';

      await writeFile(
        projectPath,
        JSON.stringify(project),
        'utf8',
      );

      await build({
        root,
        env: {},
      });

      const updatedProjectPage = await readFile(
        projectPagePath,
        'utf8',
      );

      assert(updatedProjectPage.includes('En production'));

      // Vérifier le retrait du projet masqué.
      project.published = false;

      await writeFile(
        projectPath,
        JSON.stringify(project),
        'utf8',
      );

      await build({
        root,
        env: {},
      });

      assert.equal(await exists(projectPagePath), false);

      const hiddenHome = await readFile(homePath, 'utf8');

      const hiddenProjectIndex = await readFile(
        projectIndexPath,
        'utf8',
      );

      const hiddenSitemap = await readFile(sitemapPath, 'utf8');

      assert.equal(hiddenHome.includes('Projet test'), false);

      assert.equal(
        hiddenProjectIndex.includes('href="/projets/test-projet/"'),
        false,
      );

      assert.equal(
        hiddenSitemap.includes('/projets/test-projet/'),
        false,
      );

      // Vérifier la suppression du fichier source.
      await rm(projectPath);

      const buildAfterDeletion = await build({
        root,
        env: {},
      });

      assert.equal(buildAfterDeletion.projects, 3);

      // Vérifier les restrictions de la prévisualisation.
      await build({
        root,
        env: {
          CONTEXT: 'deploy-preview',
        },
      });

      const previewHome = await readFile(homePath, 'utf8');

      const robots = await readFile(
        join(root, 'dist/robots.txt'),
        'utf8',
      );

      assert(previewHome.includes('noindex, nofollow'));
      assert(robots.includes('Disallow: /'));

      assert.equal(
        await exists(join(root, 'dist/content')),
        false,
      );
    } finally {
      await rm(root, {
        recursive: true,
        force: true,
      });
    }
  },
);

test(
  'Un média importé actif ou mal typé arrête la publication',
  async () => {
    const root = await mkdtemp(
      join(tmpdir(), 'portfolio-media-test-'),
    );

    try {
      await copySourceDirectories(root);

      const unsafeSvgPath = join(
        root,
        'assets/uploads/unsafe.svg',
      );

      const fakePngPath = join(
        root,
        'assets/uploads/pretend.png',
      );

      // Refuser un SVG importé contenant du contenu actif.
      await writeFile(
        unsafeSvgPath,
        '<svg onload="alert(1)"></svg>',
        'utf8',
      );

      await assert.rejects(
        build({
          root,
          env: {},
        }),
        /SVG importés/,
      );

      await rm(unsafeSvgPath);

      // Refuser un fichier dont le contenu ne correspond pas au format.
      await writeFile(
        fakePngPath,
        '<script>alert(1)</script>',
        'utf8',
      );

      await assert.rejects(
        build({
          root,
          env: {},
        }),
        /format de l’image/,
      );
    } finally {
      await rm(root, {
        recursive: true,
        force: true,
      });
    }
  },
);