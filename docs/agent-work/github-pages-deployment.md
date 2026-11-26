# GitHub Pages Deployment

Project ID: `kostudy`
Status: `verification`
Temperature: `active`

## Objective

Publish public, AI-disabled previews for `preview/*` branches under the repository's GitHub Pages path. Do not modify `main` or `dev`; the Pages root intentionally contains no KoStudy app, and the existing Netlify deployment is unaffected.

## Approved Scope

- GitHub Actions discovers all active `preview/*` branches and assembles their builds into one Pages artifact.
- A branch `preview/<suffix>` is served at `/kostudy/preview/<suffix>/`; deep routes are restored through a top-level 404 router.
- Each preview build sets `VITE_ENABLE_AI=false`; other builds retain existing behavior.
- Only preview paths and a minimal root 404 page are published. No production app is built from `main` or `dev`.
- Deployment requires the Actions repository variable `ENABLE_PAGES_DEPLOY=true`.
- Preview paths share browser storage with each other. Netlify is on a different origin.
- No custom domain, authentication, account sync, or AI backend.

## Current Evidence

- `PAGES_BASE_PATH=/kostudy/preview/github-pages-deployment/ VITE_ENABLE_AI=false npm run build:pages` passes, including PWA-path and AI-bundle validators.
- `npm run check`, preview routing/branch/assembly tests, workflow YAML parsing, targeted ESLint, and `git diff --check` pass.
- Browser verification against an assembled preview-only fixture confirmed `/kostudy/preview/github-pages-deployment/dashboard` survives a refresh, while `/kostudy/` shows only the intended 404.
- The assembly test covers two preview artifacts and an empty preview list; the root output contains no app `index.html`.
- `ENABLE_PAGES_DEPLOY` is currently `true`. There are no remote `preview/*` branches yet.
- The `main` and `dev` remote refs were both `f1169605b39e4da13cccf83ff1c599d6c1d091d8` when checked; neither was modified.
- Workflow YAML parses; `actionlint` is not installed.
- The global registry lookup at `youssef-imlyhen/ai-workspace/projects-registry/` returned HTTP 404. The local project ID is `kostudy`; no global registry entry was changed.
- The worktree has unrelated pre-existing changes; preserve them and commit only deployment files.

## Decisions

- Specs: `docs/ideas/github-pages-deployment.md`, `docs/ideas/github-pages-preview-delta.md`
- Plan: `tasks/plan.md`
- Tasks: `tasks/todo.md`
- Use `VITE_ENABLE_AI=false` for Pages builds, defaulting to current behavior elsewhere.
- Gate publishing on `vars.ENABLE_PAGES_DEPLOY == 'true'`; do not treat it as a secret.
- Build and publish preview paths only. The site root remains a 404 and the current Netlify deployment is not changed.

## Verification

The preview artifact and nested-route behavior are verified locally. Public deployment still requires creating and pushing `preview/github-pages-deployment`; then verify the Actions run and public URL.

## Next Action

Commit the deployment-only changes on the preview branch, push it, and verify `https://staeltchinda.github.io/kostudy/preview/github-pages-deployment/`. Do not push to `main` or `dev`.
