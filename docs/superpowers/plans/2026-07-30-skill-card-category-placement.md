# Skill Card Category Placement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render multiple compact skill category badges above each `SkillCard` title and align the card title/description typography with Astryx guidance.

**Architecture:** The `Skill` model changes from one `category` to readonly `categories`, and all category-aware consumers read from that array. `SkillCard` remains the owner of card structure while `SkillCategory` remains the owner of badge rendering and variant selection. Search, filtering, list rows, stories, and tests are updated in the same feature branch so no single-category behavior remains.

**Tech Stack:** React 19, TypeScript, Astryx `Card`, `HStack`, `VStack`, `Heading`, `Text`, existing Astryx `Badge`-based `SkillCategory`, StyleX, Vitest, Testing Library, Nx, pnpm, Storybook.

## Global Constraints

- Render every skill category at the top of the card's identity block, immediately before the skill heading.
- Category badges remain compact and wrap naturally instead of stretching to the card width.
- Use Astryx `Heading` and `Text` components for the title and description.
- The skill name remains the heading referenced by `aria-labelledby` on the card article.
- Use `Heading level={4} accessibilityLevel={3}` for compact visual scale while preserving the existing accessible outline.
- Certification citations continue to render only at the bottom when present.
- Keep `SkillCategory` responsible for Astryx `Badge` variant selection.
- Keep `SkillCard` responsible only for card structure and ordering.
- A skill matches a category filter when any of its categories matches.
- All skill categories participate in searchable text.
- Do not change carousel behavior beyond the natural card content update.
- Before using or modifying an Astryx component, inspect the available official Astryx CLI topics or component source rather than inventing props.
- Use `HStack wrap="wrap"` for wrapping badge rows; `wrap` is not a boolean prop.

---

## File Structure

- Modify: `apps/github.io/src/app/skills/skill-list.types.ts`
  - Responsibility: defines skill category constants, the `SkillCategory` union, and the `Skill` data contract.
- Modify: `apps/github.io/src/app/skills/skill-list.data.ts`
  - Responsibility: sample skill data used by the app, stories, and tests.
- Modify: `apps/github.io/src/app/skills/skill-search.tsx`
  - Responsibility: category-aware search configuration, free-text matching, and structured filter matching.
- Modify: `apps/github.io/src/app/skills/skill-search.spec.tsx`
  - Responsibility: focused search and category filter behavior tests.
- Modify: `apps/github.io/src/app/skills/skill-list-item.tsx`
  - Responsibility: compact row rendering for one skill in `SkillList`.
- Modify: `apps/github.io/src/app/skills/skill-list.stories.tsx`
  - Responsibility: Storybook states for the full list, including filtered infrastructure results.
- Modify: `apps/github.io/src/app/skills/skill-card.tsx`
  - Responsibility: Astryx card, semantic article, identity block, category badge row, title, description, and optional certification citation list.
- Modify: `apps/github.io/src/app/skills/skill-card.spec.tsx`
  - Responsibility: focused card rendering tests for categories, accessible title target, description, card height contract, and certification citation behavior.
- Read: `apps/github.io/src/app/skills/skill-category.tsx`
  - Responsibility: existing category badge component and deterministic Astryx `Badge` variant selection.
- Read: `node_modules/@astryxdesign/core/src/HStack/HStack.tsx`
  - Responsibility: confirms `HStack` forwards `wrap` to `Stack`.
- Read: `node_modules/@astryxdesign/core/src/Heading/Heading.tsx`
  - Responsibility: confirms `Heading level` and `accessibilityLevel` props.
- Read: `node_modules/@astryxdesign/core/src/Text/Text.tsx`
  - Responsibility: confirms `Text type="supporting"` and rendering props.

---

### Task 1: Migrate Skill Category Data And Search Behavior

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-list.types.ts`
- Modify: `apps/github.io/src/app/skills/skill-list.data.ts`
- Modify: `apps/github.io/src/app/skills/skill-search.tsx`
- Modify: `apps/github.io/src/app/skills/skill-search.spec.tsx`
- Modify: `apps/github.io/src/app/skills/skill-list-item.tsx`
- Modify: `apps/github.io/src/app/skills/skill-list.stories.tsx`

**Interfaces:**
- Consumes: `SkillCategory` union from `skill-list.types.ts`
- Produces: `Skill` with `categories: readonly SkillCategory[]`
- Produces: `skillMatchesQuery(skill: Skill, query: string): boolean`
- Produces: `skillMatchesFilters(skill: Skill, filters: ReadonlyArray<PowerSearchFilter>): boolean`
- Produces: category-aware row and story behavior that reads `skill.categories`

- [ ] **Step 1: Check the current category references**

Run:

```bash
rg "skill\\.category|category:|Skill\\['category'\\]" apps/github.io/src/app/skills -n
```

Expected: output lists current single-category references in types, data, search, list item, stories, card, and card tests. This is the migration checklist.

- [ ] **Step 2: Update the `Skill` type**

In `apps/github.io/src/app/skills/skill-list.types.ts`, change the `Skill` interface from:

```ts
  category: SkillCategory;
```

to:

```ts
  categories: readonly SkillCategory[];
```

- [ ] **Step 3: Migrate sample skills to `categories`**

In `apps/github.io/src/app/skills/skill-list.data.ts`, replace each `category: '...'` property with `categories: ['...']`.

Give representative multi-category coverage to skills that naturally fit more than one category:

```ts
{
  id: 'kubernetes',
  name: 'Kubernetes',
  description:
    'Container orchestration for deploying, scaling, and operating cloud-native workloads.',
  categories: ['Container', 'Cloud'],
  level: 4,
  iconSlug: 'kubernetes',
  keywords: ['containers', 'orchestration', 'platform', 'cloud native'],
  certifications: [
    // keep existing certifications unchanged
  ],
}
```

Use these exact category arrays for the other sample skills:

```ts
typescript: ['Language']
react: ['Framework']
nx: ['Build', 'Tooling']
aws: ['Cloud']
terraform: ['IaC', 'Cloud']
docker: ['Container', 'Runtime']
github-actions: ['CI/CD']
storybook: ['Design System', 'Testing']
```

- [ ] **Step 4: Write failing search tests for category arrays**

In `apps/github.io/src/app/skills/skill-search.spec.tsx`, update the first test name and expectations:

```tsx
  it('matches by name, any category, and keyword', () => {
    const kubernetes = sampleSkills.find((skill) => skill.id === 'kubernetes');
    const terraform = sampleSkills.find((skill) => skill.id === 'terraform');

    expect(kubernetes).toBeTruthy();
    expect(terraform).toBeTruthy();
    expect(skillMatchesQuery(kubernetes!, 'kubernetes')).toBe(true);
    expect(skillMatchesQuery(kubernetes!, 'Cloud')).toBe(true);
    expect(skillMatchesQuery(terraform!, 'IaC')).toBe(true);
    expect(skillMatchesQuery(terraform!, 'provisioning')).toBe(true);
    expect(skillMatchesQuery(terraform!, 'storybook')).toBe(false);
  });
```

Add this test in `describe('structured category filtering', ...)`:

```tsx
  it('matches a category filter against any skill category', () => {
    const kubernetes = sampleSkills.find((skill) => skill.id === 'kubernetes');
    const filters = [
      {
        field: 'category',
        operator: 'is',
        value: { type: 'enum' as const, value: 'Cloud' },
      },
    ];

    expect(kubernetes).toBeTruthy();
    expect(skillMatchesFilters(kubernetes!, filters)).toBe(true);
  });
```

- [ ] **Step 5: Run the focused search tests and verify they fail**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/skill-search.spec.tsx --reporter=verbose
```

Expected: FAIL because `skillMatchesQuery` and `skillMatchesFilters` still read `skill.category`.

- [ ] **Step 6: Update search implementation**

In `apps/github.io/src/app/skills/skill-search.tsx`, change the searchable fields from:

```ts
  return [skill.name, skill.category, ...skill.keywords].some((value) =>
    value.toLowerCase().includes(normalizedQuery),
  );
```

to:

```ts
  return [skill.name, ...skill.categories, ...skill.keywords].some((value) =>
    value.toLowerCase().includes(normalizedQuery),
  );
```

Change the category filter condition from:

```ts
      categoryFilters.some((filter) => skill.category === filter.value.value))
```

to:

```ts
      categoryFilters.some((filter) =>
        skill.categories.includes(filter.value.value as SkillCategory),
      ))
```

Add `SkillCategory` to the type import at the top of `skill-search.tsx`:

```ts
import { skillCategories, type Skill, type SkillCategory } from './skill-list.types';
```

- [ ] **Step 7: Update list row category rendering**

In `apps/github.io/src/app/skills/skill-list-item.tsx`, replace:

```tsx
          <SkillCategory name={skill.category} />
```

with:

```tsx
          {skill.categories.map((category) => (
            <SkillCategory key={category} name={category} />
          ))}
```

Keep `SkillRating` in the same `HStack` after the category badges.

- [ ] **Step 8: Update the focused list story filter**

In `apps/github.io/src/app/skills/skill-list.stories.tsx`, replace:

```ts
      ['Cloud', 'Container', 'CI/CD', 'IaC'].includes(skill.category),
```

with:

```ts
      skill.categories.some((category) =>
        ['Cloud', 'Container', 'CI/CD', 'IaC'].includes(category),
      ),
```

- [ ] **Step 9: Confirm no stale single-category references remain outside `SkillCard`**

Run:

```bash
rg "skill\\.category|category:" apps/github.io/src/app/skills -n
```

Expected: output may still include `skill-card.tsx`, `skill-card.spec.tsx`, or intentional `skillCategories` declarations, but it should not include `skill-search.tsx`, `skill-list-item.tsx`, `skill-list.stories.tsx`, or `skill-list.data.ts` using single `category`.

- [ ] **Step 10: Run the focused search tests and verify they pass**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/skill-search.spec.tsx --reporter=verbose
```

Expected: PASS for all `skill-search.spec.tsx` tests.

- [ ] **Step 11: Commit the data/search migration**

Stage explicit paths only:

```bash
git add apps/github.io/src/app/skills/skill-list.types.ts apps/github.io/src/app/skills/skill-list.data.ts apps/github.io/src/app/skills/skill-search.tsx apps/github.io/src/app/skills/skill-search.spec.tsx apps/github.io/src/app/skills/skill-list-item.tsx apps/github.io/src/app/skills/skill-list.stories.tsx
git commit -m "feat(github.io): support multiple skill categories"
```

Expected: a local conventional commit containing only the type/data/search/list migration.

---

### Task 2: Render Compact Category Badges And Astryx Typography In SkillCard

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-card.tsx`
- Modify: `apps/github.io/src/app/skills/skill-card.spec.tsx`
- Read: `apps/github.io/src/app/skills/skill-category.tsx`
- Read: `node_modules/@astryxdesign/core/src/HStack/HStack.tsx`
- Read: `node_modules/@astryxdesign/core/src/Heading/Heading.tsx`
- Read: `node_modules/@astryxdesign/core/src/Text/Text.tsx`

**Interfaces:**
- Consumes: `SkillCard({ skill }: SkillCardProps): ReactElement`
- Consumes: `Skill['categories']`
- Consumes: `SkillCategory({ name }: { name: SkillCategoryName })`
- Produces: `SkillCard` markup where every category text renders before the heading and the heading remains the `aria-labelledby` target.
- Produces: card title rendered with `Heading level={4} accessibilityLevel={3}`
- Produces: card description rendered with `Text type="supporting" as="p"`

- [ ] **Step 1: Check Astryx typography and stack APIs**

Run:

```bash
pnpm exec astryx docs typography
sed -n '1,160p' node_modules/@astryxdesign/core/src/HStack/HStack.tsx
sed -n '1,180p' node_modules/@astryxdesign/core/src/Heading/Heading.tsx
sed -n '1,180p' node_modules/@astryxdesign/core/src/Text/Text.tsx
```

Expected: docs recommend `Heading` and `Text`; `HStack` accepts `wrap` through `Stack`; `Heading` supports `level` and `accessibilityLevel`; `Text` supports `type` and `as`.

- [ ] **Step 2: Update the `SkillCard` base test fixture**

In `apps/github.io/src/app/skills/skill-card.spec.tsx`, change:

```ts
  category: 'Container',
```

to:

```ts
  categories: ['Container', 'Cloud'],
```

- [ ] **Step 3: Update the category rendering test**

Replace the existing category order test with:

```tsx
  it('renders every skill category before the skill title', () => {
    const { getByText, getByRole } = render(<SkillCard skill={baseSkill} />);

    const containerCategory = getByText('Container');
    const cloudCategory = getByText('Cloud');
    const title = getByRole('heading', { name: 'Kubernetes' });

    expect(containerCategory.compareDocumentPosition(title)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(cloudCategory.compareDocumentPosition(title)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
```

- [ ] **Step 4: Add a typography/accessibility expectation**

Add this test after the title test:

```tsx
  it('keeps the compact title as the accessible card label', () => {
    const { getByRole, getByTestId } = render(<SkillCard skill={baseSkill} />);

    const title = getByRole('heading', { name: 'Kubernetes', level: 3 });
    const card = getByTestId('skill-card');

    expect(card.getAttribute('aria-labelledby')).toBe(title.id);
  });
```

This verifies the `accessibilityLevel={3}` behavior without coupling to Astryx class names.

- [ ] **Step 5: Run focused card tests and verify they fail**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/skill-card.spec.tsx --reporter=verbose
```

Expected: FAIL because `SkillCard` still reads `skill.category` and still renders raw typography elements.

- [ ] **Step 6: Update imports in `SkillCard`**

In `apps/github.io/src/app/skills/skill-card.tsx`, replace:

```ts
import { VStack } from '@astryxdesign/core/Layout';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';
```

with:

```ts
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
```

- [ ] **Step 7: Remove manual title and description type styles**

In `apps/github.io/src/app/skills/skill-card.tsx`, delete the `title` and `description` entries from `styles`. Keep `root`, `citationList`, and `citationItem`.

- [ ] **Step 8: Render wrapped category badges above the title**

In `apps/github.io/src/app/skills/skill-card.tsx`, replace the inner identity block with:

```tsx
          <VStack gap={1} hAlign="start">
            <HStack gap={1} wrap="wrap">
              {skill.categories.map((category) => (
                <SkillCategory key={category} name={category} />
              ))}
            </HStack>
            <Heading id={titleId} level={4} accessibilityLevel={3}>
              {skill.name}
            </Heading>
            <Text type="supporting" as="p">
              {skill.description}
            </Text>
          </VStack>
```

Do not add local category width styles. The compact badge width should come from Astryx `Badge` plus start-aligned/wrapping layout.

- [ ] **Step 9: Run focused card tests and verify they pass**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/skill-card.spec.tsx --reporter=verbose
```

Expected: PASS for all `SkillCard` tests, including multiple category order and accessible label tests.

- [ ] **Step 10: Confirm no manual text-size styling remains in `SkillCard`**

Run:

```bash
rg "typeScaleVars|fontSize|lineHeight|<h3|<p " apps/github.io/src/app/skills/skill-card.tsx
```

Expected: no output.

- [ ] **Step 11: Commit the card rendering update**

Stage explicit paths only:

```bash
git add apps/github.io/src/app/skills/skill-card.tsx apps/github.io/src/app/skills/skill-card.spec.tsx
git commit -m "feat(github.io): render skill card category badges"
```

Expected: a local conventional commit containing only the card rendering and card test changes.

---

### Task 3: Verify App Behavior And Storybook Visuals

**Files:**
- Read: `apps/github.io/project.json`
- Read: `apps/github.io/src/app/skills/skill-card.stories.tsx`
- Read: `apps/github.io/src/app/skills/skill-list.stories.tsx`
- Modify only if verification finds a defect directly caused by Tasks 1 or 2.

**Interfaces:**
- Consumes: committed results from Task 1 and Task 2.
- Produces: verified branch with no stale single-category references, passing focused tests, and Storybook visual review notes.

- [ ] **Step 1: Check final category references**

Run:

```bash
rg "skill\\.category|category:" apps/github.io/src/app/skills -n
```

Expected: no `skill.category` references. Remaining `category:` output should be limited to PowerSearch filter object literals or `skillCategories` declarations, not the old `Skill` property.

- [ ] **Step 2: Run focused tests**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/skill-card.spec.tsx src/app/skills/skill-search.spec.tsx --reporter=verbose
```

Expected: PASS for both focused spec files.

- [ ] **Step 3: Run project checks**

Run:

```bash
pnpm nx lint github.io
pnpm nx test github.io
```

Expected: both commands pass. If a command fails, inspect the first relevant failure, fix only defects caused by this feature, and rerun the failing command.

- [ ] **Step 4: Start or reuse Storybook**

If Storybook is not already running, run from `apps/github.io`:

```bash
pnpm exec storybook dev -c .storybook -p 6006 --host 0.0.0.0 --no-open
```

Expected: Storybook serves at `http://localhost:6006/` and the Tailscale-accessible host URL if the machine is on Tailscale.

- [ ] **Step 5: Visually inspect card stories**

Open these stories:

```text
http://localhost:6006/?path=/story/github-io-skills-skill-card--without-certifications
http://localhost:6006/?path=/story/github-io-skills-skill-card--with-multiple-certifications
```

Expected: categories appear above the title, badges are compact, multiple badges wrap naturally, title uses compact Astryx heading scale, description is supporting text, and certifications remain below the identity block.

- [ ] **Step 6: Visually inspect list story**

Open:

```text
http://localhost:6006/?path=/story/github-io-skills-skill-list--focused-results
```

Expected: focused infrastructure results include skills that match any category, including multi-category `Kubernetes` and `Terraform`; list row category badges remain compact beside the rating.

- [ ] **Step 7: Inspect final diff**

Run:

```bash
git diff -- apps/github.io/src/app/skills
```

Expected: no unstaged diff after Task 1 and Task 2 commits. If fixes were required during verification, the diff should be limited to files listed in this plan.

- [ ] **Step 8: Commit verification fixes only if needed**

If Step 3, Step 5, or Step 6 required code fixes, stage explicit paths and commit:

```bash
git add apps/github.io/src/app/skills/skill-list.types.ts apps/github.io/src/app/skills/skill-list.data.ts apps/github.io/src/app/skills/skill-search.tsx apps/github.io/src/app/skills/skill-search.spec.tsx apps/github.io/src/app/skills/skill-list-item.tsx apps/github.io/src/app/skills/skill-list.stories.tsx apps/github.io/src/app/skills/skill-card.tsx apps/github.io/src/app/skills/skill-card.spec.tsx
git commit -m "fix(github.io): polish skill category rendering"
```

Expected: commit exists only when verification required a feature-scoped fix. If no fixes were needed, do not create an empty commit.
