# Evidence-Calibrated DORA Radar Scoring Design

## Goal

Recalculate every DORA capability score from the public evidence curated for its capability card. Keep the Radar maximum at `5`, constrain scores to `0.5` increments, reserve `4.5` for exceptional evidence, and leave `5` as visible headroom rather than an attainable result of the current rubric.

The score must be repeatable and auditable from existing evidence metadata. Handwritten per-capability score overrides are not part of this design.

## Current State

`curatedDevOpsCapabilityRadarScores` owns handwritten whole-number scores alongside each capability's ordered evidence IDs and summary. The Radar renders those values against `maxScore: 5` with five divisions. A separate `getCapabilityEvidenceScores` helper sums evidence strength across a full catalog and caps the result at five, but it is not the production Radar's scoring source.

This creates two scoring concepts, allows score values to drift from card evidence, and gives no documented meaning to the distance between adjacent Radar values.

## Scoring Source

Only public, non-sensitive evidence referenced by the capability's curated card projection participates in scoring. Evidence elsewhere in the full catalog does not affect the score until it is deliberately added to the card projection.

The curated projection owns:

- capability key;
- shortened Radar label;
- ordered evidence IDs; and
- capability evidence summary.

The scoring function derives the score, maximum, evidence-type counts, and strongest evidence ID. When multiple items share the strongest rating, their curated order breaks the tie.

## Evidence-Maturity Rubric

### Applied outcomes

Only `experience` and `project` evidence contributes directly to the applied-outcome subtotal:

| Strength | Contribution |
| --- | ---: |
| `primary` | 1.0 |
| `strong` | 0.75 |
| `supporting` | 0.5 |

The applied-outcome subtotal is capped at `3.5`. The cap creates diminishing returns: a large collection of related accomplishments cannot fill the scale by volume alone.

### Delivery breadth

Breadth is based on distinct `details.initiative.id` values among the curated applied evidence:

- first initiative: no bonus;
- second initiative: `+0.5`; and
- third or later initiative: one additional `+0.5` total.

The breadth subtotal is capped at `1.0`.

### Corroboration

Corroboration contributes at most `0.5`, awarded once when either condition is met:

- the curated projection includes at least one certification, education, or learning item; or
- it includes at least three skills whose `supportingEvidenceIds` resolve to applied evidence in the same curated projection.

Skills and certifications do not contribute directly to the applied-outcome subtotal. Their quantity cannot raise corroboration beyond `0.5`.

### Calibration and top-band gates

1. Add the applied-outcome, breadth, and corroboration subtotals to produce the raw maturity score.
2. Multiply the raw score by `0.8`.
3. Round to the nearest `0.5`.
4. Clamp ordinary results to the range `0` through `4.0`.
5. Override the result to `4.5` only when the exceptional gate passes: at least three primary applied outcomes, at least three distinct initiatives, and corroboration.

The displayed maximum remains `5`. The current rubric never awards `5`; it represents visible room for future growth or a later, explicitly designed mastery tier.

Evidence age does not reduce the score. Recency may inform future evidence curation, but it is not part of the calculation.

## Recalculated Scores

Applying the rubric to the current curated projections produces:

| Capability | Current | Recalculated |
| --- | ---: | ---: |
| Version Control | 4.0 | 4.5 |
| Trunk-Based Development | 4.0 | 3.5 |
| Continuous Integration | 4.0 | 3.5 |
| Test Automation | 3.0 | 3.5 |
| Pervasive Security | 2.0 | 3.5 |
| Continuous Delivery | 4.0 | 3.5 |
| Deployment Automation | 4.0 | 3.0 |
| Flexible Infrastructure | 4.0 | 3.5 |
| Monitoring and Observability | 3.0 | 3.0 |
| Documentation Quality | 4.0 | 3.0 |

Version Control is the only current capability that passes the exceptional gate. It has four primary applied outcomes across three initiatives plus backed skill evidence.

## Components and Data Flow

### Curated projection model

Introduce an input type that omits derived score fields from `DoraCapabilityScore`. Convert the existing handwritten score collection into curated projection data without changing capability order, labels, evidence order, or summaries.

### Scoring function

Replace the existing additive `getCapabilityEvidenceScores` behavior with the evidence-maturity rubric. The function accepts curated projections and the aggregate evidence catalog, validates every reference, and returns complete `DoraCapabilityScore` objects.

The production `curatedDevOpsCapabilityRadarScores` export becomes the computed result. Existing card, story, page, summary, and Radar consumers continue using that export.

### Radar

Change the Radar from five divisions to ten divisions so each ring represents `0.5` on the unchanged `0–5` scale. Decimal data points, tooltip values, and the existing visually hidden score summary require no separate formatting path.

No layout, theme, color, label, tooltip, or animation behavior changes.

## Data Integrity and Failure Behavior

Scoring is invalid when a curated evidence ID:

- does not resolve in the aggregate catalog;
- resolves to non-public or sensitive evidence;
- appears more than once in a projection; or
- is a skill counted for corroboration without a support link to applied evidence in the same projection.

Invalid curated data must produce a descriptive error rather than silently lowering or inflating a score. Static production fixtures and focused tests provide the primary guard against these failures.

Evidence-type counts are derived from the resolved projection instead of maintained separately. This prevents displayed evidence summaries from drifting from the card rows.

## Validation

Unit tests for the scorer will cover:

- all three evidence-strength weights;
- the applied-outcome and breadth caps;
- the `0.8` calibration and nearest-`0.5` rounding;
- the ordinary `4.0` cap;
- the exceptional `4.5` override and each missing prerequisite;
- capped corroboration from certifications, learning, education, and backed skills;
- skills that do not resolve to same-projection applied evidence;
- missing, duplicate, private, and sensitive evidence references;
- derived evidence counts and strongest-evidence tie-breaking; and
- no recency-based score changes.

Production-data tests will assert:

- the exact ten recalculated scores listed above;
- every score is a `0.5` increment between `0` and `4.5`;
- every `maxScore` is `5`; and
- capability order, labels, curated evidence IDs, and summaries remain unchanged.

Radar tests will assert ten divisions and decimal series values. Existing DORA capability card, story, and evidence-ordering tests remain regression coverage. The focused validation command is `pnpm nx test github.io`.

## Boundaries

This change does not:

- add, remove, rewrite, or reorder capability evidence;
- change capability-card content or layout;
- change capability ordering or Radar labels;
- redesign the Radar;
- introduce recency weighting;
- use evidence outside the curated card projection; or
- award a score of `5`.

## Risks

- Ten Radar divisions may appear visually denser. The implementation should retain the current MUI defaults and verify the component story at its existing dimensions.
- Several scores decrease because the new scale intentionally preserves headroom. Exact dataset assertions make those changes deliberate and reviewable.
- Evidence records without initiative metadata cannot earn breadth credit. This is intentional; missing structure should not be inferred from prose.
- Replacing the generic additive helper changes its test contract. The implementation must remove the obsolete behavior and avoid leaving two competing scoring formulas.
