## Context

`DESIGN.md` is the design-system source of truth for `apps/github.io`. It calls for a dark, sparse, technical showcase with violet and purple accents, selective developer-font usage, crisp 1px borders, hard-edge highlights, and subtle aliased or bits-inspired texture.

The app already uses Tailwind v4, shadcn/ui `new-york`, and CSS variables. The current implementation maps shadcn tokens through `@theme inline` in `apps/github.io/src/styles.css`. That is the right place to apply the new visual direction because shadcn components and Tailwind utilities can consume semantic tokens like `bg-background`, `text-foreground`, `border-border`, and `ring-ring`.

Relevant shadcn references:

- `https://ui.shadcn.com/docs/theming`
- `https://ui.shadcn.com/docs/components-json`

## Goals / Non-Goals

**Goals:**

- Make `apps/github.io/src/styles.css` the central implementation point for `DESIGN.md`.
- Preserve shadcn CSS-variable theming and Tailwind v4 `@theme inline` token mapping.
- Support the violet accent palette without making the UI one-note purple.
- Provide reusable utilities or semantic classes for developer-font accents, status marks, crisp surfaces, and low-opacity bits texture.
- Keep dark mode as the signature design while preserving usable light, dark, and system theme behavior.

**Non-Goals:**

- Do not apply the theme by manually restyling each component independently.
- Do not introduce a new component system or new shadcn component files.
- Do not add external font dependencies; use system sans and system monospace stacks.
- Do not add noisy glitch effects, decorative orbs, bokeh, or full pixel-art treatments.
- Do not change search behavior, skill data, routing, or deployment automation.

## Decisions

- Use CSS variables for color decisions because shadcn recommends CSS-variable theming and the app is already configured with `cssVariables: true`.
- Keep Tailwind v4 `@theme inline` as the bridge from variables to utilities so implementation can use semantic class names instead of hard-coded hex colors.
- Add design-specific variables for accent, accent-strong, accent-soft, signal, success, warning, raised surface, and subtle text where the existing shadcn token set is not specific enough.
- Use developer-font utilities only for accents such as path labels, counters, tags, compact status text, and command-like fragments. Body copy and long descriptions remain sans-serif.
- Keep visual texture centralized as a reusable page or surface utility so the app can evoke aliased bits without embedding custom effects into every component.
- Use reduced-motion-safe effects only; any texture or focus treatment must not block readability or keyboard focus visibility.

## Risks / Trade-offs

- A centralized theme cannot solve every layout issue by itself. Mitigation: allow minimal class changes only where needed to consume the new tokens and utilities.
- Too much violet would weaken the technical palette. Mitigation: reserve violet for active, focus, and highlight states; keep surfaces near-black/slate and use cyan or green only for small signal hints.
- Light mode may be less distinctive than dark mode. Mitigation: keep it readable and token-compatible, while treating dark mode as the signature visual.
- Texture can reduce contrast if overused. Mitigation: keep texture low-opacity, centralized, and disabled or harmless under reduced-motion preferences.
