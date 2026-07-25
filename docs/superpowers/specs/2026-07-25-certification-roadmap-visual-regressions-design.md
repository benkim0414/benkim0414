# Certification Citation And Roadmap Node Visual Regression Design

## Goal

Restore two `github.io` visual contracts that drifted during recent Astryx and StyleX work:

- Expired `CertificationCitation` icons should use the same neutral text color as the citation label, not the linked skill brand color.
- `DevOpsRoadmapNode` should keep the previous responsive node width contract.

## Context

The `github.io` app is an Nx React/Vite app using React 19, TypeScript, Astryx Design, StyleX, Tailwind, Vitest, Testing Library, and React Flow.

Recent work moved roadmap node styling from global CSS into StyleX and simplified certification citation styling around the Astryx `Citation` component. That migration kept the correct component boundaries, but it changed two visible details:

- `CertificationCitation` now always fills a linked skill logo with the skill brand color when an icon path exists, even when the certification is expired.
- `DevOpsRoadmapNode` now expresses width through `spacingVars['--spacing-10'] * 8` and `* 7`, which should be checked against and restored to the old visual width contract.

The pre-StyleX roadmap CSS used `width: min(100%, 320px)` on desktop and `width: min(100%, 280px)` under `640px`.

## Recommended Approach

Make a narrow restoration instead of adding new configuration.

`CertificationCitation` should continue to own certification status and should keep the Astryx `Citation` base component. Active certifications with an icon-backed brand keep the brand-colored icon. Expired certifications with an icon-backed brand still render the icon, but the generated SVG fill uses the citation's neutral label text color. Color-only brands continue to render no image.

`DevOpsRoadmapNode` should keep StyleX and Astryx token usage for the node surface, spacing, border, radius, shadow, typography, and responsive padding. The width should restore the old responsive values: `min(100%, 320px)` by default and `min(100%, 280px)` below `640px`. If an Astryx spacing token maps exactly to those values, prefer the token expression; otherwise use the literal pixel values for this compatibility contract and keep the rest of the styling tokenized.

## Architecture

### `CertificationCitation`

The component remains reusable and not roadmap-specific.

Responsibilities:

- Accept certification title, URL, linked skills, expiry date, optional citation number, and optional current date.
- Find the first linked skill with brand metadata.
- Derive `active` or `expired` status from `expiresAt`.
- Pass Astryx `Citation` the same citation source shape as today.
- Generate an icon data URL only when the primary brand has an icon path.
- Choose icon fill from certification status:
  - active: primary brand color
  - expired: neutral citation label text color
- Preserve the visually hidden active/expired status text.

The neutral expired icon color should match the existing Astryx label citation text treatment. The previous implementation used `#737373`; implementation should prefer an Astryx token when one is available and falls back to the same known value only if the token cannot be referenced inside the generated SVG data URL cleanly.

### `DevOpsRoadmapNode`

The node remains the body renderer for each React Flow roadmap item.

Responsibilities:

- Render the article, title, skill token list, optional certification list, and hidden React Flow handles.
- Use StyleX for component-local node styling.
- Keep Astryx token aliases for surface, text, spacing, border, radius, shadow, and type scale.
- Restore the responsive width values to the old contract:
  - desktop/default: `min(100%, 320px)`
  - mobile under `640px`: `min(100%, 280px)`

`DevOpsRoadmap` remains responsible for React Flow element construction, node ordering, estimated height, and diagram behavior. This change should not move sizing logic from `DevOpsRoadmapNode` into `DevOpsRoadmap`.

## Styling Boundaries

Follow the repo's Astryx, StyleX, Tailwind, and global CSS boundary:

- Astryx components define the semantic and visual base.
- StyleX owns component-specific styles and responsive variants.
- Tailwind remains limited to wrapper utilities.
- Global CSS remains scoped to third-party internals such as React Flow selectors.

This change should not introduce new global CSS for citation or node internals.

## Tests

Update focused tests rather than broad snapshot tests.

`CertificationCitation` tests should assert:

- Active icon-backed certifications still use brand color in the generated SVG data URL.
- Expired icon-backed certifications render an icon whose SVG fill is the neutral citation/text color, not the brand color.
- Color-only brands such as `AWS` still render no image and keep the existing fallback behavior.

`DevOpsRoadmapNode` tests should assert:

- The StyleX-generated node root preserves the intended responsive width contract in a stable way.
- Existing behavior still renders skill tokens and certification citations in separate lists.

If direct CSS-rule assertion is brittle with StyleX class generation, test through the smallest stable surface available in this repo, such as extracted style constants, generated CSS text, or component output attributes that already exist for test support. Do not add user-visible text solely for tests.

## Out Of Scope

- Changing certification citation API props.
- Removing active brand-colored certification icons.
- Changing skill brand metadata.
- Changing React Flow layout or height estimation.
- Changing roadmap item data.
- Adding routes or wiring these components into new app surfaces.
- Reworking Astryx theme setup, CSS layer order, or Tailwind configuration.

## Risks And Validation

Main risks:

- Hardcoding the neutral expired color could drift from Astryx if the design system changes.
- Testing StyleX responsive rules can become brittle if tests depend on generated class names.
- Restoring roadmap width may affect React Flow fit-view framing, so existing roadmap tests should still run.

Validation:

- Run the focused `github.io` tests for certifications and roadmap.
- Run `pnpm nx test github.io` if dependencies are available in the worktree.
- If a browser/dev-server pass is already being done for implementation, visually inspect the roadmap node width and expired citation icon color in Storybook or the app surface.
