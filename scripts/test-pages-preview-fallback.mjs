import assert from 'node:assert/strict';
import { createPagesFallback, getPreviewRedirect } from './pages-fallback.mjs';

const previewBases = [
  '/kostudy/preview/lesson-redesign/',
  '/kostudy/preview/lesson-redesign/mobile/',
];

assert.deepEqual(
  getPreviewRedirect('/kostudy/preview/lesson-redesign/mobile/dashboard', previewBases),
  { base: '/kostudy/preview/lesson-redesign/mobile/', route: '/dashboard' },
  'nested preview branches resolve to the most specific base',
);
assert.equal(
  getPreviewRedirect('/kostudy/preview/lesson-redesign/', previewBases),
  null,
  'the preview app root does not trigger a fallback redirect',
);
assert.equal(
  getPreviewRedirect('/kostudy/dashboard', previewBases),
  null,
  'production routes do not trigger a preview redirect',
);

const index = '<!doctype html><html><head></head><body><div id="root"></div></body></html>';
assert.equal(createPagesFallback(index, []), index, 'production fallback remains unchanged without previews');

const fallback = createPagesFallback(index, previewBases);
assert.ok(fallback.indexOf(JSON.stringify(previewBases[1])) < fallback.indexOf(JSON.stringify(previewBases[0])));
assert.match(fallback, /__pages_route/);
assert.match(fallback, /window\.location\.replace/);

const escapedFallback = createPagesFallback(index, ['/kostudy/preview/</script>/']);
assert.ok(!escapedFallback.includes('</script></script>'));

console.log('Preview fallback routing tests passed.');
