# Skill Card Rating Placement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the existing `SkillRating` display to `SkillCard` directly under the skill heading and before the description.

**Architecture:** `SkillCard` remains the composition boundary for card field ordering, while `SkillRating` remains the owner of star rendering, compact mobile behavior, and accessible rating text. The implementation only imports `SkillRating`, places it in the existing heading/description stack, and updates focused tests for the required order.

**Tech Stack:** React function components, TypeScript, Astryx `Card`/`Heading`/`Text`/`Layout`, StyleX, Vitest, Testing Library, Nx, pnpm.

## Global Constraints

- Keep `SkillRating` as the single owner of star rendering, compact mobile behavior, and accessible rating text.
- Keep `SkillCard` responsible only for ordering the existing skill fields.
- Do not add a new rating variant unless visual review proves the existing component is too large for the card.
- Do not change skill data, rating scale, category placement, search behavior, or certification citation behavior.
- Do not change `SkillRating` props or star icon implementation.
- Do not change the five-point rating scale.
- Do not move categories or certification citations.
- Do not change card width, padding, height, or carousel equal-height behavior.
- Do not add dependencies.
- Before the UI change, re-run the relevant official Astryx docs commands: `pnpm exec astryx docs layout` and `pnpm exec astryx docs typography`.

---

### Task 1: Place SkillRating In SkillCard

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-card.tsx`
- Modify: `apps/github.io/src/app/skills/skill-card.spec.tsx`

**Interfaces:**
- Consumes: `SkillRating(props: { level: Skill['level'] }): JSX.Element` from `apps/github.io/src/app/skills/skill-rating.tsx`
- Consumes: `SkillCard(props: { skill: Skill }): ReactElement`
- Produces: `SkillCard` markup where the order inside the identity stack is `Heading`, `SkillRating`, then description `Text`.

- [ ] **Step 1: Re-check Astryx layout and typography guidance**

Run:

```bash
pnpm exec astryx docs layout
pnpm exec astryx docs typography
```

Expected: both commands print official Astryx guidance successfully. Note in the implementation handoff that `layout` and `typography` were checked.

- [ ] **Step 2: Write the failing SkillCard order test**

In `apps/github.io/src/app/skills/skill-card.spec.tsx`, add this test after the existing description test:

```tsx
  it('renders the skill rating after the title and before the description', () => {
    const { getByRole, getByText } = render(<SkillCard skill={baseSkill} />);

    const title = getByRole('heading', { name: 'Kubernetes' });
    const rating = getByText('4 out of 5');
    const description = getByText(
      'Container orchestration for deploying, scaling, and operating cloud-native workloads.',
    );

    expect(title.compareDocumentPosition(rating)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(rating.compareDocumentPosition(description)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
```

This test uses the existing hidden accessible rating text from `SkillRating` as the stable DOM anchor instead of asserting Heroicons internals from the card test.

- [ ] **Step 3: Run the focused SkillCard test and verify it fails**

Run:

```bash
pnpm nx test github.io --testFile=apps/github.io/src/app/skills/skill-card.spec.tsx
```

Expected: FAIL because `4 out of 5` is not present in `SkillCard` yet.

- [ ] **Step 4: Import SkillRating in SkillCard**

In `apps/github.io/src/app/skills/skill-card.tsx`, add the import beside the other local skill imports:

```tsx
import { SkillRating } from './skill-rating';
```

The local import block should become:

```tsx
import { CertificationCitation } from '../certifications/certification-citation';
import { SkillCategory } from './skill-category';
import { SkillRating } from './skill-rating';
import type { Skill } from './skill-list.types';
```

- [ ] **Step 5: Render SkillRating between Heading and Text**

In `apps/github.io/src/app/skills/skill-card.tsx`, update the inner identity stack from:

```tsx
            <VStack gap={1} hAlign="start">
              <Heading id={titleId} level={4} accessibilityLevel={3}>
                {skill.name}
              </Heading>
              <Text type="supporting" as="p">
                {skill.description}
              </Text>
            </VStack>
```

to:

```tsx
            <VStack gap={1} hAlign="start">
              <Heading id={titleId} level={4} accessibilityLevel={3}>
                {skill.name}
              </Heading>
              <SkillRating level={skill.level} />
              <Text type="supporting" as="p">
                {skill.description}
              </Text>
            </VStack>
```

Do not change the surrounding category `HStack`, outer `VStack` gaps, `Card` padding, citation list, width style, or accessible title relationship.

- [ ] **Step 6: Run focused tests and verify they pass**

Run:

```bash
pnpm nx test github.io --testFile=apps/github.io/src/app/skills/skill-card.spec.tsx
pnpm nx test github.io --testFile=apps/github.io/src/app/skills/skill-rating.spec.tsx
```

Expected: both commands PASS. `SkillCard` verifies composition and ordering; `SkillRating` verifies star/accessibility internals.

- [ ] **Step 7: Run lint**

Run:

```bash
pnpm nx lint github.io
```

Expected: PASS with no new lint errors.

- [ ] **Step 8: Inspect SkillCard visually in Storybook**

Run Storybook using the project command. If the exact Storybook target name is unclear, first run:

```bash
pnpm nx show projects
```

Then run the existing Storybook target for `github.io`, inspect `GitHub.io/Skills/Skill Card`, and check both `WithoutCertifications` and `WithMultipleCertifications` across desktop and mobile card widths.

Expected visual result: categories stay above the title, the rating appears directly under the title, description remains readable below the rating, certifications remain at the bottom, and no text or icons clip or overlap.

- [ ] **Step 9: Commit the implementation**

Inspect the diff:

```bash
git diff
```

Stage only the implementation and test files:

```bash
git add apps/github.io/src/app/skills/skill-card.tsx apps/github.io/src/app/skills/skill-card.spec.tsx
```

Commit:

```bash
git commit -m "feat(github.io): show ratings on skill cards"
```
