# DORA Capability Card Design

## Goal

Create a reusable `DoraCapabilityCard` component for the `github.io` DevOps
capability evidence model. The card should show one full DORA capability title,
a concise description of that capability, and the merged evidence already stored
for that capability.

The component should use the current evidence catalog in
`devOpsCapabilityEvidenceItems` and the curated evidence order in
`curatedDevOpsCapabilityRadarScores`. It should render evidence through the
existing `CapabilityEvidence` component rather than introducing a separate
token renderer.

## Context

The merged `main` data now stores the recovered DORA interview evidence in
`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts`.
There are 10 curated DORA capability scores and 19 evidence catalog items. The
tests in `devops-capability-evidence.spec.ts` already protect the recovered
evidence IDs, labels, capability mappings, evidence counts, and score-to-catalog
links.

The existing `CapabilityEvidence` renderer already knows how to display each
`CapabilityEvidenceItem` as a compact token or citation:

- skills use `SkillToken`;
- learning, experience, and education use Astryx `Token`;
- certifications use `CertificationCitation`;
- projects use Astryx `Citation`.

`DoraCapabilityCard` should compose this existing renderer so the card inherits
the current label, icon, certification, link, and accessibility behavior.

## Scope

In scope:

- Add a reusable `DoraCapabilityCard` component.
- Add capability descriptions for the 10 existing DORA capability keys.
- Add a pure helper that selects and orders card evidence for one capability.
- Use `curatedDevOpsCapabilityRadarScores[*].evidenceIds` as the preferred
  evidence order.
- Fall back to filtering `devOpsCapabilityEvidenceItems` by `capabilityKeys`
  when a curated score is not provided.
- Group evidence into three visual rows: skills, certifications, then all other
  evidence.
- Render every evidence item with `CapabilityEvidence`.
- Allow each row to wrap automatically when evidence overflows.
- Omit empty rows and do not show visible labels for the rows.
- Add focused unit tests and Storybook stories for the card.

Out of scope:

- Changing the merged evidence catalog.
- Changing curated radar scores, score calculation, or public filtering rules.
- Adding the card to the main app page.
- Replacing the existing radar chart.
- Creating a generic non-DORA card system.
- Creating a second compact token renderer separate from `CapabilityEvidence`.

## Data Sources

The card should consume existing data:

```ts
import {
  curatedDevOpsCapabilityRadarScores,
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
```

`doraCapabilityDefinitions` provides the card title through
`DoraCapabilityDefinition.label`.

`devOpsCapabilityEvidenceItems` provides the catalog items that the card
renders.

`curatedDevOpsCapabilityRadarScores` provides the preferred order for evidence
within each capability. This matters because the recovered interview evidence
has already been carved and ordered there.

## Capability Descriptions

Add a small description map beside the card:

```ts
export const doraCapabilityDescriptions = {
  'continuous-delivery':
    'Keeps software releasable through small changes, repeatable release paths, and fast feedback before production.',
  'deployment-automation':
    'Uses automated deployment paths so releases are repeatable, visible, and less dependent on manual coordination.',
  'continuous-integration':
    'Integrates changes frequently with automated checks that expose quality and compatibility issues early.',
  'test-automation':
    'Builds confidence through repeatable automated tests across important product and delivery workflows.',
  'monitoring-observability':
    'Makes systems understandable in operation through telemetry, alerting, debugging signals, and production feedback.',
  'flexible-infrastructure':
    'Uses adaptable infrastructure practices that support repeatable environments, scaling, recovery, and change.',
  'pervasive-security':
    'Treats security as part of everyday delivery through secure defaults, review, automation, and risk-aware practices.',
  'trunk-based-development':
    'Keeps integration paths short through small changes, shared branches, and fast review or merge feedback.',
  'documentation-quality':
    'Keeps technical context findable and maintainable through accurate docs, decision records, and operational notes.',
  'version-control':
    'Uses source control practices that preserve history, support collaboration, and make changes reviewable.',
} as const satisfies Record<DoraCapabilityKey, string>;
```

## Evidence Selection

Add a pure helper such as `getDoraCapabilityCardEvidenceRows()`:

```ts
type DoraCapabilityCardEvidenceGroup = 'skills' | 'certifications' | 'other';

interface DoraCapabilityCardEvidenceRow {
  group: DoraCapabilityCardEvidenceGroup;
  evidence: readonly CapabilityEvidenceItem[];
}
```

The helper should:

1. Find the curated score for the requested capability key.
2. If the score exists, select catalog evidence by `score.evidenceIds` in that
   exact order.
3. If no score exists, select catalog evidence whose `capabilityKeys` include
   the requested capability key.
4. Exclude score IDs that do not resolve to catalog items.
5. Group selected evidence in this order:
   - `skill` evidence;
   - `certification` evidence;
   - every other evidence type.
6. Omit empty groups.
7. Keep evidence item identity intact so `CapabilityEvidence` controls labels,
   icons, links, and citation behavior.

The helper should not filter private data or recalculate scores. Current callers
will pass the public-safe merged catalog.

## Component Design

`DoraCapabilityCard` should accept a capability, description, evidence catalog,
and optional curated scores:

```ts
interface DoraCapabilityCardProps {
  capability: DoraCapabilityDefinition;
  description: string;
  evidence: readonly CapabilityEvidenceItem[];
  scores?: readonly DoraCapabilityScore[];
}
```

The component should render:

- an Astryx `Card`;
- an article labelled by the full capability title;
- the title as visible heading text;
- the description as body text;
- evidence rows below the description.

Each row should render an unlabelled wrapping list:

```tsx
<ul aria-label={`${capability.label} skill evidence`}>
  {row.evidence.map((item, index) => (
    <li key={item.id}>
      <CapabilityEvidence evidence={item} citationNumber={index + 1} />
    </li>
  ))}
</ul>
```

The row accessibility label should name the capability and evidence group, but
there should be no visible row labels. This preserves the user's requested
visual design while keeping the grouping understandable to assistive
technology.

## Layout And Styling

- Use Astryx layout primitives where they fit the existing app style.
- Use StyleX for narrow component-specific layout.
- Keep the card page-agnostic; do not define page grids or route placement.
- Use flex wrapping for each evidence row.
- Keep stable spacing between rows and between wrapped evidence items.
- Do not nest cards.
- Do not add global CSS.

## Storybook

Add focused stories for:

- a fully populated capability such as Flexible Infrastructure;
- a capability with only other evidence, such as Continuous Integration;
- a certification-bearing capability, such as Monitoring and Observability;
- a sparse capability, such as Documentation Quality;
- a wrapping stress case using the merged catalog.

Stories should use the real merged data by default so visual review catches
actual evidence labels and citation widths.

## Tests

Add focused tests for:

- rendering the full capability title and description;
- selecting evidence in curated score order;
- falling back to `capabilityKeys` filtering when scores are absent;
- rendering rows in skill, certification, other order;
- omitting empty rows;
- rendering all evidence through `CapabilityEvidence`;
- not showing visible row labels;
- preserving wrapping row attributes or styles;
- rendering the merged Flexible Infrastructure evidence with skill,
  certification, and other rows.

Focused verification:

```bash
pnpm exec vitest run --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
```

Final app checks when feasible:

```bash
pnpm nx test github.io
pnpm nx build github.io
```

## Risks

- The card could duplicate `CapabilityEvidence` behavior. Mitigation: pass
  whole evidence items through `CapabilityEvidence` and keep the card
  responsible only for selection, ordering, grouping, and layout.
- Curated score IDs could drift from the catalog. Mitigation: keep the existing
  score-to-catalog tests and add card helper tests for unresolved IDs.
- Real evidence labels may wrap awkwardly. Mitigation: use the real merged data
  in Storybook and keep rows flex-wrapped.
- The component could become page-specific. Mitigation: keep app placement and
  multi-card layout out of this spec.

## Acceptance Criteria

- A DORA capability card renders the full capability title, description, and
  merged evidence for that capability.
- Evidence is ordered from curated score evidence IDs when available.
- Evidence rows appear in skill, certification, other order with no visible row
  labels.
- Rows wrap automatically when evidence overflows.
- Evidence rendering is delegated to `CapabilityEvidence`.
- The merged 10-capability evidence data remains unchanged.
- Focused card and evidence tests pass, or any environment failure is reported
  exactly.
