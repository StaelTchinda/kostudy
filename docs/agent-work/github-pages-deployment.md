# GitHub Pages Deployment

Project ID: `kostudy`
Status: `active`
Temperature: `warm`

## Objective

Publish the AI-disabled main app from `main` at `https://staeltchinda.github.io/kostudy/` and active `preview/*` branches under `/kostudy/preview/<branch>/`, assembled into one GitHub Pages artifact. Do not change Netlify.

## Approved Scope

- Build main from the `main` ref and previews from active `preview/*` refs.
- Publish main and previews together so separate updates cannot replace one another's files.
- Preserve per-build Vite router, PWA manifest, and service-worker base paths.
- Restore deep routes for both main and preview apps through the top-level Pages fallback.
- Disable AI features for every Pages build.
- Trigger publishing on main and preview branch updates, gated by `ENABLE_PAGES_DEPLOY=true` and the existing `github-pages` environment.
- Do not merge or deploy during preparation; those actions require separate authorization.

## Prior Deployment Evidence

- The previous workflow published previews only and left the Pages root as a 404.
- The preview URL `https://staeltchinda.github.io/kostudy/preview/github-pages-deployment/` was live.
- The prior workflow run `45801421420` completed successfully for the preview documentation branch.
- Pages uses the repository path `/kostudy/`; the app is not intended for the account root.

## Current Implementation

- The workflow builds main at `/kostudy/` and each preview at its own nested path, then assembles one artifact.
- The top-level fallback routes deep links to the correct app base, preferring the longest matching preview path.
- Deployment is serialized and restricted to `main` or `preview/*` workflow refs.
- The existing `preview/github-pages-deployment` ref still has the old preview-only workflow; a separate draft sync PR must update it before future pushes to that ref.
- Root and nested build validation and artifact assembly tests are included.

## Verification

- `npm run test:pages-preview` passes, including main-route fallback and root-plus-preview artifact assembly.
- `PAGES_BASE_PATH=/kostudy/ VITE_ENABLE_AI=false npm run build:pages` passes.
- `PAGES_BASE_PATH=/kostudy/preview/github-pages-deployment/ VITE_ENABLE_AI=false npm run build:pages` passes.
- Builds emit existing Tailwind utility and large-chunk warnings; no new build errors were observed.
- No GitHub Pages deployment has been triggered by this work.
- The sync PR stays draft until the main app is ready; merging it after the main promotion triggers the unified deployment.

## Next Action

Review the root-plus-preview PR on the dependency-aware branch train. Do not deploy until the user separately authorizes the main release.
