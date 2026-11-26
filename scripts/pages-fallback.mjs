export function getAppRedirect(pathname, appBases) {
  const base = [...appBases]
    .sort((left, right) => right.length - left.length)
    .find((candidate) => pathname.startsWith(candidate));

  if (!base || pathname === base) return null;
  return { base, route: `/${pathname.slice(base.length)}` };
}

export function createPagesFallback(indexHtml, appBases = []) {
  if (!Array.isArray(appBases) || appBases.some((base) =>
    typeof base !== 'string' || !base.startsWith('/') || !base.endsWith('/') || base.includes('?') || base.includes('#')
  )) {
    throw new Error('App bases must be absolute URL paths ending in "/".');
  }

  if (appBases.length === 0) return indexHtml;

  const bases = JSON.stringify([...new Set(appBases)].sort((left, right) => right.length - left.length))
    .replace(/</g, '\\u003c');
  const resolver = getAppRedirect.toString();
  const script = `<script id="pages-app-fallback">const getAppRedirect = ${resolver};const redirect = getAppRedirect(window.location.pathname, ${bases});if (redirect) { const target = new URL(redirect.base, window.location.origin); target.search = window.location.search; target.searchParams.set("__pages_route", redirect.route); target.hash = window.location.hash; window.location.replace(target.href); }</script>`;

  if (!/<\/head>/i.test(indexHtml)) throw new Error('Cannot add preview fallback without an HTML head.');
  return indexHtml.replace(/<\/head>/i, `${script}</head>`);
}
