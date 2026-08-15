---
title: DORA capability cards fill mobile content width
date: 2026-08-15
category: ui-bugs
module: apps/github.io DevOps Capability Evidence
problem_type: ui_bug
component: tooling
symptoms:
  - DORA capability cards remained narrower than the available Home page content width on mobile viewports
  - Browser verification could pass when the DORA banner and cards shared the same unintended ancestor width cap
root_cause: logic_error
resolution_type: code_fix
severity: low
related_components:
  - Astryx Component Contract
  - Mobile Page Shell
  - testing_framework
tags:
  - github-io
  - dora
  - mobile-layout
  - full-width
  - astryx-card
  - browser-verification
---

# DORA capability cards fill mobile content width

## Problem

The Home page's DORA capability cards retained a component-local maximum width, so they stopped short of the content edges on mobile and iPad-sized viewports. The first browser regression check compared the cards only with the adjacent DORA banner; that comparison could still pass if a shared ancestor constrained both surfaces to the same wrong width.

## Symptoms

- DORA cards were visibly narrower than other Home page components even though the surrounding section had more inline space available.
- A card-to-banner equality assertion reported success whenever both siblings had identical geometry, including the unintended shared-cap case.

## What Didn't Work

Comparing one subject with a nearby reference did not establish that either element filled the page's intended content allocation:

```js
card.left === banner.left &&
  card.right === banner.right &&
  card.width === banner.width;
```

This oracle was self-referential. A maximum width on either the shared region or another common ancestor could make the banner and every card equally narrow while preserving all three equalities. Locating card surfaces with an unqualified document query and `parentElement` also coupled the check to unrelated matches and incidental DOM nesting.

## Solution

### Use the shared component width contract

Remove the wrapper's component-local maximum width and ask the Astryx card itself to fill the width allocated by its parent:

```tsx
<Card padding={4} width="100%">
  {/* capability content */}
</Card>
```

This keeps the card's surface behavior in the Astryx Component Contract while leaving responsive allocation with the Home section. The implementation lives in `apps/github.io/src/app/devops-capability-evidence/dora-capability-card.tsx`.

### Derive an independent browser geometry oracle

The production browser verifier now treats the Home page allocation—not a sibling—as the source of truth:

1. Scope the banner and card queries to the DORA region identified from `#dora-capabilities-title`.
2. Assert that the DORA region spans the active Home `main` rectangle.
3. Read the region's computed `padding-inline-start` and `padding-inline-end`.
4. Derive the expected inner content edges from the region rectangle and those padding values.
5. Require exactly one intended banner and at least one card surface.
6. Assert that the banner and every card surface match the independently derived edges within the verifier's geometry tolerance.

The essential calculation in `apps/github.io/scripts/verify-mobile-layout-browser.mjs` is:

```js
const expectedContentBounds = {
  left: region.left + paddingInlineStart,
  right: region.right - paddingInlineEnd,
  width: region.width - paddingInlineStart - paddingInlineEnd,
};
```

Stable test IDs locate the intended banner and capability-card roots, but they do not define the expected width. Card roots resolve their rendered surfaces with `closest('.astryx-card')`, so the assertion targets the design-system surface instead of relying on an incidental parent node. The banner locator is declared in `apps/github.io/src/app/skills/home-page.tsx`.

### Mutation-test the oracle

The verifier's self-test includes a shared-cap fixture. Its viewport and frame are 820 px wide, while the active `main` and DORA region share the shell's 808 px content allocation. Both the banner and card stop at the same narrow right edge. That geometry preserves sibling equality, so the former assertion would pass, but the independent padded-bounds assertion rejects it with `DORA surfaces do not fill the padded Home content bounds`.

This negative case tests the regression check itself: it proves that the oracle fails for the exact false-positive shape it is meant to prevent.

## Why This Works

The visual defect had two layers. The component layer imposed a local width policy that conflicted with the mobile-first page allocation; using `Card width="100%"` removes that conflict through the supported Astryx API. The verification layer used a reference that could share the same defect as the subject; deriving expected edges from a main-spanning region and its computed padding makes the oracle structurally independent of the surfaces being checked.

Scoping selectors to the DORA region excludes outside matches. Requiring exactly one banner and at least one resolvable card also turns missing or duplicate banner references and empty card selections into explicit failures instead of silently measuring the wrong node.

## Validation

- `node apps/github.io/scripts/verify-mobile-layout-browser.mjs --self-test` passes, including `a shared DORA width cap cannot pass as full-width content`.
- `pnpm nx test github.io --skip-nx-cache` passes all 615 tests.
- `pnpm nx lint github.io --skip-nx-cache` succeeds with the repository's existing warnings.
- `pnpm nx run github.io:verify-mobile-layout-browser --skip-nx-cache` verifies six routes at both 375 × 667 and 820 × 1180 in production Firefox.

## Prevention

- Let page sections allocate responsive width; use an Astryx component's public width prop instead of retaining a local maximum-width rule unless the product explicitly calls for a cap.
- For layout assertions, derive expected geometry from the owning allocation boundary and computed spacing, not from another child that could inherit the same defect.
- Assert parent/region invariants before child bounds so a constrained allocation cannot masquerade as correct child layout.
- Scope browser selectors to the semantic region under test and require exact reference counts.
- Resolve the actual rendered design-system surface explicitly rather than assuming `parentElement` is stable.
- Add a negative geometry fixture that preserves the old comparison while violating the real requirement.
- Keep both component-contract tests and production-browser geometry checks: the former protects API intent, while the latter proves rendered layout.

## Related Issues

- [Astryx component API contracts](../best-practices/astryx-component-api-contracts.md)
- [Keep Home sections under one Page Scroll Owner](../design-patterns/keep-home-sections-under-one-page-scroll-owner.md)
- [Astryx-derived badge variants](../best-practices/astryx-derived-badge-variants.md)
- [React Flow DevOps roadmap visual regression](react-flow-devops-roadmap-visual-regression.md)
- [Mirror App Shell ownership in mobile Storybook pages](../design-patterns/mirror-app-shell-ownership-in-mobile-storybook-pages.md)
