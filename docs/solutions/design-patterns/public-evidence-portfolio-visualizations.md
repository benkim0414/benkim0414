---
title: Build Portfolio Capability Radar From Public Evidence
date: 2026-07-27
last_updated: 2026-08-11
category: design-patterns
module: github.io DevOps capability evidence
problem_type: design_pattern
component: tooling
severity: medium
applies_when:
  - Building a reusable portfolio radar from personal capability evidence
  - Deriving capability scores from a curated public evidence projection
  - Applying bounded weights, breadth, corroboration, and exceptional-score rules
  - Rendering half-step capability scores on a stable zero-to-five domain
  - Writing mutation-resistant tests for scoring caps and prerequisites
related_components:
  - github.io DevOps capability evidence radar
  - github.io DevOpsCapabilityEvidenceRadar
  - Storybook
  - DORA capability cards
tags: [github-io, react, devops, dora, portfolio, evidence-scoring, privacy, testing]
---

# Build Portfolio Capability Radar From Public Evidence

## Context

Treat the `github.io` DORA Radar as a public portfolio visualization rather than a private operational dashboard. It should show a defensible capability signal without allowing evidence outside a card's curated projection to affect its score.

Each compact capability projection owns its capability key, label, ordered evidence IDs, and summary. The production export derives all ten Radar scores from those projections and the canonical evidence catalog rather than maintaining a second set of handwritten values (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:79`, `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:446-450`).

This separation keeps two responsibilities explicit:

- the catalog defines which public-safe evidence exists;
- each projection defines which evidence is allowed to support one displayed capability.

## Guidance

### Validate the curated projection before scoring

Resolve evidence IDs in projection order. Reject duplicate or missing references, private or sensitive evidence, and evidence that does not declare the projected capability (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:81-124`). Failing descriptively is safer than silently filtering a malformed production projection because it exposes authoring errors before publication.

Continue using `getPublicCapabilityEvidence` for catalog-level public surfaces. It removes non-public and sensitive items, and retains a skill only when separate public non-skill evidence supports a shared capability (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:41-65`).

### Calculate independent scoring components

Applied evidence is limited to experience and project records. Weight it by strength:

| Strength | Contribution |
| --- | ---: |
| Primary | 1.0 |
| Strong | 0.75 |
| Supporting | 0.5 |

The scorer caps the applied subtotal at `3.5` (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:18-35`, `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:125-135`).

Breadth comes only from distinct initiative IDs on applied evidence. The second initiative adds `0.5`; the third and later initiatives collectively add at most another `0.5`, for a breadth cap of `1.0` (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:136-147`).

Corroboration contributes at most `0.5`. It is present when the projection contains certification, education, or learning evidence, or at least three skill records backed by applied evidence in the same projection (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:148-161`).

For an ordinary score, add those components, multiply by `0.8`, round to the nearest `0.5`, and cap at `4.0`. Award `4.5` only when all exceptional prerequisites hold: at least three primary applied items, at least three initiatives, and corroboration. Keep the public maximum at `5`, but do not manufacture a score of `5` from this rubric (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:162-174`, `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:196-205`).

### Derive score metadata from the same evidence

Return the projection's label, ordered evidence IDs, summary, evidence-type counts, and the first strongest-evidence tie from the same resolved array used for calculation (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts:175-205`). This prevents a score, card summary, and evidence list from drifting apart.

### Match the visual scale to the numeric contract

The Radar remains defensive at its component boundary: it filters zero-valued caller data and renders nothing when no visible scores remain (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx:55-78`). It maps each score's `maxScore` into the axis metrics and exposes the decimal values in a visually hidden text summary.

Use ten sharp polygon divisions on the unchanged zero-to-five domain. Each grid ring then represents a half step, matching the scoring resolution (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.tsx:80-98`).

### Make scoring tests discriminate among rules

A high final score is not enough to prove every intermediate cap. Another ceiling can mask a removed rule. For each independently effective weight, cap, or exceptional prerequisite, choose a vector whose output changes when only that rule is mutated.

Use hand-derived expected values and real scorer behavior. During review, temporarily mutate the production rule and confirm the focused test fails for the expected reason; restore production code before committing.

Do not invent an isolated vector for a defensive ceiling that cannot affect the current formula. With the component caps and calibration above, the highest ordinary calculation already equals `4.0`, so the ordinary cap documents the public contract but is not independently discriminable. The production score contract records the current outputs, but cannot detect removal of this redundant ceiling; retain the cap as an explicit contract guard.

## Why This Matters

A public portfolio has a different trust boundary from an internal dashboard. Projection validation rejects private and sensitive evidence before it can influence a score, and rejects mismatched evidence rather than silently accepting it.

Independent scoring components make the upper range meaningful. Evidence volume alone cannot bypass the applied, breadth, or corroboration caps; together with calibration they already constrain the highest ordinary calculation to `4.0`. The explicit ordinary cap documents that ceiling, while `4.5` remains a conjunction of independently valuable signals.

Discriminating tests protect that meaning. A test that still passes after an independently effective target rule is removed creates confidence without protection; isolated vectors make such masking visible. The production score test complements those unit vectors by locking all ten labels and values, requiring half-step increments, retaining `maxScore: 5`, and rejecting any current score of `5` (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts:403-440`).

## When to Apply

- A portfolio or maturity visualization must be defensible from deliberately selected public evidence.
- Shared evidence may support several capabilities, but each card must own the subset and order that affects its score.
- The scale needs diminishing returns, initiative breadth, and corroboration rather than an unbounded additive tally.
- An exceptional band must require several independent prerequisites.
- A fractional score needs matching visual resolution and an accessible textual equivalent.

Do not use this pattern as a recency model. The scorer deliberately does not read evidence dates when calculating scores.

## Examples

### Derive the stable production export

```ts
export const curatedDevOpsCapabilityRadarScores =
  getCapabilityEvidenceScores(
    curatedDevOpsCapabilityRadarScoreProjections,
    devOpsCapabilityEvidenceItems,
  );
```

The projections remain module-private implementation data while the computed score array is exported (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:446-450`).

### Isolate the applied subtotal cap

Five primary records on one initiative score `3.0`: the `3.5` applied cap is calibrated to `2.8` and rounded to `3.0`. Without the applied cap, the ordinary cap would instead produce `4.0`. The focused fixture locks this distinction (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.spec.ts:129-138`).

### Isolate the breadth cap

Four supporting records across four initiatives have an applied subtotal of `2.0`. Capped breadth yields `(2.0 + 1.0) × 0.8 = 2.4`, rounded to `2.5`; uncapped breadth would round to `3.0` (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.spec.ts:140-156`).

### Distinguish strong from supporting evidence

One strong item alone rounds to the same `0.5` result as one supporting item, so that fixture cannot protect the `0.75` weight. One primary plus one strong item scores `1.5`; changing strong to `0.5` would instead score `1.0` (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.spec.ts:103-127`).

### Isolate exceptional prerequisites

Begin with three primary items on three initiatives and three backed skills. To test the primary-count gate, change the third item from primary to strong while retaining its ID, initiative, and supporting skill. To test breadth, retain the third primary but reuse the second initiative. To test corroboration, retain all applied items and initiatives but remove the skills. Each mutation must prevent `4.5` (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.spec.ts:203-237`).

### Verify the sharp half-step Radar

The component test asserts the decimal accessible summary, ten grid-divider paths, and zero circular grid dividers (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx:34-55`). Keep `Default` and narrow-viewport Storybook stories available for visual checks of label legibility, clipping, density, and overflow.

## Related

- `CONCEPTS.md`
- `docs/solutions/conventions/tokenize-dora-capability-evidence.md`
- `docs/solutions/design-patterns/compact-capability-evidence-renderers.md`
- `docs/solutions/design-patterns/standalone-github-io-devops-capability-radar.md`
- `docs/solutions/ui-bugs/devops-capability-evidence-radar-ipad-label-clipping.md`
- `docs/solutions/workflow-issues/verify-storybook-from-linked-worktree.md`
