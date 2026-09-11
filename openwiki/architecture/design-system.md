---
type: architecture
title: Design system and layout
description: How Astryx, StyleX, theme persistence, and browser layout checks fit together.
tags: [astryx, stylex, theme, layout]
verified:
  - by: openwiki/0.5.0
    at: 2026-09-09T10:46:58.649Z
sources:
  - id: openwiki-source-45b1d77b308bd57403f55ff9
    resource: repo://apps/github.io/.storybook/story-taxonomy.spec.ts
  - id: openwiki-source-a099837b8e8614c677082a9d
    resource: repo://apps/github.io/project.json
  - id: openwiki-source-06c5610bae8f93d17bf2ff2d
    resource: repo://apps/github.io/src/app/count-badge.stories.tsx
  - id: openwiki-source-43db7fa7bd3bd05d549bdc0a
    resource: repo://apps/github.io/src/app/count-badge.tsx
  - id: openwiki-source-931cab7abf1d26363f1a35b7
    resource: repo://apps/github.io/src/app/devops-roadmap/devops-roadmap-stepper.tsx
  - id: openwiki-source-0e64d2f01d205d55b34c0576
    resource: repo://apps/github.io/src/app/devops-roadmap/roadmap-page.spec.tsx
  - id: openwiki-source-ddb555a1fa50192a107dbf5f
    resource: repo://apps/github.io/src/app/devops-roadmap/roadmap-page.tsx
  - id: openwiki-source-8d32c84f2bba5106749ff558
    resource: repo://apps/github.io/src/app/global-navigation-footer.spec.tsx
  - id: openwiki-source-4885e601d28992a8b288dabf
    resource: repo://apps/github.io/src/app/global-navigation-footer.tsx
  - id: openwiki-source-5dbaa213d52c3aac678d1838
    resource: repo://apps/github.io/src/app/global-navigation-layout.tsx
  - id: openwiki-source-9a75dff41bf8e0bd1f49b6bc
    resource: repo://apps/github.io/src/app/home/home-page.spec.tsx
  - id: openwiki-source-0e3b0dfb231db070ffd8340f
    resource: repo://apps/github.io/src/app/home/home-page.tsx
  - id: openwiki-source-4fbf5ecc6f0c1fc5eff98141
    resource: repo://apps/github.io/src/app/skills/skills-page.spec.tsx
  - id: openwiki-source-a845ec3d01c38967df3a4dad
    resource: repo://apps/github.io/src/app/skills/skills-page.tsx
  - id: openwiki-source-dec673c983d1738cf99fce82
    resource: repo://apps/github.io/src/app/theme-mode.tsx
  - id: openwiki-source-74580f69125800ca269fab95
    resource: repo://apps/github.io/src/styles.css
  - id: openwiki-source-fcfa3ced1d03143bb27d5018
    resource: repo://apps/github.io/vite.config.ts
generated: { by: "codex", at: "2026-09-09T06:35:50.795Z" }
---

# Design system and layout

The application combines Astryx components and neutral theme tokens with
StyleX-authored local styles. The global stylesheet establishes explicit CSS
layers: reset and theme/base layers precede StyleX, with utilities last. It also
imports Astryx's reset, component styles, and neutral theme. Keep third-party
overrides scoped: the existing carousel adjustment targets `.skill-carousel`,
not every card in the application.

App-owned visible headings use Astryx `Heading` at their semantic level rather
than rendering heading tags through `Text`. The Home labels `Top skills` and
`DORA capabilities`, the Skills label, and the DevOps roadmap label are level-two
headings; the filter popover label is level three. This keeps the document
outline intact while allowing Astryx's heading type-scale tokens to determine
their appearance. Focused page tests protect both sides of that contract by
asserting the accessible heading level and the stable `astryx-heading` and
`data-level` surfaces.

Inline technical metadata follows the same ownership rule. The global footer
reads the application package version, renders it with Astryx `Code` inside
supporting `Text`, and explicitly inherits the surrounding size and color. Its
flex layout keeps that version in the leading region and moves the existing
React/Astryx attribution to an end-aligned region that can wrap on narrower
viewports. The focused footer test protects the semantic `code` element,
package-version output, region order, and supporting-text boundary.

Small repeated presentation values belong in reusable app components. For
example, the app-level `CountBadge` exposes a numeric `count` prop and delegates
the rendered label and neutral styling to Astryx's `Badge`; its colocated
Storybook stories are cataloged as `Components/Count Badge` and cover a
representative populated count and zero. This keeps pages from recreating the
design-system contract for count indicators.

The DevOps roadmap follows the same boundary. `DevOpsRoadmapStepper` delegates
ordering, vertical connectors, numbered indicators, completed announcements,
and disabled states to Astryx 0.5.4 `Stepper` and `Step`. App-owned StyleX is
limited to the wrapping evidence lists inside each step, while a roadmap-scoped
global selector promotes completed labels and vertical bars to the primary text
token without changing semantic success status; descriptions retain Astryx's
secondary text color. Evidence spacing keeps the token group closer to its own
description than to the following step title. Linked `SkillToken`s,
certification citations, and neutral concept tokens reuse existing components.
The component deliberately has no active step because evidence can complete
non-contiguous topics, so completion is represented by each step's semantic
status rather than by a single progress cursor.

Vite compiles StyleX before its React and Nx path plugins. Test mode uses
`css-only` and removes the StyleX development-server hooks; production and local
development use `full`. Thus a passing DOM test is not evidence that production
CSS behaves correctly.

`ThemeModeProvider` owns light/dark state. Only a stored `light` value selects
light mode; missing, unexpected, unavailable, or inaccessible storage defaults
to dark. Updates change React state even if writing the `theme-mode` preference
fails. Calling `useThemeMode` outside the provider throws. Global CSS maps the
root theme attribute to the browser's `color-scheme`.

The navigation frame occupies `100dvh` with hidden overflow and resets its
content scroll position when the pathname changes. Treat scroll ownership as a
layout contract, not a cosmetic tweak. Both `verify-global-layout-css` and
`verify-mobile-layout-browser` depend on a production build. Run them when
changing layout or the compiled styling pipeline.

See [application ownership](github-io.md), [validation](../workflows/validation.md),
and the [workspace quickstart](../quickstart.md). Canonical Astryx agent guidance
is maintained by `pnpm astryx:agents`; use `pnpm astryx:agents:check` to detect drift.
