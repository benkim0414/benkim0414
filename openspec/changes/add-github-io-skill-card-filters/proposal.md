## Why

The GitHub Pages app currently renders skill search results with inline markup. That makes the result presentation harder to reuse and prevents the visible category and tag metadata from acting as navigation. Users should be able to click a category or tag directly from a result card and immediately narrow the result set.

This change introduces a focused SkillCard surface built from shadcn Card primitives and uses shadcn Badge styling for categories and tags. It also adds tag-aware filtering so metadata on a card becomes an interactive part of search instead of passive text.

## What Changes

- Add a reusable `SkillCard` component for skill result rows.
- Add or reuse app-local shadcn Card and Badge primitives for the GitHub Pages app.
- Render categories and tags as clickable badge controls in skill cards.
- Extend search state and URL serialization with repeated `tag` parameters.
- Toggle category and tag filters when users click the corresponding badge.
- Preserve existing query, category, level, empty-state, and theme behavior.

Out of scope:

- Changing skill data structure beyond using existing category and tag fields.
- Applying design tokens component by component outside the existing theme path.
- Reworking the whole search layout or navigation model.

## Capabilities

### New Capabilities

- `github-io-skill-card`
- `github-io-clickable-skill-filters`

### Modified Capabilities

None.

## Impact

- Affected app: `apps/github.io`
- Affected areas: skill search UI, search state, URL query parsing, app-local shadcn UI primitives
- Expected implementation style: prefer generated or local shadcn components, keep theme changes centralized, and avoid introducing a parallel component system.
