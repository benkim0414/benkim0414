# Skill Experience Blockquote Separation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every skill experience item a visually distinct Astryx Blockquote border without changing its title-summary grouping or overall vertical rhythm.

**Architecture:** Keep one semantic list item and one Astryx `Blockquote` per evidence record. Move `paddingBlock={3}` from the inner title-summary `VStack` to a new outer `VStack` around the Blockquote, leaving only `gap={1}` inside; this preserves total spacing while preventing adjacent border rectangles from touching.

**Tech Stack:** React 19, TypeScript, Astryx `Blockquote`, `Heading`, `Text`, and `VStack`, StyleX, Vitest, Testing Library, Storybook, Nx, pnpm, agent-browser, Tailscale.

## Global Constraints

- Follow `docs/superpowers/specs/2026-08-12-skill-detail-page-design.md`.
- Use Astryx components and defaults first; no MD3 gap exists for this correction.
- Preserve one Astryx Blockquote per evidence item with its level-three Heading and secondary Text summary nested inside.
- Move `paddingBlock={3}` outside each Blockquote; keep `gap={1}` inside around the title and summary.
- Adjacent Blockquote border rectangles must not touch; the border must span only its own title and summary.
- Preserve the `Supporting experience` list, evidence order, `item.id` keys, heading hierarchy, and absence of separators.
- Do not pass `cite` or add custom Blockquote, border, margin, typography, or color styles.
- Do not change evidence data, detail resolution, metadata, breadcrumbs, projects, routes, or card/list/command-palette navigation.
- Keep Storybook reachable through the existing Tailscale VPN at port `41737`; user-operated physical iPad sign-off follows host-side verification.

## File Map

- Modify `apps/github.io/src/app/skills/skill-experience-list.spec.tsx`: protect the outer-spacing wrapper and existing nested content contract.
- Modify `apps/github.io/src/app/skills/skill-experience-list.tsx`: move Astryx padding outside each Blockquote.
- Reuse `apps/github.io/src/app/skills/skill-detail-page.stories.tsx` unchanged for responsive browser verification.

---

### Task 1: Move experience spacing outside each Blockquote

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-experience-list.spec.tsx`
- Modify: `apps/github.io/src/app/skills/skill-experience-list.tsx`

**Interfaces:**
- Consumes: `SkillExperienceList({ evidence }: SkillExperienceListProps)` and the existing one-Blockquote-per-evidence composition.
- Produces: each list item contains an outer Astryx spacing wrapper whose direct child is the evidence Blockquote; the Blockquote still contains the matching heading and summary.

- [ ] **Step 1: Re-check the installed Astryx contracts**

Run:

```bash
pnpm exec astryx component Blockquote --detail full
pnpm exec astryx component Layout --detail full
```

Expected: Blockquote owns its accent border and accepts structured children; `VStack` is the Astryx primitive for vertical grouping and supports `paddingBlock`. Do not add local border or margin styling.

- [ ] **Step 2: Add a failing outer-wrapper regression assertion**

In `skill-experience-list.spec.tsx`, retain the existing named-list, list-item, heading, Blockquote, nested title/summary, and no-separator assertions. Capture the list items:

```tsx
const listItems = getAllByRole('listitem');

expect(listItems).toHaveLength(experienceFixtures.length);
```

Inside the existing `blockquotes.forEach((blockquote, index) => { ... })`, add:

```tsx
const spacingWrapper = blockquote.parentElement;

expect(spacingWrapper).not.toBe(listItems[index]);
expect(spacingWrapper?.parentElement).toBe(listItems[index]);
expect(
  spacingWrapper?.querySelectorAll(':scope > blockquote'),
).toHaveLength(1);
```

This asserts the structural ownership needed to place Astryx padding outside the border without coupling the test to generated StyleX class names.

- [ ] **Step 3: Run the focused test and verify it fails**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/skill-experience-list.spec.tsx
```

Expected: FAIL because the current Blockquote parent is the list item itself, so `spacingWrapper` equals `listItems[index]`.

- [ ] **Step 4: Move `paddingBlock` to an outer Astryx VStack**

Replace each list item's current content:

```tsx
<Blockquote>
  <VStack gap={1} paddingBlock={3}>
    <Heading level={3}>{item.title}</Heading>
    <Text as="p" type="body" color="secondary">
      {item.summary}
    </Text>
  </VStack>
</Blockquote>
```

with:

```tsx
<VStack paddingBlock={3}>
  <Blockquote>
    <VStack gap={1}>
      <Heading level={3}>{item.title}</Heading>
      <Text as="p" type="body" color="secondary">
        {item.summary}
      </Text>
    </VStack>
  </Blockquote>
</VStack>
```

Do not change the list markup, evidence mapping, key, Blockquote props, Heading level, Text props, or StyleX resets.

- [ ] **Step 5: Run focused integration regressions**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/skill-experience-list.spec.tsx src/app/skills/skill-detail-page.spec.tsx
```

Expected: PASS — 2 files and 6 tests. Nested title/summary behavior remains intact and the new wrapper contract passes.

- [ ] **Step 6: Inspect and commit the correction**

Run:

```bash
git diff --check
git diff -- apps/github.io/src/app/skills/skill-experience-list.tsx apps/github.io/src/app/skills/skill-experience-list.spec.tsx
git add apps/github.io/src/app/skills/skill-experience-list.tsx apps/github.io/src/app/skills/skill-experience-list.spec.tsx
git diff --cached
git commit -m "fix(github.io): separate experience blockquote borders"
```

Expected: one focused commit containing only the Astryx wrapper correction and regression test.

---

### Task 2: Verify distinct borders in responsive Storybook

**Files:**
- Verify: `apps/github.io/src/app/skills/skill-detail-page.stories.tsx`
- Verify: `apps/github.io/src/app/skills/skill-experience-list.tsx`

**Interfaces:**
- Consumes: Task 1, `Skill Detail Page / Enriched Kubernetes`, the `github.io` Nx project, and the host Tailscale address.
- Produces: automated and real-browser evidence that adjacent evidence borders have positive gaps without changing overall layout.

- [ ] **Step 1: Run complete repository verification**

Run:

```bash
pnpm nx test github.io --skip-nx-cache
pnpm nx lint github.io
pnpm nx build github.io
pnpm nx build-storybook github.io
git diff --check
```

Expected: all tests and both builds PASS; lint has zero errors (existing unrelated warnings may remain); `git diff --check` emits no output.

- [ ] **Step 2: Keep current Storybook reachable over Tailscale**

If the server on port `41737` is stale, restart it from this linked worktree:

```bash
pnpm nx storybook github.io --host=0.0.0.0 --port=41737
```

Then run:

```bash
tailscale ip -4
curl --fail --silent --show-error --head http://$(tailscale ip -4):41737/
```

Expected: HTTP 200 from the private Tailscale address and no public tunnel.

- [ ] **Step 3: Verify border geometry at phone, iPad, and desktop sizes**

Open the direct `Skill Detail Page / Enriched Kubernetes` iframe at:

```text
390 × 844
768 × 1024
1440 × 900
```

At each viewport verify that every list item has one Blockquote containing its associated `h3` and summary paragraph, and run:

```js
const list = document.querySelector('ul[aria-label="Supporting experience"]');
const blockquotes = [...(list?.querySelectorAll(':scope > li blockquote') ?? [])];
const rectangles = blockquotes.map((blockquote) => {
  const rect = blockquote.getBoundingClientRect();
  return {
    top: rect.top,
    bottom: rect.bottom,
    borderWidth: getComputedStyle(blockquote).borderInlineStartWidth,
    headingInside: blockquote.querySelector(':scope h3') != null,
    summaryInside: blockquote.querySelector(':scope p') != null,
  };
});
const gaps = rectangles.slice(1).map((rect, index) =>
  rect.top - rectangles[index].bottom,
);
({ rectangles, gaps, allBordersSeparate: gaps.every((gap) => gap > 0) });
```

Expected: three Blockquotes, each with a `2px` Astryx accent border and both containment booleans `true`; every gap is positive and `allBordersSeparate` is `true`. Confirm visually that spacing is balanced, no dividers/cards appear, and metadata, breadcrumbs, evidence, and projects do not clip or overflow.

- [ ] **Step 4: Preserve the iPad URL and report state**

Save screenshots in this plan's ignored SDD workspace and leave Storybook running at `http://<tailscale-ip>:41737/`. Run:

```bash
git status --short --branch
git log -3 --oneline
```

Expected: the branch is clean. Report exact automated outcomes, measured border gaps for every viewport, screenshot paths, the direct enriched-story URL, and that physical iPad confirmation remains a user-operated gate.
