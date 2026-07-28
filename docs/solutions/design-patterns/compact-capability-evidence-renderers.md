---
title: Use Compact Capability Evidence Renderers
date: 2026-07-28
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
  - github.io DevOps capability evidence components
  - Astryx components
  - Storybook
tags: [github-io, react, evidence, astryx, icons, accessibility]
---

# Use Compact Capability Evidence Renderers

## Context

The `github.io` app needs compact evidence chips that explain why a DevOps capability is credible without turning every proof item into a full card. A single evidence model can represent skills, learning, work experience, education, certifications, and projects, but those categories are not interchangeable in compact UI: a skill token says "this is a capability", while learning, experience, and education say "this is supporting proof".

The durable pattern is to keep one public dispatcher at the evidence boundary and keep category-specific rendering in small leaves. `CapabilityEvidence` switches on `evidence.type` and routes skill, learning, experience, education, certification, and project items to their own compact renderers (`apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx:143` through `apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx:170`).

## Guidance

Prefer established Astryx primitives before creating local compact UI. Skill evidence should reuse `SkillToken`; learning, experience, and education should render as Astryx `Token`; certification evidence should reuse `CertificationCitation`; project evidence should render as Astryx `Citation` because a project proof is usually a public source link (`apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx:42` through `apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx:140`).

Keep compact labels short and separate from the full evidence title. The label helper chooses an explicit `label`, then a known technology, then a GitHub repository name for project evidence, and only then falls back to a truncated title (`apps/github.io/src/app/devops-capability-evidence/capability-evidence-label.ts:13` through `apps/github.io/src/app/devops-capability-evidence/capability-evidence-label.ts:29`). This lets a full evidence title remain descriptive in data while compact UI says `CKA`, `Kubernetes`, or `devops-roadmap`.

Treat icon choice as part of evidence semantics, not decoration. The icon helper allows technology brands for skills, certifications, and projects, but it deliberately skips technology-brand lookup for learning, experience, and education (`apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx:43` through `apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx:52`). Those three evidence types always fall through to evidence-type icons: academic cap for education, briefcase for experience, and book for learning (`apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx:66` through `apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx:75`).

Use source-brand icons only when they communicate the proof source. Project evidence with an HTTP(S) GitHub repository URL can use the GitHub brand when no technology brand takes precedence (`apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx:58` through `apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx:64`). Repository detection should exclude SSH URLs, profiles, pull requests, and reserved GitHub routes so a source icon does not imply a repository where there is none (`apps/github.io/src/app/devops-capability-evidence/capability-evidence-url.ts:34` through `apps/github.io/src/app/devops-capability-evidence/capability-evidence-url.ts:70`).

## Why This Matters

Compact evidence UI is easy to make ambiguous. If a Kubernetes learning token and a Kubernetes skill token both use the Kubernetes logo and the same compact label, the user has to infer whether the item is a skill or supporting evidence from surrounding layout. Evidence-type icons keep the category legible even when labels overlap.

Keeping the dispatcher thin also protects reuse. Callers can render one public-safe evidence item without knowing which Astryx primitive fits that evidence type, while leaf components still preserve the semantics of tokens, citations, links, and accessible names.

## When to Apply

- A component renders exactly one capability evidence item from the shared evidence model.
- Compact UI needs to show proof type quickly without a surrounding legend.
- Certification or project proof benefits from citation semantics, while learning, experience, and education should behave like compact supporting tokens.
- A technology label can appear in more than one evidence category, such as both a Kubernetes skill and Kubernetes learning evidence.

## Examples

Use the dispatcher at call sites:

```tsx
<CapabilityEvidence evidence={item} citationNumber={index + 1} />
```

Let category renderers decide the primitive:

```tsx
case 'skill':
  return <SkillEvidenceToken evidence={evidence} />;
case 'learning':
  return <LearningEvidenceToken evidence={evidence} />;
case 'certification':
  return (
    <CertificationEvidenceCitation
      citationNumber={citationNumber}
      evidence={evidence}
    />
  );
```

The component tests cover skill-token reuse, compact token links, certification citations, project citations, GitHub source icons, fallback icons, and the renderer-only public-safety boundary (`apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx:22` through `apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx:193`). Helper tests cover short-label precedence, GitHub repository URL detection, and the rule that education, experience, and learning use evidence-type icons even when their technologies include Kubernetes (`apps/github.io/src/app/devops-capability-evidence/capability-evidence.helpers.spec.tsx:27` through `apps/github.io/src/app/devops-capability-evidence/capability-evidence.helpers.spec.tsx:101`).

## Related

- `CONCEPTS.md`
- `docs/solutions/design-patterns/public-evidence-portfolio-visualizations.md`
- `docs/solutions/best-practices/astryx-stylex-tailwind-boundaries.md`
