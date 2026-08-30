# GitHub Pages Artifact Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish `github.io` at `https://benkim0414.github.io/` by promoting verified static artifacts to a dedicated user-site repo and automating semantic release records.

**Architecture:** This monorepo builds, tests, and copies `dist/apps/github.io` to the root of `benkim0414.github.io` using a repository-scoped SSH deploy key. Changesets maintains one version PR; a second trusted workflow tags its merge commit and creates the GitHub Release without publishing to npm.

**Tech Stack:** pnpm 11.16.0, Node 24, Nx 23, Vite 8, React Router 7, Changesets 3, GitHub Actions, GitHub Pages, SSH deploy keys.

**Spec:** `docs/superpowers/specs/2026-08-30-github-pages-artifact-release-design.md`

## Global Constraints

- The target repository is `benkim0414.github.io`, a Pages user-site served from `main` / root.
- Deploy every source `main` push and manual dispatch, never an npm package.
- Copy only generated output and `.nojekyll`; do not force-push, copy `.git`, or publish secrets.
- Pin actions to immutable commit SHAs. Use one cancel-in-progress deployment concurrency group.
- Only a merged PR titled `chore(release): version github.io` may create `github.io@X.Y.Z` tags and releases.

---

## File structure

| File | Responsibility |
| --- | --- |
| `package.json`, `pnpm-lock.yaml` | Root Changesets CLI and pnpm version declaration. |
| `apps/github.io/package.json` | Private semantic-version identity for the application. |
| `.changeset/config.json` | Private application version/tag policy on `main`. |
| `apps/github.io/vite.config.ts`, `index.html`, `404.html`, `src/app/app.tsx` | Explicit root-base production and SPA routing contract. |
| `apps/github.io/src/app/app.spec.tsx` | Root-base route regression coverage. |
| `scripts/sync-github-pages-artifact.mjs` | Pure artifact-to-git-checkout synchronizer. |
| `scripts/sync-github-pages-artifact.test.mjs` | Filesystem safety tests for the synchronizer. |
| `.github/workflows/deploy-github-pages-artifact.yml` | Build, verify, and non-force artifact promotion. |
| `.github/workflows/changesets-version.yml` | Version-PR automation. |
| `.github/workflows/release-github-io.yml` | Tag and GitHub Release automation. |

### Task 1: Add private application versioning

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`
- Create: `apps/github.io/package.json`, `.changeset/config.json`, `scripts/github-io-release-config.test.mjs`

**Interfaces:** Produces package `@benkim0414/github-io`, initial version `0.1.0`, for Changesets and the release workflow.

- [ ] **Step 1: Write the failing configuration contract**

Create `scripts/github-io-release-config.test.mjs` using `node:test` and `assert/strict`. Load both JSON manifests and assert `name === '@benkim0414/github-io'`, `private === true`, `version === '0.1.0'`, `baseBranch === 'main'`, and `privatePackages` deeply equals `{ version: true, tag: true }`.

- [ ] **Step 2: Verify it fails before configuration exists**

Run: `node --test scripts/github-io-release-config.test.mjs`

Expected: FAIL because the application manifest and Changesets config are absent.

- [ ] **Step 3: Implement the versioning foundation**

Add this exact application manifest:

```json
{
  "name": "@benkim0414/github-io",
  "version": "0.1.0",
  "private": true
}
```

Add this exact `.changeset/config.json`:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.1/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": [],
  "privatePackages": { "version": true, "tag": true }
}
```

Add root `packageManager: "pnpm@11.16.0"` and `@changesets/cli` at `^3.0.0`, then run `pnpm install --lockfile-only`.

- [ ] **Step 4: Verify and commit**

Run:

```bash
node --test scripts/github-io-release-config.test.mjs
pnpm exec changeset status
git add package.json pnpm-lock.yaml apps/github.io/package.json .changeset/config.json scripts/github-io-release-config.test.mjs
git commit -m "chore(github.io): configure semantic releases"
```

Expected: configuration test passes and Changesets reports no pending changesets.

### Task 2: Make root-site routing explicit

**Files:**
- Modify: `apps/github.io/vite.config.ts`, `apps/github.io/index.html`, `apps/github.io/404.html`, `apps/github.io/src/app/app.tsx`
- Create: `apps/github.io/src/app/app.spec.tsx`

**Interfaces:** `BrowserRouter` consumes `import.meta.env.BASE_URL`; the Vite build produces entry files whose base is `/`.

- [ ] **Step 1: Write failing root-route tests**

Add `app.spec.tsx`. Render `AppProviders` and `AppRoutes` inside `MemoryRouter basename="/"` for `['/skills']` and a known skill detail URL. Assert each screen renders rather than the not-found recovery page. Add a source assertion that `BrowserRouter` receives `import.meta.env.BASE_URL`.

- [ ] **Step 2: Confirm the test fails**

Run: `pnpm nx test github.io --run src/app/app.spec.tsx`

Expected: FAIL because `App` does not yet set the router basename.

- [ ] **Step 3: Implement the root contract**

Set `base: '/'` in `defineConfig`. In both entry HTML files replace the two root references with:

```html
<base href="%BASE_URL%" />
<link rel="icon" type="image/x-icon" href="%BASE_URL%favicon.ico" />
```

Change the application router to:

```tsx
<BrowserRouter basename={import.meta.env.BASE_URL}>
```

- [ ] **Step 4: Verify and commit**

Run:

```bash
pnpm nx test github.io --run src/app/app.spec.tsx
pnpm nx build github.io
rg -n 'src/styles.css|/benkim0414/' dist/apps/github.io/index.html dist/apps/github.io/404.html
pnpm nx run github.io:verify-mobile-layout-browser
git add apps/github.io/vite.config.ts apps/github.io/index.html apps/github.io/404.html apps/github.io/src/app/app.tsx apps/github.io/src/app/app.spec.tsx
git commit -m "fix(github.io): support root Pages deployment"
```

Expected: no source stylesheet or project-path reference remains in output; `/`, `/skills`, and a detail route render from production output.

### Task 3: Build a tested artifact synchronizer

**Files:**
- Create: `scripts/sync-github-pages-artifact.mjs`, `scripts/sync-github-pages-artifact.test.mjs`

**Interfaces:** Exports `syncArtifact(buildDirectory, targetDirectory)` and accepts those two paths as its first and second CLI arguments.

- [ ] **Step 1: Write failing filesystem tests**

Use `mkdtempSync` fixtures. Give the source `index.html` and `assets/app.js`; give the target stale files and `.git/HEAD`. Assert the result has source files and an empty `.nojekyll`, has no stale file, and preserves `.git/HEAD` exactly.

```js
assert.equal(existsSync(join(targetDir, 'obsolete.txt')), false);
assert.equal(readFileSync(join(targetDir, '.git', 'HEAD'), 'utf8'), 'ref: refs/heads/main\n');
```

- [ ] **Step 2: Verify the missing implementation fails**

Run: `node --test scripts/sync-github-pages-artifact.test.mjs`

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement synchronization**

Resolve arguments; throw if the build directory is absent or target lacks `.git`. Delete every root target entry except `.git`, recursively copy every build-root entry with `cpSync`, then write an empty `.nojekyll`. Export the function and invoke it only when the module is the main script.

```js
for (const entry of readdirSync(targetDirectory)) {
  if (entry !== '.git') rmSync(join(targetDirectory, entry), { recursive: true, force: true });
}
for (const entry of readdirSync(buildDirectory)) {
  cpSync(join(buildDirectory, entry), join(targetDirectory, entry), { recursive: true });
}
writeFileSync(join(targetDirectory, '.nojekyll'), '');
```

- [ ] **Step 4: Verify and commit**

Run:

```bash
node --test scripts/sync-github-pages-artifact.test.mjs
pnpm nx build github.io
target_dir=$(mktemp -d)
git -C "$target_dir" init -b main
node scripts/sync-github-pages-artifact.mjs dist/apps/github.io "$target_dir"
git -C "$target_dir" status --short
git add scripts/sync-github-pages-artifact.mjs scripts/sync-github-pages-artifact.test.mjs
git commit -m "feat(github.io): synchronize Pages artifacts safely"
```

Expected: tests pass and the temporary repository contains only generated assets plus `.nojekyll`.

### Task 4: Add verified artifact promotion

**Files:**
- Create: `.github/workflows/deploy-github-pages-artifact.yml`, `scripts/github-pages-workflow.test.mjs`

**Interfaces:** Consumes `secrets.GITHUB_PAGES_DEPLOY_KEY`; promotes `dist/apps/github.io` only after focused checks pass.

- [ ] **Step 1: Write a failing workflow contract test**

Read the workflow as text and assert: `push` to `main`, `workflow_dispatch`, concurrency group `github-pages-artifact-sync`, `cancel-in-progress: true`, frozen pnpm install, `nx lint/test/build github.io`, target repo name, deploy-key secret name, synchronizer command, and `git push origin main` without `--force`.

- [ ] **Step 2: Confirm it fails**

Run: `node --test scripts/github-pages-workflow.test.mjs`

Expected: FAIL because the workflow is absent.

- [ ] **Step 3: Create the workflow**

Use `contents: read` only. Pin these actions:

```yaml
- uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7
- uses: pnpm/action-setup@008330803749db0355799c700092d9a85fd074e9 # v6.0.9
  with:
    version: 11.16.0
- uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7
  with:
    node-version: 24
    cache: pnpm
```

Check out `benkim0414/benkim0414.github.io` at `main` into `.pages-site` using `ssh-key: ${{ secrets.GITHUB_PAGES_DEPLOY_KEY }}` and `persist-credentials: false`. Run the synchronizer. In `.pages-site`, configure `github-actions[bot]`; if `git diff --quiet`, print `No artifact changes to publish.` and exit zero. Otherwise commit `deploy: github.io $GITHUB_SHA` and run `git push origin main`.

- [ ] **Step 4: Verify and commit**

Run:

```bash
node --test scripts/github-pages-workflow.test.mjs
pnpm nx lint github.io
pnpm nx test github.io --run
pnpm nx build github.io
git add .github/workflows/deploy-github-pages-artifact.yml scripts/github-pages-workflow.test.mjs
git commit -m "ci(github.io): deploy verified Pages artifacts"
```

### Task 5: Automate version PRs, tags, and releases

**Files:**
- Create: `.github/workflows/changesets-version.yml`, `.github/workflows/release-github-io.yml`, `scripts/github-io-release-workflows.test.mjs`

**Interfaces:** Reads `apps/github.io/package.json` after a merged PR titled `chore(release): version github.io`; emits tag and release `github.io@X.Y.Z`.

- [ ] **Step 1: Write failing workflow contract tests**

Assert the version workflow has `contents: write` plus `pull-requests: write`, uses the exact version-PR title, and pins `changesets/action` v2.1.1. Assert the release workflow listens to closed PRs, requires merged `main` PRs with that title, reads the app version, performs an existing tag/release check, and invokes `gh release create` against the merge commit.

- [ ] **Step 2: Confirm the contract fails**

Run: `node --test scripts/github-io-release-workflows.test.mjs`

Expected: FAIL because both workflows are absent.

- [ ] **Step 3: Implement Changesets version-PR workflow**

Trigger on main pushes, set `contents: write` and `pull-requests: write`, then install with the same pinned runtime steps as Task 4. Use:

```yaml
- uses: changesets/action@fdf536a68c4154480c89b42547f8102cf0d8bc47 # v2.1.1
  with:
    version: pnpm changeset version
    commit: "chore(release): version github.io"
    title: "chore(release): version github.io"
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

Do not set a `publish` command.

- [ ] **Step 4: Implement merged-version-PR release workflow**

Trigger on `pull_request` closed events. Gate on `merged == true`, base ref `main`, and title `chore(release): version github.io`. With `contents: write`, check out the merge commit, read `apps/github.io/package.json` with Node, form `github.io@$version`, then create and push an annotated tag only if absent. With `GH_TOKEN` set to the workflow token, call `gh release view` first and otherwise call `gh release create` with `--target` set to that merge SHA, `--generate-notes`, and title equal to the tag. Use a concurrency group derived from the pull-request number.

- [ ] **Step 5: Verify and commit**

Run:

```bash
node --test scripts/github-io-release-workflows.test.mjs
git add .github/workflows/changesets-version.yml .github/workflows/release-github-io.yml scripts/github-io-release-workflows.test.mjs
git commit -m "ci(github.io): automate semantic releases"
```

### Task 6: Configure GitHub and verify production

**Files:** No tracked source files. Create external repository `benkim0414/benkim0414.github.io`.

**Interfaces:** Consumes completed source workflows and a dedicated Ed25519 deploy-key pair; produces Pages served from the root account URL.

- [ ] **Step 1: Create the artifact repository and Pages source**

Create public repository `benkim0414.github.io`. In Settings → Pages choose Deploy from a branch, `main`, `/(root)`.

- [ ] **Step 2: Install the narrowly scoped deploy key**

Generate a new dedicated Ed25519 key pair. Add the public half in the target repo’s Settings → Deploy keys with Allow write access. Add the private half to this source repository’s Actions secrets as `GITHUB_PAGES_DEPLOY_KEY`. Never reuse a personal SSH key.

- [ ] **Step 3: Permit Changesets PR creation**

In source Settings → Actions → General, enable Allow GitHub Actions to create and approve pull requests.

- [ ] **Step 4: Verify deployment and a semantic release**

Run the deployment workflow manually. Confirm the target contains only generated assets and `.nojekyll`, and that `/`, `/skills`, and a skill-detail deep link work at `https://benkim0414.github.io/`. Then merge a patch changeset and its generated version PR; confirm exactly one `github.io@X.Y.Z` source tag and GitHub Release target the version-PR merge commit, with no npm publication.

## Plan self-review

- **Spec coverage:** Tasks 1–2 implement semantic identity and root routing; Tasks 3–4 implement safe artifact promotion; Task 5 implements version PRs, tags, and releases; Task 6 covers required GitHub configuration and production validation.
- **No placeholders:** All affected files, repository names, secret names, triggers, action pins, commands, guards, test expectations, and commits are specified.
- **Interface consistency:** Task 3 defines the two-argument synchronizer consumed by Task 4. Task 1 defines the application manifest read by Task 5; both use the `github.io@X.Y.Z` release-tag contract.
