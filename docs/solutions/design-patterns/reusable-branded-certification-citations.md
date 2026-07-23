---
title: Reusable Branded Certification Citations
date: 2026-07-23
category: design-patterns
module: apps/github.io certifications
problem_type: design_pattern
component: tooling
severity: low
applies_when:
  - "Rendering certification evidence as reusable React UI backed by Astryx Citation"
  - "A citation can inherit brand and icon metadata from linked skill labels"
  - "Unmapped skills must preserve Astryx Citation defaults instead of receiving partial custom styling"
  - "Active and expired citation states need coordinated wrapper background, border, text, and SVG icon color treatment"
related_components:
  - "astryx-citation"
  - "skill-brand-metadata"
  - "devops-roadmap"
tags: [react, astryx, certifications, citation, branding, simple-icons, css-variables]
---

# Reusable Branded Certification Citations

## Context

The DevOps roadmap needed certification links to look connected to the skills they validate without duplicating Astryx Citation behavior or breaking neutral fallback styling. The solved pattern adds a `CertificationCitation` wrapper around `@astryxdesign/core/Citation`, accepts certification metadata plus linked skill labels, and lets the wrapper decide whether a certification can be branded from the linked skills (`apps/github.io/src/app/certifications/certification-citation.tsx:1`, `apps/github.io/src/app/certifications/certification-citation.tsx:9`).

Brand data is intentionally derived from the existing skill-brand registry. `getSkillBrand` maps known labels to Simple Icons metadata and returns `undefined` when a label has no icon metadata, so certification branding stays coupled to the same source of truth as skill UI (`apps/github.io/src/app/skills/skill-brand.ts:34`, `apps/github.io/src/app/skills/skill-brand.ts:105`). The roadmap node then renders certification citations below skill tokens by spreading each certification into `CertificationCitation` and assigning citation numbers from the list index (`apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:31`, `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:35`).

## Guidance

Wrap the design-system Citation instead of forking it. Keep the wrapper responsible for domain-specific decisions: pick the first linked skill with known brand metadata, compute active versus expired status, and pass the wrapper's selected Citation props plus an optional generated SVG icon (`apps/github.io/src/app/certifications/certification-citation.tsx:18`, `apps/github.io/src/app/certifications/certification-citation.tsx:30`, `apps/github.io/src/app/certifications/certification-citation.tsx:87`).

Preserve default Astryx behavior when no brand exists. The wrapper returns `undefined` styles if no known brand is found, omits the branded class, and sends no Citation icon in that case (`apps/github.io/src/app/certifications/certification-citation.tsx:44`, `apps/github.io/src/app/certifications/certification-citation.tsx:82`, `apps/github.io/src/app/certifications/certification-citation.tsx:93`). The regression test asserts that an unknown skill leaves `data-certification-primary-skill` unset, produces no inline style, has no branded class, and renders no image (`apps/github.io/src/app/certifications/certification-citation.spec.tsx:127`).

Use shared CSS variables for both the Citation surface and its circular icon wrapper. The wrapper sets `--certification-citation-background`, `--certification-citation-border`, and `--certification-citation-text` for branded citations (`apps/github.io/src/app/certifications/certification-citation.tsx:56`). CSS applies those variables to branded active and expired Citation sources, and separately applies the same background and border variables to the Citation's inner `span:has(> img)` icon wrapper (`apps/github.io/src/styles.css:125`, `apps/github.io/src/styles.css:131`, `apps/github.io/src/styles.css:137`).

Color the generated SVG from the same text decision as the citation treatment. Active branded citations use the brand color as background and brand foreground as text, while expired branded citations use the surface background, brand border, and Astryx secondary text color (`apps/github.io/src/app/certifications/certification-citation.tsx:48`, `apps/github.io/src/app/certifications/certification-citation.tsx:53`). The generated data URL fills the SVG path with the chosen icon color, and the tests verify white fill for an active Kubernetes citation and neutral `#737373` fill for an expired one (`apps/github.io/src/app/certifications/certification-citation.tsx:34`, `apps/github.io/src/app/certifications/certification-citation.spec.tsx:45`, `apps/github.io/src/app/certifications/certification-citation.spec.tsx:71`).

## Why This Matters

This keeps brand affordance and certification state aligned across nested UI the app does not own. The Citation itself and its circular icon container both receive the same background and border variables, while the SVG icon uses the citation text color; that avoids mismatched badges where the label says one state but the icon chip visually says another (`apps/github.io/src/styles.css:125`, `apps/github.io/src/styles.css:137`).

The fallback path matters just as much as the branded path. Unknown skill labels are valid roadmap data, and `getSkillBrand` explicitly returns `undefined` for labels outside the registry (`apps/github.io/src/app/skills/skill-brand.ts:105`, `apps/github.io/src/app/skills/skill-brand.spec.ts:17`). By returning no custom style for that case, the wrapper lets Astryx Citation keep its default styling instead of inventing a half-branded state.

The pattern also keeps roadmap layout predictable. Roadmap nodes render certifications in their own list under skills, and the flow height calculation reserves a fixed certification section when any certifications are present (`apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:31`, `apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx:20`, `apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx:23`). A roadmap test covers the reserved timeline space for certification rows (`apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx:309`).

## When to Apply

- A reusable component wraps a design-system primitive but needs product-specific semantic styling derived from related domain data.
- A citation, link, badge, or chip should inherit a brand from associated skills, providers, integrations, or categories without changing the primitive's default contract.
- A brand lookup can fail, and the no-brand output should stay close to the underlying component: no custom icon, no custom variables, no branded state class.
- Nested third-party markup needs aligned styling through wrapper-scoped CSS variables.

## Examples

Primary brand selection:

```tsx
<CertificationCitation
  title="CKAD"
  url="https://example.com/ckad.pdf"
  skills={['Unknown Skill', 'Kubernetes']}
  expiresAt="2028-02-25T11:00:00+11:00"
/>
```

The wrapper scans linked skills in order and returns the first known brand (`apps/github.io/src/app/certifications/certification-citation.tsx:18`). The test confirms this example selects `Kubernetes`, emits a Kubernetes border color, and renders a generated SVG data URL icon (`apps/github.io/src/app/certifications/certification-citation.spec.tsx:27`).

No-brand fallback:

```tsx
<CertificationCitation
  title="Custom Cert"
  url="https://example.com/custom.pdf"
  skills={['Unknown Skill']}
  expiresAt="2028-02-26T10:59:00+11:00"
/>
```

With no known brand, `citationStyle` returns `undefined`, the branded class is omitted, and Citation receives no icon (`apps/github.io/src/app/certifications/certification-citation.tsx:44`, `apps/github.io/src/app/certifications/certification-citation.tsx:82`, `apps/github.io/src/app/certifications/certification-citation.tsx:93`).

Shared active and expired variables:

```css
.certification-citation--branded.certification-citation--active .certification-citation__source,
.certification-citation--branded.certification-citation--expired .certification-citation__source {
  color: var(--certification-citation-text);
  background: var(--certification-citation-background);
  border-color: var(--certification-citation-border);
}

.certification-citation--branded .certification-citation__source > span:has(> img) {
  background: var(--certification-citation-background);
  border-color: var(--certification-citation-border);
}
```

The source keeps separate selectors for active and expired states, but both states consume the same variable names; TypeScript decides the values by status (`apps/github.io/src/styles.css:125`, `apps/github.io/src/styles.css:131`, `apps/github.io/src/app/certifications/certification-citation.tsx:48`).

## Related

- `apps/github.io/src/app/certifications/certification-citation.tsx`: reusable wrapper around Astryx Citation, including brand lookup, status logic, CSS variables, and SVG icon generation.
- `apps/github.io/src/app/skills/skill-brand.ts`: skill-to-brand registry and foreground contrast logic used by both skills and certifications.
- `apps/github.io/src/styles.css`: CSS variable application for branded certification citations and nested Citation icon wrappers.
- `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx`: integration point that renders certification citations below roadmap skill tokens.
- `apps/github.io/src/app/certifications/certification-citation.spec.tsx`: regression coverage for primary-brand derivation, active/expired styling, icon fill color, and no-brand fallback.
- `docs/solutions/workflow-issues/scaffold-nx-react-astryx-with-pnpm.md`: related setup guidance for Astryx in this Nx React app.
