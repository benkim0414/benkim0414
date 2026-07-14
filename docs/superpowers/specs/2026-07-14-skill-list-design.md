# Skill List Component Design

Date: 2026-07-14

## Summary

Create a recruiter-facing skill list component set for the `github.io` app. The component should let recruiters search and scan the author's technical skills, while staying scoped to reusable components only. It must not create a new page, route, full portfolio section, or app-shell integration.

## Goals

- Render a searchable list of skills the author has.
- Use Astryx components and follow Astryx composition patterns.
- Keep the first version compact, accessible, and Storybook-friendly.
- Support logo-style skill avatars, skill names, compact categories, and 1-5 star skill levels.
- Keep all code local to the `github.io` app.

## Non-Goals

- Do not create or modify the full app layout.
- Do not mount the skill list in `AppShell`.
- Do not add editable skill management.
- Do not add project proof, years of experience, or last-used dates in v1.
- Do not add production skill data unless it is explicitly provided later.

## Component Scope

The v1 component set should live under:

`apps/github.io/src/app/skills/`

Proposed units:

- `skill-list.tsx`: stateful searchable list component.
- `skill-list.types.ts`: `Skill`, `SkillCategory`, and component props.
- `skill-list.data.ts`: representative sample data for Storybook and tests.
- `skill-list.stories.tsx`: Storybook variants for recruiter scanning.
- `skill-rating.tsx`: accessible 5-star skill-level display.
- `skill-logo.tsx`: logo avatar adapter for Simple Icons-style technology logos.
- `skill-list.spec.tsx`: search/filter behavior.
- `skill-rating.spec.tsx`: rating rendering and accessibility.

## Skill Data Model

Each skill should include:

- `id`: stable unique id.
- `name`: display name.
- `category`: compact technical category.
- `level`: integer from 1 to 5.
- `iconSlug`: Simple Icons-style logo identifier.
- `keywords`: searchable aliases and related terms.

Fields considered but deferred:

- `years`
- `lastUsed`
- `evidence`
- `projectUrl`
- `featured`

## Categories

Use compact recruiter-readable categories:

- `Language`
- `Runtime`
- `Framework`
- `Cloud`
- `Container`
- `CI/CD`
- `IaC`
- `Observability`
- `Database`
- `Build`
- `Testing`
- `Design System`
- `Tooling`

The implementation should type these categories as a finite union so filters, stories, and future data stay consistent.

## Search and Filtering

Use Astryx `PowerSearch` as the primary search and filtering surface.

Search should match:

- `name`
- `category`
- `keywords`

Category filtering should be expressed through `PowerSearch` if the installed Astryx API supports structured filters cleanly. If the package API is more constrained than the current public docs imply, keep `PowerSearch` as the main input and adapt to the nearest Astryx-native pattern instead of adding a custom search control.

Empty results should render an Astryx-style empty state message.

## Rendering

Render the results as an Astryx `List`, not as custom cards or a grid.

Each skill item should include:

- Start content: Astryx `Avatar` containing the skill logo.
- Main label: skill name.
- Supporting content: compact Astryx `Badge` for category.
- End content: 5-star skill level.

List behavior:

- Use compact density suitable for scanning.
- Use dividers between items.
- Keep the layout single-column on mobile.
- Keep the star rating visible on small screens; it may wrap below the skill name if needed.

## Accessibility

- Logos are decorative when the skill name is visible.
- The star rating must expose text such as `4 out of 5`.
- Search input must have an accessible label.
- Empty results must be announced as normal readable content.
- Filtering should not require pointer-only interaction.

## Astryx Integration

Prefer these Astryx components:

- `PowerSearch`
- `List`
- `ListItem`
- `Avatar`
- `Badge`
- Empty-state component if available

Before implementation, verify the exact installed Astryx import paths and props. The public docs list these components, but the local package may expose them through component-specific paths rather than the top-level package.

## Storybook Coverage

Add focused stories for:

- Default populated skill list.
- Searchable list with multiple categories.
- Empty result state.
- Compact/mobile-friendly rendering if practical in Storybook args or parameters.

Storybook remains the primary visual review surface for this component on iPad/Blink.sh workflows.

## Testing

Add focused tests for:

- Rendering skill names, categories, and ratings.
- Search matching by name.
- Search matching by keyword.
- Search matching by category.
- Empty state when no skills match.
- Rating accessible text.

Testing should stay scoped to component behavior rather than full app integration.
