# Implementation Plan: Personal GitHub Pages Deployment

Source spec: [docs/ideas/github-pages-deployment.md](../docs/ideas/github-pages-deployment.md)
Follow-up spec: [docs/ideas/github-pages-preview-delta.md](../docs/ideas/github-pages-preview-delta.md)

## Overview

Publish static GitHub Pages previews for branches under `preview/*`. Preserve existing AI code for other builds, hide AI in each preview build, and make publishing explicitly opt-in through the repository Actions variable `ENABLE_PAGES_DEPLOY=true`.
Only preview builds are published; the Pages site root has no KoStudy app. Do not write to `main` or `dev`.

## Architecture Decisions

- Keep the existing BrowserRouter paths; configure the Pages base path and a static-host fallback rather than changing app URLs.
- Use `VITE_ENABLE_AI=false` only for the Pages build; keep AI enabled by default for local/other builds.
- Gate the Pages deploy job with `vars.ENABLE_PAGES_DEPLOY == 'true'`. An unset variable must never publish; the existing production-build workflow remains independent.
- Keep PWA manifest, icons, app assets, and service-worker scope under the Pages base path.
- Build each active preview from its own branch; combine only preview outputs into one GitHub Pages artifact.
- Map branch suffixes to URL paths under `/kostudy/preview/`; publish no app at the root and support nested-route refreshes.
- Keep browser storage shared between previews; document use of a separate browser profile when isolation is needed.
- Do not push commits to `main` or `dev`. The initial preview will use a new `preview/github-pages-deployment` branch.

## Task List

### Phase 1: Static-host compatibility

- [x] Task 1: Supporting the GitHub Pages project path and PWA

### Checkpoint: Static app foundation

- [x] Root-path local builds still work; Pages-path assets, PWA, direct routes, and refreshes work.

### Phase 2: AI-free Pages experience

- [x] Task 2: Hiding AI entry points in the Pages build

### Checkpoint: Pages experience

- [x] Pages build exposes core learning flows without AI links, routes, controls, or key setup; other builds retain AI.

### Phase 3: Opt-in publishing

- [x] Task 3: Adding the gated Pages workflow and setup documentation

### Checkpoint: Deployment ready

- [x] `preview/*` branches build automatically; Pages publication remains skipped unless explicitly enabled.
- [x] Repository setup, preview URL behavior, and opt-in variable are documented.
- [x] Required build checks and browser verification pass. Full-repository lint still reports pre-existing errors.

### Phase 4: Preview route fallback

- [x] Task 4: Routing nested preview requests to the matching app build

### Checkpoint: Preview routing

- [x] Preview deep links load the matching branch build after refresh; the root fallback contains no app build.

### Phase 5: Preview-only publishing

- [x] Task 5: Combining per-branch preview artifacts
- [x] Task 6: Publishing and verifying the first preview URL

### Checkpoint: Preview deployment

- [x] The artifact contains preview paths only; `main`/`dev` refs are unchanged.

## Task Details

### Task 1: Supporting the GitHub Pages project path and PWA

**Description:** Configure Vite and React routing for the repository's Pages path. Correct root-relative HTML/PWA asset and service-worker paths, and provide a GitHub Pages fallback for direct route loads and refreshes without changing local development behavior.

**Acceptance criteria:**

- [x] A Pages-path build loads its scripts, styles, icons, manifest, and service worker from the repository subpath; a normal local build still uses `/`.
- [x] PWA start URL/scope, cached resources, and installation assets work under that subpath.
- [x] BrowserRouter routes load directly and survive refresh on GitHub Pages-style static hosting.

**Verification:**

- [x] Add focused build-output validation before changing the implementation.
- [x] Run `npm run build` and build with the Pages base path.
- [x] Preview the app and browser-check direct routes and refresh; validate Pages PWA paths in the artifact.

**Dependencies:** None

**Files likely touched:**

- `vite.config.ts`
- `index.html`
- `public/manifest.json`
- `public/sw.js`
- `src/App.tsx`
- `scripts/validate-pages-build.mjs`

**Estimated scope:** Medium

### Task 2: Hiding AI entry points in the Pages build

**Description:** Introduce a build-time AI availability flag and use it to hide AI-only navigation, routes, marketing, settings, and actions in the Pages build. Preserve current AI behavior when the flag is unset or enabled.

**Acceptance criteria:**

- [x] The Pages build has no visible AI-only navigation, generator/tutor/voice actions, routes, or Gemini-key setup.
- [x] Core quizzes, lessons, personal progress, question editing, and import/export remain available.
- [x] A default non-Pages build retains the existing AI surfaces and behavior.

**Verification:**

- [x] Add focused validation for the disabled build before changing the UI.
- [x] Run relevant repository validators and build both modes.
- [x] Browser-check hidden AI surfaces and preserved core routes in the Pages build.

**Dependencies:** None

**Files likely touched:**

- `src/vite-env.d.ts`
- `src/config.ts`
- `src/App.tsx`
- `src/components/BottomNav.tsx`
- `src/screens/LandingPage.tsx`
- `src/screens/DashboardScreen.tsx`
- `src/screens/SettingsScreen.tsx`
- `src/screens/QuestionBankScreen.tsx`
- AI-related screen components

**Estimated scope:** Large; keep the shared flag small and cover all entry points in one focused slice.

### Task 3: Adding the gated Pages workflow and setup documentation

**Description:** Add a GitHub Actions workflow for preview branch builds. Build and assemble active `preview/*` branches, and deploy only when the repository Actions variable `ENABLE_PAGES_DEPLOY` is exactly `true`; document the one-time setup and opt-in.

**Acceptance criteria:**

- [x] An unset or false `ENABLE_PAGES_DEPLOY` skips publication; setting it to `true` enables preview deployment.
- [x] The Pages build sets the base path and disables AI, uses only required Pages permissions, and uploads the built artifact.
- [x] README explains the public Pages URL, one-time Pages configuration, and how to enable/disable publication.

**Verification:**

- [x] Run `npm run check` and the Pages-build validator.
- [x] Review the workflow trigger, permissions, environment, and deploy condition.
- [x] Confirm no API key or other secret is required for static hosting.

**Dependencies:** Tasks 1 and 2

**Files likely touched:**

- `.github/workflows/deploy-pages.yml`
- `README.md`
- `package.json` (only if a focused Pages build command is needed)

**Estimated scope:** Medium

### Task 4: Routing nested preview requests to the matching app build

**Description:** Extend the Pages fallback so requests below each preview branch path are sent to that preview's built index while preserving the requested client route. The root fallback must not include a production app.

**Acceptance criteria:**

- [x] The generated Pages `404.html` distinguishes known preview base paths and otherwise renders a plain not-found message.
- [x] A preview deep link and refresh load the matching preview app and retain its client route.
- [x] No production `index.html` is emitted at the site root, including when there are no preview branches.

**Verification:**

- [x] Add failing Node-based fallback/route tests before changing the implementation.
- [x] Build at a nested preview base path and validate route and PWA paths.
- [x] Browser-check the site-root 404 and a preview nested route through refresh.

**Dependencies:** Task 1

**Files likely touched:**

- `index.html`
- `src/main.tsx`
- `scripts/create-pages-fallback.mjs`
- `scripts/validate-pages-build.mjs`

**Estimated scope:** Medium

### Task 5: Combining per-branch preview artifacts

**Description:** Discover active `preview/*` branches, build each from its own ref, then assemble a preview-only Pages artifact with branch-suffixed paths. Preserve the existing exact-`true` deploy gate.

**Acceptance criteria:**

- [x] The Pages artifact contains all active preview branches at `/kostudy/preview/<suffix>/` and no root app.
- [x] Preview pushes cannot replace another branch's preview; deleting a preview branch removes its URL on the next deployment.
- [x] An absent/false `ENABLE_PAGES_DEPLOY` never publishes; AI remains disabled in all published builds.

**Verification:**

- [x] Add focused branch-list/artifact-layout validation for zero, one, and multiple preview branches.
- [x] Parse the workflow and build a local preview-only artifact with two preview fixtures.
- [x] Confirm workflow job permissions and deployment condition preserve the existing opt-in.

**Dependencies:** Task 4

**Files likely touched:**

- `.github/workflows/deploy-pages.yml`
- `scripts/list-preview-branches.mjs`
- `scripts/assemble-pages-artifact.mjs`

**Estimated scope:** Medium

### Task 6: Publishing and verifying the first preview URL

**Description:** Create and publish `preview/github-pages-deployment` from the current feature work, then verify its public preview URL. Do not write to `main` or `dev`.

**Acceptance criteria:**

- [x] The `preview/github-pages-deployment` branch deploys at `/kostudy/preview/github-pages-deployment/`.
- [x] The Pages root has no app build; the existing Netlify deployment remains unchanged.
- [x] Preview setup documents shared browser storage and how to remove a preview branch.
- [x] No changes are pushed to `main` or `dev`.

**Verification:**

- [x] Confirm `ENABLE_PAGES_DEPLOY=true` is present; do not change it unless the user approves.
- [x] Push only the preview branch and verify its GitHub Actions run and public URL.
- [x] Confirm direct route refresh works at the preview URL.

**Dependencies:** Task 5

**Files likely touched:**

- `README.md`
- `docs/agent-work/github-pages-deployment.md`

**Estimated scope:** Medium

## Risks and Mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Root-relative PWA paths or duplicate service-worker registration bypass the Pages base | High | Validate the built output and check the actual service-worker scope in a browser. |
| AI surfaces are distributed across routes, navigation, settings, and marketing | Medium | Use one build flag and explicitly validate every discovered entry point in both modes. |
| Repository variable is absent or mistyped | Low | Require an exact `true` value; default to a skipped deploy job and document the setting. |
| Existing CI and Pages builds diverge | Medium | Leave the existing production-build workflow independent and reuse its install/build conventions. |
| Preview artifact contains unintended root app files or loses other previews | High | Assemble only preview artifacts, include every active preview branch, and validate the combined output before deployment. |
| GitHub Pages returns the root 404 page for nested preview routes | High | Generate a branch-aware fallback map and test deep links/refreshes in a browser. |
| Preview changes share browser storage with production | Medium | Disclose the same-origin behavior; use a separate browser profile when isolation is needed. |

## Open Questions

- None. The user approved per-branch previews for `preview/*`, shared browser storage, the `/kostudy/preview/` path, and the no-changes-to-`main`-or-`dev` constraint.
