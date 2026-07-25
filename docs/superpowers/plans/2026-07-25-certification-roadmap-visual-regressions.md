# Certification Roadmap Visual Regressions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore expired certification citation icon color and DevOps roadmap node width to the expected `github.io` visual contracts.

**Architecture:** Keep `CertificationCitation` responsible for certification status and generated citation icon color. Keep `DevOpsRoadmapNode` responsible for node body styling while preserving StyleX and Astryx token boundaries. Do not move React Flow layout ownership out of `DevOpsRoadmap`.

**Tech Stack:** React 19, TypeScript, Nx, Vite, Vitest, Testing Library, Astryx Design, StyleX, Tailwind, React Flow.

## Global Constraints

- Work in the isolated worktree at `.worktrees/certification-roadmap-visual-regressions`.
- Keep Astryx components as the semantic and visual base.
- Use StyleX for component-specific styles and responsive variants.
- Keep Tailwind limited to wrapper utilities.
- Do not add global CSS for citation or node internals.
- Do not change certification citation public props.
- Do not remove active brand-colored certification icons.
- Do not change skill brand metadata.
- Do not change React Flow layout, height estimation, roadmap item data, routes, Astryx theme setup, CSS layer order, or Tailwind configuration.
- Restore roadmap node width to `min(100%, 320px)` by default and `min(100%, 280px)` under `640px`.

---

## File Structure

- `apps/github.io/src/app/certifications/certification-citation.tsx`
  - Owns certification status, primary linked skill brand lookup, Astryx `Citation` rendering, generated icon data URLs, and hidden active/expired status text.
- `apps/github.io/src/app/certifications/certification-citation.spec.tsx`
  - Owns behavior tests for active/expired citation icon color and color-only brand fallback.
- `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx`
  - Owns the roadmap node article body, StyleX node surface styles, skill/certification lists, and React Flow handles.
- `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`
  - Owns behavior tests for roadmap node rendering and stable exported width contract.

### Task 1: Restore Expired Certification Icon Color

**Files:**
- Modify: `apps/github.io/src/app/certifications/certification-citation.spec.tsx`
- Modify: `apps/github.io/src/app/certifications/certification-citation.tsx`

**Interfaces:**
- Consumes: `CertificationCitation(props: CertificationCitationProps): ReactElement`
- Consumes: `getSkillBrand(skill: string)` from `../skills/skill-brand`
- Produces: generated citation icon data URLs where active icon-backed certifications use brand color and expired icon-backed certifications use neutral citation label text color.

- [ ] **Step 1: Update the failing expired icon color test**

In `apps/github.io/src/app/certifications/certification-citation.spec.tsx`, replace the current test named `keeps the brand color logo for expired certifications` with this test:

```tsx
  it('uses neutral citation text color for expired certification logos', () => {
    const { container, getByRole } = render(
      <CertificationCitation
        currentDate={new Date('2029-01-01T00:00:00+11:00')}
        expiresAt="2028-02-26T10:59:00+11:00"
        skills={['Kubernetes']}
        title="KCNA"
        url={certificateUrl}
      />,
    );

    const wrapper = container.querySelector(
      '[data-testid="certification-citation"]',
    );
    const citation = getByRole('doc-noteref', { name: 'Citation 1: KCNA' });
    const icon = container.querySelector('img');
    const iconSrc = icon?.getAttribute('src') ?? '';

    expect(wrapper?.getAttribute('style')).toBeNull();
    expect(citation.getAttribute('style')).toBeNull();
    expect(iconSrc).toContain('data:image/svg+xml;utf8,');
    expect(iconSrc).toContain('fill%3D%22%23737373%22');
    expect(iconSrc).not.toContain('fill%3D%22%23326CE5%22');
  });
```

- [ ] **Step 2: Run the focused certification test and verify it fails**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/certifications/certification-citation.spec.tsx
```

Expected: FAIL because expired Kubernetes certification icons still use `#326CE5`, encoded as `fill%3D%22%23326CE5%22`, instead of `#737373`.

- [ ] **Step 3: Implement the minimal icon color restoration**

In `apps/github.io/src/app/certifications/certification-citation.tsx`, add the neutral citation label color constant near the imports and update icon color selection:

```tsx
const ASTRYX_CITATION_LABEL_TEXT = '#737373';
```

Inside `CertificationCitation`, replace the current `iconPath` / `hasSkillLogo` setup with this status-aware color setup:

```tsx
  const iconPath = primary?.brand.iconPath;
  const hasSkillLogo = Boolean(iconPath);
  const iconColor =
    status === 'active' ? primary?.brand.color : ASTRYX_CITATION_LABEL_TEXT;
```

Then update the `source.icon` expression passed to `Citation`:

```tsx
          icon: iconPath ? iconDataUrl(iconPath, iconColor) : undefined,
```

The resulting `Citation` block should still pass `variant="label"` and `xstyle={hasSkillLogo && styles.sourceWithIcon}`.

- [ ] **Step 4: Run the focused certification test and verify it passes**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/certifications/certification-citation.spec.tsx
```

Expected: PASS. The active certification test still sees brand color `#326CE5`; the expired certification test sees neutral color `#737373`; the `AWS` color-only fallback still renders no image.

- [ ] **Step 5: Commit the certification change**

Inspect the diff:

```bash
git diff -- apps/github.io/src/app/certifications/certification-citation.tsx apps/github.io/src/app/certifications/certification-citation.spec.tsx
```

Stage explicit paths and commit:

```bash
git add apps/github.io/src/app/certifications/certification-citation.tsx apps/github.io/src/app/certifications/certification-citation.spec.tsx
git commit -m "fix(github.io): use neutral expired citation icons"
```

### Task 2: Restore DevOps Roadmap Node Width Contract

**Files:**
- Modify: `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx`
- Modify: `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`

**Interfaces:**
- Consumes: `DevOpsRoadmapNode({ item }: { item: DevOpsRoadmapItem })`
- Produces: `DEVOPS_ROADMAP_NODE_WIDTH = 'min(100%, 320px)'`
- Produces: `DEVOPS_ROADMAP_NODE_MOBILE_WIDTH = 'min(100%, 280px)'`

- [ ] **Step 1: Add the failing roadmap width contract test**

In `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`, update the import from `./devops-roadmap-node` to include the exported width constants:

```tsx
import {
  DEVOPS_ROADMAP_NODE_MOBILE_WIDTH,
  DEVOPS_ROADMAP_NODE_WIDTH,
  DevOpsRoadmapNode,
} from './devops-roadmap-node';
```

Add this test inside `describe('DevOpsRoadmapNode', ...)`:

```tsx
  it('preserves the previous responsive node width contract', () => {
    expect(DEVOPS_ROADMAP_NODE_WIDTH).toBe('min(100%, 320px)');
    expect(DEVOPS_ROADMAP_NODE_MOBILE_WIDTH).toBe('min(100%, 280px)');
  });
```

- [ ] **Step 2: Run the focused roadmap test and verify it fails**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: FAIL because `DEVOPS_ROADMAP_NODE_WIDTH` and `DEVOPS_ROADMAP_NODE_MOBILE_WIDTH` are not exported yet.

- [ ] **Step 3: Export and use stable width constants**

In `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx`, add these exports after the props interface:

```tsx
export const DEVOPS_ROADMAP_NODE_WIDTH = 'min(100%, 320px)';
export const DEVOPS_ROADMAP_NODE_MOBILE_WIDTH = 'min(100%, 280px)';
```

Then replace the current responsive `width` style:

```tsx
    width: {
      default: `min(100%, calc(${spacingVars['--spacing-10']} * 8))`,
      '@media (max-width: 640px)': `min(100%, calc(${spacingVars['--spacing-10']} * 7))`,
    },
```

with:

```tsx
    width: {
      default: DEVOPS_ROADMAP_NODE_WIDTH,
      '@media (max-width: 640px)': DEVOPS_ROADMAP_NODE_MOBILE_WIDTH,
    },
```

Keep the existing StyleX object, Astryx token imports, padding, min-height, color, background, border, radius, shadow, typography, list styles, and component JSX unchanged.

- [ ] **Step 4: Run the focused roadmap test and verify it passes**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: PASS. Existing node rendering tests still pass, and the width constants match the previous desktop and mobile contract.

- [ ] **Step 5: Commit the roadmap width change**

Inspect the diff:

```bash
git diff -- apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Stage explicit paths and commit:

```bash
git add apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
git commit -m "fix(github.io): restore roadmap node width"
```

### Task 3: Final Verification

**Files:**
- Read: `apps/github.io/src/app/certifications/certification-citation.tsx`
- Read: `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx`
- Read: `apps/github.io/src/app/certifications/certification-citation.spec.tsx`
- Read: `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`

**Interfaces:**
- Consumes: completed Task 1 certification behavior.
- Consumes: completed Task 2 roadmap width behavior.
- Produces: verified branch ready for code review.

- [ ] **Step 1: Run the focused tests together**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/certifications/certification-citation.spec.tsx apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: PASS.

- [ ] **Step 2: Run the project test target**

Run:

```bash
pnpm nx test github.io
```

Expected: PASS.

- [ ] **Step 3: Inspect the final diff**

Run:

```bash
git diff HEAD~2..HEAD -- apps/github.io/src/app/certifications/certification-citation.tsx apps/github.io/src/app/certifications/certification-citation.spec.tsx apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: The diff only changes expired citation icon color behavior, adds stable roadmap width constants, uses those constants in the StyleX width object, and updates focused tests.

- [ ] **Step 4: Check worktree status**

Run:

```bash
git status --short --branch
```

Expected: clean worktree on branch `certification-roadmap-visual-regressions`.
