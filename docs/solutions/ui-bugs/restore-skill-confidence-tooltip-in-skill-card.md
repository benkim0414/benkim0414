---
title: Restore Skill Confidence Tooltip in Skill Card
date: 2026-08-30
category: ui-bugs
module: github.io App
problem_type: ui_bug
component: tooling
symptoms:
  - Skill Confidence tokens rendered inside Skill Card did not display their explanatory tooltip on hover.
  - The token lacked the focusable trigger and semantic tooltip association provided by SkillConfidence's existing wrapper.
root_cause: logic_error
resolution_type: code_fix
severity: low
related_components:
  - Skill Card
  - Skill Confidence
tags: [github-io, skills, skill-card, skill-confidence, tooltip, accessibility, regression-test]
---

# Restore Skill Confidence Tooltip in Skill Card

## Problem

In the `github.io` app, the token-format `SkillConfidence` displayed by
`SkillCard` had no explanatory tooltip on hover or keyboard focus. The card
explicitly disabled the shared component's tooltip despite rendering its token
variant.

## Symptoms

- Skill cards displayed tokens such as `Confidence: Confident`, but no
  explanatory tooltip.
- The token was not focusable and did not expose the tooltip relationship that
  the enabled token presentation provides.

## What Didn't Work

The initial test command included Vitest's unsupported `--runInBand` option.
That was a test-runner invocation error rather than an application defect;
rerunning with the supported Nx test command exercised the regression test.

## Solution

Remove the consumer-level tooltip opt-out while retaining the existing token
variant in `apps/github.io/src/app/skills/skill-card.tsx`.

```tsx
// Before
<SkillConfidence
  confidence={skill.confidence}
  hasTooltip={false}
  variant="token"
/>

// After
<SkillConfidence confidence={skill.confidence} variant="token" />
```

Add a `SkillCard` regression test that finds the token by its self-rated
confidence label, verifies it is focusable, and resolves its
`aria-describedby` IDs to the rendered tooltip
(`apps/github.io/src/app/skills/skill-card.spec.tsx:102`).

## Why This Works

`SkillConfidence` defaults `hasTooltip` to `true`
(`apps/github.io/src/app/skills/skill-confidence.tsx:52`). When a token has a
tooltip, the confidence root receives an accessible self-rated-confidence name
and `tabIndex={0}` (`apps/github.io/src/app/skills/skill-confidence.tsx:71`),
then the component wraps it in Astryx `Tooltip`
(`apps/github.io/src/app/skills/skill-confidence.tsx:107`). Removing the
false override restores that existing behavior without changing its copy,
markup, styling, or layout.

## Prevention

- Keep the card-level regression test alongside the `SkillConfidence` unit
  tests: the unit tests protect the shared component while the card test
  protects its consumer configuration.
- When a shared accessibility behavior is enabled by default, disable it in a
  consumer only for an explicit product reason and cover that alternative with
  a focused test.

## Related Issues

- [Wrap Skill Confidence Tooltip Content](skill-confidence-tooltip-wrapping.md)
- [Use Astryx Supporting Text For Skill Confidence](../best-practices/use-astryx-supporting-text-for-skill-confidence.md)
