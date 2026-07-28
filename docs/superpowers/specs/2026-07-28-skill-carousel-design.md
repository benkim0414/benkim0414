# Skill Carousel Design

## Goal

Create reusable `SkillCarousel` and `SkillCard` components for the `github.io`
app. The carousel should present each skill as a discrete card with the skill
name, description, and optional certification citations.

## Scope

In scope:

- Expand the existing `Skill` model so skill display data stays centralized.
- Add a reusable `SkillCard` component.
- Add a reusable `SkillCarousel` component.
- Reuse existing Astryx components and existing certification citation UI.
- Add focused component tests and stories for the new card and carousel.

Out of scope:

- Changing `SkillSection`, `SkillList`, or search/filter behavior.
- Adding a new page section or page-level heading.
- Adding carousel-specific data separate from the existing `Skill` model.
- Adding visible labels to the carousel or certification footer.
- Rebuilding `CertificationCitation` visuals.

## Data Model

Extend the existing `Skill` interface in `apps/github.io/src/app/skills`:

- Add required `description: string`.
- Add optional `certifications?: readonly SkillCertification[]`.

`SkillCertification` should represent the data needed by
`CertificationCitation`:

- `title: string`
- `url: string`
- `skills: readonly string[]`
- `expiresAt: string`

The rendering component should own citation numbering when mapping
certifications, rather than storing display numbers in skill data.

One skill may have zero, one, or many certifications. For example, Kubernetes
can cite KCNA, CKA, and CKAD.

## Components

### SkillCard

`SkillCard` accepts a single `Skill`:

```ts
interface SkillCardProps {
  skill: Skill;
}
```

It renders:

- skill name as the title
- skill description as supporting text
- certification citations at the bottom only when
  `skill.certifications?.length` is non-zero

The certification footer should render the existing `CertificationCitation`
component for each certification. It should not introduce an additional visible
footer label.

### SkillCarousel

`SkillCarousel` accepts a list of skills:

```ts
interface SkillCarouselProps {
  skills: readonly Skill[];
  emptyMessage?: string;
}
```

It renders an Astryx `Carousel` containing one `SkillCard` per skill. It should
not own search, filtering, section headings, or page placement. Consumers can
wrap it in a page section if they need those concerns.

When `skills` is empty, render an Astryx `EmptyState` with a default message
consistent with existing skill components.

## Astryx and Styling Guidelines

- Use Astryx `Carousel` for horizontal scrolling.
- Use Astryx `Card` because each skill is a discrete item that can be reordered
  or removed independently.
- Use Astryx layout primitives, such as `VStack` and `HStack`, for internal card
  structure where they fit.
- Use StyleX for component-specific sizing and layout details.
- Use Astryx token variables in StyleX for spacing, size, text, border, and
  alignment choices.
- Keep Tailwind limited to wrapper-level layout, if needed.
- Do not add global CSS for these components.

## Accessibility

- Do not add visible headings, carousel labels, or footer labels inside the
  reusable components.
- Non-visible accessibility labels, such as `aria-label`, are acceptable when
  needed by an Astryx component or to preserve screen reader clarity.
- Preserve the accessible behavior provided by Astryx `Carousel`, `Card`, and
  `Citation`.
- Use semantic structure inside `SkillCard` so the skill name and description
  remain clear to screen readers.
- Avoid auto-advancing carousel behavior.
- Render certification citations only when they exist.

## Validation

Add focused tests for:

- `SkillCard` renders the skill name.
- `SkillCard` renders the skill description.
- `SkillCard` omits the certification footer when no certifications exist.
- `SkillCard` renders multiple `CertificationCitation` instances for one skill.
- `SkillCarousel` renders one card per supplied skill.
- `SkillCarousel` renders an empty state when no skills are supplied.
- Existing skill list and search tests continue passing after sample skill data
  gains required descriptions.

Add Storybook stories for:

- a skill card without certifications
- a skill card with multiple certifications
- a carousel with several skills
- an empty carousel state

## Risks and Mitigations

- Required descriptions will break existing sample fixtures until they are
  updated. Mitigate by updating all `Skill` fixtures in the same implementation
  change.
- Astryx `Carousel` exposes an accessibility label prop. Mitigate ambiguity by
  allowing non-visible accessibility labels while avoiding any visible carousel
  label in the UI.
- Certification data can grow card height unevenly. Mitigate by using consistent
  card width and spacing, and by testing a multiple-certification skill.

## Handoff Criteria

Implementation is ready for handoff when:

- New components and stories are added.
- Expanded skill model compiles.
- Existing skill components still pass their tests.
- New card and carousel tests pass.
- Focused Nx test/build commands for `github.io` pass or any unrelated failures
  are documented.
