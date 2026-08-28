---
title: Default Skill Tokens to Detail Links
date: 2026-08-28
category: ui-bugs
module: github.io skill tokens
problem_type: ui_bug
component: frontend_stimulus
symptoms:
  - Direct SkillToken consumers can render skill labels without links when navigation is only supplied by parent surfaces.
  - Capability and roadmap token surfaces need the same canonical detail-link behavior as direct token usage.
root_cause: logic_error
resolution_type: code_fix
severity: medium
related_components:
  - github.io skill detail routing
  - github.io DevOps capability evidence
  - github.io DevOps roadmap
tags: [github-io, skill-tokens, skill-detail, navigation, storybook, routing]
---

# Default Skill Tokens to Detail Links

## Problem

Skill tokens were visually correct but not consistently navigable when link behavior lived only in selected parent surfaces. Direct `SkillToken` uses, including Storybook examples and project-card-style consumers, could remain display-only even when the token label corresponded to a skill detail page.

## Symptoms

- Direct Storybook examples exercise `SkillToken` without relying on a parent surface to supply navigation.
- A direct token could render `Docker` or another canonical skill name without navigating to `/skills/docker`.
- Unknown labels needed to remain display-only, so the fix could not make every string look clickable.

## What Didn't Work

Passing skill detail paths only from selected parent surfaces would not cover the actual reusable boundary. `SkillToken` is the shared compact presentation used by direct stories, roadmap evidence rows, capability evidence rows, and project skill displays, so any default behavior implemented above that wrapper remains easy to miss.

The first route resolver also treated keyword metadata as route aliases without checking ambiguity. Broad labels such as `AWS` can match multiple skill records by keyword, so keyword-first or first-match linking can send users to a plausible but wrong detail page.

## Solution

Keep explicit `href` authoritative, then let `SkillToken` resolve its own default link from both identity labels. The component now tries `brandLabel` and then the visible `label`, and passes the first resolved path to the Astryx `Token` surface (`apps/github.io/src/app/skills/skill-token.tsx:59`, `apps/github.io/src/app/skills/skill-token.tsx:90`).

```tsx
const tokenHref =
  href ??
  [brandLabel, label]
    .filter((candidate): candidate is string => Boolean(candidate))
    .map((candidate) => getSkillDetailPathForSkillName(candidate, skills))
    .find((candidate): candidate is string => Boolean(candidate));
```

Centralize canonical route construction in the skill route helper. Exact normalized skill name and ID matches are authoritative, while keyword matches only produce a link when exactly one skill matches the label (`apps/github.io/src/app/skills/skill-route.ts:7`, `apps/github.io/src/app/skills/skill-route.ts:17`, `apps/github.io/src/app/skills/skill-route.ts:22`).

Regression tests cover the component-level contract: known labels link by default, unknown labels stay display-only, brand-label misses fall back to the visible label, and explicit `href` remains preserved (`apps/github.io/src/app/skills/skill-token.spec.tsx:273`, `apps/github.io/src/app/skills/skill-token.spec.tsx:281`, `apps/github.io/src/app/skills/skill-token.spec.tsx:289`, `apps/github.io/src/app/skills/skill-token.spec.tsx:295`). Route tests also lock the ambiguous keyword behavior so `AWS` does not silently link to whichever AWS-related skill appears first (`apps/github.io/src/app/skills/skill-route.spec.ts:24`).

## Why This Works

The reusable token wrapper is the lowest shared UI boundary that knows it is presenting a skill-like label. Owning default navigation there makes direct tokens and higher-level evidence tokens follow the same behavior, while still allowing parent surfaces to pass explicit links when they have a more specific mapping.

The route helper separates identity from search metadata. A name or ID match means the label corresponds to one detail page; a keyword match is only safe when it is unique. Ambiguous broad terms remain inert instead of becoming incorrect navigation.

## Prevention

- Put default behavior for reusable presentation components in the wrapper, not only in current call sites.
- Preserve explicit `href` props before deriving defaults.
- Treat keywords as search metadata unless a resolver can prove the label maps to exactly one canonical record.
- Add component-level tests for known, unknown, ambiguous, fallback, and explicit-link cases when compact UI tokens become navigable.
- Use Storybook on tablet-width routes to validate direct component stories as well as full-page consumers.

## Related Issues

- [Tokenize DORA Capability Evidence](../conventions/tokenize-dora-capability-evidence.md) covers the broader evidence-token model and the separation between supported skills and compact evidence projections.
- [Constrain DevOps Roadmap Skill Inventory Nodes](../design-patterns/constrain-devops-roadmap-skill-inventory-nodes.md) covers the roadmap skill inventory surface that also renders compact skill tokens.
- [Verify Skill Icons Against Exact Brand Meaning](../design-patterns/project-skill-icon-mapping.md) captures a related skill-token rule: metadata convenience must not imply a false brand or identity match.
