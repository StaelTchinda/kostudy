import { appendFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import process from 'node:process';
import { getPreviewBranches } from './preview-branches.mjs';

const output = execFileSync('git', [
  'for-each-ref',
  '--format=%(refname:short)%09%(objectname)',
  'refs/remotes/origin/preview/',
], { encoding: 'utf8' });
const refs = output.trim().split('\n').filter(Boolean).map((line) => {
  const [remoteBranch, sha] = line.split('\t');
  return { branch: remoteBranch.replace(/^origin\//, ''), sha };
});
const previews = getPreviewBranches(refs);
const matrix = previews.length ? previews : [{ branch: '', sha: '', basePath: '', destination: '', artifactName: '' }];
const result = [
  `previews=${JSON.stringify(previews)}`,
  `preview_matrix=${JSON.stringify(matrix)}`,
  `has_previews=${previews.length > 0}`,
].join('\n') + '\n';

if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, result);
} else {
  process.stdout.write(result);
}
