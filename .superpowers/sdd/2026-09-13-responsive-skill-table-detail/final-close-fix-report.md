# Final close fix report

## Outcome

The desktop skill detail now closes only for an unhandled, non-composing
Escape keydown. A foreground control that calls `preventDefault()` retains the
selected detail, and Escape used to cancel text composition does not dismiss
the detail. The existing ordinary-Escape close path still calls `onClose(true)`
and retains its focus-restoration behavior.

## Root cause

The document-level keydown listener checked only `event.key === 'Escape'`.
Because it did not inspect `event.defaultPrevented` or `event.isComposing`, it
could not distinguish a dismissal request from an Escape already consumed by a
foreground interaction or an input-method editor.

## TDD evidence

### RED

Command:

```text
./node_modules/.bin/vitest run apps/github.io/src/app/skills/skill-table-detail-layout.spec.tsx --config apps/github.io/vite.config.ts
```

Before the production change, the focused suite reported 2 failures and 5
passes. Both new regressions observed one unexpected `onClose(true)` call:

- `keeps an active panel open when a foreground control handles Escape`
- `keeps an active panel open while Escape cancels text composition`

An earlier attempt through `pnpm exec` did not reach the tests because pnpm
tried to repair its store, could not open its SQLite database, and then could
not reach the npm registry. The installed Vitest binary avoided dependency or
network mutation.

### GREEN

The same focused Vitest command then passed all 7 tests. This includes the
existing regression `closes an active panel with Escape and requests focus
restoration`, which preserves the unhandled-Escape behavior.

## Implementation

The listener predicate now requires all three conditions before dismissing:

- the key is Escape;
- the event is not already default-prevented;
- the event is not composing.

No event propagation or focus-restoration code changed.

## Verification

- Focused test: 1 file passed, 7 tests passed.
- `./node_modules/.bin/nx lint github.io`: passed.
- `./node_modules/.bin/nx build github.io`: passed; 2,797 modules transformed.
- `git diff --check`: passed with no whitespace errors.

Vitest and build emitted the repository's existing Nx Vite TypeScript-paths
deprecation warning. It did not affect either command's exit status.

## Self-review

- Scope is limited to the desktop document listener and its unit regressions.
- The foreground regression exercises real bubbling from a control whose own
  listener calls `preventDefault()`; it does not assert on a mock event handler.
- Removing either new predicate guard causes its corresponding regression to
  fail, while the existing Escape test protects ordinary dismissal.
- `apps/github.io/debug-storybook.log` remains untouched and untracked.
