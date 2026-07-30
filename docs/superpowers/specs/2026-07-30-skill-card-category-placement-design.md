# Skill Card Category Placement Design

## Goal

Show each skill's category on `SkillCard` using the existing `SkillCategory`
component while preserving the Astryx card structure and the current skill card
information hierarchy.

## Context

`SkillCard` currently renders the skill name, description, and optional
certification citations. The skill data already includes `skill.category`, and
`SkillCategory` already renders that category through Astryx `Badge` with a
deterministic theme-safe variant.

The `github.io` app's Astryx guidance prefers Astryx components and tokens
before local visual primitives. It also treats `SkillCategory` as a badge-like
category label, while skill names remain the primary card heading.

## Recommended Placement

Render `SkillCategory` at the top of the card's identity block, immediately
before the skill heading:

```tsx
<VStack gap={3}>
  <VStack gap={1}>
    <SkillCategory name={skill.category} />
    <h3>{skill.name}</h3>
    <p>{skill.description}</p>
  </VStack>

  {certifications.length > 0 ? <CertificationList /> : null}
</VStack>
```

This makes the category a lightweight classifier for the whole skill. The skill
name stays the semantic heading, the description remains supporting copy, and
certifications continue to read as bottom-of-card evidence.

## Alternatives Considered

### Inline With The Heading

Putting the category in the same horizontal row as the heading is more compact,
but it creates wrapping and alignment risk on narrow cards. It also makes the
badge compete visually with the skill name, which should remain the primary
identifier.

### Below The Description

Placing the category below the description keeps the title area minimal, but it
makes the category read like a tag or footer detail instead of a classifier for
the skill. It also pushes the category closer to certification citations, which
are a different kind of metadata.

### Certification Footer Area

Putting the category with certifications should be avoided. Certifications are
evidence links and may be absent; category is stable identity metadata for every
skill.

## Component Boundaries

- Import and render the existing `SkillCategory` component from `SkillCard`.
- Do not add new category styling to `SkillCard`.
- Keep `SkillCategory` responsible for Astryx `Badge` variant selection.
- Keep `SkillCard` responsible only for card structure and ordering.
- Do not change the `Skill` data model, filtering, search, or carousel behavior.

## Accessibility

The skill name remains the `h3` referenced by `aria-labelledby` on the card
article. The category badge is visible metadata and should not replace or wrap
the heading. No additional visible label is needed.

## Testing

Update focused `SkillCard` tests to assert that the category text renders for a
skill. Keep the existing tests that verify the card title, description,
content-driven card height, distinct heading IDs, and optional certification
citations.

Visual verification should use the existing `SkillCard` Storybook stories to
check both cards with and without certifications across desktop and mobile
widths.

## Handoff Criteria

Implementation is ready for handoff when:

- `SkillCard` renders `SkillCategory` before the skill heading.
- The skill heading remains the accessible title target.
- Certification citations still render only at the bottom when present.
- Focused `github.io` tests pass or unrelated failures are documented.
- Storybook visual review confirms no text clipping or awkward wrapping in the
  existing card widths.
