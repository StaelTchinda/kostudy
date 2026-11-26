import assert from 'node:assert/strict';
import { createPagesFallback, getAppRedirect } from './pages-fallback.mjs';

const previewBases = [
  '/kostudy/preview/lesson-redesign/',
  '/kostudy/preview/lesson-redesign/mobile/',
];
const appBases = ['/kostudy/', ...previewBases];

assert.deepEqual(
  getAppRedirect('/kostudy/preview/lesson-redesign/mobile/dashboard', appBases),
  { base: '/kostudy/preview/lesson-redesign/mobile/', route: '/dashboard' },
  'nested preview branches resolve to the most specific base',
);
assert.equal(
  getAppRedirect('/kostudy/preview/lesson-redesign/', appBases),
  null,
  'the preview app root does not trigger a fallback redirect',
);
assert.equal(
  getAppRedirect('/kostudy/', appBases),
  null,
  'the main app root does not trigger a fallback redirect',
);
assert.deepEqual(
  getAppRedirect('/kostudy/dashboard', appBases),
  { base: '/kostudy/', route: '/dashboard' },
  'main app routes restore at the project Pages path',
);
assert.equal(
  getAppRedirect('/outside/dashboard', appBases),
  null,
  'paths outside published apps are not redirected',
);

const index = '<!doctype html><html><head></head><body><div id="root"></div></body></html>';
assert.equal(createPagesFallback(index, []), index, 'production fallback remains unchanged without previews');

const fallback = createPagesFallback(index, appBases);
assert.ok(fallback.indexOf(JSON.stringify(previewBases[1])) < fallback.indexOf(JSON.stringify(previewBases[0])));
assert.ok(fallback.indexOf(JSON.stringify(previewBases[0])) < fallback.indexOf(JSON.stringify('/kostudy/')));
assert.match(fallback, /__pages_route/);
assert.match(fallback, /window\.location\.replace/);

const escapedFallback = createPagesFallback(index, ['/kostudy/preview/</script>/']);
assert.ok(!escapedFallback.includes('</script></script>'));

console.log('Preview fallback routing tests passed.');
