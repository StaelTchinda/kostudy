export function getPreviewRedirect(pathname, previewBases) {
  const base = [...previewBases]
    .sort((left, right) => right.length - left.length)
    .find((candidate) => pathname.startsWith(candidate) && pathname !== candidate);

  if (!base) return null;
  return { base, route: `/${pathname.slice(base.length)}` };
}

export function createPagesFallback(indexHtml, previewBases = []) {
  if (!Array.isArray(previewBases) || previewBases.some((base) =>
    typeof base !== 'string' || !base.startsWith('/') || !base.endsWith('/') || base.includes('?') || base.includes('#')
  )) {
    throw new Error('Preview bases must be absolute URL paths ending in "/".');
  }

  if (previewBases.length === 0) return indexHtml;

  const bases = JSON.stringify([...new Set(previewBases)].sort((left, right) => right.length - left.length))
    .replace(/</g, '\\u003c');
  const resolver = getPreviewRedirect.toString();
  const script = `<script id="pages-preview-fallback">const getPreviewRedirect = ${resolver};const redirect = getPreviewRedirect(window.location.pathname, ${bases});if (redirect) { const target = new URL(redirect.base, window.location.origin); target.search = window.location.search; target.searchParams.set("__pages_route", redirect.route); target.hash = window.location.hash; window.location.replace(target.href); }</script>`;

  if (!/<\/head>/i.test(indexHtml)) throw new Error('Cannot add preview fallback without an HTML head.');
  return indexHtml.replace(/<\/head>/i, `${script}</head>`);
}
