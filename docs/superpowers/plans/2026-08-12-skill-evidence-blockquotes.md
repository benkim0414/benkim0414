# Skill Evidence Blockquotes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the separate skill-experience summary with one Astryx blockquote for every selected experience evidence item.

**Architecture:** Remove `experienceSummary` from the enrichment and resolved-view contracts so the detail page has one source of experience content. Let `SkillExperienceList` own the evidence presentation by pairing each Astryx level-3 heading with an Astryx `Blockquote`, while `SkillDetailPage` renders the `In practice` section only when resolved evidence exists.

**Tech Stack:** React 19, TypeScript, Astryx 0.1.4, StyleX, Nx/Vite, Vitest, Testing Library, Storybook 10.

## Global Constraints

- Work only in the linked worktree at `/home/benkim0414/workspace/benkim0414/.worktrees/skill-detail-page` on branch `feat/skill-detail-page`.
- Use Astryx for every available UI primitive; import `Blockquote` from `@astryxdesign/core/Blockquote` and `Heading` from `@astryxdesign/core/Heading`.
- The experience section heading remains exactly `In practice`.
- Remove the separate `experienceSummary` field and copy from the detail record, resolved model, resolver, and page.
- Render every selected evidence title as an Astryx level-3 `Heading` and every evidence summary as an Astryx `Blockquote`.
- Do not pass the optional `Blockquote` `cite` prop and do not add custom blockquote styles.
- Remove evidence dividers; use the existing Astryx layout spacing to separate evidence items.
- Preserve semantic list/list-item markup, explicit evidence order, public/non-sensitive validation, duplicate-record rejection, projects, certifications, routing, and not-found behavior.
- Do not modify skill cards, list items, command-palette behavior, or the mobile skills page.
- Stage explicit paths only and commit with a conventional subject.

## File Structure

### Modify

- `apps/github.io/src/app/skills/skill-detail.types.ts` — remove the duplicated summary from enrichment and resolved contracts.
- `apps/github.io/src/app/skills/skill-detail.data.ts` — remove the Kubernetes summary copy.
- `apps/github.io/src/app/skills/skill-detail-resolver.ts` — resolve evidence and projects without a summary property.
- `apps/github.io/src/app/skills/skill-detail-resolver.spec.ts` — verify basic and enriched results omit the removed property.
- `apps/github.io/src/app/skills/skill-experience-list.tsx` — replace divided text rows with Astryx heading/blockquotes.
- `apps/github.io/src/app/skills/skill-experience-list.spec.tsx` — verify one semantic blockquote per evidence item and no separators.
- `apps/github.io/src/app/skills/skill-detail-page.tsx` — show `In practice` based on resolved evidence and remove the standalone blockquote.
- `apps/github.io/src/app/skills/skill-detail-page.spec.tsx` — verify the evidence blockquotes and absence of duplicate summary content.

### Explicitly untouched

- `apps/github.io/src/app/app.tsx`
- `apps/github.io/src/app/app.spec.tsx`
- `apps/github.io/src/app/skills/skill-detail-route.tsx`
- `apps/github.io/src/app/skills/skill-detail-page.stories.tsx`
- `apps/github.io/src/app/skills/mobile-skills-page.tsx`
- `apps/github.io/src/app/skills/skill-card.tsx`
- `apps/github.io/src/app/skills/skill-list-item.tsx`
- `apps/github.io/src/app/skills/skill-search.tsx`

---

### Task 1: Render all experience evidence as Astryx blockquotes

**Files:**

- Modify: `apps/github.io/src/app/skills/skill-detail.types.ts`
- Modify: `apps/github.io/src/app/skills/skill-detail.data.ts`
- Modify: `apps/github.io/src/app/skills/skill-detail-resolver.ts`
- Test: `apps/github.io/src/app/skills/skill-detail-resolver.spec.ts`
- Modify: `apps/github.io/src/app/skills/skill-experience-list.tsx`
- Test: `apps/github.io/src/app/skills/skill-experience-list.spec.tsx`
- Modify: `apps/github.io/src/app/skills/skill-detail-page.tsx`
- Test: `apps/github.io/src/app/skills/skill-detail-page.spec.tsx`

**Interfaces:**

- Consumes: existing `CapabilityEvidenceItem`, `Project`, `Skill`, `Blockquote`, `Heading`, `VStack`, and `resolveSkillDetail(skillId, sources)` behavior.
- Produces: `SkillDetailRecord` with `skillId`, `experienceEvidenceIds`, and `projectIds`; `ResolvedSkillDetail` with `skill`, `experienceEvidence`, and `projects`; unchanged `SkillDetailPage({ detail })` and `SkillExperienceList({ evidence })` component APIs.

- [ ] **Step 1: Write failing resolver and rendering assertions**

In `skill-detail-resolver.spec.ts`, update the basic-skill test to narrow the result and require the removed property to be absent:

```ts
expect(result.status).toBe('found');
if (result.status !== 'found') return;

expect(result.value.experienceEvidence).toEqual([]);
expect(result.value.projects).toEqual([]);
expect(result.value).not.toHaveProperty('experienceSummary');
```

Also add this assertion to the enriched Kubernetes test:

```ts
expect(result.value).not.toHaveProperty('experienceSummary');
```

In `skill-experience-list.spec.tsx`, rename the test to `renders every evidence summary as an Astryx blockquote` and replace the summary-only checks with:

```tsx
const { container, getAllByRole, getByRole, queryAllByRole } = render(
  <SkillExperienceList evidence={experienceFixtures} />,
);

expect(getByRole('list', { name: 'Supporting experience' })).toBeTruthy();
expect(getAllByRole('listitem')).toHaveLength(2);
expect(getAllByRole('heading', { level: 3 })).toHaveLength(2);

const blockquotes = [...container.querySelectorAll('blockquote')];

expect(blockquotes).toHaveLength(2);
expect(blockquotes.map(({ textContent }) => textContent)).toEqual(
  experienceFixtures.map(({ summary }) => summary),
);
expect(queryAllByRole('separator')).toHaveLength(0);
```

In `skill-detail-page.spec.tsx`, replace the standalone summary assertion with:

```tsx
const evidenceBlockquotes = [...container.querySelectorAll('blockquote')];

expect(evidenceBlockquotes).toHaveLength(detail.experienceEvidence.length);
expect(evidenceBlockquotes.map(({ textContent }) => textContent)).toEqual(
  detail.experienceEvidence.map(({ summary }) => summary),
);
```

- [ ] **Step 2: Run focused tests and verify the new expectations fail**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/skill-detail-resolver.spec.ts src/app/skills/skill-experience-list.spec.tsx src/app/skills/skill-detail-page.spec.tsx
```

Expected: FAIL because resolved models still contain `experienceSummary`, the experience list renders no blockquotes and includes a divider, and the page renders one standalone blockquote instead of one per evidence item.

- [ ] **Step 3: Remove the duplicated experience summary contract and data**

Change the contracts in `skill-detail.types.ts` to:

```ts
export interface SkillDetailRecord {
  readonly skillId: string;
  readonly experienceEvidenceIds: readonly string[];
  readonly projectIds: readonly string[];
}

export interface ResolvedSkillDetail {
  readonly skill: Skill;
  readonly experienceEvidence: readonly CapabilityEvidenceItem[];
  readonly projects: readonly Project[];
}
```

Delete `experienceSummary` and its string value from the Kubernetes record in `skill-detail.data.ts`.

In `skill-detail-resolver.ts`, remove `experienceSummary: undefined` from the basic result and `experienceSummary: record.experienceSummary` from the enriched result. Preserve the existing duplicate-record, missing-reference, public/non-sensitive, and ordering logic unchanged.

- [ ] **Step 4: Render each evidence item with Astryx components**

In `skill-experience-list.tsx`:

```tsx
import { Blockquote } from '@astryxdesign/core/Blockquote';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/Layout';
```

Remove the `Divider` and `Text` imports. Render each item without the array index or divider:

```tsx
{evidence.map((item) => (
  <li key={item.id} {...stylex.props(styles.item)}>
    <VStack gap={1} paddingBlock={3}>
      <Heading level={3}>{item.title}</Heading>
      <Blockquote>{item.summary}</Blockquote>
    </VStack>
  </li>
))}
```

Do not pass `cite` and do not add blockquote-specific StyleX.

In `skill-detail-page.tsx`, remove the `Blockquote` import, replace the experience-section condition with `detail.experienceEvidence.length > 0`, and remove the standalone `<Blockquote>{detail.experienceSummary}</Blockquote>`. Keep `In practice` and `<SkillExperienceList evidence={detail.experienceEvidence} />`.

- [ ] **Step 5: Run focused tests and verify they pass**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/skill-detail-resolver.spec.ts src/app/skills/skill-experience-list.spec.tsx src/app/skills/skill-detail-page.spec.tsx
```

Expected: all three test files PASS; resolver results omit the summary property, the experience list has one semantic blockquote per evidence item and no separator, and the detail page has no duplicate summary blockquote.

- [ ] **Step 6: Run project verification and visual QA**

Run:

```bash
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx build github.io
pnpm nx build-storybook github.io
```

Expected: all commands exit successfully. Inspect `GitHub.io / Skills / Skill Detail Page / Enriched Kubernetes` at phone `390x844`, iPad `768x1024`, and desktop `1440x1000`. Confirm exactly three blockquotes appear, every blockquote has the Astryx leading border, each heading remains visually grouped with its statement, no dividers or duplicate summary appear, evidence order is unchanged, and no horizontal overflow occurs.

- [ ] **Step 7: Commit the self-contained change**

Inspect and stage only the eight task files:

```bash
git diff -- apps/github.io/src/app/skills/skill-detail.types.ts apps/github.io/src/app/skills/skill-detail.data.ts apps/github.io/src/app/skills/skill-detail-resolver.ts apps/github.io/src/app/skills/skill-detail-resolver.spec.ts apps/github.io/src/app/skills/skill-experience-list.tsx apps/github.io/src/app/skills/skill-experience-list.spec.tsx apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx
git add apps/github.io/src/app/skills/skill-detail.types.ts apps/github.io/src/app/skills/skill-detail.data.ts apps/github.io/src/app/skills/skill-detail-resolver.ts apps/github.io/src/app/skills/skill-detail-resolver.spec.ts apps/github.io/src/app/skills/skill-experience-list.tsx apps/github.io/src/app/skills/skill-experience-list.spec.tsx apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx
git diff --cached
git commit -m "feat(github.io): present skill evidence as blockquotes"
```

Expected: one conventional commit containing only the approved evidence-model and presentation changes.
