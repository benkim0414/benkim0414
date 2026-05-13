## Context

The skill search panel already has structured skill metadata and URL-backed filters for query, category, and level. Result cards are currently implemented inline in the search panel, while categories and tags are displayed as passive text spans.

The repository also has active OpenSpec work to standardize the GitHub Pages app on shadcn usage and centralized theming. This change should build on that direction: shadcn Card owns the result container, shadcn Badge owns category and tag presentation, and filtering logic remains in the search feature instead of being scattered across individual components.

Current shadcn references:

- Card: https://ui.shadcn.com/docs/components/card
- Badge: https://ui.shadcn.com/docs/components/badge
- Button: https://ui.shadcn.com/docs/components/button

## Goals

- Extract skill result presentation into a reusable `SkillCard` component.
- Use shadcn Card composition for each skill result.
- Use shadcn Badge styling for categories and tags.
- Make category and tag badges clickable and keyboard accessible.
- Keep search state URL-addressable, including selected tags.
- Keep filter behavior predictable when multiple filter groups are active.

## Non-Goals

- Redesigning the entire search page.
- Introducing a custom design-system layer beyond app-local shadcn primitives.
- Changing the source skill taxonomy or content schema.
- Adding a global tag sidebar or facet panel.

## Decisions

### Add app-local shadcn primitives only when missing

If Card or Badge primitives do not already exist in `apps/github.io/src/components/ui`, add the shadcn versions there and import them from the app-local alias. Do not create bespoke card or badge primitives under a different design-system namespace.

### Keep SkillCard feature-owned

Place `SkillCard` in the search feature area so it can stay close to skill result data, click handlers, and search tests. The component should receive skill data, selected filter state, and click callbacks as props. It should not parse URL parameters itself.

### Badge clicks toggle filters

Clicking a category badge toggles that category in the existing category filter set. Clicking a tag badge toggles that tag in the new tag filter set. Clicking an active badge removes that filter.

### Add URL-backed tag filters

Extend `SearchState` with `tags: string[]`. Parse and serialize selected tags using repeated `tag` query parameters, matching the existing category and level parameter pattern.

### Compose filters by group

Within the same group, selected values are OR'd. Across groups, active filters are AND'd:

- A skill matches selected categories when its category is in the selected category set.
- A skill matches selected tags when it has at least one selected tag.
- A skill must satisfy every active group: query, category, level, and tags.

### Preserve accessible controls

Clickable category and tag badges should be real buttons or button-backed shadcn composition. They need visible active state, keyboard activation, and an accessible label that identifies whether clicking will add or remove the filter.

## Risks And Tradeoffs

- Clickable badges can look like static metadata if active and hover states are too subtle. Mitigate this by using clear cursor, focus, and selected-state styling.
- Adding tag filters increases URL state. Matching the existing repeated-parameter approach keeps behavior consistent.
- If generated shadcn Badge does not support `asChild`, use Badge styling on a native `button` through the exported badge variants or an equivalent local shadcn pattern instead of inventing a separate badge component.
