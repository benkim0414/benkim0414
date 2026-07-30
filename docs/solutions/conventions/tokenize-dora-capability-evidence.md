---
title: Tokenize DORA Capability Evidence
date: 2026-07-30
category: conventions
module: github.io DevOps capability evidence
problem_type: convention
component: documentation
severity: medium
applies_when:
  - Storing carved evidence for DORA capability scores
  - Translating interview answers or broad portfolio proof into public evidence data
  - Linking capability radar scores to evidence catalog items
related_components:
  - github.io DevOps capability evidence radar
  - CapabilityEvidence renderer
tags: [github-io, dora, evidence, portfolio, data-model, privacy]
---

# Tokenize DORA Capability Evidence

## Context

The DevOps capability evidence model needs to store public portfolio proof, not raw interview answers. Broad evidence items were initially useful for seeding the radar, but they hid several distinct proof signals behind labels such as CI/CD workflow ownership, Kubernetes learning, and DevOps roadmap. The current data model now stores capability score rows with explicit `evidenceIds`, `strongestEvidenceId`, and `evidenceCounts` fields in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:57`.

The evidence catalog is a public projection. Individual entries carry compact labels, public-safe summaries, evidence type, strength, technologies, and one or more DORA capability keys in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:209`.

## Guidance

When a user provides evidence for DORA capability questions, carve the answer into compact evidence tokens rather than preserving the full answer as one large item. A good token is a short proof phrase that can stand alone in a token or citation UI: `IRSA`, `Image digests`, `Nx affected`, `Postgres tests`, `GitHub Actions`, or `Roadmap repo`.

Each token should still carry a safe summary. The summary explains the proof without exposing private repositories, customer names, operational records, incident IDs, or exact workplace details. The safety test rejects obvious private-detail patterns while requiring each catalog item to have a non-empty summary, capability mapping, and recognized strength in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts:121`.

Link tokens to every DORA capability they genuinely support, but keep the primary meaning narrow. For example, `image-digest-deployments` supports both `pervasive-security` and `deployment-automation`, while `irsa-service-accounts` supports `pervasive-security` and `flexible-infrastructure` in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:297` and `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:310`.

Update the curated score row at the same time as the catalog. The score row should list the linked token IDs, identify the strongest evidence ID, and keep `evidenceCounts` in sync with the referenced item types. The integrity test walks every curated score, verifies referenced IDs exist, checks each referenced item includes the score capability key, and compares derived counts to `score.evidenceCounts` in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts:413`.

Keep broad certification and skill evidence when it is already token-sized. Split only where the old evidence bundles multiple concrete proof signals. In the current catalog, the Kubernetes certification and Kubernetes skill remain intact, while the broader Kubernetes learning item became `Workloads`, `kubectl`, and `Cluster ops`.

## Why This Matters

Evidence tokens make the radar auditable. A score backed by several concrete tokens is easier to inspect than a score backed by one broad narrative item, and the UI can show compact proof without inventing fallback labels from long prose.

Tokenization also protects privacy. The public site can communicate capability evidence without storing the original interview answer, exact workplace details, or private operational specifics.

## When to Apply

- A DORA capability score needs evidence copied from an interview or conversation.
- One broad evidence item contains several independent proof signals.
- A new evidence item should render well as a compact token or citation.
- Score-level `evidenceIds`, `strongestEvidenceId`, or `evidenceCounts` are changed.

## Examples

Split a broad workplace answer into separate evidence tokens:

```ts
{
  id: 'image-digest-deployments',
  label: 'Image digests',
  type: 'experience',
  capabilityKeys: ['pervasive-security', 'deployment-automation'],
  summary:
    'Improved deployment supply-chain safety by moving container image references from commit-hash tags to immutable image digests.',
}
```

Then link the token from every supported score row:

```ts
{
  capabilityKey: 'pervasive-security',
  evidenceIds: [
    'image-digest-deployments',
    'irsa-service-accounts',
    'terraform-scoped-iam',
  ],
  strongestEvidenceId: 'irsa-service-accounts',
  evidenceCounts: { experience: 3 },
}
```

The same rule applies to previously captured broad evidence. CI/CD workflow ownership was split into `GitHub Actions`, `Docker`, and `Team delivery`; Kubernetes learning was split into `Workloads`, `kubectl`, and `Cluster ops`; the DevOps roadmap project was split into `Portfolio radar` and `Roadmap repo`. The regression test fixes those expected compact tokens in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts:339`.

## Related

- `docs/solutions/design-patterns/public-evidence-portfolio-visualizations.md`
- `docs/solutions/design-patterns/compact-capability-evidence-renderers.md`
- `CONCEPTS.md`
