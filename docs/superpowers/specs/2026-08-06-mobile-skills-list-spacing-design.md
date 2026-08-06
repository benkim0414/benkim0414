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
- Astryx spacing steps define the page rhythm.
- `MobileSkillsPage` owns outer layout spacing.
- `SkillCarousel` continues to own its internal card spacing.

Material 3 carousel guidance is a secondary reference. The installed Astryx
component contract and spacing scale remain the primary source of truth.

## Recommended Design

Keep the change in `MobileSkillsPage`. Do not modify the reusable
`SkillCarousel` or `SkillCardList` defaults.

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
- Carousel inline page inset: `spacing-4` (`16px`) on both sides.
- Carousel to the full-list label: `spacing-4` (`16px`).
- Full-list label to the first card or empty state: `spacing-3` (`12px`).
- Page bottom inset: retain `spacing-4` (`16px`).
- Carousel card-to-card gap: retain the existing `gap={3}` (`12px`).
- Full-list card-to-card gap: retain the existing `gap={3}` (`12px`).

The page should express the 16px outer spacing through its existing layout
wrappers. The label and full list should be composed in an Astryx `VStack`
using `gap={3}`. No local typography rules or changes to generated carousel
internals are needed.

## Component Boundaries

`MobileSkillsPage` remains responsible for:

- Page hierarchy and section labels.
- Fixed carousel placement above the scrollable list.
- Outer page insets and spacing between major regions.
- Search filtering and list empty-state selection.

`SkillCarousel` remains responsible for:

- Rendering highlighted skill cards.
- Carousel semantics, snapping, and internal card gap.
- Its highlighted-skills empty state.

`SkillCardList` remains responsible for:

- Rendering full-width skill cards or its empty state.
- Internal card-to-card spacing.
- The list region's accessible name.

No new component or public prop is required.

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
- The carousel wrapper has the intended 16px outer spacing.
- The label-to-list composition uses the Astryx 12px gap.
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
- Refactoring shared list or carousel components.
- Redesigning desktop layouts.

## Reference

- [Material Design 3 carousel specifications](https://m3.material.io/components/carousel/specs)
