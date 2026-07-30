# Skill Category Badge Variants Design

## Goal

Make `SkillCategory` badges visually distinct by deriving their Astryx `Badge`
variant from the category name. The color should be stable for a given category,
theme-compatible, and aligned with the Astryx design system.

## Scope

In scope:

- Add a deterministic category-name-to-badge-variant helper for
  `SkillCategory`.
- Keep `SkillCategory` rendered with Astryx `Badge`.
- Use Astryx Badge color variants instead of custom hex backgrounds.
- Add focused tests for stability and allowed variant output.
- Keep the existing Storybook stories working with the generated variants.

Out of scope:

- Generating arbitrary hex, RGB, or HSL colors.
- Adding custom StyleX color overrides for category badges.
- Changing the skill category data model.
- Manually maintaining a fixed category-to-color map.
- Changing skill search, filtering, or list layout behavior.

## Recommended Approach

Use a small deterministic hash over the normalized category name, then map the
hash to an approved Astryx Badge variant palette.

The approved palette should use category-like colors only:

- `blue`
- `cyan`
- `green`
- `orange`
- `pink`
- `purple`
- `teal`
- `yellow`

Status variants such as `success`, `warning`, and `error` should be excluded so
category badges do not imply health, severity, or completion state. `neutral`
should also be excluded from generated category colors because the goal is to
make categories visually distinct.

## Component Design

`SkillCategory` remains a thin component:

```tsx
<Badge label={name} variant={getSkillCategoryVariant(name)} />
```

The helper can live beside the component unless future components need the same
mapping. It should accept a `SkillCategoryName` or `string` and return an Astryx
`BadgeVariant`.

The normalization should be intentionally small:

- trim the category name
- lowercase it

This keeps `Cloud`, `cloud`, and accidental surrounding whitespace mapped to the
same variant without changing meaningful category text.

## Algorithm

Use a simple string hash over UTF-16 character codes and map the resulting
integer into the allowed palette:

1. Normalize the category name.
2. Initialize an integer hash.
3. For each character, combine the character code into the hash.
4. Use `Math.abs(hash) % allowedVariants.length`.
5. Return the variant at that index.

The exact hash function does not need cryptographic strength. It only needs to
be deterministic, cheap, and well distributed enough for a short category list.

## Astryx and Styling Guidelines

- Keep Astryx `Badge` as the semantic and visual base.
- Prefer the `variant` prop over custom `style`, `className`, or `xstyle`
  overrides.
- Do not introduce custom CSS variables for category badge colors.
- Do not use raw color values when an Astryx component variant represents the
  design intent.

This follows the existing Astryx boundary used in the app: Astryx components own
component anatomy and theme-aware visuals, while local overrides are reserved
for narrow component needs that the Astryx API cannot express.

## Testing

Add or update focused tests for `SkillCategory`:

- It still renders the category name as a badge.
- The same category name maps to the same variant across repeated renders.
- Equivalent normalized names map to the same variant.
- Known skill categories only map to the approved category palette.

Tests should not snapshot the full CSS output. They should assert the component
receives an allowed deterministic variant through visible behavior or a small
exported helper test.

## Risks and Mitigations

- Different categories can share a color because the Astryx palette is finite.
  This is acceptable for lightweight visual grouping and avoids custom color
  accessibility drift.
- Hash changes would reshuffle category colors. Mitigate by keeping the helper
  small, tested, and stable once introduced.
- The selected palette includes light colors such as `yellow`. Mitigate by
  relying on Astryx Badge variant foreground and background tokens rather than
  custom text color decisions.

## Handoff Criteria

Implementation is ready for handoff when:

- `SkillCategory` uses a deterministic Astryx variant derived from its name.
- Tests cover stable mapping and allowed output.
- Focused `github.io` tests pass or any unrelated failures are documented.
