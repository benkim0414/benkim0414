---
title: Tokenize DORA Capability Evidence
date: 2026-07-30
last_updated: 2026-08-08
category: conventions
module: github.io DevOps capability evidence
problem_type: convention
component: documentation
severity: medium
applies_when:
  - Publishing DORA capability evidence derived from private source material
  - Maintaining a full evidence history beside a compact card projection
  - Separating demonstrated experience from evidence-backed skills
  - Preserving deterministic evidence selection and chronology
  - Rendering dense skill evidence with readable neutral tokens
related_components:
  - github.io DevOps capability evidence radar
  - CapabilityEvidence renderer
tags: [github-io, dora, continuous-integration, evidence-model, privacy, curated-projection, chronology, skill-tokens]
---

# Tokenize DORA Capability Evidence

## Context

The DevOps capability evidence model publishes portfolio proof, not raw interview answers or private workplace material. A broad story often contains several independently useful accomplishments, but a compact capability card can show only a curated subset. Treat these as two separate ownership concerns:

- Full catalogs own reusable, atomic evidence records.
- Capability scores own the smaller public projection used by compact cards.

The Continuous Integration example makes that boundary concrete. Its experience catalog has 18 stable IDs, with an explicit expected-ID and uniqueness contract in `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts:6-35`. A separate skill catalog has 13 stable IDs and links every skill to one or more supporting experience records in `apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.spec.ts:4-21` and `apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.spec.ts:114-149`.

The shared evidence catalog composes both datasets in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:256-257`. The CI score then selects exactly five experience IDs before appending the canonical skill IDs, with matching counts, in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:89-103`.

## Guidance

### Store atomic public evidence

Model each independently useful accomplishment as one `CapabilityEvidenceItem`. Give it a durable public ID, compact label, descriptive title, capability keys, strength, generalized summary, and specific public technology names. Keep dates, metrics, denominators, initiatives, and facts structured through `CapabilityEvidenceDetails` rather than hiding them in display prose (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts:30-56`).

Atomic means that one record should express one contribution that can be selected, scored, linked, or displayed independently. It does not mean removing useful specificity. Public technology names such as AWS CodePipeline, GitHub Actions, Nx, Docker, Helm, Kustomize, and Argo CD can remain explicit, as can dates and numeric results. Generalize or omit the organization, repository, account, internal service, workflow, module, image, parameter path, proof URL, and business identifiers that would disclose private context.

Privacy is a data contract, not a final copy-editing pass. Every CI experience must be public, non-sensitive, organization-free, proof-URL-free, dated, and backed by at least one fact (`apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts:132-170`). A regression test also rejects URLs, 12-digit account-like values, parameter paths, and employer, customer, or client wording (`apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts:173-180`). Apply the same boundary to the skill catalog (`apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.spec.ts:140-149`).

### Keep skills separate and evidence-backed

A skill is a competency supported by accomplishments, not another accomplishment and not every string found in an experience's `technologies` array. Store it as `type: 'skill'` with an official public name and focused `supportingEvidenceIds`. The shared type makes that relationship explicit at `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts:64-84`.

Each support ID must resolve to a real experience record. The CI skill tests lock those focused links and reject empty or non-experience support in `apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.spec.ts:114-137`. This prevents unsupported or circular skill claims while leaving the same experience reusable by several genuinely related skills.

### Make the compact projection explicit

Do not derive the compact card with `slice(0, 5)`, runtime ranking, or incidental catalog order. Keep its selected experience IDs literally in the capability score, append the canonical skill IDs, and update `evidenceCounts` in the same change. Integrity tests verify that every referenced ID exists, supports the capability, and matches the declared type counts (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts:417-446`). A separate CI assertion locks the exact five experiences and the complete ordered skill suffix (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts:449-469`).

The card resolver follows score order and skips unresolved IDs; it does not truncate or re-rank the full catalog (`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.ts:35-52`). Adding a sixth experience to the catalog does not change the current compact summary unless the score references change.

### Separate chronology from grouping

Chronology belongs to canonical data order. For CI skills, tests derive each skill's earliest supporting experience date and lock delivery-flow order for equal dates (`apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.spec.ts:80-111`). The score reuses that order by mapping over the canonical skill catalog (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:93-100`).

Presentation grouping is a separate operation. The card maps evidence types into `applied`, `certifications`, `skills`, and `learning`, emits groups in that fixed order, and preserves score order inside each group (`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.ts:15-29` and `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.ts:54-77`). Do not use UI grouping as the chronology algorithm.

### Keep dense skill tokens readable

Capability skill rows use neutral token chrome so thirteen brands do not compete for attention. `SkillEvidenceToken` opts into the shared `SkillToken` with `variant="neutral"` at `apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx:41-55`. The neutral variant uses the gray Astryx token surface and applies brand color only to a real inline logo; locally bundled full-color assets remain unchanged, and missing logos remain text-only (`apps/github.io/src/app/skills/skill-token.tsx:32-84`).

The compact card labels these rows `Experience` and `Skills` with supporting, secondary text and uses the visible labels as the lists' accessible names (`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx:24-29` and `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx:70-85`).

## Why This Matters

Separating catalog ownership from projection ownership keeps the evidence reusable. A dedicated capability page can consume the full history while the compact card remains a deliberate five-experience summary plus supported skills. Stable IDs make every score auditable, structured details preserve evidence strength, and focused support links explain why each skill belongs.

The boundaries also prevent three common failures:

- Catalog growth accidentally changes a compact card.
- Technology strings overstate skills that lack concrete support.
- Public presentation leaks private context copied from source material.

Neutral skill surfaces and visible row labels solve the related presentation problem. Experience and skill evidence stay scannable as one system without turning every brand into a competing colored token.

## When to Apply

- Translating verified private work history into public capability evidence.
- Splitting one broad answer into accomplishments that should be independently reusable or scored.
- Adding a skill that must be backed by concrete experience.
- Growing a full catalog without changing a compact card's curated selection.
- Preserving chronological meaning independently of UI grouping.
- Showing many branded skills in a dense evidence row.

## Examples

Keep the reusable record and compact projection separate:

```ts
// Full catalog: one reusable public-safe accomplishment.
{
  id: 'github-actions-oidc-ecr-publishing',
  type: 'experience',
  technologies: ['GitHub Actions', 'OIDC', 'Docker', 'Amazon ECR'],
  details: {
    period: { startedAt: '2024-05-10' },
    metrics: [],
    facts: ['Published verified container images with short-lived credentials.'],
  },
}

// Compact projection: explicit selection, not catalog.slice(0, 5).
evidenceIds: [
  'terraform-codepipeline-platform',
  'codebuild-pr-gates',
  'nx-affected-quality-gates',
  'github-actions-gitops-handoff',
  'kustomize-tag-update-reliability',
  ...continuousIntegrationSkillEvidenceItems.map((item) => item.id),
]
```

Back a skill with focused evidence instead of inferring it from a technology list:

```ts
{
  id: 'continuous-integration-skill-github-actions',
  title: 'GitHub Actions',
  type: 'skill',
  supportingEvidenceIds: [
    'nx-affected-quality-gates',
    'github-actions-oidc-ecr-publishing',
    'github-actions-gitops-handoff',
  ],
}
```

Render the same evidence with restrained visual hierarchy:

```tsx
<SkillToken label={label} brandLabel={brandName} variant="neutral" />
```

## Related

- `docs/solutions/design-patterns/compact-capability-evidence-renderers.md`
- `docs/solutions/design-patterns/public-evidence-portfolio-visualizations.md`
- `docs/solutions/design-patterns/project-skill-icon-mapping.md`
- `docs/solutions/logic-errors/color-only-certification-brand-fallback.md`
- `docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md`
- `CONCEPTS.md`
