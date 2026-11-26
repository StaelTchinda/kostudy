import { access, cp, mkdir, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import process from 'node:process';
import { createPagesFallback } from './pages-fallback.mjs';

const fallbackPage = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>KoStudy preview not found</title></head><body><main><h1>404</h1><p>This page is not part of a published KoStudy preview.</p></main></body></html>';

export async function assemblePagesSite(siteDir, mainArtifactDir, previewArtifactsDir, previews) {
  const root = resolve(siteDir);
  const mainArtifact = resolve(mainArtifactDir);
  const artifactsRoot = resolve(previewArtifactsDir);
  const appBases = ['/kostudy/'];
  await mkdir(root, { recursive: true });

  try {
    await access(resolve(mainArtifact, 'index.html'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    throw new Error('Main artifact is missing an index.html file.');
  }

  await cp(mainArtifact, root, { recursive: true, force: true });

  for (const preview of previews) {
    const { artifactName, basePath, destination } = preview;
    if (
      typeof basePath !== 'string' ||
      typeof destination !== 'string' ||
      typeof artifactName !== 'string' ||
      !basePath.startsWith('/kostudy/preview/') ||
      !basePath.endsWith('/') ||
      basePath !== `/kostudy/${destination}/` ||
      destination.split('/').some((segment) => !segment || segment === '.' || segment === '..')
    ) {
      throw new Error(`Invalid preview artifact mapping: ${JSON.stringify(preview)}`);
    }

    const sourcePath = resolve(artifactsRoot, artifactName);
    const outputPath = resolve(root, destination);
    if (!sourcePath.startsWith(`${artifactsRoot}${sep}`) || !outputPath.startsWith(`${root}${sep}`)) {
      throw new Error(`Preview artifact path escapes its output directory: ${basePath}`);
    }

    try {
      await access(resolve(sourcePath, 'index.html'));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      throw new Error(`Preview artifact is missing for ${basePath}`);
    }

    await cp(sourcePath, outputPath, { recursive: true, force: true });
    appBases.push(basePath);
  }

  await writeFile(resolve(root, '404.html'), createPagesFallback(fallbackPage, appBases));
  return { previewCount: appBases.length - 1 };
}

if (process.env.PAGES_SITE_DIR) {
  const previews = JSON.parse(process.env.PAGES_PREVIEWS || '[]');
  const { previewCount } = await assemblePagesSite(
    process.env.PAGES_SITE_DIR,
    process.env.PAGES_MAIN_ARTIFACT_DIR,
    process.env.PAGES_PREVIEW_ARTIFACTS_DIR,
    previews,
  );
  console.log(`Assembled Pages site with ${previewCount} preview builds.`);
}
