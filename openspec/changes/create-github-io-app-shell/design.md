## Context

The workspace is a pnpm-managed Nx monorepo with no existing application under `apps/` or `packages/`. The showcase will ultimately be served from `https://benkim0414.github.io/`, but this change only creates the source app and validates that it can build as a static Vite app.

## Goals / Non-Goals

**Goals:**

- Create the app through Nx generator output rather than hand-building project files.
- Use the selected stack: React, Vite, TypeScript, Vitest, and Playwright.
- Establish stable Nx target names for later changes to test and build against.
- Keep the generated app root-hosting compatible by using a root Vite base path.

**Non-Goals:**

- Do not add shadcn/ui, Tailwind, Fuse.js, skills data, search UI, or GitHub Actions deployment.
- Do not create or push to `benkim0414/benkim0414.github.io`.
- Do not change Node versions or package manager choices.

## Decisions

- Use `@nx/react:app` because Nx owns the workspace project graph and the user explicitly requested Nx's generator.
- Use Vite because it is the selected React bundler and produces straightforward static assets for GitHub Pages.
- Use TypeScript because the app will carry typed local data and search/filter state in later changes.
- Generate Vitest and Playwright up front so later TDD changes can add tests without retrofitting test infrastructure.
- Place the app at `apps/github.io` to match the user's selected app location while preserving the app name `github.io`.

## Risks / Trade-offs

- New Nx generator defaults may create files beyond the minimal app shell. Mitigation: keep edits scoped to generated output and review the diff before commit.
- Package installation may update `pnpm-lock.yaml`. Mitigation: verify with `pnpm install --frozen-lockfile` after generation.
- The dot in `github.io` may affect project-name escaping in generated target names. Mitigation: inspect `pnpm nx show project github.io --json` and use the generated project name consistently.
