import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { createPagesFallback } from './pages-fallback.mjs';

const index = await readFile('dist/index.html', 'utf8');
const previewBases = JSON.parse(process.env.PAGES_PREVIEW_BASES || '[]');
await writeFile('dist/404.html', createPagesFallback(index, previewBases));
