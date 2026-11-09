---
name: verify-github-io
description: "Drive the benkim0414 github.io React SPA the way a visitor does — launch a disposable production preview, exercise Home/Skills/Roadmap/theme via Chrome CDP, and capture ARIA + screenshot evidence. Use when verifying UI behavior for apps/github.io, after visual/layout changes, or when a ticket needs browser proof beyond unit tests."
---

# Verify github.io

Project-local verification skill for the primary user surface of this monorepo: the `github.io` GitHub Pages SPA under `apps/github.io`.

Secondary surfaces (not driven by this skill unless a feature file says so):

- Storybook for component visual QA (`pnpm nx storybook github.io`)
- Nx unit/component tests (`pnpm nx test github.io`)
- Firefox WebDriver BiDi layout gate (`pnpm nx run github.io:verify-mobile-layout-browser`) — keep using that target for layout regressions; this skill uses Chrome CDP for interactive user-path proof

Do not edit `pstack-models.mdc` as part of verification work.

## Interview snapshot

| Question | Answer from this repo |
| --- | --- |
| Surface | Public web UI (React Router SPA). No CLI product surface. |
| Run | `pnpm nx build github.io` then Vite production preview on an ephemeral `127.0.0.1` port. Dev server alternative: port `4200` via Vite `server`; prefer preview for release fidelity. |
| Drive | Chrome CDP through `control-github-io` (this skill). Existing Firefox BiDi script remains the layout verifier. |
| Observe | HTTP readiness, DOM ready selectors, ARIA snapshots, PNG screenshots, `data-theme`, pathnames. No DB. |
| Isolate | Yes — ephemeral preview + CDP ports and a disposable Chrome profile per run. Never drive a preview you did not launch. |

## Helpers

All commands below are from the **repository root**. The helper is executable Node:

```bash
chmod +x .cursor/skills/verify-github-io/scripts/control-github-io.mjs
CONTROL=node\ .cursor/skills/verify-github-io/scripts/control-github-io.mjs
# or:
CONTROL=./.cursor/skills/verify-github-io/scripts/control-github-io.mjs
```

Optional environment:

- `GITHUB_IO_VERIFY_RUN_ID` — stable id for one verification run (default: timestamp)
- `GITHUB_IO_VERIFY_RUN_DIR` — override run directory (default: `/tmp/github-io-verify-$RUN_ID`)
- `GITHUB_IO_PREVIEW_PORT` / `GITHUB_IO_CDP_PORT` — pin ports when needed
- `CHROME_BINARY` — defaults to `google-chrome`

Evidence lives in `$GITHUB_IO_VERIFY_RUN_DIR/evidence/` and is mirrored under `.cursor/skills/verify-github-io/artifacts/` for relative paths. Cleanup **must not** delete evidence.

## Launch

Ready means the production preview serves HTML **and** the Home landmark is present under Chrome — not merely that a TCP port accepts connections.

```bash
export GITHUB_IO_VERIFY_RUN_ID="verify-$(date -u +%Y%m%dT%H%M%SZ)"
$CONTROL launch
# Reuse an existing dist/apps/github.io build:
$CONTROL launch --skip-build
```

What launch does:

1. Runs `pnpm nx build github.io` unless `--skip-build`
2. Starts `pnpm exec vite preview` from `apps/github.io` on an owned port
3. Starts headless Chrome with a disposable profile and CDP port
4. Writes `/tmp/github-io-verify-$RUN_ID/state.json` and creates the evidence directory

Teardown is `cleanup` (below). If launch fails mid-way, still run cleanup for that `GITHUB_IO_VERIFY_RUN_ID`.

## Doctor

Run first whenever anything looks off:

```bash
$CONTROL doctor
```

Doctor is read-only. It must report `ok: true` with:

- owned preview + Chrome process groups still alive
- `baseUrl` HTTP 200 with HTML
- `main[aria-label="Home"]` reachable after navigating to `/`

Refuse to drive when doctor fails. Relaunch or fix the environment first.

## Drive

Read `features/README.md`, then the feature file for the journey. Prefer stable handles already used in this app:

- Landmarks: `main[aria-label="Home"]`, `main[aria-labelledby="skills-page-title"]`, `main[aria-label="Skill detail"]`, Roadmap `main` with heading `DevOps roadmap`
- Nav: link `Home` / `Skills` / `Roadmap`; mobile `button[aria-label="Navigation"]` + `dialog[aria-label="Navigation"]`
- Theme: `button[aria-label="Switch to light mode"]` / `Switch to dark mode`
- Skills search: combobox / textbox named `Search skills`
- Detail outline: `nav[aria-label="On this page"]`

Harness examples:

```bash
$CONTROL browser navigate --url /
$CONTROL browser ready --selector 'main[aria-label="Home"]'
$CONTROL browser click --role link --name Skills
$CONTROL browser click --selector 'button[aria-label="Switch to light mode"]'
$CONTROL browser fill --selector 'input[placeholder="Search skills..."]' --value kubernetes
$CONTROL browser eval --expression 'document.documentElement.getAttribute("data-theme")'
$CONTROL browser snapshot --aria --path home/home.aria.txt
$CONTROL browser screenshot --path home/home.png
```

At desktop widths (≥768px) Skills/Roadmap links are in the top nav. At phone widths open the Navigation drawer first.

## Evidence

Proof standards:

- Exercise the real visitor path (nav links, search, theme toggle). Do not call internal React setters or Storybook-only knobs as proof of the SPA.
- Capture the **action and resulting state** (ARIA snapshot + screenshot), not only a final URL.
- Confirm side effects that exist in this static app: pathname, focused heading, `data-theme`, visible search results, outline `aria-current`.
- Mocks are unnecessary for the SPA itself; outbound `https://dora.dev` / `https://roadmap.sh` / GitHub links may be observed but must not be required for local proof.

Artifact locations:

- Canonical: `/tmp/github-io-verify-$RUN_ID/evidence/<feature>/...`
- Convenience mirror: `.cursor/skills/verify-github-io/artifacts/<feature>/...` (gitignored)

Record the feature id and entry point with every artifact set.

## Cleanup

```bash
$CONTROL cleanup
```

Cleanup stops **only** the preview and Chrome process groups recorded in `state.json`, removes the disposable Chrome profile, and leaves the evidence directory intact. Never `pkill -f vite` / `pkill chrome`.

Confirm after cleanup:

```bash
test -d "/tmp/github-io-verify-$GITHUB_IO_VERIFY_RUN_ID/evidence"
ls "/tmp/github-io-verify-$GITHUB_IO_VERIFY_RUN_ID/evidence"
```

## Feature map

See [features/README.md](./features/README.md). Seeded journeys:

- Home landing
- Skills catalogue + search
- Skill detail
- DevOps roadmap
- Theme toggle

## Related Nx checks (not a substitute for this skill)

```bash
pnpm nx lint github.io
pnpm nx test github.io
pnpm nx build github.io
pnpm nx run github.io:verify-global-layout-css
pnpm nx run github.io:verify-mobile-layout-browser   # requires Firefox
```

## Maintenance

When routes, ARIA names, or nav structure change, update the matching files under `features/` and re-prove one journey. Use `/maintain-verification-skill` to keep the map honest as the app evolves.
