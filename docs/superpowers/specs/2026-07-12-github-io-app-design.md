# GitHub.io React App Design

Date: 2026-07-12

## Summary

Create a basic React app named `github.io` in this Nx monorepo as the first version of the user's GitHub Pages user site at `https://benkim0414.github.io/`.

The first version is only a generic app-shell layout. It does not include real portfolio content, deployment automation, or a visual theme switcher.

## Goals

- Add a Vite React application named `github.io`.
- Place the app under `apps/github.io`.
- Use the repository's pnpm workflow.
- Use Astryx as the UI/design-system foundation.
- Render a generic single-page app-shell skeleton.
- Keep the first scaffold minimal and verifiable.

## Non-Goals

- Do not add GitHub Actions or GitHub Pages deployment automation.
- Do not add Playwright or a new e2e test setup.
- Do not add real personal profile, resume, project, or contact content.
- Do not add a light/dark mode toggle in the first version.
- Do not hand-wire a Vite app when Nx generators can create the project shape.

## Repository Context

The repository is an Nx 19 monorepo using `nx/presets/npm.json`. It currently has `@nx/js` installed and does not yet include React support. The workspace uses pnpm, with `pnpm-lock.yaml`, `.npmrc`, and `pnpm-workspace.yaml`.

The current pnpm workspace only includes `packages/*`. Adding an application under `apps/github.io` requires updating the workspace package patterns so pnpm includes `apps/*`.

## Architecture

Use `@nx/react` to add React support to the workspace and generate a Vite React app named `github.io` under `apps/github.io`.

The app is a static client-rendered React application. It is intended for the GitHub Pages user-site root URL, but deployment is out of scope for the first implementation. Build and local verification are the only publishing-related requirements.

Astryx is the app's UI foundation. The implementation should import Astryx reset/base/theme CSS early in the app entry stylesheet or entry point, then wrap the React tree with Astryx theme infrastructure if required by the installed Astryx package APIs. Custom styles should use Astryx semantic tokens or supported Astryx styling paths instead of hardcoded color, spacing, and radius values where practical.

## UI Structure

The app renders a pure layout skeleton with generic labels only.

The visual direction is an app-shell feel:

- Sticky top bar.
- Generic brand label.
- Simple generic navigation labels.
- Constrained main content width.
- Main intro region with generic heading and subheading placeholders.
- Stacked placeholder sections for future portfolio content.
- Light section dividers.
- Quiet footer.

The page should avoid wrapping every section in cards. Cards may be used only where Astryx component semantics make them appropriate.

## Data And State

The first version has no external data, API calls, routing state, or persisted user state.

The app may contain static arrays for generic nav labels or placeholder section labels if that keeps rendering code clear.

## Error Handling

There are no runtime data-loading errors to handle in the first version.

Implementation should still preserve standard React/Vite failure visibility during development and avoid suppressing errors. Missing Astryx setup should fail visibly during build or local development rather than being hidden by fallback styling.

## Testing And Verification

Keep whatever basic unit or component test setup the Nx React generator provides by default. Do not add Playwright or a custom e2e setup.

Verification should include:

- Install/update dependencies with pnpm as needed.
- Run the generated app's build target.
- Run lint and test targets if the generator creates them.

If an expected verification target does not exist after generation, record that explicitly during implementation.

## Implementation Constraints

- Use pnpm commands for dependency and script execution.
- Prefer Nx generators for adding React support and creating the app.
- Keep changes scoped to the new app and required workspace configuration.
- Stage explicit paths only when committing.
- Use conventional commit messages.

