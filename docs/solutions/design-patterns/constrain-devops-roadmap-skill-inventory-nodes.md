---
title: Constrain DevOps Roadmap Skill Inventory Nodes
date: 2026-08-26
category: design-patterns
module: github.io DevOps roadmap skill inventory
problem_type: design_pattern
component: frontend_stimulus
severity: medium
applies_when:
  - Rendering a DevOps roadmap skill inventory from roadmap.sh recommendations
  - Separating visible skill evidence from recommended-but-uncovered gaps
  - Choosing whether a roadmap item belongs in a skill row or a concept row
  - Mapping roadmap skill tokens to truthful brand surfaces
related_components:
  - DevOpsRoadmapNode
  - SkillToken
  - SkillBrand
  - github.io DevOps capability evidence
tags:
  [
    github-io,
    devops-roadmap,
    roadmap-sh,
    skill-inventory,
    skill-tokens,
    certifications,
    skill-icons,
    neutral-surfaces,
  ]
---

# Constrain DevOps Roadmap Skill Inventory Nodes

## Context

The DevOps roadmap skill inventory is a portfolio projection over roadmap.sh-derived topics, not a generic skills map. It should show only the selected nodes represented by `devOpsRoadmapItems` and only the user's visible evidence for those nodes. The inventory data is explicit: each `DevOpsRoadmapSkillInventoryNode` carries `evidenceSkillTokens`, even when empty, while certifications and covered concepts are separate optional rows (`apps/github.io/src/app/devops-roadmap/devops-roadmap-skill-inventory.data.ts:13`, `apps/github.io/src/app/devops-roadmap/devops-roadmap.types.ts:13`).

Recommended-but-uncovered items belong outside the node display data. The gap catalog is exported separately and keyed by `nodeId`, so missing recommendations remain queryable without being rendered as earned evidence (`apps/github.io/src/app/devops-roadmap/devops-roadmap-skill-inventory.data.ts:174`, `apps/github.io/src/app/devops-roadmap/devops-roadmap-skill-inventory.data.ts:184`). Tests enforce that nodes do not own a `gaps` property and that every stored gap points at a real inventory node (`apps/github.io/src/app/devops-roadmap/devops-roadmap-skill-inventory.data.spec.ts:103`, `apps/github.io/src/app/devops-roadmap/devops-roadmap-skill-inventory.data.spec.ts:311`).

## Guidance

Keep inventory node identity tied to the canonical roadmap source. The inventory test compares each inventory node's `id` and `title` to `devOpsRoadmapItems`, so title drift, order drift, and invented nodes fail in one place (`apps/github.io/src/app/devops-roadmap/devops-roadmap-skill-inventory.data.spec.ts:97`, `apps/github.io/src/app/devops-roadmap/devops-roadmap-skill-inventory.data.spec.ts:100`). This protects exact node names such as `Networking & Protocols` and `Application Monitoring` from being replaced by nearby labels.

Use the three row types for different claims:

- `certifications` are strongest evidence and render first.
- `evidenceSkillTokens` are concrete skills, tools, products, languages, or platforms that the user has and that belong to the node.
- `coveredRoadmapConcepts` are roadmap concepts the user covers but that should not receive brand icon treatment.

`DevOpsRoadmapNode` renders those rows in that order and falls back from `evidenceSkillTokens` to legacy `skills` only for older roadmap data (`apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:64`, `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:86`, `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:99`, `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:112`). Its list labels include the node title so repeated certification, skill, and concept rows stay distinguishable to assistive technology (`apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:89`, `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:102`, `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:115`).

Disable empty nodes instead of rendering gaps as evidence. A node is disabled only when it has no certifications, no evidence skill tokens, and no covered concepts; disabled nodes get muted styling plus `aria-disabled` and `data-roadmap-node-disabled` (`apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:66`, `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:72`). The `Artifact Management` test locks that behavior and verifies that empty nodes do not render hidden certification, skill, or concept lists (`apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx:278`, `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx:293`).

Keep brand evidence truthful. Simple Icons mappings default to branded surfaces, while local image assets listed in `skillIconAssets` can stay neutral through `skillBrandSurfaces` (`apps/github.io/src/app/skills/skill-brand.ts:183`, `apps/github.io/src/app/skills/skill-brand.ts:231`, `apps/github.io/src/app/skills/skill-brand.ts:303`). Ansible is an exact Simple Icons mapping and is intentionally not in the neutral override table, so it renders with its official brand color (`apps/github.io/src/app/skills/skill-brand.ts:108`, `apps/github.io/src/app/skills/skill-token.spec.tsx:146`). Concepts render with neutral Astryx `Token` and no icon path, which keeps broad roadmap patterns from looking like product-backed skills (`apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx:118`, `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx:358`).

## Why This Matters

The roadmap inventory is a credibility surface. If it displays every recommendation, converts a gap into a token, or gives a broad concept a product icon, the UI implies evidence the user did not claim. The data tests guard against that by rejecting level-qualified labels, keeping roadmap concepts scoped to the same node, avoiding duplicate skill/concept rows, and preserving selected gaps separately (`apps/github.io/src/app/devops-roadmap/devops-roadmap-skill-inventory.data.spec.ts:112`, `apps/github.io/src/app/devops-roadmap/devops-roadmap-skill-inventory.data.spec.ts:261`, `apps/github.io/src/app/devops-roadmap/devops-roadmap-skill-inventory.data.spec.ts:277`, `apps/github.io/src/app/devops-roadmap/devops-roadmap-skill-inventory.data.spec.ts:311`).

The same honesty applies to visual identity. `SkillBrand` supports exact Simple Icons, local assets, color-only metadata, and missing metadata as distinct outcomes (`apps/github.io/src/app/skills/skill-brand.ts:293`, `apps/github.io/src/app/skills/skill-brand.ts:305`). That lets the UI use icons when identity is truthful and stay text-only when no exact mark exists.

## When to Apply

Apply this pattern when editing `devOpsRoadmapSkillInventoryNodes`, adding roadmap gaps, moving a roadmap item between visible evidence and hidden gaps, changing roadmap node row rendering, or changing `SkillToken`/`getSkillBrand` behavior used by the roadmap inventory.

Do not apply it blindly to unrelated skill-card or capability-radar data. Those surfaces may share evidence-token and brand-metadata primitives, but their projection rules are owned by their own data contracts.

## Examples

For `Container Orchestration`, certifications render before the skill token. The inventory stores the Kubernetes certification row as CKA, CKAD, KCNA, and the node's only evidence skill token is `Kubernetes` (`apps/github.io/src/app/devops-roadmap/devops-roadmap-skill-inventory.data.ts:7`, `apps/github.io/src/app/devops-roadmap/devops-roadmap-skill-inventory.data.ts:127`, `apps/github.io/src/app/devops-roadmap/devops-roadmap-skill-inventory.data.ts:130`). Platform-specific experience such as EKS can be true user evidence elsewhere, but it does not need to render inside this exact roadmap node unless the roadmap node contract allows it.

For `Cloud Design Patterns`, selected patterns are covered concepts, not skill tokens. The node has an empty `evidenceSkillTokens` row and stores entries such as `Backends for Frontends`, `Gateway Aggregation`, `Retry`, and `Static Content Hosting` in `coveredRoadmapConcepts` (`apps/github.io/src/app/devops-roadmap/devops-roadmap-skill-inventory.data.ts:158`, `apps/github.io/src/app/devops-roadmap/devops-roadmap-skill-inventory.data.ts:161`). The renderer shows them as neutral gray tokens with no SVG or image.

For `Service Mesh`, keep the node empty and disabled until there is direct visible evidence. The node has no evidence skill tokens or covered concepts, while `Istio`, `Linkerd`, `Consul`, and related recommendations stay in the separate gap catalog (`apps/github.io/src/app/devops-roadmap/devops-roadmap-skill-inventory.data.ts:152`, `apps/github.io/src/app/devops-roadmap/devops-roadmap-skill-inventory.data.ts:184`). This shows the roadmap node without presenting unused service mesh tools as skills.
