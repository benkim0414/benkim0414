---
type: domain
title: Skills and capability evidence
description: Public-safe evidence, curated projections, skill resolution, and calibrated capability scores.
tags: [skills, evidence, capabilities, domain]
verified:
  - by: openwiki/0.5.0
    at: 2026-09-09T03:17:16.871Z
sources:
  - id: openwiki-source-d004d8237034180f25bca313
    resource: repo://apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts
  - id: openwiki-source-bcd58fc33f104c190f9326be
    resource: repo://apps/github.io/src/app/skills/skill-detail-resolver.ts
generated: { by: "codex", at: "2026-09-08T02:06:28.031Z" }
---

# Skills and capability evidence

[CONCEPTS.md](../../CONCEPTS.md) owns the vocabulary. The Capability Evidence
Catalog holds reusable public-safe facts; a Compact Capability Projection selects
the evidence and order for one compact surface. Adding unrelated catalog records
must not silently change that surface's score. These are portfolio maturity
signals, not measurements of a production team's delivery performance.

Public capability filtering requires `isPublic` and rejects `isSensitive` items.
A skill item additionally needs separate public, non-skill supporting evidence
sharing a capability. A skill label alone is not proof. Scoring consumes explicit
projection references and throws for duplicate, missing, private, sensitive, or
wrong-capability evidence rather than silently scoring invalid input.

The calibrated score combines applied experience/project evidence (strengths
0.5, 0.75, or 1, capped at 3.5), initiative breadth (0.5 per initiative beyond
the first, capped at 1), and corroboration (0.5 for curated certification,
education, learning, or at least three applied-evidence-backed skills). Ordinary
scores multiply the sum by 0.8, round to halves, and cap at 4. The exceptional
4.5 tier requires at least three primary applied records, three distinct
initiatives, and corroboration. The displayed scale's maximum is 5.

Skill detail is a separate projection. An unknown skill returns `not-found`.
Without a curated detail record, the resolver derives experience evidence and
related skills, leaving narrative and project lists empty. With a record,
narratives must exist, be public and non-sensitive, and declare that skill;
projects must resolve. Explicit experience evidence must be public, non-sensitive,
and of type `experience`. Broken references throw, distinguishing invalid authored
data from a visitor's unknown URL.

When extending data, change the catalog and its intended projections explicitly,
then exercise resolver/scoring tests. Do not introduce private source material as
evidence simply because it describes real work. See [route integration](../architecture/github-io.md)
and [validation](../workflows/validation.md).
