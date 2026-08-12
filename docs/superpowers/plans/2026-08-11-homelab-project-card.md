# Homelab Project Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the `benkim0414/homelab` portfolio card with every available official skill logo and a permanent Storybook surface for iPad validation over Tailscale.

**Architecture:** Keep project content in `sampleProjects` and brand metadata in the centralized `getSkillBrand` resolver. Use installed Simple Icons for exact marks, vendor the official MetalLB and kube-vip assets with provenance, preserve text-only fallbacks for Sealed Secrets and NFS, and expose the existing Homelab fixture through `ProjectCard` Storybook without project-specific component logic.

**Tech Stack:** TypeScript, React, Simple Icons, Vite asset imports, Vitest, Testing Library, Storybook, Nx, pnpm, Tailscale

## Global Constraints

- Use `benkim0414/homelab` as the card title and `homelab` as its stable ID.
- Use `https://github.com/benkim0414/homelab` as the repository URL.
- Preserve exactly these skill labels in this order: K3s, Argo CD, Helm, Ansible, kubectl, Tailscale, Sealed Secrets, Traefik, Longhorn, MetalLB, kube-vip, Prometheus, Grafana, Loki, Alloy, PostgreSQL, Redis, NFS, Amazon S3, Renovate.
- Preserve `brandLabel: 'AWS'` for Amazon S3.
- Do not include Kubernetes, GitOps, Bash, mise, hosted applications, or repo-local agent skills.
- Add exact Simple Icons mappings for K3s, Tailscale, Traefik using the Traefik Proxy mark, Longhorn, Redis, and Renovate.
- Vendor the official MetalLB SVG from CNCF Landscape and the official kube-vip PNG from the kube-vip website repository; record source, retrieval date, and license provenance.
- Keep Sealed Secrets and NFS text-only; do not use generic, Kubernetes-family, or invented substitute icons.
- Preserve `ProjectCard` markup, styling, responsiveness, accessibility, types, dependencies, and page architecture.
- Keep `homelab-project` as the evidence ID and preserve the capability keys `deployment-automation`, `flexible-infrastructure`, `monitoring-observability`, and `pervasive-security` in that order.
- Work only in the existing linked worktree and stage explicit paths for each logical commit.
- If pnpm/Nx fails with the known pnpm SQLite or Nx lockfile parsing error, run the equivalent checked-in direct binary and report both results.

---

## File Structure

- `apps/github.io/src/app/projects/project-list.data.ts`: changes only the Homelab display title.
- `apps/github.io/src/app/projects/project-card.spec.tsx`: protects the title and permanent Homelab Storybook fixture.
- `apps/github.io/src/app/projects/project-card.stories.tsx`: exports the Homelab fixture by stable ID.
- `apps/github.io/src/app/skills/skill-brand.ts`: owns all new Simple Icons and vendored-asset mappings.
- `apps/github.io/src/app/skills/skill-brand.spec.ts`: verifies exact official marks, complete Homelab logo coverage, and required text-only fallbacks.
- `apps/github.io/src/assets/skills/metallb/metallb.svg`: vendored official MetalLB artwork.
- `apps/github.io/src/assets/skills/kube-vip/kube-vip.png`: vendored official kube-vip artwork.
- `apps/github.io/src/assets/skills/README.md`: records asset provenance and licensing.

### Task 2: Finalize the Homelab title and permanent story

**Files:**
- Modify: `apps/github.io/src/app/projects/project-card.spec.tsx`
- Modify: `apps/github.io/src/app/projects/project-list.data.ts`
- Modify: `apps/github.io/src/app/projects/project-card.stories.tsx`

**Interfaces:**
- Consumes: `sampleProjects: readonly Project[]` and `ProjectCard` Storybook metadata.
- Produces: the stable Homelab fixture with `title: 'benkim0414/homelab'` and exported `Homelab: Story`.

- [ ] **Step 1: Write the failing title and story contract**

Change the Homelab object expected by the existing data test to:

```tsx
title: 'benkim0414/homelab',
```

Add these assertions to `exports the expected story fixtures`:

```tsx
expect(stories.Homelab.args?.project?.id).toBe('homelab');
expect(stories.Homelab.args?.project?.title).toBe('benkim0414/homelab');
expect(stories.Homelab.args?.project?.skills).toHaveLength(20);
```

- [ ] **Step 2: Run the focused test and verify the title contract fails**

Run from the repository root:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/projects/project-card.spec.tsx
```

Expected: FAIL because the current Homelab title is `homelab`. If pnpm fails
before Vitest with the known SQLite error, run from `apps/github.io`:

```bash
../../../../node_modules/.bin/vitest --config vite.config.ts --run src/app/projects/project-card.spec.tsx
```

Expected fallback result: the same title mismatch failure.

- [ ] **Step 3: Update the title and retain the permanent Homelab story**

Change only the Homelab title in `project-list.data.ts`:

```ts
title: 'benkim0414/homelab',
```

Ensure `project-card.stories.tsx` selects by stable ID and exports this story:

```tsx
const homelabProject = sampleProjects.find(
  (project) => project.id === 'homelab',
);

if (!homelabProject) {
  throw new Error('Homelab project fixture is required for its visual story.');
}

export const Homelab: Story = {
  args: {
    project: homelabProject,
  },
};
```

Do not duplicate the fixture or fall back to `sampleProjects[1]`.

- [ ] **Step 4: Run the focused test and verify it passes**

Run the same focused command from Step 2, using the direct Vitest fallback if
the pnpm wrapper fails.

Expected: PASS, including the Homelab title and story assertions.

- [ ] **Step 5: Review and commit the title/story slice**

```bash
git diff --check
git diff -- apps/github.io/src/app/projects/project-list.data.ts apps/github.io/src/app/projects/project-card.spec.tsx apps/github.io/src/app/projects/project-card.stories.tsx
git add apps/github.io/src/app/projects/project-list.data.ts apps/github.io/src/app/projects/project-card.spec.tsx apps/github.io/src/app/projects/project-card.stories.tsx
git diff --cached
git commit -m "feat(github.io): finalize homelab card title"
```

Expected: only the title, permanent Homelab story, and their tests are staged.

### Task 3: Add all available official Homelab skill logos

**Files:**
- Create: `apps/github.io/src/assets/skills/metallb/metallb.svg`
- Create: `apps/github.io/src/assets/skills/kube-vip/kube-vip.png`
- Modify: `apps/github.io/src/assets/skills/README.md`
- Modify: `apps/github.io/src/app/skills/skill-brand.ts`
- Modify: `apps/github.io/src/app/skills/skill-brand.spec.ts`

**Interfaces:**
- Consumes: `getSkillBrand(label: string): SkillBrand | undefined`, `hasSkillBrandIcon(brand): brand is IconBackedSkillBrand`, installed `simple-icons`, and Vite asset URL imports.
- Produces: icon-backed brands for K3s, Tailscale, Traefik, Longhorn, MetalLB, kube-vip, Redis, and Renovate while leaving Sealed Secrets and NFS without icons.

- [ ] **Step 1: Write failing exact-logo and fallback tests**

Add imports to `skill-brand.spec.ts`:

```ts
import {
  siK3s,
  siLonghorn,
  siRedis,
  siRenovate,
  siTailscale,
  siTraefikproxy,
} from 'simple-icons';
```

Add these tests inside `describe('getSkillBrand', ...)`:

```ts
it.each([
  ['K3s', siK3s],
  ['Tailscale', siTailscale],
  ['Traefik', siTraefikproxy],
  ['Longhorn', siLonghorn],
  ['Redis', siRedis],
  ['Renovate', siRenovate],
] as const)('uses the exact official Simple Icon for %s', (skill, icon) => {
  expect(getSkillBrand(skill)?.iconPath).toBe(icon.path);
});

it.each([
  ['MetalLB', /metallb.*\.svg/],
  ['kube-vip', /kube-vip.*\.png/],
] as const)('uses the official vendored project asset for %s', (skill, asset) => {
  const brand = getSkillBrand(skill);

  expect(brand?.iconPath).toBeUndefined();
  expect(brand?.iconDataUrl).toMatch(asset);
});

it('provides an icon for every Homelab skill with an official mark', () => {
  const iconBackedSkills = [
    'K3s',
    'Argo CD',
    'Helm',
    'Ansible',
    'kubectl',
    'Tailscale',
    'Traefik',
    'Longhorn',
    'MetalLB',
    'kube-vip',
    'Prometheus',
    'Grafana',
    'Loki',
    'Alloy',
    'PostgreSQL',
    'Redis',
    'AWS',
    'Renovate',
  ];

  for (const skill of iconBackedSkills) {
    expect(hasSkillBrandIcon(getSkillBrand(skill)), skill).toBe(true);
  }
});

it.each(['Sealed Secrets', 'NFS'])(
  'keeps %s text-only because it has no official product logo',
  (skill) => {
    expect(hasSkillBrandIcon(getSkillBrand(skill))).toBe(false);
  },
);
```

- [ ] **Step 2: Run the resolver test and verify the new mappings fail**

Run from the repository root:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-brand.spec.ts
```

Expected: FAIL for the six missing Simple Icons and both missing vendored
assets. Use this direct fallback from `apps/github.io` if pnpm fails before
Vitest:

```bash
../../../../node_modules/.bin/vitest --config vite.config.ts --run src/app/skills/skill-brand.spec.ts
```

- [ ] **Step 3: Retrieve and inspect the two official assets**

Create the two focused asset directories, then download only these published
upstream files:

```bash
mkdir -p apps/github.io/src/assets/skills/metallb apps/github.io/src/assets/skills/kube-vip
curl -L https://raw.githubusercontent.com/cncf/landscape/master/hosted_logos/metallb.svg -o apps/github.io/src/assets/skills/metallb/metallb.svg
curl -L https://raw.githubusercontent.com/kube-vip/website/main/static/images/kube-vip.png -o apps/github.io/src/assets/skills/kube-vip/kube-vip.png
file apps/github.io/src/assets/skills/metallb/metallb.svg apps/github.io/src/assets/skills/kube-vip/kube-vip.png
sha256sum apps/github.io/src/assets/skills/metallb/metallb.svg apps/github.io/src/assets/skills/kube-vip/kube-vip.png
rg -n "<script|javascript:|https?://|xlink:href" apps/github.io/src/assets/skills/metallb/metallb.svg
```

Expected: MetalLB is valid SVG, kube-vip is valid PNG, hashes are printed for
review, and the SVG contains no script, JavaScript URL, or external resource
reference. An empty `rg` result is expected. Do not optimize, recolor, trace, or
otherwise alter either artwork file.

- [ ] **Step 4: Record provenance**

Append these sections to `apps/github.io/src/assets/skills/README.md`:

```markdown
## MetalLB project logo

- Source: [`cncf/landscape`](https://github.com/cncf/landscape/blob/master/hosted_logos/metallb.svg)
- Retrieval date: 2026-08-12
- Source repository license: Apache-2.0

The local SVG is the unmodified MetalLB artwork published in the CNCF
Landscape logo collection. The logo remains the property of its project; the
repository license is recorded as provenance rather than a trademark grant.

## kube-vip project logo

- Source: [`kube-vip/website`](https://github.com/kube-vip/website/blob/main/static/images/kube-vip.png)
- Retrieval date: 2026-08-12
- Source repository license: Apache-2.0

The local PNG is the unmodified project artwork published by kube-vip's
official website repository. The logo remains the property of its project; the
repository license is recorded as provenance rather than a trademark grant.
```

- [ ] **Step 5: Add the Simple Icons and local-asset mappings**

Add these named imports from `simple-icons` in `skill-brand.ts`:

```ts
siK3s,
siLonghorn,
siRedis,
siRenovate,
siTailscale,
siTraefikproxy,
```

Add the vendored asset imports beside the existing local skill assets:

```ts
import kubeVipIconUrl from '../../assets/skills/kube-vip/kube-vip.png';
import metallbIconUrl from '../../assets/skills/metallb/metallb.svg?no-inline';
```

Add these exact entries to `skillIcons`:

```ts
K3s: siK3s,
Longhorn: siLonghorn,
Redis: siRedis,
Renovate: siRenovate,
Tailscale: siTailscale,
Traefik: siTraefikproxy,
```

Add these entries to `skillIconAssets`:

```ts
MetalLB: metallbIconUrl,
'kube-vip': kubeVipIconUrl,
```

Add neutral backgrounds for the full-color assets in `skillBrandColors`:

```ts
MetalLB: '#FFFFFF',
'kube-vip': '#FFFFFF',
```

Do not add entries for Sealed Secrets or NFS.

- [ ] **Step 6: Run focused tests and verify they pass**

Run the resolver test from Step 2 and the project-card test from Task 2.

Expected: both files PASS, proving exact mappings, vendored URLs, full Homelab
coverage, and text-only fallbacks.

- [ ] **Step 7: Review and commit the logo slice**

```bash
git diff --check
git diff -- apps/github.io/src/app/skills/skill-brand.ts apps/github.io/src/app/skills/skill-brand.spec.ts apps/github.io/src/assets/skills/README.md
git status --short
git add apps/github.io/src/app/skills/skill-brand.ts apps/github.io/src/app/skills/skill-brand.spec.ts apps/github.io/src/assets/skills/README.md apps/github.io/src/assets/skills/metallb/metallb.svg apps/github.io/src/assets/skills/kube-vip/kube-vip.png
git diff --cached --stat
git diff --cached -- apps/github.io/src/app/skills/skill-brand.ts apps/github.io/src/app/skills/skill-brand.spec.ts apps/github.io/src/assets/skills/README.md
git commit -m "feat(github.io): add homelab skill logos"
```

Expected: only the resolver, tests, provenance, and two official assets are
staged. Inspect the binary path and size in `--stat` before committing.

### Task 4: Validate the complete card and inspect it from iPad

**Files:**
- Verify only; modify implementation files only if a check exposes a defect.

**Interfaces:**
- Consumes: the finalized Homelab fixture, resolver mappings, permanent Storybook story, and existing Tailscale-aware Storybook configuration.
- Produces: test, lint, build, and visual evidence that the card is ready for review without changing shared layout behavior.

- [ ] **Step 1: Run the full github.io test suite**

```bash
pnpm nx test github.io -- --run
```

Expected: all tests PASS. If the pnpm wrapper fails with the known SQLite or Nx
lockfile error, run from `apps/github.io`:

```bash
../../../../node_modules/.bin/vitest --config vite.config.ts --run
```

Expected fallback result: all github.io Vitest files PASS.

- [ ] **Step 2: Run lint and production build**

```bash
pnpm nx lint github.io
pnpm nx build github.io
```

Expected: both exit successfully. If pnpm/Nx fails before either underlying
tool starts, run from `apps/github.io`:

```bash
../../../../node_modules/.bin/eslint .
../../../../node_modules/.bin/vite build --config vite.config.ts
```

Expected fallback result: both commands exit zero; report pre-existing warnings
separately from new failures.

- [ ] **Step 3: Start Storybook on the Tailscale interface**

Confirm the machine address:

```bash
tailscale ip -4
```

Expected: the current machine IPv4 is `100.113.57.51`. From
`apps/github.io`, start Storybook:

```bash
STORYBOOK_DISABLE_TELEMETRY=1 STORYBOOK_ALLOWED_HOST=100.113.57.51 ../../../../node_modules/.bin/storybook dev --host 0.0.0.0 --port 6006 --no-open --ci
```

Expected: Storybook reports ready on port 6006 and lists `100.113.57.51` as an
allowed host.

- [ ] **Step 4: Inspect the permanent Homelab story from the iPad**

Open this URL on the iPad while connected to the same Tailscale network:

```text
http://100.113.57.51:6006/?path=/story/github-io-projects-project-card--homelab
```

Verify all of the following:

- the heading is `benkim0414/homelab` and is not clipped;
- all 20 skill tokens remain inside the card and wrap cleanly;
- K3s, Tailscale, Traefik, Longhorn, MetalLB, kube-vip, Redis, and Renovate show their official marks;
- Sealed Secrets and NFS are intentionally text-only;
- existing Argo CD, Helm, Ansible, kubectl, Prometheus, Grafana, Loki, Alloy, PostgreSQL, and AWS marks still render;
- the description and GitHub citation remain readable and tappable;
- no horizontal page overflow, broken image indicator, or unexpected token background appears.

- [ ] **Step 5: Run final diff and repository review**

```bash
git diff --check
git status --short --branch
git log --oneline -6
```

Expected: no uncommitted implementation files remain. The existing
`apps/github.io/debug-storybook.log` is not staged or committed. Stop at the
repository's awaiting-handoff state; do not push, open a PR, merge, or deploy.
