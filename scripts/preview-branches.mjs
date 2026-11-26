export function getPreviewBranches(refs) {
  return refs
    .filter(({ branch }) => branch.startsWith('preview/'))
    .sort((left, right) => left.branch < right.branch ? -1 : left.branch > right.branch ? 1 : 0)
    .map(({ branch, sha }, index) => {
      const suffix = branch.slice('preview/'.length);
      const segments = suffix.split('/');
      if (!suffix || segments.some((segment) => !segment || segment === '.' || segment === '..')) {
        throw new Error(`invalid preview branch path: ${branch}`);
      }

      const encodedSuffix = segments.map(encodeURIComponent).join('/');
      return {
        branch,
        sha,
        basePath: `/kostudy/preview/${encodedSuffix}/`,
        destination: `preview/${encodedSuffix}`,
        artifactName: `pages-preview-${index}`,
      };
    });
}
