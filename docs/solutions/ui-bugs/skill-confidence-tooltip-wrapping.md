---
title: Wrap Skill Confidence Tooltip Content
date: 2026-08-28
category: ui-bugs
module: github.io Astryx skills
problem_type: ui_bug
component: tooling
symptoms:
  - Skill confidence inline tooltip text stayed on one line instead of wrapping
  - Tooltip copy needed an explicit wrapping contract independent of the inline confidence wrapper
  - Linked skill rows risked pulling tooltip explanation copy into their accessible names
root_cause: logic_error
resolution_type: code_fix
severity: low
related_components:
  - github.io Astryx Foundation
  - github.io skill components
  - SkillConfidence
  - Astryx Tooltip
  - Storybook
  - testing_framework
tags: [github-io, skills, skill-confidence, astryx, tooltip, stylex, storybook, accessibility]
---

# Wrap Skill Confidence Tooltip Content

## Problem

Adding concise Astryx Tooltip explanations to `SkillConfidence` exposed a
layout and accessibility edge case. The confidence root intentionally keeps the
visible label compact with `whiteSpace: 'nowrap'`, but tooltip explanation copy
needs to wrap inside the tooltip surface (`apps/github.io/src/app/skills/skill-confidence.tsx:20`,
`apps/github.io/src/app/skills/skill-confidence.tsx:25`).

The change also had to preserve the existing confidence contracts. Skill detail
metadata keeps `Confidence` as the `MetadataListItem` label and renders only
the qualitative value in the value slot (`apps/github.io/src/app/skills/skill-detail-page.tsx:98`,
`apps/github.io/src/app/skills/skill-detail-page.tsx:99`). Linked skill rows
keep their row link name focused on skill, category, and hidden confidence
context rather than adding supplemental tooltip copy
(`apps/github.io/src/app/skills/skill-list-item.spec.tsx:67`,
`apps/github.io/src/app/skills/skill-list-item.spec.tsx:90`).

## Symptoms

- The confidence tooltip explanation needed its own wrapping style instead of
  depending on inherited behavior from either the trigger subtree or Astryx
  tooltip internals.
- Moving to a sibling `anchorRef` tooltip escaped the layout inheritance issue,
  but made the expected trigger-to-tooltip accessibility path harder to keep
  aligned with Astryx's wrapper-mode contract.
- Detail metadata could regress into repeated visible text such as
  `Confidence: Confident` instead of preserving the label/value split.
- Linked list rows and clickable skill cards could gain extra tooltip-trigger
  focus targets or accessible-description text inside an already clickable
  surface.

## What Didn't Work

Relying on the Astryx tooltip surface alone left the local wrapping contract
implicit. Astryx's tooltip content wrapper already applies a max width and
`wordBreak: 'break-word'` (`node_modules/.pnpm/@astryxdesign+core@0.1.4_@stylexjs+stylex@0.19.0_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@astryxdesign/core/src/Tooltip/useTooltip.tsx:72`,
`node_modules/.pnpm/@astryxdesign+core@0.1.4_@stylexjs+stylex@0.19.0_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@astryxdesign/core/src/Tooltip/useTooltip.tsx:78`,
`node_modules/.pnpm/@astryxdesign+core@0.1.4_@stylexjs+stylex@0.19.0_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@astryxdesign/core/src/Tooltip/useTooltip.tsx:79`), but
the local confidence component still needed to declare that the explanatory
copy wraps normally.

Sibling `anchorRef` mode was also the wrong default here. Astryx supports
external anchors, but normal element-child wrapper mode already attaches the
combined tooltip ref and `aria-describedby` to the first child
(`node_modules/.pnpm/@astryxdesign+core@0.1.4_@stylexjs+stylex@0.19.0_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@astryxdesign/core/src/Tooltip/Tooltip.tsx:264`,
`node_modules/.pnpm/@astryxdesign+core@0.1.4_@stylexjs+stylex@0.19.0_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@astryxdesign/core/src/Tooltip/Tooltip.tsx:267`,
`node_modules/.pnpm/@astryxdesign+core@0.1.4_@stylexjs+stylex@0.19.0_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@astryxdesign/core/src/Tooltip/Tooltip.tsx:311`). Extra anchoring logic added another path to test without solving a distinct product need.

## Solution

Keep Astryx Tooltip in wrapper mode and reset whitespace on the tooltip copy
with StyleX, not an inline style object. `SkillConfidence` defines a concise
tooltip sentence, gives the copy a dedicated `tooltipContent` style with
`whiteSpace: 'normal'`, and renders that copy as the Tooltip content
(`apps/github.io/src/app/skills/skill-confidence.tsx:33`,
`apps/github.io/src/app/skills/skill-confidence.tsx:35`,
`apps/github.io/src/app/skills/skill-confidence.tsx:47`,
`apps/github.io/src/app/skills/skill-confidence.tsx:57`,
`apps/github.io/src/app/skills/skill-confidence.tsx:65`).

```tsx
const styles = stylex.create({
  tooltipContent: {
    display: 'block',
    whiteSpace: 'normal',
  },
});

const tooltipContent = (
  <span {...stylex.props(styles.tooltipContent)}>
    {confidenceTooltip}
  </span>
);
```

For the text variant, make the Astryx `Text` element itself the tooltip trigger
and give it `tabIndex={0}` so Tooltip's automatic focus handling applies to a
focusable first child. The dashed underline remains a local StyleX override
passed through `Text`'s `xstyle` prop (`apps/github.io/src/app/skills/skill-confidence.tsx:88`,
`apps/github.io/src/app/skills/skill-confidence.tsx:89`,
`apps/github.io/src/app/skills/skill-confidence.tsx:92`,
`apps/github.io/src/app/skills/skill-confidence.tsx:94`).

```tsx
tooltip(
  <Text
    aria-label={`Self-rated confidence: ${label}`}
    tabIndex={0}
    type="supporting"
    xstyle={styles.textTooltipTrigger}
  >
    {label}
  </Text>,
)
```

For the standalone token variant, wrap the confidence root and make it
focusable when the tooltip is enabled (`apps/github.io/src/app/skills/skill-confidence.tsx:72`,
`apps/github.io/src/app/skills/skill-confidence.tsx:79`,
`apps/github.io/src/app/skills/skill-confidence.tsx:107`). For linked cards
and linked rows, opt out with `hasTooltip={false}` or `hasTooltip={!href}` so
the clickable surface does not gain nested tooltip focus targets
(`apps/github.io/src/app/skills/skill-card.tsx:84`,
`apps/github.io/src/app/skills/skill-card.tsx:86`,
`apps/github.io/src/app/skills/skill-list-item.tsx:38`,
`apps/github.io/src/app/skills/skill-list-item.tsx:40`).

Storybook exposes reviewable open states for both variants through
`TextTooltipOpen` and `TokenTooltipOpen` (`apps/github.io/src/app/skills/skill-confidence.stories.tsx:25`,
`apps/github.io/src/app/skills/skill-confidence.stories.tsx:39`).

## Why This Works

Wrapper mode keeps ownership of tooltip semantics with Astryx. For element
children, Tooltip uses a `display: contents` wrapper and attaches the tooltip
ref plus `aria-describedby` to the first child, so the trigger remains the
visible confidence control rather than a detached sibling
(`node_modules/.pnpm/@astryxdesign+core@0.1.4_@stylexjs+stylex@0.19.0_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@astryxdesign/core/src/Tooltip/Tooltip.tsx:308`,
`node_modules/.pnpm/@astryxdesign+core@0.1.4_@stylexjs+stylex@0.19.0_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@astryxdesign/core/src/Tooltip/Tooltip.tsx:311`,
`node_modules/.pnpm/@astryxdesign+core@0.1.4_@stylexjs+stylex@0.19.0_react-dom@19.2.7_react@19.2.7__react@19.2.7/node_modules/@astryxdesign/core/src/Tooltip/Tooltip.tsx:314`).

The whitespace reset is intentionally narrower than changing the confidence
root. The root still prevents compact metadata labels from wrapping, while the
tooltip message opts back into normal wrapping at the content node. That keeps
the layout contract and the tooltip-reading contract independent.

The accessibility model also stays layered. The visible inline confidence value
is a keyboard-focusable tooltip trigger, the standalone token root can be
focused when its tooltip is enabled, and linked rows/cards suppress tooltip
triggers inside their clickable surfaces. Regression tests cover
`aria-describedby`, focusability, tooltip content structure, token rendering,
metadata label/value separation, and linked-row accessible-name preservation.
The linked-card suppression is implemented by opting the card token out of the
tooltip, but does not currently have its own focused regression test
(`apps/github.io/src/app/skills/skill-confidence.spec.tsx:52`,
`apps/github.io/src/app/skills/skill-confidence.spec.tsx:61`,
`apps/github.io/src/app/skills/skill-confidence.spec.tsx:81`,
`apps/github.io/src/app/skills/skill-confidence.spec.tsx:92`,
`apps/github.io/src/app/skills/skill-detail-page.spec.tsx:184`,
`apps/github.io/src/app/skills/skill-list-item.spec.tsx:67`,
`apps/github.io/src/app/skills/skill-card.tsx:84`).

## Prevention

- When a tooltip trigger lives in a component that uses `white-space: nowrap`,
  add a local StyleX whitespace reset on the tooltip content node so wrapping is
  explicit and reviewable.
- Prefer Astryx Tooltip wrapper mode for normal inline triggers; use
  `anchorRef` only when sibling anchoring is a real requirement.
- If a tooltip trigger must be keyboard discoverable, make the first child
  Tooltip sees focusable and test that it has `aria-describedby`.
- Do not add tooltip triggers inside linked rows or clickable cards unless the
  whole surface's accessible name and tab order are intentionally updated.
- Keep forced-open Storybook stories for tooltip variants so wrapping and
  placement can be reviewed without relying on hover timing.

## Related Issues

- [Use Astryx Supporting Text For Skill Confidence](../best-practices/use-astryx-supporting-text-for-skill-confidence.md)
- [Use Astryx IconButton Tooltips For Global Nav Icons](../best-practices/use-astryx-iconbutton-tooltips-for-global-nav-icons.md)
- [Verify Astryx Component API Contracts Before Styling](../best-practices/astryx-component-api-contracts.md)
- [Use Astryx Typography For Component-Owned Text](../best-practices/astryx-component-owned-typography.md)
- [Keep Certification HoverCards Supplemental to Direct Links](../design-patterns/accessible-certification-metadata-hovercard.md)
- [Verify Storybook From Linked Worktrees](../workflow-issues/verify-storybook-from-linked-worktree.md)
