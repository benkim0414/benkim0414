# Task 3 Report: Deterministic Storybook sidebar ordering

## Implementation

Added the Storybook manager sort policy to `preview.parameters.options.storySort`, ordering root groups as `Pages`, `Navigation`, then `Components`. Added a taxonomy test that imports the preview and asserts this exact configuration. The existing preview decorator and controls matcher configuration are unchanged.

## Files changed

- `apps/github.io/.storybook/preview.ts`
- `apps/github.io/.storybook/story-taxonomy.spec.ts`

## TDD evidence

RED:

```text
Command: pnpm nx test github.io -- story-taxonomy
Result: FAIL (1 failed, 2 passed)
Failure: expected undefined to deeply equal { order: [ 'Pages', 'Navigation', 'Components' ] }
```

GREEN:

```text
Command: pnpm nx test github.io -- story-taxonomy
Result: PASS (1 file, 3 tests)
```

## Validation

Commands were run in the required order:

1. `pnpm nx lint github.io` — passed; 0 errors, 31 pre-existing warnings.
2. `pnpm nx test github.io` — passed; 75 files, 724 tests.
3. `pnpm nx build github.io` — passed.
4. `pnpm nx build-storybook github.io` — passed; generated `apps/github.io/storybook-static`.

The generated `storybook-static/index.json` includes the five `Pages` stories, the two `Navigation` stories, and the `Components` stories. This was an automated manifest inspection only; a manual browser/sidebar inspection was not performed. The route taxonomy test confirms the five route stories use `/`, `/skills`, `/skills/kubernetes`, `/roadmap`, and `/missing`.

## Warnings and concerns

Observed warnings (not introduced by this task):

- Node repeatedly emitted: `Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set`.
- Test/build tooling emitted: `The nxViteTsPaths plugin from @nx/vite/plugins/nx-tsconfig-paths.plugin is deprecated and will be removed in Nx v24. Replace it with tsconfigPaths() from the vite-tsconfig-paths package.`
- Lint completed with 31 warnings: `react/jsx-no-useless-fragment`, `jsx-a11y/role-supports-aria-props`, `@typescript-eslint/no-non-null-assertion`, `react-hooks/exhaustive-deps`, and `jsx-a11y/accessible-emoji` warnings in existing application files.
- Full Vitest output included existing jsdom environment messages: `Error: Not implemented: HTMLCanvasElement.prototype.getContext (without installing the canvas npm package)` and `Error: Not implemented: window.scrollTo`.
- App build emitted Lightning CSS warnings: `[lightningcss minify] Unknown at rule: @theme` (three occurrences) and `Unknown at rule: @tailwind` (one occurrence).
- App build and Storybook build emitted the existing large-chunk warning: `Some chunks are larger than 500 kB after minification.`
- Storybook build displayed its standard anonymous usage telemetry notice.
- Manual Storybook sidebar verification was skipped; this report does not treat the manifest inspection as a substitute for a browser check.

No production routes, UI, data, dependencies, or physical `pages/` directory were changed.

## Self-review

The diff is limited to the two requested files, preserves the decorator and controls configuration, implements the approved root order exactly, and adds direct regression coverage. The only deferred validation is the skipped manual browser/sidebar inspection noted above.
