# Neutral Skill Token Surfaces Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Default project-card skills without a verified official brand color to the Astryx neutral token surface while preserving branded Simple Icons surfaces and every existing logo asset.

**Architecture:** Add explicit `surface` provenance to the centralized `SkillBrand` result. `SkillToken` derives its effective variant from an explicit caller override, then resolver metadata, then a neutral fallback, so `ProjectCard` remains free of brand-specific branches and evidence cards retain their forced-neutral behavior.

**Tech Stack:** React 19, TypeScript, Astryx `Token`, StyleX, Simple Icons, Vitest, Testing Library, Storybook 10, Nx, pnpm.

## Global Constraints

- Work only in the existing linked worktree on `feat/homelab-project-card`.
- Preserve all 45 Dotfiles and Homelab skill labels, order, icons, and accessible names.
- Keep `mise`, `Bash`, `Kubernetes`, and `GitOps` excluded from Homelab.
- Keep branded surfaces for the 26 Simple Icons-backed project skills.
- Use neutral surfaces for `Amazon S3`, `Alloy`, `Codex`, `gh-dash`, `Herdr`, `Loki`, `MetalLB`, `mise`, `kube-vip`, and `Yazi`.
- Use neutral surfaces for `eza`, `fzf`, `ripgrep`, `zoxide`, `delta`, `LazyGit`, `SSH`, `Sealed Secrets`, and `NFS`.
- Preserve original embedded colors in raster and SVG image assets; do not recolor, redraw, replace, or edit logo files.
- Preserve explicit `variant="neutral"` behavior in evidence skill tokens.
- Do not add dependencies or project-specific color lists to `ProjectCard`.
- Do not re-audit or change Simple Icons hex values.
- Do not stage or remove `apps/github.io/debug-storybook.log`.
- Stage explicit paths only and use conventional commit subjects.
- Do not claim the physical iPad/Tailscale gate passed without user verification on the iPad.

## File Structure

- Modify `apps/github.io/src/app/skills/skill-brand.ts`: define surface provenance and classify resolver results.
- Modify `apps/github.io/src/app/skills/skill-brand.spec.ts`: protect Simple Icons brand surfaces and all 10 audited custom-image neutral surfaces.
- Modify `apps/github.io/src/app/skills/skill-token.tsx`: derive the effective variant from caller override, resolver metadata, or neutral fallback.
- Modify `apps/github.io/src/app/skills/skill-token.spec.tsx`: protect neutral defaults for the 10 image-backed and nine text-only project skills, plus explicit overrides.
- Verify `apps/github.io/src/app/projects/project-card.spec.tsx`: preserve project content and Homelab exclusions.
- Verify `apps/github.io/src/app/projects/project-card.stories.tsx`: provide the permanent Dotfiles and Homelab visual fixtures.

---

### Task 1: Record skill surface provenance

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-brand.ts`
- Test: `apps/github.io/src/app/skills/skill-brand.spec.ts`

**Interfaces:**
- Consumes: the existing `skillIcons`, `skillIconAssets`, and `getSkillBrand(label: string)` resolver flow.
- Produces: `SkillBrandSurface = 'brand' | 'neutral'` and `SkillBrand.surface: SkillBrandSurface`.
- Produces: `surface: 'brand'` for Simple Icons results, `surface: 'neutral'` for the 10 audited custom-image project skills, and a neutral default for other non-Simple-Icons results.

- [ ] **Step 1: Write failing surface-provenance tests**

Add these tests inside `describe('getSkillBrand', ...)`:

```ts
it('marks Simple Icons metadata as an official brand surface', () => {
  expect(getSkillBrand('Docker')?.surface).toBe('brand');
});

it.each([
  'Amazon S3',
  'Alloy',
  'Codex',
  'gh-dash',
  'Herdr',
  'Loki',
  'MetalLB',
  'mise',
  'kube-vip',
  'Yazi',
])('marks audited custom-image skill %s as a neutral surface', (skill) => {
  expect(getSkillBrand(skill)?.surface).toBe('neutral');
});
```

Extend the existing mapped-brand expectation with `surface`:

```ts
expect(brand).toMatchObject({
  name: 'Kubernetes',
  color: '#326CE5',
  foreground: 'var(--color-on-dark)',
  surface: 'brand',
});
```

- [ ] **Step 2: Run the focused resolver suite and confirm the red phase**

```bash
./node_modules/.bin/vitest run --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/skills/skill-brand.spec.ts \
  --coverage.enabled=false
```

Expected: FAIL because `SkillBrand` results do not contain `surface`.

- [ ] **Step 3: Add explicit surface metadata**

Add the exported type and required property in `skill-brand.ts`:

```ts
export type SkillBrandSurface = 'brand' | 'neutral';

export interface SkillBrand {
  name: string;
  color: string;
  foreground: string;
  surface: SkillBrandSurface;
  iconPath?: string;
  iconDataUrl?: string;
}
```

Add the audited classifications beside `skillBrandColors`:

```ts
const skillBrandSurfaces: Readonly<Record<string, SkillBrandSurface>> = {
  'Amazon S3': 'neutral',
  Alloy: 'neutral',
  Codex: 'neutral',
  'gh-dash': 'neutral',
  Herdr: 'neutral',
  Loki: 'neutral',
  MetalLB: 'neutral',
  mise: 'neutral',
  'kube-vip': 'neutral',
  Yazi: 'neutral',
};
```

In `getSkillBrand`, derive and return the surface without inspecting asset format or color value:

```ts
const surface = skillBrandSurfaces[label] ?? (icon ? 'brand' : 'neutral');

return {
  name: label,
  color: brandColor,
  foreground: brandForeground(brandColor.slice(1)),
  surface,
  ...iconData,
};
```

- [ ] **Step 4: Run the resolver suite and confirm green**

Run the command from Step 2.

Expected: PASS, including all 10 custom-image classifications and the Simple Icons brand classification.

- [ ] **Step 5: Review and commit the provenance slice**

```bash
git diff --check
git diff -- \
  apps/github.io/src/app/skills/skill-brand.ts \
  apps/github.io/src/app/skills/skill-brand.spec.ts
git add \
  apps/github.io/src/app/skills/skill-brand.ts \
  apps/github.io/src/app/skills/skill-brand.spec.ts
git diff --cached
git commit -m "feat(github.io): classify skill token surfaces"
```

Expected: only resolver metadata and its focused tests are committed.

### Task 2: Default unbranded project skills to neutral

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-token.tsx`
- Test: `apps/github.io/src/app/skills/skill-token.spec.tsx`

**Interfaces:**
- Consumes: `SkillBrand.surface: 'brand' | 'neutral'` from Task 1.
- Preserves: `SkillTokenProps.variant?: 'brand' | 'neutral'` as an explicit caller override.
- Produces: effective variant precedence `variant ?? brand?.surface ?? 'neutral'`.

- [ ] **Step 1: Replace old unmapped-purple expectations with failing neutral-default tests**

Keep the existing branded Docker test. Replace the two tests that expect
unmapped and color-only skills to use the purple roadmap treatment with:

```tsx
it.each([
  'eza',
  'fzf',
  'ripgrep',
  'zoxide',
  'delta',
  'LazyGit',
  'SSH',
  'Sealed Secrets',
  'NFS',
])('defaults text-only project skill %s to the Astryx gray surface', (label) => {
  const { container, getByTestId } = render(
    <>
      <SkillToken label={label} />
      <Token color="gray" data-testid="gray-reference" label="Reference" size="sm" />
    </>,
  );
  const token = getByTestId('skill-token');

  expect(token.className).toBe(getByTestId('gray-reference').className);
  expect(token.getAttribute('style')).toBeNull();
  expect(container.querySelector('[data-testid="skill-token"] svg')).toBeNull();
  expect(container.querySelector('[data-testid="skill-token"] img')).toBeNull();
});
```

Add coverage for every audited custom-image project skill:

```tsx
it.each([
  'Amazon S3',
  'Alloy',
  'Codex',
  'gh-dash',
  'Herdr',
  'Loki',
  'MetalLB',
  'mise',
  'kube-vip',
  'Yazi',
])('defaults custom-image project skill %s to the Astryx gray surface', (label) => {
  const { container, getByTestId } = render(
    <>
      <SkillToken label={label} />
      <Token color="gray" data-testid="gray-reference" label="Reference" size="sm" />
    </>,
  );
  const token = getByTestId('skill-token');
  const image = container.querySelector('[data-testid="skill-token"] img');

  expect(token.className).toBe(getByTestId('gray-reference').className);
  expect(token.getAttribute('style')).toBeNull();
  expect(image?.getAttribute('aria-hidden')).toBe('true');
  expect(image?.getAttribute('alt')).toBe('');
  expect(image?.getAttribute('src')).toBeTruthy();
});
```

Add an explicit brand-override test:

```tsx
it('honors an explicit brand variant for a neutral-default local asset', () => {
  const { getByTestId } = render(<SkillToken label="Yazi" variant="brand" />);

  expect(getByTestId('skill-token').getAttribute('style')).toContain(
    '--skill-token-background: #FFFFFF',
  );
});
```

- [ ] **Step 2: Run the focused token suite and confirm the red phase**

```bash
./node_modules/.bin/vitest run --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/skills/skill-token.spec.tsx \
  --coverage.enabled=false
```

Expected: FAIL because omitted `variant` still defaults to `brand` and the nine text-only skills do not use the gray token class.

- [ ] **Step 3: Derive one effective variant in SkillToken**

Remove the `variant = 'brand'` parameter default and calculate the resolver-driven value:

```tsx
export function SkillToken({
  label,
  brandLabel,
  variant,
}: SkillTokenProps): ReactElement {
  const brand = getSkillBrand(brandLabel ?? label);
  const effectiveVariant = variant ?? brand?.surface ?? 'neutral';
  const hasIcon = hasSkillBrandIcon(brand);
  const usesBrandSurface = effectiveVariant === 'brand' && hasIcon;
```

Replace later reads of `variant` with `effectiveVariant`, including:

```tsx
fill={effectiveVariant === 'neutral' ? brand.color : 'currentColor'}
```

```tsx
<Token
  color={effectiveVariant === 'neutral' ? 'gray' : 'purple'}
  data-testid="skill-token"
  icon={icon}
  label={label}
  size="sm"
  style={tokenStyle(brand, effectiveVariant)}
  xstyle={usesBrandSurface ? styles.brandToken : undefined}
/>
```

Do not add resolver calls or label lists to `ProjectCard`.

- [ ] **Step 4: Run focused resolver, token, and project-card suites**

```bash
./node_modules/.bin/vitest run --config apps/github.io/vite.config.ts \
  apps/github.io/src/app/skills/skill-brand.spec.ts \
  apps/github.io/src/app/skills/skill-token.spec.tsx \
  apps/github.io/src/app/projects/project-card.spec.tsx \
  --coverage.enabled=false
```

Expected: PASS. The 19 exceptions use gray by default, Docker remains branded, explicit overrides work, project content is unchanged, and Homelab still excludes `Kubernetes`, `GitOps`, `Bash`, and `mise`.

- [ ] **Step 5: Review and commit the rendering slice**

```bash
git diff --check
git diff -- \
  apps/github.io/src/app/skills/skill-token.tsx \
  apps/github.io/src/app/skills/skill-token.spec.tsx
git add \
  apps/github.io/src/app/skills/skill-token.tsx \
  apps/github.io/src/app/skills/skill-token.spec.tsx
git diff --cached
git commit -m "feat(github.io): default unbranded skills to neutral"
```

Expected: only shared token behavior and its focused tests are committed.

### Task 3: Complete automated and iPad Storybook validation

**Files:**
- Verify only: `apps/github.io/src/app/projects/project-card.stories.tsx`
- Do not modify or stage: `apps/github.io/debug-storybook.log`

**Interfaces:**
- Consumes: the Task 1 and Task 2 commits.
- Produces: test, lint, production-build, and Storybook evidence without a validation-only code commit.

- [ ] **Step 1: Run repository-preferred verification separately**

```bash
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx build github.io
```

Expected: all three pass. If a wrapper cannot start because of a pnpm SQLite or Nx lockfile parsing error, retain that error and run Step 2; do not report the wrapper as passing.

- [ ] **Step 2: Run direct fallbacks only if a preferred wrapper cannot start**

Run the corresponding fallback for each wrapper that could not start:

```bash
./node_modules/.bin/vitest run --config apps/github.io/vite.config.ts --coverage.enabled=false
./node_modules/.bin/eslint apps/github.io/src
./node_modules/.bin/vite build --config apps/github.io/vite.config.ts
```

Expected: all tests pass, ESLint has no errors, and Vite produces the production bundle. Existing warnings may be reported but must not be described as new failures.

- [ ] **Step 3: Inspect both permanent stories headlessly at `834x1194`**

Inspect `github-io-projects-project-card--default` and
`github-io-projects-project-card--homelab` in light and dark modes.

Expected: the 19 exceptions share the Astryx gray surface; Simple Icons skills remain branded; custom images retain embedded colors without clipping; text labels remain readable; skills wrap within card boundaries; and titles, descriptions, links, and accessible labels remain intact.

- [ ] **Step 4: Start Tailscale-accessible Storybook for the manual gate**

```bash
PROJECT_TAILSCALE_IP="$(tailscale ip -4 | head -n 1)"
__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS="$PROJECT_TAILSCALE_IP" \
  ./node_modules/.bin/storybook dev \
  --config-dir apps/github.io/.storybook \
  --host 0.0.0.0 \
  --port 6006
```

Expected: Storybook listens on `0.0.0.0:6006`, and both URLs return HTTP 200 from the host:

```text
http://<tailscale-ip>:6006/?path=/story/github-io-projects-project-card--default
http://<tailscale-ip>:6006/?path=/story/github-io-projects-project-card--homelab
```

- [ ] **Step 5: Ask the user to complete the physical iPad check**

Provide the exact live URLs. Ask the user to verify neutral versus branded surfaces, light/dark logo and text legibility, skill wrapping and card boundaries, and intact content and accessibility labels. Do not complete this step until the user confirms the physical-device result.

- [ ] **Step 6: Review final repository state**

```bash
git status --short --branch
git log -6 --oneline
```

Expected: only `apps/github.io/debug-storybook.log` is untracked; the plan and two implementation slices are committed, with no unrelated changes and no push performed.
