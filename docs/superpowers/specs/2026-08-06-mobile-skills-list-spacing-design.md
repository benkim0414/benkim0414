# Mobile Skills List Label And Spacing Design

## Goal

Improve the mobile skills page hierarchy by adding a visible label for the
complete skills list and by applying consistent page-level spacing around the
highlighted skills carousel and the list below it.

## Context

`MobileSkillsPage` currently renders the top navigation, a fixed highlighted
skills carousel, and a separately scrollable full skills list. The carousel
already owns a `gap={3}` between its cards, while the page owns the carousel's
horizontal and bottom spacing. There is no top space between the navigation and
carousel, and the full list has no visible label.

This change follows the repository's Astryx styling boundary:

- Astryx `Text` provides the visible label typography and semantic element.
- Astryx spacing steps and component props define the page rhythm.
- `MobileSkillsPage` selects the spacing required by this mobile composition.
- `SkillCarousel` exposes Astryx Carousel's content-padding contract while
  continuing to own its internal card spacing.

Astryx publishes a 4px spacing-token scale and component-level spacing APIs,
but does not prescribe a universal mobile content gutter for Carousel. Material
3 carousel guidance is therefore a secondary reference for choosing the 16px
mobile gutter; Astryx remains the source of truth for how that spacing is
applied.

## Recommended Design

Keep the composition decision in `MobileSkillsPage`. Add an optional
content-padding prop to `SkillCarousel` so the page can use Astryx Carousel's
native scroll gutter without changing the shared default. Do not modify
`SkillCardList` defaults.

Render a visible full-list label after the highlighted carousel and before the
skills cards:

```tsx
<Text as="h2" type="body" weight="bold">
  All skills
</Text>
```

Using `as="h2"` gives the section a navigable heading without changing the
approved Astryx body typography. The existing visually hidden `h1` named
`Skills` remains the page title.

The `SkillCardList` region should use `All skills` as its accessible name so
the visible label and region name agree.

## Spacing

Use the Astryx spacing scale without arbitrary values:

- Navigation to carousel: `spacing-4` (`16px`).
- Carousel inline content inset: `spacing-4` (`16px`) on both sides through
  Astryx Carousel's `padding={4}` API. This also applies matching inline scroll
  padding so snapped cards align with the content edge.
- Carousel to the full-list label: `spacing-4` (`16px`).
- Full-list label to the first card or empty state: `spacing-3` (`12px`).
- Page bottom inset: retain `spacing-4` (`16px`).
- Carousel card-to-card gap: retain the existing `gap={3}` (`12px`).
- Full-list card-to-card gap: retain the existing `gap={3}` (`12px`).

The carousel should span the mobile content width while its Astryx scroll
container owns the inline gutter. The full-list scroll region should be an
Astryx `VStack` using `paddingInline={4}`, `paddingBlock={4}`, and `gap={3}`.
This gives the label and cards a 16px inline inset, places 16px between the
carousel and label, preserves 16px at the bottom of the list, and keeps the
12px label-to-list rhythm. No arbitrary values, local typography rules, or
changes to generated carousel internals are needed.

## Component Boundaries

`MobileSkillsPage` remains responsible for:

- Page hierarchy and section labels.
- Fixed carousel placement above the scrollable list.
- Selecting the mobile content gutter and spacing between major regions.
- Search filtering and list empty-state selection.

`SkillCarousel` remains responsible for:

- Rendering highlighted skill cards.
- Carousel semantics, snapping, and internal card gap.
- Forwarding an optional Astryx spacing step to Carousel's native `padding`
  prop without introducing a new default.
- Its highlighted-skills empty state.

`SkillCardList` remains responsible for:

- Rendering full-width skill cards or its empty state.
- Internal card-to-card spacing.
- The list region's accessible name.

`SkillCarousel` gains one optional public prop for native carousel content
padding. Existing callers retain the current no-padding default.

## Behavior And States

The `All skills` label remains visible when the list is populated, filtered to
one skill, has no search match, or receives no skills. This preserves the
section hierarchy regardless of the content state.

The change does not alter:

- Highlighted or full skill data.
- Search and selection behavior.
- Carousel gestures, snapping, or card sizing.
- Fixed navigation and carousel behavior.
- Full-list scrolling.
- Compact card variants.
- Desktop behavior.

## Accessibility

- Keep the visually hidden `h1` as the page-level `Skills` heading.
- Render `All skills` as a semantic `h2` through the Astryx `Text` component.
- Name the full-list region `All skills` to match the visible heading.
- Preserve the existing `Highlighted skills` carousel label.
- Do not rely on spacing or font weight alone to communicate the section
  boundary.

## Testing And Validation

Update the focused `MobileSkillsPage` tests to verify:

- `All skills` is rendered as an `h2`.
- The label appears after the highlighted carousel and before the full-list
  region.
- The full-list region is named `All skills`.
- The mobile page requests Astryx `padding={4}` for the carousel content
  gutter.
- The list composition uses Astryx 16px inline/block padding and a 12px gap.
- `SkillCarousel` retains `gap={3}`.
- Existing populated, filtered, empty, compact-card, and scroll-shell behavior
  continues to pass.

Use the page-level Storybook story for visual validation at narrow phone and
iPad-width viewports. Confirm consistent 16px page insets, clear separation
between the navigation, carousel, label, and list, preserved horizontal
carousel behavior, unobstructed vertical scrolling, and no overlap or clipping.

## Out Of Scope

- Changing carousel card spacing or carousel component defaults.
- Adding a visible heading above the highlighted carousel.
- Changing skill cards, data, search behavior, or navigation.
- Changing shared list spacing or the default carousel content padding.
- Redesigning desktop layouts.

## Reference

- [Astryx spacing tokens](https://astryx.atmeta.com/docs/tokens)
- [Material Design 3 carousel specifications](https://m3.material.io/components/carousel/specs)
