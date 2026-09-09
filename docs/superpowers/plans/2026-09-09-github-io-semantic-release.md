# GitHub.io Semantic Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically calculate, publish, display, and deploy an independent SemVer for the `github.io` app from exact-scope conventional commits, including a reviewed historical bootstrap and safe retry behavior.

**Architecture:** A repository-owned Node coordinator owns commit classification and the resumable release state machine. Nx remains the project/build orchestrator and records the independent release group/tag convention. Vite injects an immutable version into the app. One serialized GitHub Actions workflow builds once, persists a verified artifact as a draft GitHub Release asset, publishes the tag/release, and deploys that exact artifact with anti-rollback checks.

**Tech Stack:** Node.js ESM and `node:test`, Git, Nx 23, pnpm, Vite 8, React 19, GitHub Actions, GitHub CLI.

**Spec:** `docs/superpowers/specs/2026-09-09-github-io-semantic-release-design.md`

## Global Constraints

- Only commits whose Conventional Commit scope is exactly `github.io` affect this stream.
- A scoped breaking change is major; otherwise `feat` is minor, `fix` is patch, and every other type is ignored.
- Replay first-parent integrations from `8acdd81` at `0.0.0` for the one-time bootstrap; the expected result is asserted by tests before any tag is created.
- The authoritative tag format is `github.io@{version}`; the app manifest has no source version.
- Development displays `dev`; production release builds require a valid SemVer and reject missing or development values.
- The release artifact is built once, digest-verified on resume, and never rebuilt after publication begins.
- Deployment must reject divergent, conflicting, or older candidates and permit missing deployment metadata only during bootstrap.
- Do not push, create a real tag/release, alter secrets, or deploy while implementing this plan.

---

### Task 1: Implement conventional-commit version calculation

**Files:**
- Create: `scripts/github-io-release-core.mjs`
- Create: `scripts/github-io-release-core.test.mjs`

**Interfaces:**
- Produces: `parseConventionalCommit(subject, body)`, `classifyGithubIoCommit(commit)`, `highestBump(commits)`, `incrementVersion(version, bump)`, and `calculateVersion({ currentVersion, commits })`.
- `classifyGithubIoCommit` returns `'major' | 'minor' | 'patch' | null`; `calculateVersion` returns `{ bump, version, contributingCommits } | null`.

- [ ] **Step 1: Add failing table tests** covering exact scope, `feat`/`fix`, ignored types/scopes, `type(scope)!`, `BREAKING CHANGE:` trailers, major precedence, SemVer increments, and an all-ignored no-op. Include false-positive cases `github-io`, `github.io-ui`, and an unscoped breaking commit.
- [ ] **Step 2: Run the red test:** `node --test scripts/github-io-release-core.test.mjs`; expect module-not-found.
- [ ] **Step 3: Implement the pure functions** with this parsing contract:

```js
const HEADER = /^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?: (?<description>.+)$/;

export function classifyGithubIoCommit({ subject, body = '' }) {
  const match = HEADER.exec(subject);
  if (!match || match.groups.scope !== 'github.io') return null;
  if (match.groups.breaking || /(^|\n)BREAKING[ -]CHANGE:\s/m.test(body)) return 'major';
  if (match.groups.type === 'feat') return 'minor';
  if (match.groups.type === 'fix') return 'patch';
  return null;
}
```

Implement strict `major.minor.patch` parsing without adding a SemVer dependency. Preserve each contributing commit's SHA, subject, and bump.
- [ ] **Step 4: Run the green test:** `node --test scripts/github-io-release-core.test.mjs`; expect all tests pass.
- [ ] **Step 5: Commit:** stage both explicit paths and commit `feat(github.io): calculate releases from scoped commits`.

### Task 2: Implement Git history, bootstrap, and prepared-release records

**Files:**
- Create: `scripts/github-io-release.mjs`
- Create: `scripts/github-io-release.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes Task 1 functions.
- Produces CLI commands `calculate`, `bootstrap`, `verify-record`, and `verify-deployment`.
- A release record is `{ schemaVersion: 1, project: 'github.io', sourceSha, previousVersion, version, tag, bootstrap, commits, artifact: { name, sha256 } }`.
- CLI writes JSON only to stdout and diagnostics only to stderr.

- [ ] **Step 1: Add failing integration tests** using temporary Git repositories. Cover: first-parent range scanning; rejection when the previous tag is not an ancestor; bootstrap replay from `8acdd81` semantics using a fixture intro SHA; no-op histories; deterministic record serialization; mismatched project/SHA/tag/digest; and deployment decisions `deploy`, `identical`, `superseded`, `divergent`, `conflict`, plus bootstrap initialization.
- [ ] **Step 2: Run the red test:** `node --test scripts/github-io-release.test.mjs`; expect missing CLI/functions.
- [ ] **Step 3: Implement the CLI** using `execFileSync('git', args, { encoding: 'utf8' })`, `%H%x00%s%x00%b%x00` log fields, `git merge-base --is-ancestor`, and Task 1 classification. `calculate --target <sha>` discovers the latest merged `github.io@*` tag; `bootstrap --target <sha> --start 8acdd81` replays `--first-parent <start>^..<target>` from `0.0.0`. Both output `{ action: 'prepare' | 'noop', ... }`.
- [ ] **Step 4: Implement record verification and deployment ordering.** Digest verification uses `createHash('sha256')`; version ordering uses Task 1's strict parser; source ancestry is evaluated before version order. A missing deployed record is accepted only with `--bootstrap`.
- [ ] **Step 5: Add package scripts:**

```json
"release:github.io": "node scripts/github-io-release.mjs",
"test:release:github.io": "node --test scripts/github-io-release-core.test.mjs scripts/github-io-release.test.mjs"
```

- [ ] **Step 6: Run:** `pnpm test:release:github.io`; expect pass.
- [ ] **Step 7: Commit:** stage the three explicit paths and commit `feat(github.io): add resumable release coordinator`.

### Task 3: Inject and validate the immutable application version

**Files:**
- Modify: `apps/github.io/package.json`
- Modify: `apps/github.io/vite.config.ts`
- Modify: `apps/github.io/src/app/global-navigation-footer.tsx`
- Modify: `apps/github.io/src/app/global-navigation-footer.spec.tsx`
- Create: `apps/github.io/src/app/release-version.ts`
- Create: `apps/github.io/src/app/release-version.spec.ts`
- Modify: `nx.json`

**Interfaces:**
- Produces compile-time constants `__APP_VERSION__` and `__APP_RELEASE__` and exported `appVersion`.
- Environment contract: `APP_RELEASE=true` requires `APP_VERSION` matching `major.minor.patch`; every other mode exposes `dev`.

- [ ] **Step 1: Add failing unit tests** that mock the compile-time constants and expect `appVersion` to be the fixture version in release mode and `dev` otherwise. Update the footer assertion from `v0.1.0` to `v1.2.3` using the fixture.
- [ ] **Step 2: Run the red tests:** `pnpm nx test github.io --testPathPattern=release-version|global-navigation-footer`; expect missing constant/module failures.
- [ ] **Step 3: Add Vite validation and defines:**

```ts
const release = process.env.APP_RELEASE === 'true';
const supplied = process.env.APP_VERSION;
if (release && !/^\d+\.\d+\.\d+$/.test(supplied ?? '')) {
  throw new Error('APP_VERSION must be a stable SemVer for release builds');
}
const version = release ? supplied : 'dev';
// merge into define:
'__APP_RELEASE__': JSON.stringify(release),
'__APP_VERSION__': JSON.stringify(version),
```

Declare the constants in `release-version.ts`, export `appVersion`, and make the footer render `v${appVersion}`. Remove only the `version` key from the private app manifest.
- [ ] **Step 4: Add `APP_RELEASE` and `APP_VERSION` to the github.io build target's explicit runtime cache inputs** in `nx.json` so different values produce different hashes.
- [ ] **Step 5: Verify behavior and cache isolation:** run the focused tests; then build unchanged source with `1.2.3` and `1.2.4` into separate output directories and assert only the matching version occurs; finally run `APP_RELEASE=true pnpm nx build github.io --skip-nx-cache` without `APP_VERSION` and expect the validation error.
- [ ] **Step 6: Commit:** stage the seven explicit paths and commit `feat(github.io): embed release version at build time`.

### Task 4: Make deployment synchronization traceable and rollback-safe

**Files:**
- Modify: `scripts/sync-github-pages-artifact.mjs`
- Modify: `scripts/sync-github-pages-artifact.test.mjs`
- Modify: `scripts/github-pages-workflow.test.mjs`

**Interfaces:**
- Consumes Task 2 deployment decision contract.
- Produces `.github-pages-release.json` in the deployed repository and a sync result `{ action: 'deploy' | 'identical' | 'superseded' }`.

- [ ] **Step 1: Add failing tests** for copying the metadata file, preserving `.git`, identical no-op, newer deployment, older retry skip, same-version/different-digest conflict, divergent source failure, and missing metadata accepted only with `--bootstrap`.
- [ ] **Step 2: Run the red tests:** `node --test scripts/sync-github-pages-artifact.test.mjs scripts/github-pages-workflow.test.mjs`.
- [ ] **Step 3: Extend the sync CLI** to require `--release-record`, load existing target metadata before mutation, call the coordinator's deployment verifier, and write the canonical record to `.github-pages-release.json`. Never erase or rewrite the target on `identical` or `superseded`.
- [ ] **Step 4: Update workflow contract assertions** to require source tag, SHA, version, and digest in the deployed commit message and to prohibit source rebuild/version calculation in the deployment step.
- [ ] **Step 5: Run the tests:** same command; expect pass.
- [ ] **Step 6: Commit:** stage the three explicit paths and commit `fix(github.io): prevent stale pages deployments`.

### Task 5: Configure Nx release metadata and replace the legacy workflows

**Files:**
- Modify: `nx.json`
- Modify: `apps/github.io/project.json` or create it if the project is currently inferred
- Create: `.github/workflows/release-github-io.yml` (replace existing content)
- Delete: `.github/workflows/changesets-version.yml`
- Modify: `.github/workflows/deploy-github-pages-artifact.yml` or fold it into the release workflow and delete it
- Modify: `scripts/github-io-release-workflows.test.mjs`
- Modify: `scripts/github-pages-workflow.test.mjs`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Delete: `.changeset/config.json`
- Delete: `.changeset/sharp-aliens-tan.md`

**Interfaces:**
- Nx release group `github.io` selects the exact project, uses independent projects, tag pattern `github.io@{version}`, and `git-tag` current-version resolution.
- Workflow persistence backend: a draft GitHub Release named `github.io prepared <sourceSha>` plus an attached `github-io-pages.tgz` and `release-record.json`; final publication renames/publishes the same release. GitHub Actions artifacts mirror both files for 90 days as recovery evidence.

- [ ] **Step 1: Extend failing static workflow tests** to assert: `fetch-depth: 0`, tags fetched, `concurrency.group: release`, `cancel-in-progress: false`, exact `main` push trigger, coordinator invocation before build, lint/test, release build env, archive/digest verification, draft persistence before tag publication, recovery lookup by source SHA, 90-day artifact retention, release publication, anti-rollback sync, and absence of the Changesets action and package-manifest version reads.
- [ ] **Step 2: Run the red tests:** `node --test scripts/github-io-release-workflows.test.mjs scripts/github-pages-workflow.test.mjs`.
- [ ] **Step 3: Add Nx release configuration** matching the interface and tag the project with `release:deployable`. Keep generated manifest updates disabled; the coordinator supplies the explicit version and Nx supplies project selection/task orchestration.
- [ ] **Step 4: Replace the workflows** with one serialized release workflow. Give the calculation/build job `contents: write`, withhold the cross-repository token until the deployment step, use a GitHub Environment for deployment, write all coordinator outputs through `$GITHUB_OUTPUT`, and quote untrusted commit-derived values. On `noop`, stop before lint/build. On `prepare`, run focused lint/test and `APP_RELEASE=true APP_VERSION=<version> pnpm nx build github.io --skip-nx-cache`, assert `v<version>`, archive `dist/apps/github.io`, upload the 90-day workflow artifact, create/update the draft release and upload the archive/record, then create/verify the exact tag and publish the release. On retry, download the saved assets, verify the record/digest, and never rebuild.
- [ ] **Step 5: Remove Changesets** configuration, package scripts/dependency, and lockfile entries with `pnpm remove --workspace-root @changesets/cli`; do not alter unrelated dependencies.
- [ ] **Step 6: Run static tests and `pnpm nx show projects`;** expect `github.io` and `benkim0414` and all workflow tests passing.
- [ ] **Step 7: Commit:** stage only the listed workflow/config/test/package paths and commit `ci(github.io): automate semantic releases`.

### Task 6: Lock the historical bootstrap and verify the end-to-end implementation

**Files:**
- Create: `scripts/github-io-bootstrap.test.mjs`
- Modify: `docs/superpowers/specs/2026-09-09-github-io-semantic-release-design.md` only if the observed calculated version differs from its recorded expectation
- Update generated OpenWiki only through `docs/agents/openwiki.md`

**Interfaces:**
- Produces a reviewed bootstrap JSON preview for `HEAD`; it does not create a tag, release, or deployment.

- [ ] **Step 1: Add a repository-history test** that runs the bootstrap calculator from `8acdd81` through the current first-parent `HEAD`, asserts the exact ordered contributing SHA/subject/bump list, and asserts the exact calculated version. Record the observed value in the test only after manually reviewing every contributing commit.
- [ ] **Step 2: Run the bootstrap preview twice:** `pnpm release:github.io bootstrap --start 8acdd81 --target HEAD`; expect byte-identical JSON and no Git ref or working-tree changes.
- [ ] **Step 3: Run full verification:**

```sh
pnpm test:release:github.io
node --test scripts/github-io-bootstrap.test.mjs scripts/github-io-release-workflows.test.mjs scripts/github-pages-workflow.test.mjs scripts/sync-github-pages-artifact.test.mjs
pnpm nx lint github.io
pnpm nx test github.io
APP_RELEASE=true APP_VERSION=9.8.7 pnpm nx build github.io --skip-nx-cache
git diff --check
```

Assert the built output contains `v9.8.7`, and confirm `git tag --list 'github.io@*'` is unchanged.
- [ ] **Step 4: Follow `docs/agents/openwiki.md`.** Update the wiki from source evidence if the installed lifecycle is available; otherwise report the exact blocker without hand-editing generated pages.
- [ ] **Step 5: Run `/review` against the approved spec, fix all blocking findings with focused regression tests, and rerun the affected checks.
- [ ] **Step 6: Commit:** stage the bootstrap test and any review/OpenWiki corrections as explicit paths; use `test(github.io): lock semantic release bootstrap` for the test and separate conventional commits for unrelated documentation corrections.
- [ ] **Step 7: Stop at awaiting handoff.** Report commits, calculated bootstrap version, verification evidence, and wiki status. Do not push, publish, or deploy until the user explicitly requests handoff.
