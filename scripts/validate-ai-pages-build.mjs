import { readdir, readFile } from 'node:fs/promises';
import process from 'node:process';

if (process.env.VITE_ENABLE_AI !== 'false') {
  throw new Error('Build the Pages variant with VITE_ENABLE_AI=false before validating it.');
}

const assets = await readdir('dist/assets');
const javascript = assets.filter((file) => file.endsWith('.js'));
const bundles = await Promise.all(javascript.map((file) => readFile(`dist/assets/${file}`, 'utf8')));
const bundle = bundles.join('\n');
const forbiddenMarkers = [
  ['/chat', 'Chat route'],
  ['/sagalearn', 'SagaLearn route'],
  ['/ai-generator', 'AI App Studio route'],
  ['Tutor this step', 'Lesson tutor'],
];
const failures = forbiddenMarkers
  .filter(([marker]) => bundle.includes(marker))
  .map(([, feature]) => `${feature} is still present in the Pages JavaScript.`);

const lessonCreationRouteIndex = bundle.indexOf('path:"/lessons/new"');
const lessonCreationRoute = lessonCreationRouteIndex < 0
  ? ''
  : bundle.slice(lessonCreationRouteIndex, lessonCreationRouteIndex + 250);
if (!lessonCreationRoute.includes('to:"/categories"') || !lessonCreationRoute.includes('replace:!0')) {
  failures.push('The AI-disabled lesson creation URL does not redirect to Learn.');
}

if (failures.length) {
  console.error('AI-free Pages build validation failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('AI entry points are excluded from the Pages JavaScript.');
