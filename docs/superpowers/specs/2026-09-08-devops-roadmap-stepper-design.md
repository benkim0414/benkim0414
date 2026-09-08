# DevOps Roadmap Stepper Design

## Goal

Replace the roadmap visualization shown on the public `/roadmap` page with a
new `DevOpsRoadmapStepper`. The component will present the same ordered DevOps
topics and portfolio evidence through Astryx's vertical `Stepper` and `Step`
components. The existing React Flow-based `DevOpsRoadmap` remains available and
unchanged.

## Context

The `github.io` app currently renders `DevOpsRoadmap` from `RoadmapPage`. Its
skill-inventory projection contains 22 ordered roadmap topics, linked skill
tokens, Kubernetes certification citations, covered concepts, and visible gaps.
The repository currently uses Astryx 0.1.4, which predates the Core `Stepper`.
The official Astryx component page documents Stepper in Core 0.5.4.

The Stepper is a capability inventory rather than a wizard. It will not allow
clicking or advancing steps. Its status communicates portfolio evidence, not
completion of an interactive workflow.

## Recommended Approach

Render one continuous vertical `Stepper` with balanced density. Each roadmap
topic becomes one `Step` in its existing order:

- `label` is the roadmap node title.
- `description` is a concise, neutral summary of the corresponding roadmap.sh
  guidance.
- `indicator="number"` preserves sequence numbers for completed and upcoming
  topics.
- Evidence-backed topics receive the Astryx semantic success status.
- Topics without evidence are disabled and presented as upcoming.
- The step content contains the topic's skill tokens, certification citations,
  and covered-concept tokens.

This keeps every topic and its evidence visible without interaction, preserves
the original roadmap sequence, and follows Astryx's recommendation to use a
vertical Stepper for long descriptions.

## Component and Data Design

### `DevOpsRoadmapStepper`

Add a reusable function component beside the existing roadmap implementation.
It accepts an ordered, readonly list of roadmap items and an accessible label,
with the existing skill-inventory projection as its default data.

The component owns only presentation-derived state. For each item it derives:

- `evidenceSkillTokens` from the existing evidence-token field, falling back to
  the legacy skills field where required;
- `hasEvidence` when the item contains at least one skill token,
  certification, or covered concept;
- semantic success status for evidence-backed items; and
- disabled/upcoming presentation when no visible evidence exists.

The current dataset therefore keeps `Artifact Management` and `Service Mesh`
as upcoming gaps. `Cloud Design Patterns` remains evidence-backed because its
covered concepts are visible portfolio evidence.

Astryx derives normal progress from one contiguous `activeStep`, but this
portfolio's evidence is non-contiguous. The component will use a deliberate
no-current sentinel (`activeStep={-1}`), leaving the base sequence upcoming,
then apply semantic success to evidence-backed steps and disabled state to
unsupported steps. This avoids falsely marking an unsupported earlier topic as
completed merely because a later topic has evidence. Focused tests must verify
that the installed Astryx release renders this state without `aria-current` and
announces semantic status correctly. If the upgraded release rejects a
no-current value, implementation must stop and return to design rather than
simulate the Stepper with custom markup.

The Stepper is static: omit `onStepClick` and do not add local interaction
state. Use Astryx layout components and design tokens for any composition around
`Step` content. Do not recreate Stepper indicators, connectors, or progress
styles.

### Roadmap descriptions

Extend the shared roadmap item model with a required description for every
displayed topic. Store descriptions with the canonical ordered roadmap topic
data so both roadmap presentations can consume them without duplicating
content. The old component need not render the new field.

Descriptions will be original summaries informed by the matching roadmap.sh
topic guidance. Each should be one neutral sentence of roughly 10–20 words,
short enough to scan and not copied verbatim. Keep the existing topic titles
unless correcting an obvious source-label typo is separately approved.

### Evidence content

Reuse the existing evidence components and routing helpers:

- `SkillToken` for owned skills, linked to local skill detail routes and using
  the same neutral treatment as `SkillExperienceCard`;
- `CertificationCitation` for certifications, preserving their numbering and
  external evidence links; and
- Astryx `Token` for covered roadmap concepts.

Use semantic lists or Astryx layout components that render the appropriate list
elements. Do not introduce a card wrapper around each step.

## Page Integration

Change `RoadmapPage` to render `DevOpsRoadmapStepper` after its existing heading
and informational banner. Preserve the `/roadmap` route, page title, explanatory
copy, roadmap.sh attribution button, and surrounding page layout.

Do not delete or refactor `DevOpsRoadmap`, `DevOpsRoadmapNode`, React Flow layout
logic, or their existing tests and stories. The old component remains a usable
repository component; only the page's selected visualization changes.

## Astryx Upgrade

Upgrade `@astryxdesign/core`, `@astryxdesign/theme-neutral`, and
`@astryxdesign/cli` together to a mutually compatible release that includes the
Core Stepper documented by Astryx. Refresh the lockfile, run
`pnpm exec astryx upgrade --apply`, and regenerate/check repository Astryx agent
guidance.

After upgrading, inspect `pnpm exec astryx component Stepper` and the relevant
Astryx principles, layout, typography, tokens, and styling documentation from
the installed release. Use the installed API as the implementation source of
truth and do not invent props. Record the checked documentation in the final
implementation handoff.

## Accessibility

- Give the Stepper an explicit `label`, such as `DevOps roadmap`.
- Preserve the ordered-list semantics supplied by Astryx.
- Use `Step` labels for topic names and descriptions for supporting text.
- Keep numbered indicators through `indicator="number"`.
- Ensure evidence status is available to assistive technology through Astryx's
  semantic status contract.
- Ensure disabled/upcoming topics remain readable and are not interactive.
- Avoid adding a navigation landmark because this is a progress sequence, not
  site navigation.

## Testing and Validation

### Focused automated coverage

Add component tests that verify:

- every roadmap topic renders once and in source order;
- every topic has a non-empty description;
- steps use numbered indicators;
- evidence-backed and upcoming state derivation;
- the deliberate no-current state has no `aria-current="step"`;
- skill tokens link to skill detail pages;
- certifications retain their labels, numbering, and links;
- covered-concept tokens remain visible; and
- empty evidence sections are omitted.

Update `RoadmapPage` tests to assert the new Stepper is rendered instead of the
React Flow diagram. Add focused Storybook stories for the default full roadmap
and representative evidence-rich and upcoming steps.

### Verification commands

Run focused tests during development, followed by:

```sh
pnpm nx lint github.io
pnpm nx test github.io
pnpm nx build github.io
```

Also run the repository's Astryx agent-document checks and Storybook/browser
visual verification at desktop and mobile widths in light and dark themes.
Confirm that long titles, descriptions, certifications, and skill-token rows do
not clip or overlap.

Existing `DevOpsRoadmap` tests and stories must remain green without behavioral
changes.

## Error Handling

The component has no runtime data fetching. Missing optional evidence produces
an upcoming step rather than an error. Tests and TypeScript enforce a
description for every displayed topic. Unknown skill labels may render through
the existing text fallback, while known skills retain their local links.

Dependency migration or Stepper API incompatibilities are implementation
blockers. Do not replace Astryx Stepper with custom markup to bypass them.

## Out of Scope

- Removing or redesigning the existing React Flow roadmap component.
- Changing the public route, global navigation, page banner, or attribution.
- Interactive step selection or next/back controls.
- Filtering, searching, collapsing, or grouping roadmap topics.
- Introducing new roadmap phases or reordering topics.
- Changing the underlying skill, certification, or covered-concept models.
- Adding roadmap gaps that are not already represented by the current data.

## Risks

- **Astryx migration regressions:** upgrade all Astryx packages together, apply
  official migrations, and run the complete app verification suite.
- **No-current Stepper semantics:** verify the explicit sentinel against the
  installed component before relying on it; return to design if unsupported.
- **Page height:** keep descriptions to one short sentence and use the balanced
  vertical layout rather than hiding content.
- **Responsive wrapping:** test evidence-rich steps across mobile and desktop
  Storybook/browser viewports.
- **Source drift:** keep descriptions concise and original, and attribute the
  overall roadmap to roadmap.sh through the existing page banner.
