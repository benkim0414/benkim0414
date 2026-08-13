---
title: Tokenize DORA Capability Evidence
date: 2026-07-30
last_updated: 2026-08-13
category: conventions
module: github.io DevOps capability evidence
problem_type: convention
component: documentation
severity: medium
applies_when:
  - Publishing DORA capability evidence derived from private source material
  - Maintaining a full evidence history beside compact card copy and projection
  - Separating demonstrated experience from evidence-backed skills
  - Preserving canonical shared identity, deterministic selection, and chronology
  - Rendering dense skill evidence with readable neutral tokens
related_components:
  - github.io DevOps capability evidence radar
  - CapabilityEvidence renderer
  - github.io skill detail
tags:
  [
    github-io,
    dora,
    trunk-based-development,
    evidence-model,
    privacy,
    curated-projection,
    chronology,
    skill-tokens,
  ]
---

# Tokenize DORA Capability Evidence

## Context

The DevOps capability evidence model publishes portfolio proof, not raw interview answers or private workplace material. A broad story often contains several independently useful accomplishments, but a compact capability card can show only a curated subset. Treat these as two separate ownership concerns:

- Full catalogs own reusable, atomic evidence records and their compact labels.
- Capability scores own the smaller public projection and capability-level supplemental summary used by compact cards.

The Continuous Integration example makes that boundary concrete. Its experience catalog has 18 stable IDs, with an explicit expected-ID and uniqueness contract in `apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts:6-35`. A separate skill catalog has 13 stable IDs and links every skill to one or more supporting experience records in `apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.spec.ts:4-21` and `apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.spec.ts:114-149`.

Version Control and Trunk-Based Development apply the same model independently. Their complete public catalogs contain nine and six experience records, while their separate catalogs contain thirteen and six strongly supported skills. Exact ID, public-data, ordering, and support-link contracts live in `apps/github.io/src/app/devops-capability-evidence/version-control-evidence.data.spec.ts:3-53`, `apps/github.io/src/app/devops-capability-evidence/trunk-based-development-evidence.data.spec.ts:3-49`, `apps/github.io/src/app/devops-capability-evidence/version-control-skill-evidence.data.spec.ts:6-122`, and `apps/github.io/src/app/devops-capability-evidence/trunk-based-development-skill-evidence.data.spec.ts:4-88`.

The shared evidence catalog composes the complete capability datasets through an identity-aware boundary in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:278-342`. Deployment Automation and Flexible Infrastructure intentionally reuse canonical records from other capability catalogs, so a repeated ID can mean either a valid second reference to the same object or a conflicting second definition. Compact scores remain a separate concern: they select ordered evidence IDs with matching counts and capability-level summaries; some scores append canonical skill IDs from their skill catalogs.

## Guidance

### Store atomic public evidence

Model each independently useful accomplishment as one `CapabilityEvidenceItem`. Give it a durable public ID, compact label, descriptive title, capability keys, strength, generalized summary, and specific public technology names. Keep dates, metrics, denominators, initiatives, and facts structured through `CapabilityEvidenceDetails` rather than hiding them in display prose (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts:30-56`).

Atomic means that one record should express one contribution that can be selected, scored, linked, or displayed independently. It does not mean removing useful specificity. Public technology names such as AWS CodePipeline, GitHub Actions, Nx, Docker, Helm, Kustomize, and Argo CD can remain explicit, as can dates and numeric results. Generalize or omit the organization, repository, account, internal service, workflow, module, image, parameter path, proof URL, and business identifiers that would disclose private context.

Privacy is a data contract, not a final copy-editing pass. Every CI experience must be public, non-sensitive, organization-free, proof-URL-free, dated, and backed by at least one fact (`apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts:132-170`). A regression test also rejects URLs, 12-digit account-like values, parameter paths, and employer, customer, or client wording (`apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts:173-180`). Apply the same boundary to the skill catalog (`apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.spec.ts:140-149`).

For a public portfolio, retain only affirmative evidence for the capability. Do not publish missing safeguards, caveats about distribution, or absent automation as evidence merely because the wording is technically accurate. State the demonstrated outcome directly and test known negative patterns narrowly enough that positive phrases such as “without manual intervention” remain valid. The Version Control contract demonstrates both the affirmative fact assertion and this focused negative-language guard in `apps/github.io/src/app/devops-capability-evidence/version-control-evidence.data.spec.ts:101-120`; the Trunk-Based Development catalog applies the positive-only boundary to every record in `apps/github.io/src/app/devops-capability-evidence/trunk-based-development-evidence.data.spec.ts:24-49`.

### Compose shared catalogs by canonical identity

Complete capability catalogs can overlap legitimately. Within the aggregate construction boundary, use one canonical object per stable ID; consuming catalogs should reuse that object rather than reconstructing an equivalent-looking record. Deployment Automation resolves its shared records from the Continuous Integration and Continuous Delivery catalogs (`apps/github.io/src/app/devops-capability-evidence/deployment-automation-evidence.data.ts:8-21`); Flexible Infrastructure resolves shared records across those catalogs and Deployment Automation (`apps/github.io/src/app/devops-capability-evidence/flexible-infrastructure-evidence.data.ts:10-25`).

At the aggregate boundary, treat the evidence ID as the logical uniqueness key and reference identity as proof that overlap is intentional. `composeCanonicalCapabilityEvidenceItems` emits the first object for an ID, skips only later references where `existing === item`, and throws when a distinct object reuses that ID (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:278-301`). Do not replace this with an ID-only `Set` or `filter`: that silently keeps whichever definition appears first and hides conflicting summaries, mappings, metrics, or provenance.

Lock both sides of the contract in tests. Known shared records must remain the exact canonical objects, repeated references to one object must compose once, and a cloned same-ID object must throw (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts:239-280`). The aggregate test also requires every Deployment Automation and Flexible Infrastructure record (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts:215-237`), while the aggregate implementation composes all currently imported capability catalogs (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:303-342`).

As general guidance outside this in-memory construction boundary, do not rely on reference identity. Use an explicit immutable payload identity or version contract when records cross serialization, API, or persistence boundaries.

### Keep skills separate and evidence-backed

A skill is a competency supported by accomplishments, not another accomplishment and not every string found in an experience's `technologies` array. Store it as `type: 'skill'` with an official public name and focused `supportingEvidenceIds`. The shared type makes that relationship explicit at `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts:64-84`.

Each support ID must resolve to a real experience record. The CI skill tests lock those focused links and reject empty or non-experience support in `apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.spec.ts:114-137`. This prevents unsupported or circular skill claims while leaving the same experience reusable by several genuinely related skills.

### Make the compact projection explicit

Do not derive the compact card with `slice(0, 5)`, runtime ranking, or incidental catalog order. Keep its selected experience IDs literally in the capability score, append the canonical skill IDs, and update `evidenceCounts` in the same change. Integrity tests verify that every referenced ID exists, supports the capability, and matches the declared type counts (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts:514-543`). A separate CI assertion locks the exact five experiences and the complete ordered skill suffix (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts:776-788`).

When the projection itself must be reviewable as a fixed editorial decision, list both the five experience IDs and the complete skill suffix literally. The Version Control and Trunk-Based Development score records do this, with matching counts and score-owned summaries, in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:65-118`. This stricter form makes additions, removals, and reordering visible in the score diff instead of inheriting a runtime map or catalog change.

The card resolver follows score order and skips unresolved IDs; it does not truncate or re-rank the full catalog (`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.ts:35-52`). Adding a sixth experience to the catalog does not change the current compact summary unless the score references change.

### Keep skill-detail evidence experience-only

A compact skill-detail page applies the same projection rule outside the DORA
capability card. Author the selected `experienceEvidenceIds` literally and in
display order; do not discover them from technology tags, capability keys,
runtime ranking, or catalog order. The Kubernetes detail currently selects
three DORA evidence IDs and resolves its `homelab` project through a separate
`projectIds` collection
(`apps/github.io/src/app/skills/skill-detail.data.ts:3-13`). Catalog growth can
then add reusable evidence without silently rewriting the page's editorial
claim.

Resolve those IDs only against the canonical capability evidence catalog. At
the resolver boundary, validate existence first, then the public and
non-sensitive trust boundary, then require `type === 'experience'`
(`apps/github.io/src/app/skills/skill-detail-resolver.ts:51-70`). Visibility
alone is insufficient: a project, learning record, certification, or skill can
be public and non-sensitive without being professional experience. Resolve
project-card IDs independently against the project source
(`apps/github.io/src/app/skills/skill-detail-resolver.ts:72-81`); relevance to a
skill does not make project presentation data part of the evidence list.

Lock both the malformed-input boundary and the production projection in tests.
The resolver test supplies a public, non-sensitive project record and requires
rejection, while the Kubernetes production assertion requires the exact three
authored IDs, verifies that every resolved record is an experience, and checks
the separate Homelab project result
(`apps/github.io/src/app/skills/skill-detail-resolver.spec.ts:15-33` and
`apps/github.io/src/app/skills/skill-detail-resolver.spec.ts:85-106`). The
three-item count is the current compact Kubernetes contract, not a universal
limit for every future skill page.

### Keep compact labels and capability summaries with their owners

Use an atomic record's `label` for short text that should follow that evidence
wherever it is selected. A label-only change must preserve the record's stable
ID, descriptive title, detailed summary, facts, technologies, metrics, dates,
initiative, and capability mappings. The CI contract locks the five curated
labels beside their unchanged record titles in
`apps/github.io/src/app/devops-capability-evidence/continuous-integration-evidence.data.spec.ts:199-238`.

Use a score's optional `evidenceSummary` for one public-safe sentence that
describes what the selected evidence demonstrates for that capability as a
whole. Do not derive this prose from labels or concatenate catalog summaries at
runtime. The score owns the copy and the existing resolver returns it for the
matching capability
(`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.ts:15-21`).
The card keeps the generic DORA definition separate, then renders the
supplemental summary before the evidence rows
(`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx:120-148`).

Both copy layers follow the same privacy boundary as detailed evidence. Public
technology names may remain specific, but private repository, project, service,
workflow, organization, account, path, URL, customer, and architecture names do
not belong in either field. Existing catalog privacy regexes do not scan
score-owned summaries, so keep exact score-summary assertions and review new
summary text explicitly rather than assuming catalog checks cover it.

Storybook must consume the same production evidence and score arrays. Its
contract verifies inherited production data and the exact curated labels in
`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.spec.ts:92-167`.
This prevents a polished Storybook-only fixture from masking stale production
copy.

### Separate chronology from grouping

Chronology belongs to canonical data order. For CI skills, tests derive each skill's earliest supporting experience date and lock delivery-flow order for equal dates (`apps/github.io/src/app/devops-capability-evidence/continuous-integration-skill-evidence.data.spec.ts:80-111`). The score reuses that order by mapping over the canonical skill catalog (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts:125-132`).

Version Control and Trunk-Based Development also derive each skill's earliest date from its focused support IDs and assert nondecreasing display order. Their tests additionally lock the complete ordered titles and exact support mapping, including Conventional Commits as the public skill rather than an implementation-specific commit-message tool (`apps/github.io/src/app/devops-capability-evidence/version-control-skill-evidence.data.spec.ts:6-128` and `apps/github.io/src/app/devops-capability-evidence/trunk-based-development-skill-evidence.data.spec.ts:4-94`).

Presentation grouping is a separate operation. The card maps evidence types into `applied`, `certifications`, `skills`, and `learning`, emits groups in that fixed order, and preserves score order inside each group (`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.ts:15-29` and `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.evidence.ts:54-77`). Do not use UI grouping as the chronology algorithm.

### Keep dense skill tokens readable

Capability skill rows use neutral token chrome so thirteen brands do not compete for attention. `SkillEvidenceToken` opts into the shared `SkillToken` with `variant="neutral"` at `apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx:41-55`. The neutral variant uses the gray Astryx token surface and applies brand color only to a real inline logo; locally bundled full-color assets remain unchanged, and missing logos remain text-only (`apps/github.io/src/app/skills/skill-token.tsx:32-84`).

The compact card labels these rows `Relevant experience` and `Technical skills`
with supporting, secondary text and uses the visible labels as the lists'
accessible names
(`apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx:27-32`
and `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx:66-99`).

## Why This Matters

Separating catalog ownership from projection ownership keeps the evidence reusable. A dedicated capability page can consume the full history while the compact card remains a deliberate five-experience summary plus supported skills. Stable IDs make every score auditable, structured details preserve evidence strength, and focused support links explain why each skill belongs.

The boundaries also prevent six common failures:

- Catalog growth accidentally changes a compact card.
- Catalog drift places a public non-experience record in an experience-only skill detail.
- ID-only deduplication silently masks conflicting definitions of shared evidence.
- Capability summaries drift from the score-owned projection they describe.
- Technology strings overstate skills that lack concrete support.
- Public presentation leaks private context copied from source material.

Neutral skill surfaces and visible row labels solve the related presentation problem. Experience and skill evidence stay scannable as one system without turning every brand into a competing colored token.

## When to Apply

- Translating verified private work history into public capability evidence.
- Splitting one broad answer into accomplishments that should be independently reusable or scored.
- Adding a skill that must be backed by concrete experience.
- Growing a full catalog without changing a compact card's curated selection.
- Curating skill-detail fluency evidence while rendering related project cards separately.
- Clarifying a reusable evidence token or adding capability-level supporting copy.
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
  'github-actions-gitops-handoff',
  'argocd-environment-state-from-version-control',
  'argocd-automated-database-migrations',
  'merge-commit-history',
  'version-control-skill-git',
  // ...the remaining literal, ordered skill IDs
]

// Capability-level copy: one score-owned sentence, not item-level prose.
evidenceSummary:
  'Built and evolved CI from reusable delivery pipelines to monorepo automation, with affected quality gates and immutable artifacts.',
```

Compose overlapping catalogs without hiding conflicts:

```ts
function composeCanonical(items: readonly CapabilityEvidenceItem[]) {
  const byId = new Map<string, CapabilityEvidenceItem>();
  const catalog: CapabilityEvidenceItem[] = [];

  for (const item of items) {
    const existing = byId.get(item.id);

    if (!existing) {
      byId.set(item.id, item);
      catalog.push(item);
    } else if (existing !== item) {
      throw new Error(
        `Conflicting duplicate capability evidence ID: ${item.id}`,
      );
    }
  }

  return catalog;
}

composeCanonical([canonical, canonical]); // one canonical entry
composeCanonical([canonical, { ...canonical }]); // throws
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

Keep skill-detail evidence and project presentation as two explicit projections:

```ts
{
  skillId: 'kubernetes',
  experienceEvidenceIds: [
    'argocd-environment-state-from-version-control',
    'deterministic-kubernetes-overlays',
    'reusable-kubernetes-deployment-foundations',
  ],
  projectIds: ['homelab'],
}

if (evidence.type !== 'experience') {
  throw new Error('Skill detail evidence must be experience evidence.');
}
```

Render the same evidence with restrained visual hierarchy:

```tsx
<SkillToken label={label} brandLabel={brandName} variant="neutral" />
```

For copy-only changes, assert the owning data and every projection boundary:

- exact catalog labels beside unchanged IDs and titles;
- exact score summaries, scores, counts, strongest evidence, and selected IDs;
- resolver output and summary omission for capabilities without one;
- rendered supporting text and accessible evidence-token names;
- Storybook's use of shared production arrays;
- phone and tablet wrapping, overflow, row hierarchy, and logo stability.

Automated tests establish data and semantic behavior, but they do not prove that
longer labels and summaries fit at responsive widths. Serve Storybook from the
linked worktree and complete visual QA before treating the copy change as ready.

## Related

- `docs/solutions/design-patterns/compact-capability-evidence-renderers.md`
- `docs/solutions/design-patterns/public-evidence-portfolio-visualizations.md`
- `docs/solutions/workflow-issues/verify-storybook-from-linked-worktree.md`
- `docs/solutions/ui-bugs/storybook-certification-badge-fixtures.md`
- `docs/solutions/design-patterns/project-skill-icon-mapping.md`
- `docs/solutions/logic-errors/color-only-certification-brand-fallback.md`
- `docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md`
- `CONCEPTS.md`
