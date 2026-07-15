# Skill Components Decomposition Design

Date: 2026-07-15

## Summary

Refactor the existing `github.io` skill UI into focused render components. This pass keeps the scope to component decomposition only. Page-level wiring, a dedicated `SkillSearch`, and a `SkillsSection` container remain future work.

## Goals

- Make `SkillList` a render-focused list component.
- Extract one-row rendering into `SkillListItem`.
- Rename/reframe logo rendering as `SkillAvatar`.
- Keep `SkillRating` as the accessible 5-star level component.
- Preserve current visual behavior, tests, Storybook coverage, and Astryx component usage.

## Non-Goals

- Do not wire the skill components into `AppShell` yet.
- Do not create a full page-level `SkillsSection` yet.
- Do not remove the existing PowerSearch behavior unless replacement wiring is created in the same change.
- Do not change the skill data model or categories.

## Component Boundaries

`SkillList` should focus on list orchestration: empty states and mapping skills to rows.

`SkillListItem` should render a single skill row using Astryx `ListItem`, `Badge`, `SkillAvatar`, and `SkillRating`.

`SkillAvatar` should own bundled logo lookup, Astryx `Avatar`, initials fallback, and image-load fallback behavior.

`SkillRating` stays as the existing level component and should continue exposing hidden text such as `4 out of 5` via Astryx `VisuallyHidden`.

The existing search/filter helpers and PowerSearch configuration can stay with `SkillList` for now if needed to preserve current behavior. A later page-level pass can move search state into a `SkillsSection` composition component.

## Testing

Keep behavior covered by focused tests:

- `SkillAvatar` logo and fallback behavior.
- `SkillRating` accessible text and visual stars.
- `SkillListItem` row content and rating/avatar composition.
- `SkillList` empty states and list rendering.
- Existing search/filter helper behavior if those helpers remain in the module.

## Storybook

Storybook should expose separate visual entries for:

- `SkillList`
- `SkillListItem`
- `SkillAvatar`
- `SkillRating`

Existing skill-list stories should continue working.
