# Personal GitHub Pages Deployment Tasks

## Phase 1: Static-host compatibility

- [x] Task 1: Supporting the GitHub Pages project path and PWA

### Checkpoint: Static app foundation

- [x] Local root-path build remains functional.
- [x] Pages-path assets, PWA, direct routes, and refreshes work.

## Phase 2: AI-free Pages experience

- [x] Task 2: Hiding AI entry points in the Pages build

### Checkpoint: Pages experience

- [x] AI surfaces are hidden in the Pages build and preserved in other builds.
- [x] Core learning and question-management flows work.

## Phase 3: Opt-in publishing

- [x] Task 3: Adding the gated Pages workflow and setup documentation

### Checkpoint: Deployment ready

- [x] `preview/*` branches build automatically; publishing is skipped unless `ENABLE_PAGES_DEPLOY=true`.
- [x] README documents preview URLs, one-time setup, and the opt-in.
- [x] Build checks, Pages-output validation, workflow syntax, and browser checks pass. Full-repository lint has pre-existing errors.

## Phase 4: Preview route fallback

- [x] Task 4: Routing nested preview requests to the matching app build

### Checkpoint: Preview routing

- [x] Preview deep links load the matching branch build after refresh; the root fallback contains no app build.

## Phase 5: Preview-only publishing

- [x] Task 5: Combining per-branch preview artifacts
- [x] Task 6: Publishing and verifying `https://staeltchinda.github.io/kostudy/preview/github-pages-deployment/`

### Checkpoint: Preview deployment

- [x] The artifact contains preview paths only, and `main`/`dev` refs are unchanged.
