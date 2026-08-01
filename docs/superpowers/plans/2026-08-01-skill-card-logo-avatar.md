# Skill Card Logo Avatar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add skill logos to `SkillCard` as compact rounded-rectangle logo tiles while preserving the current 24px circular avatar behavior in list surfaces.

**Architecture:** Extend the existing `SkillAvatar` component with a `variant` prop so icon source generation, accessible naming, and initials fallback stay centralized. `SkillCard` consumes the new `variant="card"` logo in its header, beside the title and star rating.

**Tech Stack:** React, TypeScript, StyleX, Astryx `Avatar`, Astryx `Card`, Astryx `Layout`, Vitest, Testing Library, Storybook.

## Global Constraints

- Work in the linked worktree for this branch: `/home/benkim0414/workspace/benkim0414/.worktrees/skill-card-logo-avatar-design`.
- Stage explicit paths only; do not use `git add .`, `git add -A`, or `git add -u`.
- Use conventional commits.
- Preserve unrelated dirty changes in other worktrees.
- Keep `SkillListItem` avatar behavior unchanged at Astryx `Avatar size="xsmall"` / 24px.
- Use a 36px by 36px rounded rectangle for card logos.
- Use an 8px or Astryx `radiusVars['--radius-element']` corner radius for the card logo tile.
- Place the card logo at the top-left of the `SkillCard` header beside the skill name and star rating.
- Do not add new skill data, API-backed skills, desktop-only layouts, light/dark mode, or custom replacements for Astryx primitives.

---

## File Structure

- Modify `apps/github.io/src/app/skills/skill-avatar.tsx`
  - Add a `variant?: 'list' | 'card'` prop.
  - Keep the existing default as `list`.
  - Reuse the existing Simple Icons source and fallback behavior.
  - Add card-only StyleX overrides for 36px sizing and rounded-rectangle mask.
- Modify `apps/github.io/src/app/skills/skill-avatar.spec.tsx`
  - Keep existing list/avatar tests passing.
  - Add tests for the card variant size and shape contract.
- Modify `apps/github.io/src/app/skills/skill-avatar.stories.tsx`
  - Add a Storybook story for the card logo tile and card fallback initials.
- Modify `apps/github.io/src/app/skills/skill-card.tsx`
  - Import and render `SkillAvatar`.
  - Add a card header `HStack` where the card avatar leads the title/rating stack.
  - Preserve category, description, rating, compact variant, and certification behavior.
- Modify `apps/github.io/src/app/skills/skill-card.spec.tsx`
  - Add tests proving the logo appears before the title and uses the card variant.

---

### Task 1: Add `SkillAvatar` Card Variant

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-avatar.tsx`
- Modify: `apps/github.io/src/app/skills/skill-avatar.spec.tsx`
- Modify: `apps/github.io/src/app/skills/skill-avatar.stories.tsx`

**Interfaces:**
- Consumes: `Skill` from `./skill-list.types`.
- Produces: `SkillAvatar({ skill, variant = 'list' }: SkillAvatarProps)`.
- Produces: `SkillAvatarVariant = 'list' | 'card'`.
- Later tasks use: `<SkillAvatar skill={skill} variant="card" />`.

- [ ] **Step 1: Add failing tests for card variant size and shape**

Add this import in `apps/github.io/src/app/skills/skill-avatar.spec.tsx`:

```tsx
import { fireEvent, render } from '@testing-library/react';
```

Keep the existing import unchanged if it already matches. Add these tests inside `describe('SkillAvatar', () => { ... })`:

```tsx
  it('renders the card variant as a 36px logo tile', () => {
    const typeScript = sampleSkills.find((skill) => skill.id === 'typescript');

    expect(typeScript).toBeTruthy();

    const { getByRole } = render(
      <SkillAvatar skill={typeScript!} variant="card" />,
    );
    const avatar = getByRole('img', { name: 'TypeScript' });
    const content = avatar.firstElementChild as HTMLElement;

    expect(avatar.getAttribute('data-skill-avatar-variant')).toBe('card');
    expect(avatar.getAttribute('data-size')).toBe('small');
    expect(content.style.getPropertyValue('--x-width')).toBe('36px');
    expect(content.style.getPropertyValue('--x-height')).toBe('36px');
  });

  it('uses a rounded rectangle mask for the card variant', () => {
    const typeScript = sampleSkills.find((skill) => skill.id === 'typescript');

    expect(typeScript).toBeTruthy();

    const { getByRole } = render(
      <SkillAvatar skill={typeScript!} variant="card" />,
    );
    const avatar = getByRole('img', { name: 'TypeScript' });

    expect(avatar.className).toContain('skill-card-logo-tile');
  });

  it('keeps card variant fallback initials when the logo source is unavailable', () => {
    const skill = {
      ...sampleSkills[0],
      iconSlug: 'missing-logo',
      name: 'Unknown Skill',
    };
    const { getByRole, getByText } = render(
      <SkillAvatar skill={skill} variant="card" />,
    );

    expect(getByRole('img', { name: 'Unknown Skill' })).toBeTruthy();
    expect(getByText('US')).toBeTruthy();
  });
```

- [ ] **Step 2: Run the focused avatar tests and verify failure**

Run:

```bash
pnpm vitest run apps/github.io/src/app/skills/skill-avatar.spec.tsx
```

Expected: fail because `variant` and `data-skill-avatar-variant` are not implemented yet.

- [ ] **Step 3: Implement the `SkillAvatar` variant prop**

Update `apps/github.io/src/app/skills/skill-avatar.tsx` to import StyleX radius tokens and support the new variant:

```tsx
import * as stylex from '@stylexjs/stylex';
import { Avatar } from '@astryxdesign/core/Avatar';
import { radiusVars } from '@astryxdesign/core/theme/tokens.stylex';
```

Add the variant type and prop:

```tsx
export type SkillAvatarVariant = 'list' | 'card';

interface SkillAvatarProps {
  skill: Skill;
  variant?: SkillAvatarVariant;
}
```

Add card styles near the existing helper functions:

```tsx
const styles = stylex.create({
  cardTile: {
    borderRadius: radiusVars['--radius-element'],
    overflow: 'hidden',
  },
});
```

Update the component:

```tsx
export function SkillAvatar({ skill, variant = 'list' }: SkillAvatarProps) {
  const isCard = variant === 'card';

  return (
    <Avatar
      className={isCard ? 'flex-none skill-card-logo-tile' : 'flex-none'}
      data-skill-avatar-variant={variant}
      name={skill.name}
      size={isCard ? 'small' : 'xsmall'}
      src={skillAvatarPresentation(skill.iconSlug)}
      xstyle={isCard && styles.cardTile}
    />
  );
}
```

If TypeScript rejects `data-skill-avatar-variant` because Astryx `AvatarProps` does not include arbitrary data attributes, replace that line with this local prop spread:

```tsx
      {...({ 'data-skill-avatar-variant': variant } as {
        'data-skill-avatar-variant': SkillAvatarVariant;
      })}
```

- [ ] **Step 4: Run the focused avatar tests and verify pass**

Run:

```bash
pnpm vitest run apps/github.io/src/app/skills/skill-avatar.spec.tsx
```

Expected: pass.

- [ ] **Step 5: Add Storybook examples for the card avatar**

Append these stories to `apps/github.io/src/app/skills/skill-avatar.stories.tsx`:

```tsx
export const CardLogoTile: Story = {
  args: {
    skill: sampleSkills[0],
    variant: 'card',
  },
};

export const CardInitialsFallback: Story = {
  args: {
    skill: {
      ...sampleSkills[0],
      iconSlug: 'missing-logo',
      name: 'Unknown Skill',
    },
    variant: 'card',
  },
};
```

- [ ] **Step 6: Run avatar tests and TypeScript-aware project tests**

Run:

```bash
pnpm vitest run apps/github.io/src/app/skills/skill-avatar.spec.tsx
pnpm nx test github.io --skip-nx-cache
```

Expected: both commands pass.

- [ ] **Step 7: Commit Task 1**

Inspect:

```bash
git diff -- apps/github.io/src/app/skills/skill-avatar.tsx apps/github.io/src/app/skills/skill-avatar.spec.tsx apps/github.io/src/app/skills/skill-avatar.stories.tsx
git status --short
```

Commit:

```bash
git add apps/github.io/src/app/skills/skill-avatar.tsx apps/github.io/src/app/skills/skill-avatar.spec.tsx apps/github.io/src/app/skills/skill-avatar.stories.tsx
git commit -m "feat(github.io): add skill avatar card variant"
```

---

### Task 2: Render Card Avatar In `SkillCard`

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-card.tsx`
- Modify: `apps/github.io/src/app/skills/skill-card.spec.tsx`
- Modify: `apps/github.io/src/app/skills/skill-card.stories.tsx`

**Interfaces:**
- Consumes: `SkillAvatar({ skill, variant = 'list' }: SkillAvatarProps)` from Task 1.
- Produces: `SkillCard` header structure with `data-testid="skill-card-header"` and `<SkillAvatar skill={skill} variant="card" />`.

- [ ] **Step 1: Add failing tests for card logo placement**

Add these tests inside `describe('SkillCard', () => { ... })` in `apps/github.io/src/app/skills/skill-card.spec.tsx`:

```tsx
  it('renders the skill logo before the title in the card header', () => {
    const { getByRole, getByTestId } = render(<SkillCard skill={baseSkill} />);

    const logo = getByRole('img', { name: 'Kubernetes' });
    const title = getByRole('heading', { name: 'Kubernetes', level: 3 });
    const header = getByTestId('skill-card-header');

    expect(header.contains(logo)).toBe(true);
    expect(header.contains(title)).toBe(true);
    expect(logo.compareDocumentPosition(title)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('uses the card avatar variant for the SkillCard logo', () => {
    const { getByRole } = render(<SkillCard skill={baseSkill} />);

    expect(
      getByRole('img', { name: 'Kubernetes' }).getAttribute(
        'data-skill-avatar-variant',
      ),
    ).toBe('card');
  });
```

- [ ] **Step 2: Run focused card tests and verify failure**

Run:

```bash
pnpm vitest run apps/github.io/src/app/skills/skill-card.spec.tsx
```

Expected: fail because `SkillCard` does not render the logo/header test id yet.

- [ ] **Step 3: Render the card avatar beside the title/rating stack**

Update `apps/github.io/src/app/skills/skill-card.tsx` to import `SkillAvatar`:

```tsx
import { SkillAvatar } from './skill-avatar';
```

Replace the current title/description `VStack` block:

```tsx
            <VStack gap={2} hAlign="start">
              <VStack
                gap={0.5}
                hAlign="start"
                data-testid="skill-card-title-rating"
              >
                <Heading id={titleId} level={3}>
                  {skill.name}
                </Heading>
                <SkillRating level={skill.level} />
              </VStack>
              <Text type="body" color="secondary" as="p">
                {skill.description}
              </Text>
            </VStack>
```

with:

```tsx
            <VStack gap={2} hAlign="start">
              <HStack
                gap={2}
                vAlign="start"
                data-testid="skill-card-header"
              >
                <SkillAvatar skill={skill} variant="card" />
                <VStack
                  gap={0.5}
                  hAlign="start"
                  data-testid="skill-card-title-rating"
                >
                  <Heading id={titleId} level={3}>
                    {skill.name}
                  </Heading>
                  <SkillRating level={skill.level} />
                </VStack>
              </HStack>
              <Text type="body" color="secondary" as="p">
                {skill.description}
              </Text>
            </VStack>
```

Do not move category rendering. Categories still appear above this header only for `variant="default"`.

- [ ] **Step 4: Run focused card tests and verify pass**

Run:

```bash
pnpm vitest run apps/github.io/src/app/skills/skill-card.spec.tsx
```

Expected: pass.

- [ ] **Step 5: Update SkillCard stories for visual review**

In `apps/github.io/src/app/skills/skill-card.stories.tsx`, keep existing stories and add a compact full-width mobile card story:

```tsx
export const CompactFullWidth: Story = {
  args: {
    isFullWidth: true,
    skill: typeScript,
    variant: 'compact',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
```

- [ ] **Step 6: Run focused and project checks**

Run:

```bash
pnpm vitest run apps/github.io/src/app/skills/skill-avatar.spec.tsx apps/github.io/src/app/skills/skill-card.spec.tsx
pnpm nx test github.io --skip-nx-cache
pnpm nx lint github.io --skip-nx-cache
pnpm nx build github.io --skip-nx-cache
git diff --check
```

Expected:

- Vitest commands pass.
- Nx test passes.
- Nx lint exits 0. Existing warning-only output is acceptable if no new errors are introduced.
- Nx build exits 0. Existing Lightning CSS warnings for Tailwind/StyleX directives are acceptable if no new errors are introduced.
- `git diff --check` prints no output.

- [ ] **Step 7: Run Storybook for iPad visual review**

If no Storybook session is already running on the Tailscale host, get the host IP:

```bash
tailscale ip -4
```

Run Storybook bound to that IP:

```bash
pnpm nx storybook github.io -- --host 100.113.57.51 --port 6006
```

Replace `100.113.57.51` with the current `tailscale ip -4` output if it has changed.

Expected: Storybook reports a network URL. Use that URL from iPad, for example:

```text
http://100.113.57.51:6006/
```

Inspect:

- `GitHub.io/Skills/Skill Card/Compact Full Width`
- `GitHub.io/Skills/Mobile Skills Page`

- [ ] **Step 8: Commit Task 2**

Inspect:

```bash
git diff -- apps/github.io/src/app/skills/skill-card.tsx apps/github.io/src/app/skills/skill-card.spec.tsx apps/github.io/src/app/skills/skill-card.stories.tsx
git status --short
```

Commit:

```bash
git add apps/github.io/src/app/skills/skill-card.tsx apps/github.io/src/app/skills/skill-card.spec.tsx apps/github.io/src/app/skills/skill-card.stories.tsx
git commit -m "feat(github.io): show logos on skill cards"
```

---

## Final Verification

After both tasks are committed, run:

```bash
pnpm nx test github.io --skip-nx-cache
pnpm nx lint github.io --skip-nx-cache
pnpm nx build github.io --skip-nx-cache
git status --short --branch
```

Expected:

- Test, lint, and build exit 0.
- The branch contains the design commit, plan commit, and implementation commits.
- No unrelated files are staged or modified in the implementation worktree.
