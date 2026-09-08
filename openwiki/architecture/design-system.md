---
type: architecture
title: Design system and layout
description: How Astryx, StyleX, theme persistence, and browser layout checks fit together.
tags: [astryx, stylex, theme, layout]
verified:
  - by: openwiki/0.5.0
    at: 2026-09-08T02:06:28.031Z
sources:
  - id: openwiki-source-a099837b8e8614c677082a9d
    resource: repo://apps/github.io/project.json
  - id: openwiki-source-5dbaa213d52c3aac678d1838
    resource: repo://apps/github.io/src/app/global-navigation-layout.tsx
  - id: openwiki-source-dec673c983d1738cf99fce82
    resource: repo://apps/github.io/src/app/theme-mode.tsx
  - id: openwiki-source-74580f69125800ca269fab95
    resource: repo://apps/github.io/src/styles.css
  - id: openwiki-source-fcfa3ced1d03143bb27d5018
    resource: repo://apps/github.io/vite.config.ts
generated: { by: "codex", at: "2026-09-08T02:06:28.031Z" }
---

# Design system and layout

The application combines Astryx components and neutral theme tokens with
StyleX-authored local styles. The global stylesheet establishes explicit CSS
layers: reset and theme/base layers precede StyleX, with utilities last. It also
imports Astryx's reset, component styles, and neutral theme. Keep third-party
overrides scoped: the existing carousel adjustment targets `.skill-carousel`,
not every card in the application.

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
