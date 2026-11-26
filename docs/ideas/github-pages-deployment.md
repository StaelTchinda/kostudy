# Personal GitHub Pages Deployment

## Problem Statement

How might we publish KoStudy's core learning app at a stable URL under the repository owner's control, with automatic builds and no ongoing Netlify dependency?

## Recommended Direction

Use GitHub Actions to build and publish the static Vite app to GitHub Pages on updates to `main`. Keep AI code available in the source and other builds, but hide AI features in the Pages build. Core quiz and learning flows do not need the Netlify Function.

Publishing must be opt-in: the Pages deploy job is skipped unless the repository Actions variable `ENABLE_PAGES_DEPLOY` is explicitly set to `true` in GitHub Settings. The build may still run while deployment is disabled.

## Key Assumptions to Validate

- [x] The public GitHub Pages URL is acceptable; the app does not need authentication.
- [x] Core quizzes and learning flows work without AI or a server backend.
- [x] A one-time GitHub Pages/Actions setup is acceptable.

## MVP Scope

- Configure the Vite base path, React routes, PWA manifest, assets, and service worker for the project Pages URL, including direct route loads and refreshes.
- Hide AI entry points in the Pages build while preserving the existing AI implementation for other builds.
- Add a GitHub Actions workflow that builds on `main` and deploys only when `ENABLE_PAGES_DEPLOY=true`.
- Document enabling Pages and setting the opt-in variable.
- Preserve quiz, lesson, progress, question editing, import/export, and other client-side behavior.

## Not Doing (and Why)

- Adding or migrating an AI backend — AI is not needed for this personal deployment.
- Custom domain, authentication, or account/data sync — outside the requested simple public site.
- Removing AI support from the source — the requested deployment can hide it without deleting existing capabilities.
- Unrelated app or dependency changes — keep the release focused.

## Open Questions

- None before planning.
