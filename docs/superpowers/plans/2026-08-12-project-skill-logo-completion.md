# Project Skill Logo Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give Amazon S3 and the verified Dotfiles skills compact, provenance-recorded logos without inventing substitutes for skills that lack an approved mark.

**Architecture:** Keep `getSkillBrand()` as the only resolver and add six static asset-URL mappings. Project data will stop redirecting `Amazon S3` to the generic `AWS` mapping, while `SkillToken` and `ProjectCard` remain unchanged and consume the resolver output as they do today.

**Tech Stack:** React 19, TypeScript, Vite asset imports, Vitest, Testing Library, Storybook 10, Nx, pnpm.

## Global Constraints

- Work only in the existing linked worktree on `feat/homelab-project-card`.
- Do not add, remove, or rename skills on either project card.
- Keep `mise`, `Bash`, `Kubernetes`, and `GitOps` excluded from Homelab.
- Use unmodified, pinned assets and record source, revision, retrieval date, checksum, license, and trademark provenance.
- Treat LobeHub's Codex SVG as the sole approved community-source exception; do not describe it as official OpenAI artwork.
- Keep `eza`, `fzf`, `ripgrep`, `zoxide`, `delta`, `LazyGit`, and `SSH` text-only.
- Do not add dependencies or change `ProjectCard`, `SkillToken`, layout, responsiveness, or accessibility behavior.
- Import SVGs with `?no-inline`; render PNGs as ordinary Vite asset URLs.
- Do not stage or remove `apps/github.io/debug-storybook.log`.
- Stage explicit paths only and use conventional commit subjects.

## File Structure

- Create `apps/github.io/src/assets/skills/aws/amazon-s3.png`: official Amazon S3 service architecture icon.
- Create `apps/github.io/src/assets/skills/yazi/yazi.png`: official Yazi duck mark.
- Create `apps/github.io/src/assets/skills/mise/mise.svg`: official compact mise mark.
- Create `apps/github.io/src/assets/skills/gh-dash/gh-dash.png`: official compact gh-dash favicon.
- Create `apps/github.io/src/assets/skills/herdr/herdr.svg`: official compact Herdr mark.
- Create `apps/github.io/src/assets/skills/codex/codex.svg`: approved LobeHub Codex color mark.
- Modify `apps/github.io/src/assets/skills/README.md`: immutable provenance and license notes for all six assets.
- Modify `apps/github.io/src/app/skills/skill-brand.ts`: imports, exact label mappings, and neutral brand surfaces.
- Modify `apps/github.io/src/app/skills/skill-brand.spec.ts`: resolver coverage for the new assets and remaining text-only skills.
- Modify `apps/github.io/src/app/projects/project-list.data.ts`: let `Amazon S3` resolve by its exact label.
- Modify `apps/github.io/src/app/projects/project-card.spec.tsx`: assert the exact Amazon S3 fixture and preserve Homelab exclusions.

---

### Task 1: Vendor and resolve approved skill assets

**Files:**
- Create: `apps/github.io/src/assets/skills/aws/amazon-s3.png`
- Create: `apps/github.io/src/assets/skills/yazi/yazi.png`
- Create: `apps/github.io/src/assets/skills/mise/mise.svg`
- Create: `apps/github.io/src/assets/skills/gh-dash/gh-dash.png`
- Create: `apps/github.io/src/assets/skills/herdr/herdr.svg`
- Create: `apps/github.io/src/assets/skills/codex/codex.svg`
- Modify: `apps/github.io/src/assets/skills/README.md`
- Modify: `apps/github.io/src/app/skills/skill-brand.ts`
- Test: `apps/github.io/src/app/skills/skill-brand.spec.ts`

**Interfaces:**
- Consumes: `getSkillBrand(label: string): SkillBrand | undefined` and `hasSkillBrandIcon(brand): boolean`.
- Produces: exact asset-backed mappings for `Amazon S3`, `Yazi`, `mise`, `gh-dash`, `Herdr`, and `Codex`.
- Preserves: `undefined`/text-only resolution for `eza`, `fzf`, `ripgrep`, `zoxide`, `delta`, `LazyGit`, and `SSH`.

- [ ] **Step 1: Write failing resolver tests**

Add these focused cases and replace the old Dotfiles assertion that incorrectly includes `gh-dash` among unbranded skills:

```ts
it.each([
  ['Amazon S3', /amazon-s3.*\.png/],
  ['Yazi', /yazi.*\.png/],
  ['mise', /mise.*\.svg/],
  ['gh-dash', /gh-dash.*\.png/],
  ['Herdr', /herdr.*\.svg/],
  ['Codex', /codex.*\.svg/],
] as const)('uses the approved vendored asset for %s', (skill, asset) => {
  const brand = getSkillBrand(skill);

  expect(brand?.iconPath).toBeUndefined();
  expect(brand?.iconDataUrl).toMatch(asset);
  expect(hasSkillBrandIcon(brand)).toBe(true);
});

it.each(['eza', 'fzf', 'ripgrep', 'zoxide', 'delta', 'LazyGit', 'SSH'])(
  'keeps %s text-only because it has no approved exact mark',
  (skill) => {
    expect(hasSkillBrandIcon(getSkillBrand(skill))).toBe(false);
  },
);
```

Change the Homelab icon-backed list entry from `'AWS'` to `'Amazon S3'`.

- [ ] **Step 2: Run the focused test and confirm the red phase**

Run:

```bash
./node_modules/.bin/vitest run --config apps/github.io/vite.config.ts apps/github.io/src/app/skills/skill-brand.spec.ts --coverage.enabled=false
```

Expected: FAIL for the six new asset mappings and the Homelab `Amazon S3` coverage because the assets and resolver entries do not exist yet. Existing tests must continue to pass.

- [ ] **Step 3: Download the exact pinned assets**

Create the six destination directories and download only these pinned URLs:

```bash
mkdir -p \
  apps/github.io/src/assets/skills/aws \
  apps/github.io/src/assets/skills/yazi \
  apps/github.io/src/assets/skills/mise \
  apps/github.io/src/assets/skills/gh-dash \
  apps/github.io/src/assets/skills/herdr \
  apps/github.io/src/assets/skills/codex

curl -L --fail --silent --show-error \
  https://raw.githubusercontent.com/awslabs/aws-icons-for-plantuml/50efda948226ff4e06937596201528b707ef3ef9/dist/Storage/SimpleStorageService.png \
  -o apps/github.io/src/assets/skills/aws/amazon-s3.png
curl -L --fail --silent --show-error \
  https://raw.githubusercontent.com/sxyazi/yazi/5ab58e3029c023ca1ae4bd788716b3da927fb525/assets/logo.png \
  -o apps/github.io/src/assets/skills/yazi/yazi.png
curl -L --fail --silent --show-error \
  https://raw.githubusercontent.com/jdx/mise/05251b278bd78682dd56a879d5975a2d7faad794/docs/public/logo.svg \
  -o apps/github.io/src/assets/skills/mise/mise.svg
curl -L --fail --silent --show-error \
  https://raw.githubusercontent.com/dlvhdr/gh-dash/4ea7c39fbe4d12dbbd66398253fbd81b61073e06/docs/public/favicon.png \
  -o apps/github.io/src/assets/skills/gh-dash/gh-dash.png
curl -L --fail --silent --show-error \
  https://raw.githubusercontent.com/herdrdev/herdr/5600197f00e871764465d4e3d9ba5e6aa6fd9547/assets/logo.svg \
  -o apps/github.io/src/assets/skills/herdr/herdr.svg
curl -L --fail --silent --show-error \
  https://raw.githubusercontent.com/lobehub/lobe-icons/befa2f8022c22985891e5d28aa706f9fba8c578d/packages/static-svg/icons/codex-color.svg \
  -o apps/github.io/src/assets/skills/codex/codex.svg
```

- [ ] **Step 4: Verify bytes and reject active SVG content**

Run:

```bash
sha256sum -c <<'EOF'
6715951abe7d964792afc3d36dec4e2f89e7d27df74d702ba75e575304a80d22  apps/github.io/src/assets/skills/aws/amazon-s3.png
7df01d685d6727dcf165f2de5d9145dedca89d38e18f526209a9ec6346ab9915  apps/github.io/src/assets/skills/yazi/yazi.png
e4a37c1531f5f7d7fcb0ba2e7f55ec37c1ff88d9124f226bea397451e70c5873  apps/github.io/src/assets/skills/mise/mise.svg
42d4d02e60d51e8e7125ec8fb0308b8d5b1409a1f7d40a99179f779b0ad74d7c  apps/github.io/src/assets/skills/gh-dash/gh-dash.png
f4a8400d515fcf50112a952a5b48f5fa6e6b02b4dcb0b483ca92be39f7d7f7a1  apps/github.io/src/assets/skills/herdr/herdr.svg
4a2f43ce46b5b6e3722c95088f88d26ef91e6a8c2e598e70642a1c54367386e4  apps/github.io/src/assets/skills/codex/codex.svg
EOF

if rg -n "<script|<foreignObject|(?:href|xlink:href)=['\"](?:https?:|//)| on[a-z]+=" \
  apps/github.io/src/assets/skills/mise/mise.svg \
  apps/github.io/src/assets/skills/herdr/herdr.svg \
  apps/github.io/src/assets/skills/codex/codex.svg; then
  exit 1
fi
```

Expected: all six checksums report `OK`; `rg` prints no matches and the conditional exits successfully.

- [ ] **Step 5: Add resolver imports and mappings**

Add imports alongside the existing local assets:

```ts
import amazonS3IconUrl from '../../assets/skills/aws/amazon-s3.png';
import codexIconUrl from '../../assets/skills/codex/codex.svg?no-inline';
import ghDashIconUrl from '../../assets/skills/gh-dash/gh-dash.png';
import herdrIconUrl from '../../assets/skills/herdr/herdr.svg?no-inline';
import miseIconUrl from '../../assets/skills/mise/mise.svg?no-inline';
import yaziIconUrl from '../../assets/skills/yazi/yazi.png';
```

Add exact keys to `skillIconAssets`:

```ts
'Amazon S3': amazonS3IconUrl,
Codex: codexIconUrl,
'gh-dash': ghDashIconUrl,
Herdr: herdrIconUrl,
mise: miseIconUrl,
Yazi: yaziIconUrl,
```

Add the same six keys to `skillBrandColors`, each with `'#FFFFFF'`, so the unchanged full-color artwork renders on a neutral chip surface.

- [ ] **Step 6: Record complete provenance**

Append one section per asset to `apps/github.io/src/assets/skills/README.md`. Each section must include the exact source URL from Step 3, pinned revision, retrieval date `2026-08-12`, SHA-256 from Step 4, and these provenance facts:

- Amazon S3: Amazon-published AWS architecture artwork, `CC-BY-ND-2.0` in the source package.
- Yazi: official `sxyazi/yazi` repository asset; repository license MIT.
- mise: official `jdx/mise` repository asset; repository license MIT.
- gh-dash: official `dlvhdr/gh-dash` documentation favicon; repository license MIT.
- Herdr: official `herdrdev/herdr` repository asset; repository license Apache-2.0.
- Codex: LobeHub community-maintained Codex mark; LobeHub license MIT; not an official OpenAI asset source.

For every project mark, state that the repository license is recorded as provenance and is not a trademark grant.

- [ ] **Step 7: Run the focused tests and confirm green**

Run:

```bash
./node_modules/.bin/vitest run --config apps/github.io/vite.config.ts apps/github.io/src/app/skills/skill-brand.spec.ts --coverage.enabled=false
```

Expected: PASS, including all six asset-backed mappings and all seven text-only assertions.

- [ ] **Step 8: Commit the self-contained resolver change**

Inspect `git diff`, then stage only:

```bash
git add \
  apps/github.io/src/app/skills/skill-brand.ts \
  apps/github.io/src/app/skills/skill-brand.spec.ts \
  apps/github.io/src/assets/skills/README.md \
  apps/github.io/src/assets/skills/aws/amazon-s3.png \
  apps/github.io/src/assets/skills/yazi/yazi.png \
  apps/github.io/src/assets/skills/mise/mise.svg \
  apps/github.io/src/assets/skills/gh-dash/gh-dash.png \
  apps/github.io/src/assets/skills/herdr/herdr.svg \
  apps/github.io/src/assets/skills/codex/codex.svg
git diff --cached
git commit -m "feat(github.io): complete project skill logos"
```

### Task 2: Select the exact Amazon S3 brand from Homelab data

**Files:**
- Modify: `apps/github.io/src/app/projects/project-list.data.ts`
- Test: `apps/github.io/src/app/projects/project-card.spec.tsx`

**Interfaces:**
- Consumes: the `Amazon S3` resolver mapping produced by Task 1.
- Produces: `{ label: 'Amazon S3' }` in the Homelab fixture, with no parent-brand override.
- Preserves: the 20-skill order, `benkim0414/homelab` title and URL, capability metadata, and all four exclusions.

- [ ] **Step 1: Write the failing fixture expectation**

In the exact Homelab object expectation, replace:

```ts
{ label: 'Amazon S3', brandLabel: 'AWS' },
```

with:

```ts
{ label: 'Amazon S3' },
```

Keep the existing exclusion assertion for `Kubernetes`, `GitOps`, `Bash`, and `mise` unchanged.

- [ ] **Step 2: Run the project test and confirm the red phase**

Run:

```bash
./node_modules/.bin/vitest run --config apps/github.io/vite.config.ts apps/github.io/src/app/projects/project-card.spec.tsx --coverage.enabled=false
```

Expected: FAIL because the fixture still contains `brandLabel: 'AWS'`.

- [ ] **Step 3: Remove the parent-brand override**

In `project-list.data.ts`, change only the Amazon S3 entry to:

```ts
{ label: 'Amazon S3' },
```

Do not reorder or otherwise edit either project skill list.

- [ ] **Step 4: Run both focused suites**

Run:

```bash
./node_modules/.bin/vitest run --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/projects/project-card.spec.tsx \
  apps/github.io/src/app/skills/skill-brand.spec.ts \
  --coverage.enabled=false
```

Expected: PASS. The Homelab fixture still has 20 skills and the resolver still gives `Amazon S3` its service icon.

- [ ] **Step 5: Commit the fixture correction**

Inspect `git diff`, then stage only:

```bash
git add \
  apps/github.io/src/app/projects/project-list.data.ts \
  apps/github.io/src/app/projects/project-card.spec.tsx
git diff --cached
git commit -m "fix(github.io): use exact Amazon S3 brand"
```

### Task 3: Complete automated and iPad Storybook validation

**Files:**
- Verify only: `apps/github.io/src/app/projects/project-card.stories.tsx`
- Do not modify or stage: `apps/github.io/debug-storybook.log`

**Interfaces:**
- Consumes: completed Task 1 and Task 2 commits.
- Produces: verification evidence for tests, lint, production build, and the two permanent project-card stories.

- [ ] **Step 1: Run repository-preferred verification**

Run separately so each failure is attributable:

```bash
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx build github.io
```

Expected: all commands pass. If pnpm/Nx fails before executing because of the known SQLite database or pnpm-lock parsing problem, preserve the complete error and continue with Step 2; do not report the wrapper as passing.

- [ ] **Step 2: Run direct fallbacks when the wrappers cannot start**

Run:

```bash
./node_modules/.bin/vitest run --config apps/github.io/vite.config.ts --coverage.enabled=false
./node_modules/.bin/eslint apps/github.io/src
./node_modules/.bin/vite build --config apps/github.io/vite.config.ts
```

Expected: all tests pass, ESLint has no errors, and Vite produces the `github.io` production bundle. Existing warnings may be reported but must not be described as new failures.

- [ ] **Step 3: Start Tailscale-accessible Storybook**

Resolve the current Tailscale IPv4, then start the existing Storybook without changing configuration:

```bash
PROJECT_TAILSCALE_IP="$(tailscale ip -4 | head -n 1)"
__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS="$PROJECT_TAILSCALE_IP" \
  ./node_modules/.bin/storybook dev \
  --config-dir apps/github.io/.storybook \
  --host 0.0.0.0 \
  --port 6006
```

Expected: Storybook listens on port 6006 and is reachable from another device on the same tailnet.

- [ ] **Step 4: Inspect both permanent stories from the iPad**

Open these URLs, replacing `<tailscale-ip>` with the value from Step 3:

```text
http://<tailscale-ip>:6006/?path=/story/github-io-projects-project-card--default
http://<tailscale-ip>:6006/?path=/story/github-io-projects-project-card--homelab
```

Verify:

- Dotfiles shows compact Yazi, mise, gh-dash, Herdr, and Codex marks.
- Homelab shows the Amazon S3 service icon, not the generic AWS wordmark.
- `eza`, `fzf`, `ripgrep`, `zoxide`, `delta`, `LazyGit`, and `SSH` remain readable text-only chips.
- Icons remain legible on light and dark surfaces without clipping or distortion.
- Skills wrap within card boundaries at the iPad viewport.
- Titles, descriptions, GitHub links, and accessible skill labels remain intact.

Record any visual defect before changing code. If no defect is found, no validation-only commit is required.

- [ ] **Step 5: Review final repository state**

Run:

```bash
git status --short --branch
git log -5 --oneline
```

Expected: only the pre-existing `apps/github.io/debug-storybook.log` is untracked; implementation files are committed in the two task commits, with no unrelated changes and no push performed.
