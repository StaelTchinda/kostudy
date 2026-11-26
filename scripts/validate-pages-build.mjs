import { access, readFile } from 'node:fs/promises';
import process from 'node:process';

const basePath = process.env.PAGES_BASE_PATH;
if (!basePath?.startsWith('/') || !basePath.endsWith('/')) {
  throw new Error('Set PAGES_BASE_PATH to an absolute path ending in "/", for example "/kostudy/".');
}

const dist = 'dist';
const index = await readFile(`${dist}/index.html`, 'utf8');
const manifests = await Promise.all(['manifest.json', 'manifest.webmanifest'].map(async (file) => [
  file,
  JSON.parse(await readFile(`${dist}/${file}`, 'utf8')),
]));
const failures = [];

if (basePath !== '/' && index.includes('href="/manifest.json"')) failures.push('index.html still links to the manifest at the domain root.');
if (index.includes('src="/src/main.tsx"')) failures.push('index.html still points to the Vite source entry.');
if (!index.includes(`${basePath}assets/`)) failures.push(`Built app assets are not rooted at ${basePath}.`);
if (!index.includes('id="root"')) failures.push('Built index.html is missing the app root.');

for (const [file, manifest] of manifests) {
  for (const [name, value] of [['start_url', manifest.start_url], ['scope', manifest.scope]]) {
    const resolved = new URL(value, `https://pages.invalid${basePath}${file}`);
    if (!resolved.pathname.startsWith(basePath)) failures.push(`${file} ${name} escapes the Pages path: ${value}`);
  }

  for (const icon of manifest.icons ?? []) {
    const resolved = new URL(icon.src, `https://pages.invalid${basePath}${file}`);
    if (!resolved.pathname.startsWith(basePath)) failures.push(`${file} icon escapes the Pages path: ${icon.src}`);
  }
}

const registerScript = await readFile(`${dist}/registerSW.js`, 'utf8');
if (!registerScript.includes(`${basePath}sw.js`)) failures.push(`Service worker registration is not rooted at ${basePath}.`);

for (const file of ['404.html', 'sw.js']) {
  try {
    await access(`${dist}/${file}`);
  } catch {
    failures.push(`Pages build is missing ${file}.`);
  }
}

if (failures.length) {
  console.error('GitHub Pages build validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`GitHub Pages build paths validated for ${basePath}.`);
