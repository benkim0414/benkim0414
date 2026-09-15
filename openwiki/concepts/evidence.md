---
type: domain
title: Skills and capability evidence
description: Public-safe evidence, curated projections, skill resolution, and calibrated capability scores.
tags: [skills, evidence, capabilities, domain]
sources:
  - id: openwiki-source-d004d8237034180f25bca313
    resource: repo://apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.scoring.ts
  - id: openwiki-source-c74ed2ffc48c42eefc7d7f1b
    resource: repo://apps/github.io/src/app/devops-roadmap/devops-roadmap-skill-inventory.data.spec.ts
  - id: openwiki-source-16f3c4caa37e89d7694f060b
    resource: repo://apps/github.io/src/app/devops-roadmap/devops-roadmap-skill-inventory.data.ts
  - id: openwiki-source-931cab7abf1d26363f1a35b7
    resource: repo://apps/github.io/src/app/devops-roadmap/devops-roadmap-stepper.tsx
  - id: openwiki-source-43f6485bd500f1f79408e2e3
    resource: repo://apps/github.io/src/app/devops-roadmap/devops-roadmap.data.ts
  - id: openwiki-source-e15aaceb559c1219a1e6667c
    resource: repo://apps/github.io/src/app/projects/project-card.spec.tsx
  - id: openwiki-source-bd7d75b07e3062c09dcab6e9
    resource: repo://apps/github.io/src/app/projects/project-card.tsx
  - id: openwiki-source-bcd58fc33f104c190f9326be
    resource: repo://apps/github.io/src/app/skills/skill-detail-resolver.ts
  - id: openwiki-source-61956fea1deed015d3bafd72
    resource: repo://apps/github.io/src/app/skills/skill-experience-card-list.tsx
  - id: openwiki-source-6d3d436c779dec5facaf5f2d
    resource: repo://apps/github.io/src/app/skills/skill-experience-card-shell.tsx
  - id: openwiki-source-ba5c27392181e6c65798f3c4
    resource: repo://apps/github.io/src/app/skills/skill-experience-list.tsx
  - id: openwiki-source-b4039a7397de0bc8565df5e3
    resource: repo://apps/github.io/src/app/skills/skill-list.data.ts
generated: { by: "codex", at: "2026-09-15T03:04:17.043Z" }
verified:
  - by: openwiki/0.5.0
    at: 2026-09-15T03:04:17.043Z
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

The rendered detail projection keeps orientation and proof separate. Each
experience entry keeps its source summary visible, then places ordered authored
narratives or distinct capability facts and relevant-skill tokens behind one
disclosure. The UI calls the mixed narrative points and facts `Highlights`
rather than `Outcomes`: the collection includes actions, methods, context, and
effects, so the broader presentation label avoids implying that every point is
a measured result. The disclosure labels and counts only non-empty projections.
While both exist, the collapsed trigger names both; once expanded, it retains
the highlight count and each renderer moves the visible `Relevant skills` label
and count above the accessible token list. A skills-only disclosure instead
keeps that label and count in its trigger beside the chevron in both states, and
omits a duplicate heading above the tokens. An entry with neither projection has
no disclosure. The standalone detail route presents entries in cards and
disclosures, whereas the table inspector uses an unframed always-visible list
with the same labels and count badges.
The proof starts collapsed when the initial viewport selects the shared compact
bottom-sheet surface and expanded on the non-compact adjacent-panel surface.
Later viewport changes preserve the visitor's choice without truncating or
discarding evidence. Capability facts equal to the summary are filtered so the
same claim is not repeated. Internal names such as `outcomeCount` and
`SkillKeyOutcomes` remain implementation vocabulary; the shared presentation
does not collapse the two source models or move projection rules into the
resolver.

Project cards similarly keep the project summary visible and place only their
skill-token projection behind a `Skills used` disclosure with a count. The
repository link remains a separate, labelled GitHub action rather than turning
the evidence card into navigation.

The DevOps roadmap inventory is another separate, display-oriented projection.
Its 22 canonical topics and concise descriptions define the source order, while
the inventory explicitly associates each topic with skill labels,
certifications, or covered concepts. The Stepper treats any of those visible
associations as completed evidence and treats a topic with none as an upcoming,
disabled step. This is a presentation rule, not the capability scoring model:
roadmap skill and concept tokens must not be interpreted as scored proof.

Descriptions are shared between the canonical roadmap and its evidence
inventory, and tests require both projections to have the same IDs, titles,
descriptions, and order. Artifact Management is completed by explicit Amazon
ECR and GitHub Packages evidence, while Service Mesh remains the intentional
unsupported gap. Additions should update the explicit inventory rather than
inferring evidence from unrelated catalog entries.

When extending data, change the catalog and its intended projections explicitly,
then exercise resolver/scoring tests. Do not introduce private source material as
evidence simply because it describes real work. See [route integration](../architecture/github-io.md)
and [validation](../workflows/validation.md).
