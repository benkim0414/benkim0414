# Skill Avatar Size Prop Design

## Goal

Make `SkillAvatar` reusable across compact and regular skill surfaces by exposing its Astryx avatar size as a prop.

## Design

`SkillAvatar` should accept an optional `size` prop using Astryx `AvatarSize`. The default should be Astryx `medium`, which is the valid Astryx name for the requested md-sized avatar and resolves to 48px. Command-palette skill results should pass `size="tiny"` so search results remain compact at 20px.

`SkillListItem` should continue to call `SkillAvatar` without a size prop, so it receives the default medium avatar. `SkillCard` remains out of scope and should not render a skill avatar.

## Validation

- Focused avatar tests should prove the default size is `medium` / 48px.
- Mobile skills page tests should prove command-palette results render `tiny` / 20px avatars.
- Run focused Vitest specs plus the normal `github.io` Nx test, lint, build, and diff checks.
