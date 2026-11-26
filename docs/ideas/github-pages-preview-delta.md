# Spec Delta: GitHub Pages Per-Branch Previews

Status: accepted (preview-only publishing)

Source spec: [github-pages-deployment.md](./github-pages-deployment.md)

## Objective

Publish public test deployments for branches under `preview/*` without changing the `main` or `dev` branches. Publish preview builds under paths such as `/kostudy/preview/lesson-redesign/`; do not include a production app at `/kostudy/`.

## Current Behavior

The Pages build and artifact upload succeeded for the push to `github-pages-deployment`, but the deploy job was skipped because it is restricted to `main`. The existing deployment model publishes a single Pages artifact, so deploying a branch artifact directly would replace the production site.

## Accepted Scope

- On a Pages deployment, build every active `preview/*` branch from its own latest commit.
- Combine only preview builds in one Pages artifact, each at `/kostudy/preview/<suffix>/`. Do not build or publish a root app from `main`, `dev`, or another branch.
- The site root has no KoStudy app; the artifact contains only a minimal top-level 404 page needed to route preview deep links.
- Map `preview/<suffix>` to `/kostudy/preview/<suffix>/`, preserving the suffix's path segments. Each branch has an independent preview URL.
- Support direct routes and refreshes in preview builds.
- Keep `ENABLE_PAGES_DEPLOY=true` as the required opt-in for every deployment. Builds may run and upload intermediate artifacts while publication is disabled.
- Keep AI disabled in every preview build.
- Do not namespace browser storage. All previews share a GitHub Pages origin and therefore share localStorage/sessionStorage; users who need isolated test data can use a separate browser profile. The existing Netlify app is on a different origin.
- Rebuild all active previews on each preview deployment so one branch update does not silently erase other preview URLs. A deleted preview branch disappears from the site on the next deployment.
- The existing Netlify deployment and app are not changed.

## Success Criteria

- A push to any `preview/*` branch builds all active preview branches into one artifact.
- Each active preview branch is reachable at its corresponding `/kostudy/preview/<suffix>/` URL, and direct nested routes work after refresh.
- Multiple preview branches coexist without replacing one another.
- When `ENABLE_PAGES_DEPLOY` is absent or not exactly `true`, no artifact is published to GitHub Pages.
- No Gemini credentials, Netlify Function, or additional dependency is required.
- Neither the `main` nor `dev` branch is modified.

## Boundaries

- Do not publish a production app at the Pages site root as part of this preview deployment.
- Always retain the existing Pages opt-in variable and AI-disabled build policy.
- Do not isolate browser storage in this delta; disclose the shared-origin behavior in setup documentation.
- Ask before adding external deployment services, credentials, or dependencies.
- Never modify `main` or `dev`, commit secrets, or enable Pages publication implicitly.

## Open Questions

- None. The user chose `/kostudy/preview/`, per-branch URLs for branches under `preview/*`, and no storage-isolation refactor.
