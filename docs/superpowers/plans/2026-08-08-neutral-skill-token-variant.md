# Neutral Skill Token Variant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an opt-in neutral `SkillToken` variant that uses the same gray surface as experience evidence while retaining brand color only in the skill logo, then use it for DORA capability skill evidence.

**Architecture:** Keep the existing brand-filled presentation as `SkillToken`'s default. Add a `neutral` branch inside the shared component that selects Astryx `Token color="gray"`, omits brand surface overrides, and colors only inline Simple Icons; local full-color image assets remain unchanged. `SkillEvidenceToken` opts into the variant without adding DORA-specific styling.

**Tech Stack:** React, TypeScript, StyleX, Astryx Design System `Token`, Vitest, Testing Library, Nx, Storybook.

## Global Constraints

- Work only in the linked `feat/dora-ci-evidence` worktree and do not push, merge, or deploy.
- The reusable API is exactly `SkillToken variant="neutral"`; the prop type is `variant?: 'brand' | 'neutral'`.
- Omitting `variant` must remain equivalent to `variant="brand"` and preserve every existing consumer's current brand-filled presentation.
- Neutral tokens use Astryx `Token color="gray"`, matching experience evidence tokens, with no brand background or foreground CSS-variable overrides.
- Neutral Simple Icons use the exact `brand.color` on the SVG path; neutral local image assets retain their existing full-color artwork.
- Missing and color-only brands remain text-only and must not receive an unrelated icon.
- `SkillEvidenceToken` is the only production call site changed to opt into `neutral`.
- Preserve token size, icon dimensions, wrapping, labels, decorative accessibility, and all evidence data, scores, grouping, spacing, assets, provenance, links, and interaction behavior.
- Known spec TypeScript baseline is seven unrelated diagnostics; introduce no new diagnostic.
- Commit the implementation as one self-contained logical change with explicit staging and a conventional commit subject.

---

## File Structure

- Modify `apps/github.io/src/app/skills/skill-token.tsx`: define the variant contract and separate brand-surface styling from icon coloring.
- Modify `apps/github.io/src/app/skills/skill-token.spec.tsx`: lock default compatibility, neutral gray surface, Simple Icons color, full-color image behavior, and text-only fallbacks.
- Modify `apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx`: opt DORA skill evidence into the neutral variant.
- Modify `apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx`: verify the DORA adapter uses the neutral surface and retains both icon representations.

### Task 1: Add And Adopt The Neutral Skill Token Variant

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-token.tsx`
- Modify: `apps/github.io/src/app/skills/skill-token.spec.tsx`
- Modify: `apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx`
- Modify: `apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx`

**Interfaces:**
- Consumes: `SkillBrand`, `getSkillBrand`, `hasSkillBrandIcon`, Astryx `Token color="gray"`, and the existing `SkillEvidenceToken -> SkillToken` adapter.
- Produces: `SkillTokenProps.variant?: 'brand' | 'neutral'`; brand-compatible default rendering; neutral gray-surface rendering with brand-colored decorative icons.

- [ ] **Step 1: Write failing neutral-variant `SkillToken` tests**

In `skill-token.spec.tsx`, import Astryx `Token` alongside the existing imports:

```ts
import { Token } from '@astryxdesign/core/Token';
```

Keep the existing mapped Docker test as the regression proof that omitted
`variant` remains brand-filled. Add these tests:

```tsx
it('uses the Astryx gray surface with only a brand-colored Simple Icon', () => {
  const { container, getByTestId } = render(
    <>
      <SkillToken label="Docker" variant="neutral" />
      <Token color="gray" data-testid="gray-reference" label="Reference" size="sm" />
    </>,
  );
  const token = getByTestId('skill-token');
  const grayReference = getByTestId('gray-reference');
  const path = container.querySelector('[data-testid="skill-token"] path');

  expect(token.className).toBe(grayReference.className);
  expect(token.getAttribute('style')).toBeNull();
  expect(path?.getAttribute('fill')).toBe('#2496ED');
});

it('keeps a neutral local asset full-color on the gray surface', () => {
  const { container, getByTestId } = render(
    <>
      <SkillToken label="AWS CodePipeline" variant="neutral" />
      <Token color="gray" data-testid="gray-reference" label="Reference" size="sm" />
    </>,
  );
  const token = getByTestId('skill-token');
  const image = container.querySelector('[data-testid="skill-token"] img');

  expect(token.className).toBe(getByTestId('gray-reference').className);
  expect(token.getAttribute('style')).toBeNull();
  expect(image?.getAttribute('aria-hidden')).toBe('true');
  expect(image?.getAttribute('alt')).toBe('');
  expect(image?.getAttribute('src')).toMatch(/assets\/.*\.svg/);
});

it.each(['Forward Proxy', 'AWS'])(
  'keeps neutral text-only skill %s on the gray surface without an icon',
  (label) => {
    const { container, getByTestId } = render(
      <>
        <SkillToken label={label} variant="neutral" />
        <Token color="gray" data-testid="gray-reference" label="Reference" size="sm" />
      </>,
    );
    const token = getByTestId('skill-token');

    expect(token.className).toBe(getByTestId('gray-reference').className);
    expect(token.getAttribute('style')).toBeNull();
    expect(container.querySelector('[data-testid="skill-token"] svg')).toBeNull();
    expect(container.querySelector('[data-testid="skill-token"] img')).toBeNull();
  },
);
```

The production change that will make these tests pass is the new variant branch:
the current component always uses `color="purple"`, applies brand surface styles,
and fills Simple Icons with `currentColor`.

- [ ] **Step 2: Run the focused token test and verify RED**

Run:

```bash
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts skill-token.spec.tsx
```

Expected: FAIL because `neutral` is not an allowed variant and the component does
not render the gray-surface behavior. If Vitest transpilation does not surface the
prop-type failure, the class/style/path assertions must still fail for the intended
behavioral reason.

- [ ] **Step 3: Implement the minimal shared variant behavior**

In `skill-token.tsx`, replace the unused variant declaration with:

```ts
export type SkillTokenVariant = 'brand' | 'neutral';

export interface SkillTokenProps {
  label: string;
  brandLabel?: string;
  variant?: SkillTokenVariant;
}
```

Make brand surface style conditional:

```ts
function tokenStyle(
  brand: SkillBrand | undefined,
  variant: SkillTokenVariant,
): CSSProperties | undefined {
  if (variant === 'neutral' || !hasSkillBrandIcon(brand)) {
    return undefined;
  }

  return {
    '--skill-token-background': brand.color,
    '--skill-token-foreground': brand.foreground,
  } as CSSProperties;
}
```

Default the component to brand behavior and calculate neutral presentation once:

```ts
export function SkillToken({
  label,
  brandLabel,
  variant = 'brand',
}: SkillTokenProps): ReactElement {
  const brand = getSkillBrand(brandLabel ?? label);
  const hasIcon = hasSkillBrandIcon(brand);
  const usesBrandSurface = variant === 'brand' && hasIcon;
```

For the inline Simple Icons branch, replace `fill="currentColor"` with:

```tsx
fill={variant === 'neutral' ? brand.color : 'currentColor'}
```

Keep the existing local `<img>` branch byte-for-byte. Change the Astryx token props
to:

```tsx
<Token
  color={variant === 'neutral' ? 'gray' : 'purple'}
  data-testid="skill-token"
  icon={icon}
  label={label}
  size="sm"
  style={tokenStyle(brand, variant)}
  xstyle={usesBrandSurface ? styles.brandToken : undefined}
/>
```

Do not add a neutral StyleX surface; Astryx `Token color="gray"` is the source of
truth shared with experience evidence.

- [ ] **Step 4: Run the focused token test and verify GREEN**

Run the Step 2 command again.

Expected: PASS for all existing brand-filled tests and the new neutral cases.

- [ ] **Step 5: Write the failing DORA adapter test**

In `capability-evidence.spec.tsx`, import Astryx `Token` and revise the first skill
case so it renders a gray reference token next to `CapabilityEvidence`. Assert the
DORA token has the same class, no brand surface style, and a Kubernetes-blue path:

```tsx
const { container } = render(
  <>
    <CapabilityEvidence
      evidence={evidence({
        label: undefined,
        title: 'Kubernetes',
        type: 'skill',
      })}
    />
    <Token color="gray" data-testid="gray-reference" label="Reference" size="sm" />
  </>,
);

const skillToken = screen.getByTestId('skill-token');

expect(skillToken.className).toBe(screen.getByTestId('gray-reference').className);
expect(skillToken.getAttribute('style')).toBeNull();
expect(
  container.querySelector('[data-testid="skill-token"] path')?.getAttribute('fill'),
).toBe('#326CE5');
```

Update the alias-label skill assertion from expecting
`--skill-token-background: #326CE5` to expecting no style and a path fill of
`#326CE5`. Keep the AWS and Kustomize decorative-icon assertions.

- [ ] **Step 6: Run the capability evidence test and verify RED**

Run:

```bash
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts capability-evidence.spec.tsx
```

Expected: FAIL because `SkillEvidenceToken` still omits the variant and therefore
uses the default brand surface.

- [ ] **Step 7: Adopt the neutral variant in `SkillEvidenceToken`**

In `capability-evidence.tsx`, add the prop without changing the existing label or
brand alias flow:

```tsx
<SkillToken
  brandLabel={
    iconData?.kind === 'brand' ? iconData.brand.name : undefined
  }
  label={label}
  variant="neutral"
/>
```

- [ ] **Step 8: Run focused GREEN verification**

Run:

```bash
../../node_modules/.bin/vitest run --config apps/github.io/vite.config.ts skill-token.spec.tsx capability-evidence.spec.tsx dora-capability-card.spec.tsx dora-capability-card.stories.spec.ts
```

Expected: PASS. The DORA card still contains five applied and thirteen skill items,
with no data/order/spacing change.

- [ ] **Step 9: Run TypeScript and full app verification**

Run each command independently:

```bash
../../node_modules/.bin/tsc -p apps/github.io/tsconfig.spec.json --noEmit --pretty false
NX_DAEMON=false ../../node_modules/.bin/nx test github.io --skip-nx-cache
NX_DAEMON=false ../../node_modules/.bin/nx lint github.io --skip-nx-cache
NX_DAEMON=false ../../node_modules/.bin/nx build github.io --skip-nx-cache
NX_DAEMON=false ../../node_modules/.bin/nx build-storybook github.io --skip-nx-cache
```

Expected: all four Nx targets exit `0`. TypeScript may exit `2` only with the seven
documented baseline diagnostics; every diagnostic in `skill-token*`,
`capability-evidence*`, or another file changed by this plan must be fixed.

- [ ] **Step 10: Perform responsive Storybook QA**

Start Storybook only after obtaining any required risk-specific approval for the
chosen bind address. Use loopback for automated browser QA unless iPad/Tailscale
access is explicitly approved:

```bash
NX_DAEMON=false ../../node_modules/.bin/nx storybook github.io --host 127.0.0.1 --port 6008
```

Inspect the shared Continuous Integration capability-card story with a real browser
at `390x844` and `768x1024`. Verify:

- applied and skill tokens use the same gray surface treatment;
- the skill row remains visually distinguishable through its brand-colored logos
  and skill labels rather than token background colors;
- Docker/Kubernetes-style inline logos retain exact brand colors;
- AWS service icons remain full-color local images;
- all thirteen skills wrap inside the card;
- the Parameter Store token fits without overlap or horizontal overflow;
- no visible row heading, link, hover card, or click affordance appears; and
- existing row gaps, token size, and icon dimensions remain unchanged.

Store screenshots and overflow measurements only in this plan's ignored SDD
workspace. Stop only the server started by this step. Do not modify `nx.json`.

- [ ] **Step 11: Commit the neutral variant**

```bash
git diff --check
git diff -- apps/github.io/src/app/skills/skill-token.tsx apps/github.io/src/app/skills/skill-token.spec.tsx apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx
git add apps/github.io/src/app/skills/skill-token.tsx apps/github.io/src/app/skills/skill-token.spec.tsx apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx
git diff --cached --check
git commit -m "feat(github.io): add neutral skill token variant"
```

- [ ] **Step 12: Review and return to the parent feature workflow**

Run `superpowers:requesting-code-review` against this plan's implementation commit.
Resolve valid findings with focused tests and separate conventional commits. Then
return to the parent DORA capability skill evidence workflow for its final
whole-branch review and `superpowers:verification-before-completion`; do not push,
merge, deploy, or delete the feature worktree.
