---
title: Sync Skill Stories With the Storybook Viewport
date: 2026-09-13
category: ui-bugs
module: github.io responsive skill Storybook stories
problem_type: ui_bug
component: testing_framework
symptoms:
  - During the pre-fix manual Storybook check, selecting Tablet resized the iframe but still rendered the desktop inline interaction; the session attributed this to coarse-pointer media queries remaining false.
  - In the pre-fix stories, desktop detail fixtures declared desktop viewport globals; Storybook treats a story-level viewport global as locked.
  - During the pre-fix toolbar transition, a compact matchMedia wrapper was observed to persist when returning to Desktop or Responsive.
root_cause: test_isolation
resolution_type: code_fix
severity: medium
related_components:
  - github.io SkillTableDetailLayout
  - github.io SkillsPage
  - github.io SkillTable
  - Storybook viewport globals
  - window.matchMedia
tags:
  [
    github-io,
    storybook,
    skills,
    responsive-layout,
    tablet,
    coarse-pointer,
    match-media,
    test-isolation,
  ]
---

# Sync Skill Stories With the Storybook Viewport

## Problem

Storybook viewport selection changes the iframe dimensions, but it does not
reproduce every responsive input capability used by the skills master-detail
UI. The UI's compact-surface decision includes both width and pointer/hover
features, so a tablet-sized iframe can still take the fine-pointer panel branch
unless the story supplies the missing capability
(`apps/github.io/src/app/skills/skill-table-detail-layout.tsx:26`).

## Symptoms

- During the pre-fix manual check, the Tablet viewport opened the desktop-style
  detail region instead of the expected bottom-sheet dialog. The application
  chooses the detail surface from `useMediaQuery(COMPACT_SURFACE_QUERY)`, not
  width alone
  (`apps/github.io/src/app/skills/skill-table-detail-layout.tsx:45`).
- In the pre-fix stories, desktop detail fixtures declared desktop viewport
  globals; Storybook treats those story-level values as locked. Regression
  tests now protect the unlocked desktop-story state
  (`apps/github.io/src/app/skills/skills-page.stories.spec.ts:18`).
- During the pre-fix toolbar transition, the compact `window.matchMedia`
  wrapper was observed to persist when returning from Tablet to Desktop. The
  helper now recovers the original matcher, and its test covers that transition
  (`apps/github.io/src/app/skills/skill-story-match-media.ts:8`;
  `apps/github.io/src/app/skills/skill-story-match-media.spec.ts:57`).
- An already-mounted responsive hook could retain subscriptions created before
  `window.matchMedia` changed. The interactive stories now key their rendered
  roots from the viewport global
  (`apps/github.io/src/app/skills/skills-page.stories.tsx:86`;
  `apps/github.io/src/app/skills/skill-table.stories.tsx:107`).

## What Didn't Work

### Treating viewport dimensions as device emulation

Resizing the iframe was insufficient for the coarse-tablet case. The production
query combines a maximum width with `(pointer: coarse)` and `(hover: none)`,
while the layout consumes the complete query through `useMediaQuery`
(`apps/github.io/src/app/skills/skill-table-detail-layout.tsx:26`). A viewport
preset should not be assumed to emulate pointer hardware.

### Pinning desktop stories to a desktop global

Pinning the desktop story made its initial rendering deterministic, but also
made the story own the viewport value and prevented the toolbar from remaining
an effective responsive control. The corrected contract pins only fixtures
whose identity requires a fixed viewport and explicitly tests that the desktop
story has no viewport global
(`apps/github.io/src/app/skills/skills-page.stories.tsx:105`;
`apps/github.io/src/app/skills/skills-page.stories.spec.ts:18`).

### Overriding width and capability queries together

Forcing both the table-width query and compact-surface query made one preset
deterministic but disconnected table/card selection from the iframe's real
width. The final adapter intercepts only `COMPACT_SURFACE_QUERY` and delegates
every other query to the native matcher
(`apps/github.io/src/app/skills/skill-story-match-media.ts:21`). The test also
asserts that the native width-query object is returned unchanged
(`apps/github.io/src/app/skills/skill-story-match-media.spec.ts:30`).

### Stacking wrappers across toolbar transitions

Capturing the current `window.matchMedia` without checking whether it was
already adapted allowed wrappers to accumulate. Returning to a viewport with no
compact override could expose stale behavior. The helper now attaches the
native matcher to its wrapper and unwraps it before applying the next state
(`apps/github.io/src/app/skills/skill-story-match-media.ts:3`).

### Replacing `matchMedia` without refreshing consumers

Changing the global function does not recreate subscriptions held by mounted
responsive hooks. The stories now derive a React key from the viewport value,
forcing a fresh mount when the toolbar selection changes
(`apps/github.io/src/app/skills/skill-story-match-media.ts:55`).

## Solution

Keep responsibility split between Storybook's viewport control and a
capability-only adapter:

```ts
const originalMatchMedia = getSkillStoryOriginalMatchMedia(window.matchMedia);
window.matchMedia = createSkillStoryMatchMedia(
  originalMatchMedia,
  getSkillStoryCompactOverride(globals.viewport),
);
```

The responsive desktop story uses this loader pattern and restores the captured
native matcher during cleanup
(`apps/github.io/src/app/skills/skills-page.stories.tsx:69`). The adapter itself
is deliberately narrow:

```ts
const nativeMatchMedia = getSkillStoryOriginalMatchMedia(originalMatchMedia);
if (compact === undefined) return nativeMatchMedia;

return (query) =>
  query === COMPACT_SURFACE_QUERY
    ? compactMediaQueryList(query, compact)
    : nativeMatchMedia(query);
```

Named tablet and mobile viewports map to a compact override; desktop,
responsive, and unknown values use native behavior
(`apps/github.io/src/app/skills/skill-story-match-media.ts:44`). Non-compact
queries always delegate to the native matcher.

Leave the desktop story's viewport global unset so toolbar changes remain
authoritative. Key the responsive root by
`getSkillStoryViewportKey(globals.viewport)` at render time
(`apps/github.io/src/app/skills/skills-page.stories.tsx:63`). Keep a dedicated
coarse-tablet story pinned to `tablet` because that fixture specifically
represents coarse input
(`apps/github.io/src/app/skills/skills-page.stories.tsx:105`).

Production `/skills` behavior remains based on the application media queries;
the emulation helper is used only by skills Storybook stories and its own test.

## Why This Works

Dimensions and input capability are separate responsive signals. Storybook
continues to own dimensions, so native width-query results track the selected
iframe size. The adapter supplies only the coarse-input fact that the browser
does not infer from that size. This matches the application's decision boundary
without replacing unrelated media-query behavior.

Unwrapping makes the override transition-safe: every new loader starts from the
recorded native matcher, and a viewport with no override returns that matcher
directly (`apps/github.io/src/app/skills/skill-story-match-media.ts:8`). Loader
cleanup restores it after the story
(`apps/github.io/src/app/skills/skills-page.stories.tsx:79`).

Finally, the viewport-derived key changes with the toolbar value, as asserted by
the helper test (`apps/github.io/src/app/skills/skill-story-match-media.spec.ts:71`).
React remounts the responsive story subtree, allowing media-query consumers to
subscribe against the matcher for the new viewport.

## Prevention

- Treat Storybook viewport presets as dimension controls, not complete device
  emulators. Emulate only missing media capabilities used by the production
  decision.
- Do not set `globals.viewport` on an exploratory responsive story. Protect
  this with manifest assertions for stories intended to follow the toolbar.
- Delegate all unrelated media queries and test native object identity, not
  merely an equivalent boolean result.
- Make global adapters reversible and idempotent. Preserve the original
  function, unwrap before reconfiguration, and test compact-to-desktop
  transitions.
- Pair global media-query replacement with lifecycle cleanup and a remount key
  when consumers subscribe during mount.
- Assert semantic outcomes in play tests: a desktop selection opens a named
  `region`, while compact input opens a named `dialog`.

## Related Issues

- [Mirror Route Ownership in Mobile Storybook Pages](../design-patterns/mirror-app-shell-ownership-in-mobile-storybook-pages.md)
  covers the related need to reset stateful Storybook providers at story
  boundaries.
- [Verify Storybook From Linked Worktrees](../workflow-issues/verify-storybook-from-linked-worktree.md)
  covers running the exact branch under review during device testing.
- [Make Certification Badge Storybook Fixtures Explicit](storybook-certification-badge-fixtures.md)
  documents another case where a Storybook fixture diverged from production
  behavior.
