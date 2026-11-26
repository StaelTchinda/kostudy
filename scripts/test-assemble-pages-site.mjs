import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { assemblePagesSite } from './assemble-pages-site.mjs';

const root = await mkdtemp(join(tmpdir(), 'kostudy-pages-site-'));
const artifacts = join(root, 'artifacts');
const site = join(root, 'site');
const previews = [
  {
    basePath: '/kostudy/preview/alpha/',
    destination: 'preview/alpha',
    artifactName: 'pages-preview-0',
  },
  {
    basePath: '/kostudy/preview/feature/nested/',
    destination: 'preview/feature/nested',
    artifactName: 'pages-preview-1',
  },
];

try {
  for (const [index, preview] of previews.entries()) {
    const artifact = join(artifacts, preview.artifactName);
    await mkdir(join(artifact, 'assets'), { recursive: true });
    await writeFile(join(artifact, 'index.html'), `<!doctype html><title>${index}</title>`);
    await writeFile(join(artifact, 'assets', 'app.js'), `preview-${index}`);
  }

  const assembled = await assemblePagesSite(site, artifacts, previews);
  assert.equal(assembled.previewCount, 2);
  assert.equal(await readFile(join(site, 'preview/alpha/index.html'), 'utf8'), '<!doctype html><title>0</title>');
  assert.equal(await readFile(join(site, 'preview/feature/nested/assets/app.js'), 'utf8'), 'preview-1');
  await assert.rejects(readFile(join(site, 'index.html')), { code: 'ENOENT' });

  const fallback = await readFile(join(site, '404.html'), 'utf8');
  assert.ok(fallback.includes('/kostudy/preview/alpha/'));
  assert.ok(fallback.includes('/kostudy/preview/feature/nested/'));
  assert.ok(!fallback.includes('<title>0</title>'), 'root fallback does not reuse an app build');

  const emptySite = join(root, 'empty-site');
  const empty = await assemblePagesSite(emptySite, artifacts, []);
  assert.equal(empty.previewCount, 0);
  await assert.rejects(readFile(join(emptySite, 'index.html')), { code: 'ENOENT' });
  assert.ok((await readFile(join(emptySite, '404.html'), 'utf8')).includes('404'));

  await assert.rejects(
    assemblePagesSite(join(root, 'missing-site'), artifacts, [{ ...previews[0], artifactName: 'missing' }]),
    /Preview artifact is missing/,
  );
} finally {
  await rm(root, { recursive: true, force: true });
}

console.log('Pages artifact assembly tests passed.');
