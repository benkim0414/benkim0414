# GitHub.io Agent Guidelines Design

## Goal

Create an app-scoped `apps/github.io/AGENTS.md` that tells AI agents how to develop the `github.io` app consistently. The file should be strict, concise, and enforceable. It should prevent UI drift by requiring official Astryx guidance, React best practices, and careful third-party component integration before agents change app code.

## Scope

In scope:

- Add `apps/github.io/AGENTS.md`.
- Define app-local rules for UI development, styling, React implementation, third-party UI/chart components, Storybook visual QA, and focused Nx verification.
- Ground the rules in official Astryx documentation and official React guidance.
- Include the existing repo workflow constraints where they affect `github.io`, especially pnpm/Nx commands and app-scoped verification.

Out of scope:

- Do not create or update `apps/github.io/README.md`.
- Do not change app components, stories, tests, build config, or dependencies.
- Do not replace root `AGENTS.md`; the app-local file supplements it for files under `apps/github.io`.

## Research Inputs

Official Astryx guidance used for the rules:

- `pnpm exec astryx docs principles`
- `pnpm exec astryx docs styling`
- `pnpm exec astryx docs styling-libraries`
- `pnpm exec astryx docs layout`
- `pnpm exec astryx docs spacing`
- `pnpm exec astryx docs typography`
- `pnpm exec astryx docs working-with-ai`

Official React guidance used for the rules:

- React components and hooks must be pure.
- React function components are preferred for new code.
- State should avoid redundant or duplicated values.
- Controlled inputs should keep value and change handling explicit.
- Lists need stable keys from data rather than generated keys.
- Memoization should be used for clear performance reasons, not as a default style.

Third-party chart guidance used for the rules:

- MUI X charts can size from `height` and/or `width` props, or fill a parent with intrinsic dimensions.
- For responsive MUI X charts, the parent must have intrinsic dimensions.
- MUI X chart defaults should be preserved unless there is a documented visual or product reason to override them.

## Recommended Approach

Create one strict `apps/github.io/AGENTS.md` with short rule sections:

1. App scope
2. Required pre-change checks
3. Astryx-first UI rules
4. Styling rules
5. React rules
6. Third-party component rules
7. Storybook and visual QA
8. Verification commands

The file should read as instructions, not a tutorial. It should use `must`, `must not`, and `only` for hard requirements. Use `prefer` only where a tradeoff may be legitimate, such as choosing the smallest focused Nx verification command.

## Key Rules

### Required Pre-Change Checks

Before any `github.io` UI change, agents must check relevant official Astryx docs with `pnpm exec astryx docs <topic>`. If they use or modify an Astryx component, they must inspect the component docs with the Astryx CLI or other official Astryx source before changing its props or styling.

For third-party UI/chart components, agents must check that library's official docs before changing sizing, styling, layout behavior, or integration patterns.

### Astryx-First UI

Agents must use Astryx components for UI covered by the design system before using raw HTML or another component library. Astryx default component styles should remain intact unless the change has a specific product or accessibility reason.

Agents must not invent Astryx props. They must verify component props from official docs.

### Styling

Agents must use semantic Astryx tokens for colors, spacing, radius, typography, shadow, and layout values. They must not hardcode colors or arbitrary spacing/radius/type values in normal app styling.

StyleX `xstyle` should be used for component-specific Astryx overrides. Tailwind utilities backed by the Astryx theme bridge may be used for layout and wrapper styling. Scoped global CSS is only allowed for generated or third-party DOM that cannot be reached through a component API.

Hover styles in StyleX must use a hover-capable media guard. New CSS selectors targeting Astryx components must use stable Astryx classes plus data attributes rather than deprecated bare prop/state classes.

### React

Agents must write new React components as function components. Render logic must stay pure and side effects must stay in event handlers or effects. State should be minimal and derived data should be computed during render unless caching is justified.

Inputs must be controlled when the component owns form state. Lists must use stable keys from data. Agents must not use array indexes, random values, or generated values as keys when list ordering can change.

Memoization must not be added by default. Use `useMemo`, `useCallback`, or `memo` only when there is a clear expensive computation, referential stability requirement, or measured performance issue.

### Third-Party Components

When a third-party component is required, agents must preserve that component's default structure, spacing, and behavior as much as possible. Local styling should be limited to mapping Astryx color and text tokens into the third-party API.

For MUI X charts such as `RadarChart`, agents must follow MUI X sizing guidance. Use either explicit chart dimensions or a parent with intrinsic dimensions. Do not override MUI chart margins, axes, series internals, or generated classes unless a visual bug requires it and the reason is documented near the code or in a solution doc.

### Storybook and Visual QA

Components developed under `apps/github.io` must have focused Storybook coverage when they are visual, reusable, or user-facing. Agents must use Storybook for visual review and must support host/port configuration when the user wants to inspect from another device over Tailscale or local network.

Before claiming a visual fix is complete, agents must verify the relevant story in a browser or explain why visual verification was not run.

### Verification

For `github.io` changes, agents must run focused Nx checks relevant to the changed surface:

- `pnpm nx lint github.io`
- `pnpm nx test github.io`
- `pnpm nx build github.io`
- Storybook command or browser check when the change is visual

Agents must report any skipped verification and the reason.

## Risks

- The rules may become too broad if they duplicate root repository workflow instructions. Keep the app-local file focused on `github.io` UI and verification behavior.
- Requiring Astryx docs checks for every UI change adds a small cost. This is acceptable because the goal is to prevent design-system drift.
- Third-party components sometimes need custom dimensions or CSS for real bugs. The rules allow documented exceptions instead of banning customization completely.

## Acceptance Criteria

- `apps/github.io/AGENTS.md` exists.
- The file applies only to the `github.io` app and clearly supplements root `AGENTS.md`.
- The file requires official Astryx docs checks before every UI change.
- The file requires Astryx components and default styling first.
- The file requires React best practices for purity, state, controlled inputs, keys, and memoization.
- The file requires third-party component defaults first, with Astryx color/text styling applied through official APIs.
- The file includes the MUI X Radar sizing/style rule.
- The file includes Storybook and focused Nx verification expectations.
