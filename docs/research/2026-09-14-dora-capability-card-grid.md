# DORA capability-card responsive-grid research

Date: 2026-09-14

## Recommendation

Render the existing card collection with Astryx `Grid`, using its responsive
track API rather than a viewport-specific CSS override:

```tsx
<Grid columns={{ minWidth: 360, max: 2 }} gap={4}>
  {cards}
</Grid>
```

Keep the heading and Banner outside the grid, retain source/DOM order, and keep
each existing `DoraCapabilityCard` at `width="100%"`. This produces one column
until the **allocated DORA region** can fit two 360 px tracks plus a 16 px gap;
with the present 16 px inline section padding, that is about a 768 px viewport.
It then remains a two-column grid, including at wide desktop sizes. This is a
capacity threshold, not a claim that all 768 px devices need two columns.

Use `gap={4}` (16 px) in both axes. It matches the cards' existing 16 px
padding and Astryx's token scale, preserves an obvious gutter between dense
evidence cards, and avoids introducing raw CSS spacing. Do not give individual
cards a new width cap or force equal heights: differing evidence lengths should
extend rows naturally while each card still fills its grid track.

The current page-content frame already caps the whole route at **1440 px** and
the DORA section intentionally fills that allocation. Preserve that policy for
this focused change; do not add a DORA-only max-width. Astryx names 960 px as a
common *page* content width for mixed content, so a later readability review
may choose a 960 px region-level cap, but that would be a separate page-layout
decision rather than a per-card fix.

## Approved masonry refinement

After the initial grid implementation, the approved product direction changed:
the DORA cards should retain their natural heights and use a Masonry-like
shortest-column packing rule, rather than leaving unused space beneath a
shorter card in a grid row. Astryx has no masonry primitive, so the Home
section uses a small app-owned measured layout. It uses the Astryx spacing-4
CSS token for the visible gap, reads that computed gap for positioning, and
keeps the existing 360 px content threshold. The 360 px threshold remains a
documented card-content requirement rather than a general spacing token.

The wrappers are rendered in canonical source order and only their visual
positions are measured, preserving the card articles, reading order, and
keyboard traversal. Focused tests cover the below/at-threshold column choice
and shortest-column positions with the same 16 px horizontal and vertical
gutter; the desktop Storybook scenario remains the visual review surface.

## Evidence and constraints

- Material Design 3 identifies a feed as the canonical layout for card
  collections and says it adapts at compact, medium, and expanded breakpoints.
  It defines breakpoints as opinionated width changes driven by user needs; the
  public M3 guidance reviewed does **not** prescribe universal web pixel
  breakpoints, gutters, or a maximum content width. The responsive Grid
  threshold above therefore follows available space rather than a named device
  class ([M3 canonical layouts](https://m3.material.io/foundations/layout/canonical-examples/overview)).
- Astryx 0.5.4 explicitly recommends `Grid` for multi-column/card galleries,
  responsive `columns={{ minWidth: 280 }}`, and `max` to limit columns. Its
  capped-track implementation keeps a single mobile card at the full available
  width and makes present tracks fill their row. `minWidth: 360` is a local
  content decision: each DORA card contains a heading, two summaries, labels,
  and wrapping evidence tokens, so it deliberately exceeds the generic 280 px
  example ([Grid docs](/home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/core/src/Grid/Grid.doc.mjs),
  [Grid implementation](/home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/core/src/Grid/Grid.tsx),
  [current card](/home/benkim0414/workspace/benkim0414/.worktrees/dora-card-grid/apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx)).
- Astryx maps spacing step 4 to 16 px and recommends token-backed interior
  spacing. Its Card guidance asks for consistent sibling padding, which the
  current cards already use ([spacing tokens](/home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/core/src/theme/tokens.stylex.ts),
  [Card docs](/home/benkim0414/workspace/benkim0414/node_modules/@astryxdesign/core/src/Card/Card.doc.mjs)).
- The existing Home page is a single `VStack` section with 16 px inline
  padding and maps the canonical DORA definitions in order; the frame has a
  1440 px maximum width. The change should wrap only that map, leaving the
  semantic `h2`, informational Banner, and card internals unchanged
  ([Home page](/home/benkim0414/workspace/benkim0414/.worktrees/dora-card-grid/apps/github.io/src/app/home/home-page.tsx),
  [frame policy](/home/benkim0414/workspace/benkim0414/.worktrees/dora-card-grid/apps/github.io/src/app/global-navigation-layout.tsx)).

## Accessibility and validation

- Do not reorder the mapped definitions visually or in the DOM. Keyboard and
  reading order must remain the canonical one-column sequence; CSS Grid may
  place that sequence into columns, but must not introduce a column-major data
  order.
- Preserve the card `article`/heading association, semantic evidence lists,
  visible focus indicators, wrapping evidence, and the existing mobile
  full-width geometry contract. A layout wrapper is not a reason to make the
  cards interactive, alter their names, or hide content.
- Check at a narrow mobile width, just below and just above the computed
  two-track threshold, and the 1440 px frame cap. Verify no horizontal scroll,
  no clipped tokens or text, a 16 px inter-card gutter, and that the Banner
  remains full section width above the grid. Add a focused Home-page assertion
  for the Grid configuration and visually inspect the affected Storybook/Home
  view.

## Sources inspected

- Official Material Design 3 canonical-layout guidance (URL above).
- Installed Astryx Core 0.5.4 Grid, Card, Layout, and token sources; the
  repository pins this version in `pnpm-lock.yaml`.
- Current Home-page, navigation-frame, and DORA-card sources in this feature
  worktree.
