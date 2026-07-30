---
title: Use Compact Capability Evidence Renderers
date: 2026-07-28
last_updated: 2026-07-30
category: design-patterns
module: github.io DevOps capability evidence
problem_type: design_pattern
component: tooling
severity: medium
applies_when:
  - Rendering one public capability evidence item in compact UI
  - Choosing between token and citation affordances for portfolio evidence
  - Distinguishing evidence categories that can share the same technology label
related_components:
  - github.io DevOpsCapabilityEvidenceRadar
  - Astryx components
  - Storybook
tags: [github-io, react, evidence, astryx, icons, accessibility]
---

# Use Compact Capability Evidence Renderers

## Context

This pattern is current again for `github.io` work. The compact `CapabilityEvidence` renderer was reintroduced after an approved design reopened per-evidence display alongside the evidence-backed radar. The two surfaces now have different jobs: `DevOpsCapabilityEvidenceRadar` summarizes capability coverage, while `CapabilityEvidence` renders one public evidence item as a compact token or citation.

The evidence model keeps the broad evidence category stable. `CapabilityEvidenceItem.type` remains the top-level discriminator for skill, learning, experience, education, certification, and project evidence in `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts:13`. More specific learning presentation is carried by `learningKind` rather than splitting `learning` into separate top-level evidence types (`apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts:21` and `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts:48`).

## Guidance

Use `CapabilityEvidence` when the UI needs to show one concrete proof item in compact form. Prefer explicit `label` values for portfolio copy; when a label is absent, the helper falls back through technology, GitHub repository label, and compacted title in `apps/github.io/src/app/devops-capability-evidence/capability-evidence-label.ts:97`.

Keep fallback labels short and DORA-contextual. The helper leaves titles of three words or fewer unchanged, then condenses longer titles to two prioritized words using DevOps-oriented keywords such as deployment, delivery, automation, security, observability, infrastructure, and ownership (`apps/github.io/src/app/devops-capability-evidence/capability-evidence-label.ts:5` and `apps/github.io/src/app/devops-capability-evidence/capability-evidence-label.ts:29`). That lets a long title such as "Operational ownership across distributed deployment environments" render as "Deployment ownership" without making the data model depend on title prose.

Use icons to distinguish evidence kind, but keep brand precedence narrow:

- Skill, certification, and project evidence may use known technology brands (`apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx:83`).
- GitHub project citations use the repository identity before technology metadata: the label helper prefers a GitHub repository label for project evidence, and the icon helper resolves GitHub repository URLs before known technology brands (`apps/github.io/src/app/devops-capability-evidence/capability-evidence-label.ts:101` and `apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx:83`).
- Learning evidence can use provider brands when the provider is meaningful. Udemy URLs resolve to the Udemy brand before generic learning icons (`apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx:56` and `apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx:77`).
- Generic learning fallbacks are subtype-based: courses use `AcademicCapIcon`, articles use `NewspaperIcon`, and books, docs, and labs use `BookOpenIcon` (`apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx:103`).

When a brand icon is rendered inline in a token, the SVG path uses the brand color rather than inheriting the neutral token text color (`apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx:138`). This keeps provider examples such as Udemy visually distinct while the surrounding token can remain an Astryx neutral token.

Do not create new top-level evidence types just to change an icon. Add a small subtype only when the distinction is specific to an existing category, as `learningKind` is for courses, articles, books, docs, and labs.

## Why This Matters

Capability evidence has to be readable in dense portfolio UI. Long titles, indistinct book icons for every learning item, or technology logos on experience entries make the evidence harder to scan and can imply stronger proof than the item provides.

Keeping `learning` as one top-level evidence type also protects the scoring and capability model from UI-specific taxonomy churn. Courses, posts, books, docs, and labs are all learning evidence for DORA capability scoring; the renderer can still distinguish them visually through provider detection and `learningKind`.

## When to Apply

- Rendering one public evidence item in a compact portfolio UI.
- Deciding whether evidence should appear as a token or citation.
- Adding a new learning source such as an online course, blog post, book, documentation page, or lab.
- Choosing whether a new evidence distinction belongs in `type` or in a category-specific subtype.

## Examples

Provider-aware learning evidence keeps the top-level type broad and moves presentation detail into `learningKind` and `proofUrl`:

```ts
const evidence = {
  id: 'udemy-course',
  label: 'CKAD prep',
  learningKind: 'course',
  proofUrl:
    'https://www.udemy.com/course/certified-kubernetes-application-developer/',
  title: 'Kubernetes Certified Application Developer with Tests',
  type: 'learning',
};
```

That item remains `learning` for capability semantics, renders with the explicit compact label, and uses the Udemy brand because the citation URL identifies a recognized provider.

For a blog post, use the article subtype and a compact DORA-context label:

```ts
const evidence = {
  id: 'web-article',
  label: 'Agentic review',
  learningKind: 'article',
  proofUrl: 'https://addyosmani.com/blog/agentic-code-review/',
  title: 'Agentic Code Review by Addy Osmani',
  type: 'learning',
};
```

The generic fallback is the article icon, not a technology brand, because a blog post about a technology is still learning evidence rather than skill proof.

## Related

- `CONCEPTS.md`
- `docs/solutions/design-patterns/public-evidence-portfolio-visualizations.md`
- `docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md`
