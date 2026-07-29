# GitHub.io Agent Guidelines Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a strict app-scoped `apps/github.io/AGENTS.md` that tells AI agents how to develop the `github.io` app with Astryx, React, third-party components, Storybook, and focused Nx verification.

**Architecture:** This is a documentation-only change. The new app-local `AGENTS.md` supplements the root `AGENTS.md` for files under `apps/github.io` and must not duplicate broad repo workflow policy beyond the app-specific checks agents need while editing this app.

**Tech Stack:** Nx, pnpm, React, Storybook, Astryx, StyleX, Tailwind v4 Astryx bridge, MUI X Charts.

## Global Constraints

- Add `apps/github.io/AGENTS.md`.
- Do not create or update `apps/github.io/README.md`.
- Do not change app components, stories, tests, build config, or dependencies.
- Do not replace root `AGENTS.md`; the app-local file supplements it for files under `apps/github.io`.
- The file must be strict, concise, and enforceable.
- Before any `github.io` UI change, agents must check relevant official Astryx docs with `pnpm exec astryx docs <topic>`.
- Agents must use Astryx components and default styling first.
- Agents must follow React best practices for purity, minimal state, controlled inputs, stable keys, and measured memoization.
- Third-party components must keep their own default structure, spacing, and behavior; local styling is limited to Astryx color and text token mapping unless a documented visual bug requires an exception.
- MUI X Radar guidance must require official MUI X sizing rules and default chart behavior first.
- Visual, reusable, or user-facing components must have Storybook coverage and visual QA.

---

## File Structure

- Create `apps/github.io/AGENTS.md`
  - Responsibility: app-local AI agent rules for developing under `apps/github.io`.
  - Consumers: Codex, other AI coding agents, and humans reviewing agent behavior.
  - Boundary: app-specific UI, React, Astryx, third-party component, Storybook, and verification rules only.
- No other files should be modified.

## Task 1: Add App-Scoped Agent Rules

**Files:**
- Create: `apps/github.io/AGENTS.md`

**Interfaces:**
- Consumes: root `AGENTS.md` repository rules.
- Produces: app-local instructions automatically applied to work under `apps/github.io`.

- [ ] **Step 1: Confirm current app docs state**

Run:

```bash
test ! -f apps/github.io/AGENTS.md
test ! -f apps/github.io/README.md
```

Expected: both commands exit successfully, confirming the task will create only the app-local `AGENTS.md` and will not edit a README.

- [ ] **Step 2: Re-check official Astryx guidance**

Run:

```bash
pnpm exec astryx docs principles
pnpm exec astryx docs styling
pnpm exec astryx docs styling-libraries
pnpm exec astryx docs layout
pnpm exec astryx docs typography
pnpm exec astryx docs working-with-ai
```

Expected: commands print official Astryx guidance for component-first UI, tokens, StyleX/Tailwind, third-party styling interop, layout, typography, and AI agent workflow.

- [ ] **Step 3: Create `apps/github.io/AGENTS.md`**

Write this content:

```markdown
# Agent Instructions for github.io

These instructions apply to files under `apps/github.io`. They supplement the repository root `AGENTS.md`; follow the root workflow and git rules first, then apply these app-specific UI rules.

## App Scope

- Treat `github.io` as an Nx React application built with pnpm, Astryx, StyleX, Tailwind utilities backed by Astryx tokens, Storybook, and selected third-party visualization libraries.
- Do not add app-level dependencies, styling systems, component libraries, or build tooling without an approved spec.
- Do not create or update `apps/github.io/README.md` unless the user explicitly asks for it.

## Required Pre-Change Checks

- Before any UI change, run the relevant official Astryx docs command, for example `pnpm exec astryx docs principles`, `pnpm exec astryx docs styling`, `pnpm exec astryx docs layout`, `pnpm exec astryx docs typography`, or `pnpm exec astryx docs styling-libraries`.
- Before using or modifying an Astryx component, inspect that component's official docs with the Astryx CLI or another official Astryx source. Do not invent props.
- Before changing a third-party UI or chart component, check that library's official docs for sizing, styling, layout, and integration guidance.
- Mention the docs checked in the implementation notes or final handoff when the change touches UI.

## Astryx-First UI

- Use Astryx components for every UI surface the design system covers before reaching for raw HTML or another component library.
- Keep Astryx default component styles unless there is a specific product, accessibility, or documented visual reason to override them.
- Use Astryx layout guidance before arranging a page or component: decide the frame, region budgets, container policy, and responsive behavior before writing markup.
- Dense scannable data must render as rows, lists, or tables. Do not wrap every item or section in cards.
- Use `Card` only for self-contained widgets, galleries, settings groups, or genuinely framed tools. Do not nest cards.
- Use `Badge` only for counts or enumerated states. Use status or token-style affordances for metadata/status when Astryx provides them.

## Styling Rules

- Use semantic Astryx tokens for colors, spacing, radius, shadow, typography, and size.
- Do not hardcode colors, arbitrary spacing, arbitrary radii, or manual typography values in normal app styling.
- Use Astryx component props for spacing and structure when available.
- Use StyleX `xstyle` for component-specific overrides and reusable local styles.
- Use Tailwind utilities only when they are backed by the Astryx Tailwind bridge and are appropriate for layout or wrapper styling.
- Use scoped global CSS only for generated or third-party DOM that cannot be styled through a public component API.
- New CSS selectors targeting Astryx components must use stable `.astryx-*` classes plus reflected `data-*` attributes. Do not target deprecated bare prop/state classes.
- StyleX hover styles must be guarded with `@media (hover: hover)`.
- Use CSS custom properties or Astryx typed StyleX token exports for DOM styling. Use token resolver APIs only for non-CSS consumers such as chart configuration, canvas, or SVG APIs that cannot consume CSS variables.

## React Rules

- Write new React components as function components.
- Keep render logic pure. Do not cause side effects during render.
- Keep side effects in event handlers or effects with explicit dependencies.
- Keep state minimal. Do not store values that can be derived from props or existing state during render.
- Use controlled inputs when a component owns form state.
- Use stable keys from data for lists. Do not use array indexes, random values, or generated values as keys when list order can change.
- Do not add `useMemo`, `useCallback`, or `memo` by default. Add memoization only for a clear expensive computation, referential stability requirement, or measured performance issue.
- Keep components small enough to review. Extract helpers or child components when a file is mixing unrelated responsibilities.

## Third-Party Components

- Use third-party UI or chart components only when Astryx does not cover the capability or when the app already uses the library for that domain.
- Preserve the third-party component's default structure, behavior, spacing, and layout. Apply only Astryx color and text styles unless a documented visual bug requires an exception.
- Apply Astryx styling to third-party components by mapping Astryx color and text tokens into the third-party component's public styling API.
- Restyle third-party internals through generated or internal classes only for a documented visual bug when no public API exists, and keep the selector narrowly scoped.
- For MUI X Charts, including `RadarChart`, follow official MUI X sizing guidance. Provide explicit chart dimensions or a parent with intrinsic dimensions.
- For MUI X `RadarChart`, keep MUI X default radar spacing, margins, axes, and series behavior unless a visual bug requires a documented exception. Apply only Astryx color and text-size styling by default.

## Storybook and Visual QA

- Add or update focused Storybook stories for visual, reusable, or user-facing components.
- Use Storybook for visual review before claiming a visual change is complete.
- When the user asks to inspect from iPad or another device over Tailscale/VPN, run Storybook with an externally reachable host and report the usable URL.
- If visual verification cannot be run, state the exact reason in the final handoff.
- Check that text, labels, chart axes, buttons, and cards do not clip or overlap across relevant desktop and mobile viewports.

## Verification

- Use focused Nx commands for this app:
  - `pnpm nx lint github.io`
  - `pnpm nx test github.io`
  - `pnpm nx build github.io`
- Run Storybook or browser visual checks when the change affects UI.
- Report every skipped verification command and why it was skipped.
```

- [ ] **Step 4: Inspect the created file**

Run:

```bash
sed -n '1,260p' apps/github.io/AGENTS.md
rg -n "README|must|Do not|Astryx|React|MUI X|Storybook|pnpm nx" apps/github.io/AGENTS.md
```

Expected: the file exists, is app-scoped, excludes README creation, and contains strict Astryx, React, third-party, Storybook, and verification rules.

- [ ] **Step 5: Verify no unintended files changed**

Run:

```bash
git status --short
```

Expected: only `apps/github.io/AGENTS.md` is modified or untracked.

- [ ] **Step 6: Run docs-focused verification**

Run:

```bash
pnpm nx lint github.io
```

Expected: lint passes. Full test/build are not required for this documentation-only change unless local policy or a reviewer asks for them.

- [ ] **Step 7: Commit**

Run:

```bash
git add apps/github.io/AGENTS.md
git diff --cached -- apps/github.io/AGENTS.md
git commit -m "docs(github.io): add app agent guidelines"
```

Expected: one commit containing only `apps/github.io/AGENTS.md`.
