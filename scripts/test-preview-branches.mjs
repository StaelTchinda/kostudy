import assert from 'node:assert/strict';
import { getPreviewBranches } from './preview-branches.mjs';

const previews = getPreviewBranches([
  { branch: 'main', sha: 'main-sha' },
  { branch: 'dev', sha: 'dev-sha' },
  { branch: 'preview/zeta', sha: 'zeta-sha' },
  { branch: 'preview/feature/lesson-redesign', sha: 'feature-sha' },
  { branch: 'preview/feature#2', sha: 'encoded-sha' },
]);

assert.deepEqual(
  previews.map(({ branch, basePath, destination, sha }) => ({ branch, basePath, destination, sha })),
  [
    {
      branch: 'preview/feature#2',
      basePath: '/kostudy/preview/feature%232/',
      destination: 'preview/feature%232',
      sha: 'encoded-sha',
    },
    {
      branch: 'preview/feature/lesson-redesign',
      basePath: '/kostudy/preview/feature/lesson-redesign/',
      destination: 'preview/feature/lesson-redesign',
      sha: 'feature-sha',
    },
    {
      branch: 'preview/zeta',
      basePath: '/kostudy/preview/zeta/',
      destination: 'preview/zeta',
      sha: 'zeta-sha',
    },
  ],
  'preview refs map deterministically to separate URL and artifact paths',
);

assert.deepEqual(getPreviewBranches([{ branch: 'main', sha: 'main-sha' }]), []);
assert.throws(
  () => getPreviewBranches([{ branch: 'preview/../escape', sha: 'bad-sha' }]),
  /invalid preview branch path/,
);

console.log('Preview branch mapping tests passed.');
