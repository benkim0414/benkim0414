# Skill Card Category Placement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render each skill's category at the top of `SkillCard` using the existing `SkillCategory` component.

**Architecture:** `SkillCard` remains the structural owner of the Astryx `Card` and internal `VStack` ordering. `SkillCategory` remains the semantic and visual owner of category badge rendering and Astryx `Badge` variant selection. No data model, carousel, search, filtering, or global styling changes are needed.

**Tech Stack:** React 19, TypeScript, Astryx `Card` and `VStack`, existing Astryx `Badge`-based `SkillCategory`, StyleX, Vitest, Testing Library, Nx, pnpm.

## Global Constraints

- Render `SkillCategory` at the top of the card's identity block, immediately before the skill heading.
- The skill name remains the `h3` referenced by `aria-labelledby` on the card article.
- Certification citations continue to render only at the bottom when present.
- Import and render the existing `SkillCategory` component from `SkillCard`.
- Do not add new category styling to `SkillCard`.
- Keep `SkillCategory` responsible for Astryx `Badge` variant selection.
- Keep `SkillCard` responsible only for card structure and ordering.
- Do not change the `Skill` data model, filtering, search, or carousel behavior.
- Before changing UI, check official Astryx guidance with `pnpm exec astryx docs layout`.
- Before using or modifying an Astryx component, inspect the available official Astryx CLI topics or component source rather than inventing props.

---

## File Structure

- Modify: `apps/github.io/src/app/skills/skill-card.tsx`
  - Responsibility: render the Astryx card, semantic article, identity block, description, and optional certification citation list for one `Skill`.
- Modify: `apps/github.io/src/app/skills/skill-card.spec.tsx`
  - Responsibility: focused rendering tests for `SkillCard` structure, accessible title target, category visibility, description, card height contract, and certification citation behavior.
- Read only: `apps/github.io/src/app/skills/skill-category.tsx`
  - Responsibility: existing category badge component and deterministic Astryx `Badge` variant selection.
- Read only: `apps/github.io/src/app/skills/skill-card.stories.tsx`
  - Responsibility: Storybook visual states for cards with and without certifications.

---

### Task 1: Render Skill Category In SkillCard Identity Block

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-card.tsx`
- Modify: `apps/github.io/src/app/skills/skill-card.spec.tsx`
- Read: `apps/github.io/src/app/skills/skill-category.tsx`
- Read: `apps/github.io/src/app/skills/skill-card.stories.tsx`

**Interfaces:**
- Consumes: `SkillCard({ skill }: SkillCardProps): ReactElement`
- Consumes: `SkillCategory({ name }: { name: SkillCategoryName })`
- Consumes: `Skill['category']`
- Produces: `SkillCard` markup where category text renders before the heading and the heading remains the `aria-labelledby` target.

- [ ] **Step 1: Check Astryx layout guidance**

Run:

```bash
pnpm exec astryx docs layout
```

Expected: command prints Astryx layout guidance. Confirm the change still keeps `SkillCard` as a self-contained card and does not introduce nested cards, global CSS, or decorative badge usage beyond the approved category label.

- [ ] **Step 2: Inspect existing `SkillCategory` API**

Run:

```bash
sed -n '1,120p' apps/github.io/src/app/skills/skill-category.tsx
```

Expected: `SkillCategory` accepts `name` and renders an Astryx `Badge`. Use that existing API exactly.

- [ ] **Step 3: Write the failing category rendering test**

In `apps/github.io/src/app/skills/skill-card.spec.tsx`, add this test after the skill description test:

```tsx
  it('renders the skill category before the skill title', () => {
    const { getByText, getByRole } = render(<SkillCard skill={baseSkill} />);

    const category = getByText('Container');
    const title = getByRole('heading', { name: 'Kubernetes' });

    expect(category.compareDocumentPosition(title)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
```

This test verifies visible category rendering and the intended DOM order without coupling to Astryx `Badge` internals.

- [ ] **Step 4: Run the focused test and verify it fails**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-card.spec.tsx
```

Expected: FAIL because `Container` is not rendered by `SkillCard` yet.

- [ ] **Step 5: Import `SkillCategory` into `SkillCard`**

In `apps/github.io/src/app/skills/skill-card.tsx`, add this import below the certification import:

```tsx
import { SkillCategory } from './skill-category';
```

- [ ] **Step 6: Render `SkillCategory` before the heading**

In `apps/github.io/src/app/skills/skill-card.tsx`, update the inner identity `VStack` to:

```tsx
          <VStack gap={1}>
            <SkillCategory name={skill.category} />
            <h3 id={titleId} {...stylex.props(styles.title)}>
              {skill.name}
            </h3>
            <p {...stylex.props(styles.description)}>{skill.description}</p>
          </VStack>
```

Do not add a new wrapper, heading label, local category style, Tailwind class, or global CSS selector.

- [ ] **Step 7: Run the focused test and verify it passes**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-card.spec.tsx
```

Expected: PASS for all `SkillCard` tests, including the new category order test.

- [ ] **Step 8: Run focused app verification**

Run:

```bash
pnpm nx lint github.io
pnpm nx test github.io
```

Expected: both commands pass. If either fails for an unrelated existing issue, capture the exact failing command and first relevant failure line in the implementation notes.

- [ ] **Step 9: Visual review in Storybook**

Run Storybook for `github.io` using the repo's existing Storybook command. If the command is discoverable from `project.json`, use that command. Inspect the existing `GitHub.io/Skills/Skill Card` stories:

- `WithoutCertifications`
- `WithMultipleCertifications`

Expected: the category badge appears before the skill heading, the heading remains readable, the description does not clip, and certification citations still sit below the description.

- [ ] **Step 10: Inspect the final diff**

Run:

```bash
git diff -- apps/github.io/src/app/skills/skill-card.tsx apps/github.io/src/app/skills/skill-card.spec.tsx
```

Expected: the diff is limited to importing/rendering `SkillCategory` and adding the focused category rendering test.

- [ ] **Step 11: Commit the implementation**

Stage explicit paths only:

```bash
git add apps/github.io/src/app/skills/skill-card.tsx apps/github.io/src/app/skills/skill-card.spec.tsx
git commit -m "feat(github.io): show skill category on cards"
```

Expected: a local conventional commit containing only the implementation and test changes.
