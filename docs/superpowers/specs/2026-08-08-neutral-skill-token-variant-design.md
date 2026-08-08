# Neutral Skill Token Variant Design

## Goal

Improve readability of dense DORA capability skill rows by rendering skill tokens
with the same neutral gray surface as experience evidence tokens while retaining
brand color only in each skill logo.

## Context

The Continuous Integration capability card now selects thirteen skill evidence
items. `SkillEvidenceToken` renders each item through the shared `SkillToken`
component. The current `SkillToken` presentation applies the skill's brand color
to the entire token surface, which produces too many competing colors when a
capability card displays many skills together.

Other `SkillToken` consumers, including roadmap, project, and standalone skill
stories, still benefit from the existing brand-filled presentation. The
readability treatment must therefore be reusable and opt-in rather than a global
default change or DORA-specific CSS override.

## Recommended Approach

Add an explicit visual variant to `SkillToken`:

```ts
variant?: 'brand' | 'neutral';
```

`brand` remains the default when the prop is omitted and preserves current
behavior. `neutral` uses the Astryx `Token` gray color without brand background or
foreground overrides. `SkillEvidenceToken` selects `variant="neutral"` for DORA
capability skill evidence.

This is preferred over changing the global default because it avoids unrelated
visual changes. It is preferred over styling inside `CapabilityEvidence` because
the appearance belongs to `SkillToken` and should be reusable by any future dense
skill list.

## Rendering Contract

### Brand variant

- Continue using the skill brand color as the token background.
- Continue choosing a contrasting token foreground.
- Continue rendering Simple Icons with `currentColor`.
- Continue rendering local full-color assets as decorative images.
- Preserve existing behavior for every call site that omits `variant`.

### Neutral variant

- Render the Astryx `Token` with `color="gray"`, matching experience evidence
  tokens.
- Do not apply `--skill-token-background` or
  `--skill-token-foreground` overrides.
- Render a Simple Icons path with its own `brand.color` so only the logo is
  brand-colored.
- Render a local full-color SVG asset unchanged through the existing decorative
  image path.
- Keep missing and color-only brand mappings text-only; do not invent or fall back
  to an unrelated logo.

Both variants keep the existing small token size, stable icon dimensions, visible
label, wrapping behavior, and decorative icon accessibility.

## Component Flow

Preserve the existing shared rendering path:

```text
DoraCapabilityCard
  -> CapabilityEvidence
    -> SkillEvidenceToken
      -> SkillToken variant="neutral"
```

`SkillEvidenceToken` remains responsible only for adapting capability evidence to
`SkillToken`. No capability-specific styling, wrapper class, or new DORA component
is introduced.

## Scope

Modify only the shared `SkillToken` variant behavior, its focused tests, and the
`SkillEvidenceToken` call site/tests. Do not change:

- evidence data, scores, ordering, or grouping;
- experience token rendering;
- card spacing, row gaps, or token dimensions;
- roadmap, project, standalone skill token, or Skills-page call sites;
- icon assets, icon provenance, or brand mappings;
- links, hover cards, or interaction behavior.

## Accessibility

The visible skill label remains the accessible token text. Simple Icons and local
image assets remain decorative with `aria-hidden="true"`; local images also keep
an empty `alt`. The neutral variant changes color presentation only and adds no
focusable or clickable element.

The gray surface and brand-colored logo must preserve the Astryx token's existing
text contrast. The logo is supplemental, so comprehension must not depend on
distinguishing its color.

## Validation

Focused tests must verify:

- omitting `variant` preserves the brand-filled default;
- `variant="neutral"` uses the gray token color and has no brand surface style;
- a neutral Simple Icons token renders its path with the exact brand color;
- a neutral local AWS asset remains a full-color decorative image;
- a neutral unknown or color-only brand remains text-only;
- `SkillEvidenceToken` passes the neutral variant for DORA skill evidence; and
- existing brand-variant assertions continue to pass.

Run the focused `SkillToken` and `CapabilityEvidence` suites, followed by the
github.io Nx test, lint, production build, and Storybook build targets. Complete
real-browser checks of the Continuous Integration capability card at `390x844`
and `768x1024`, confirming the skill row uses a consistent gray surface, logos
retain brand color, the long Parameter Store token fits, and neither row
overflows.

## Error Handling

All variant and brand data is local and synchronous. An unknown variant is
prevented by TypeScript. Missing icon metadata follows the existing text-only
fallback. Tests must fail if the DORA adapter omits the neutral variant or if a
neutral token receives brand surface overrides.

## Acceptance Criteria

- DORA capability skill tokens use the same gray surface color as experience
  evidence tokens.
- Only skill logos retain brand color in the DORA skill row.
- The reusable API is `SkillToken variant="neutral"`.
- Existing consumers that omit `variant` remain brand-filled and visually
  unchanged.
- No evidence, grouping, spacing, icon asset, or interaction behavior changes.
- Focused and full verification pass without feature-introduced TypeScript errors.
- Phone and iPad Storybook checks show readable, wrapping skill tokens without
  overflow.
