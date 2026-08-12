# Skill Experience Blockquote Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present the Kubernetes experience summary as a concise Astryx blockquote under the heading `In practice`.

**Architecture:** Keep the existing detail record and resolved view-model contracts unchanged. Replace only the Kubernetes summary copy and the experience statement's presentation in `SkillDetailPage`, using Astryx `Blockquote` for its semantic markup and built-in visual treatment.

**Tech Stack:** React 19, TypeScript, Astryx 0.1.4, Nx/Vite, Vitest, Testing Library, Storybook 10.

## Global Constraints

- Work only in the linked worktree at `/home/benkim0414/workspace/benkim0414/.worktrees/skill-detail-page` on branch `feat/skill-detail-page`.
- Import `Blockquote` from `@astryxdesign/core/Blockquote`; do not reproduce its styling with custom CSS or StyleX.
- The experience section heading must be exactly `In practice`.
- The Kubernetes statement must be exactly `I've used Kubernetes to operate application platforms, manage GitOps environments with Argo CD, and build reusable Kustomize foundations across professional and homelab projects.`
- Omit the optional Astryx `Blockquote` `cite` prop because this is the portfolio owner's first-person statement.
- Keep the supporting experience rows and all other detail-page sections unchanged.
- Do not modify skill cards, list items, the command palette, or the mobile skills page.
- Stage explicit paths only and use a conventional commit subject.

## File Structure

### Modify

- `apps/github.io/src/app/skills/skill-detail.data.ts` — shorten the Kubernetes experience statement.
- `apps/github.io/src/app/skills/skill-detail-page.tsx` — render the statement with Astryx `Blockquote` under `In practice`.
- `apps/github.io/src/app/skills/skill-detail-page.spec.tsx` — verify the heading, exact copy, and semantic blockquote.
- `apps/github.io/src/app/app.spec.tsx` — update route-level heading coverage.

### Explicitly untouched

- `apps/github.io/src/app/skills/skill-detail.types.ts`
- `apps/github.io/src/app/skills/skill-detail-resolver.ts`
- `apps/github.io/src/app/skills/skill-experience-list.tsx`
- `apps/github.io/src/app/skills/mobile-skills-page.tsx`
- `apps/github.io/src/app/skills/skill-card.tsx`
- `apps/github.io/src/app/skills/skill-list-item.tsx`
- `apps/github.io/src/app/skills/skill-search.tsx`

---

### Task 1: Refine the skill experience statement

**Files:**

- Modify: `apps/github.io/src/app/skills/skill-detail.data.ts`
- Modify: `apps/github.io/src/app/skills/skill-detail-page.tsx`
- Test: `apps/github.io/src/app/skills/skill-detail-page.spec.tsx`
- Test: `apps/github.io/src/app/app.spec.tsx`

**Interfaces:**

- Consumes: `Blockquote({ children, cite?, ...props })` from `@astryxdesign/core/Blockquote` and the existing `ResolvedSkillDetail.experienceSummary` string.
- Produces: the existing `SkillDetailPage({ detail }: SkillDetailPageProps)` API with a revised heading and semantic experience statement; no public type changes.

- [ ] **Step 1: Write the failing semantic and copy assertions**

In `skill-detail-page.spec.tsx`, retain the existing enriched-page assertions, destructure `container`, and add exact checks for the revised section:

```tsx
const { container, getByRole, getByText } = render(
  <SkillDetailPage detail={detail} />,
);

expect(
  getByRole('heading', { level: 2, name: 'In practice' }),
).toBeTruthy();

const experienceStatement = container.querySelector('blockquote');

expect(experienceStatement).toBeTruthy();
expect(experienceStatement?.textContent).toBe(
  "I've used Kubernetes to operate application platforms, manage GitOps environments with Argo CD, and build reusable Kustomize foundations across professional and homelab projects.",
);
```

Replace the old route-level heading assertion in `app.spec.tsx` with:

```tsx
expect(
  getByRole('heading', { level: 2, name: 'In practice' }),
).toBeTruthy();
```

- [ ] **Step 2: Run the focused tests and verify the new expectations fail**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-detail-page.spec.tsx apps/github.io/src/app/app.spec.tsx
```

Expected: FAIL because the page still renders `How I've used Kubernetes`, the old summary copy, and no `blockquote`.

- [ ] **Step 3: Apply the minimal Astryx implementation**

Replace the Kubernetes `experienceSummary` in `skill-detail.data.ts`:

```ts
experienceSummary:
  "I've used Kubernetes to operate application platforms, manage GitOps environments with Argo CD, and build reusable Kustomize foundations across professional and homelab projects.",
```

Import Astryx `Blockquote` in `skill-detail-page.tsx`:

```tsx
import { Blockquote } from '@astryxdesign/core/Blockquote';
```

Replace only the existing experience heading and paragraph:

```tsx
<Heading id="skill-experience-heading" level={2}>
  In practice
</Heading>
<Blockquote>{detail.experienceSummary}</Blockquote>
```

Do not pass `cite` and do not add custom blockquote styles.

- [ ] **Step 4: Run focused tests and verify they pass**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-detail-page.spec.tsx apps/github.io/src/app/app.spec.tsx
```

Expected: both test files PASS, including the exact heading, copy, and semantic `blockquote` assertions.

- [ ] **Step 5: Run project verification and visual QA**

Run:

```bash
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx build github.io
pnpm nx build-storybook github.io
```

Expected: all commands exit successfully. Then inspect `GitHub.io / Skills / Skill Detail Page / Enriched Kubernetes` in Storybook at phone, iPad `768x1024`, and desktop widths. Confirm the Astryx leading border is visible, the statement remains readable without awkward wrapping, supporting evidence rows remain unchanged, and no horizontal overflow appears.

- [ ] **Step 6: Commit the self-contained change**

Inspect and stage only the four task files:

```bash
git diff -- apps/github.io/src/app/skills/skill-detail.data.ts apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx apps/github.io/src/app/app.spec.tsx
git add apps/github.io/src/app/skills/skill-detail.data.ts apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx apps/github.io/src/app/app.spec.tsx
git diff --cached
git commit -m "feat(github.io): refine skill experience summary"
```

Expected: one conventional commit containing only the approved content and presentation refinement.
