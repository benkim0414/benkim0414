# Skill Card Category Placement Design

## Goal

Show each skill's categories on `SkillCard` using the existing
`SkillCategory` visual language while preserving Astryx card structure,
Kanban-card density, and semantic typography.

## Context

`SkillCard` currently renders the skill name, description, optional
certification citations, and a single `skill.category` badge above the heading.
The next step is to support skills with multiple categories and make the card
closer to Astryx's Kanban board card treatment, where small category/status
labels sit above the card title.

The `github.io` app's Astryx guidance prefers Astryx components and tokens
before local visual primitives. Astryx typography guidance specifically says to
use `Heading` for headings and `Text` for body/supporting copy instead of
manually composing raw font size and line-height tokens. The current raw `h3`
and `p` styling only partially follows that guidance.

## Recommended Placement

Render the skill's category badges at the top of the card's identity block,
immediately before the skill heading:

```tsx
<VStack gap={3}>
  <VStack gap={1} hAlign="start">
    <HStack gap={1} wrap="wrap">
      {skill.categories.map(category => (
        <SkillCategory key={category} name={category} />
      ))}
    </HStack>
    <Heading level={4} accessibilityLevel={3}>{skill.name}</Heading>
    <Text type="supporting">{skill.description}</Text>
  </VStack>

  {certifications.length > 0 ? <CertificationList /> : null}
</VStack>
```

This makes categories lightweight classifiers for the whole skill. The skill
name stays the accessible card heading, the description reads as secondary
supporting copy, and certifications continue to read as bottom-of-card evidence.
Using `Heading level={4} accessibilityLevel={3}` gives the card the compact
visual scale expected in a dense card while preserving the current document
outline exposed to assistive technology.

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

### Manual Font Token Styling

Keeping raw `h3` and `p` elements with direct `typeScaleVars` references avoids
new imports, but it conflicts with Astryx typography guidance. It also risks
missing parts of the semantic type style, such as heading weight, and makes the
card drift from Astryx examples.

## Component Boundaries

- Change the skill data model from a single `category` to `categories` for card
  rendering and metadata workflows.
- Render one `SkillCategory` per category at the top of the `SkillCard`
  identity block.
- Do not add new category styling to `SkillCard`.
- Keep `SkillCategory` responsible for Astryx `Badge` variant selection.
- Keep `SkillCard` responsible only for card structure and ordering.
- Use Astryx `Heading` and `Text` components for the title and description.
- Keep filtering behavior category-based; a skill matches a category filter when
  any of its categories matches.
- Keep search behavior category-aware; all categories should participate in the
  searchable text.
- Do not change carousel behavior beyond the natural card content update.

## Accessibility

The skill name remains the heading referenced by `aria-labelledby` on the card
article. Use Astryx `Heading` with `accessibilityLevel={3}` so the document
outline remains consistent with the existing card semantics even if the visual
heading level is smaller. Category badges are visible metadata and should not
replace or wrap the heading. No additional visible label is needed.

## Testing

Update focused `SkillCard` tests to assert that all category texts render before
the skill title. Update search and list tests or stories touched by the data
model change so category filtering and search still cover category metadata.
Keep the existing tests that verify the card title, description, content-driven
card height, distinct heading IDs, and optional certification citations.

Visual verification should use the existing `SkillCard` Storybook stories to
check both cards with and without certifications across desktop and mobile
widths.

## Handoff Criteria

Implementation is ready for handoff when:

- `SkillCard` renders every skill category before the skill heading.
- Category badges remain compact and wrap naturally instead of stretching to the
  card width.
- `SkillCard` uses Astryx `Heading` and `Text` for title and description
  typography.
- The skill heading remains the accessible title target.
- Category search and filtering work against all categories for a skill.
- Certification citations still render only at the bottom when present.
- Focused `github.io` tests pass or unrelated failures are documented.
- Storybook visual review confirms no text clipping or awkward wrapping in the
  existing card widths.
