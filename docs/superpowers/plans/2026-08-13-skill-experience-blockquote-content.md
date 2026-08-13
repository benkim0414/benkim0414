# Skill Experience Blockquote Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Place each skill experience title and summary inside the same Astryx Blockquote so they share one continuous accent border.

**Architecture:** Keep `SkillExperienceList` as the semantic list boundary and preserve one list item per evidence record. Move the existing level-three Astryx `Heading` into the Astryx `Blockquote`, add secondary Astryx `Text` for the summary, and group both with an Astryx `VStack`; no data, resolver, route, or custom-style changes are required.

**Tech Stack:** React 19, TypeScript, Astryx `Blockquote`, `Heading`, `Text`, and `VStack`, StyleX, Vitest, Testing Library, Storybook, Nx, pnpm, agent-browser, Tailscale.

## Global Constraints

- Follow the approved design in `docs/superpowers/specs/2026-08-12-skill-detail-page-design.md`.
- Use Astryx components and defaults first; use MD3 only where Astryx has no guidance. No such gap exists for this change.
- Render one Astryx `Blockquote` per experience evidence item.
- Nest the evidence item's level-three Astryx `Heading` and secondary Astryx `Text` summary inside that Blockquote so both share one continuous accent border.
- Preserve the `Supporting experience` semantic list, evidence order, item keys, heading hierarchy, and absence of separators.
- Do not pass `cite`; the heading labels the evidence and is not an attribution source.
- Do not add custom Blockquote, border, typography, or color styles.
- Do not change evidence data, detail resolution, metadata, breadcrumbs, projects, routes, or excluded card/list/command-palette navigation.
- Keep Storybook reachable from the user's iPad through the existing Tailscale VPN; physical-device sign-off remains a user review action after host-side verification.

## File Map

- Modify `apps/github.io/src/app/skills/skill-experience-list.spec.tsx`: assert each Blockquote owns its associated level-three heading and summary.
- Modify `apps/github.io/src/app/skills/skill-experience-list.tsx`: compose Heading and Text inside each Blockquote using Astryx VStack.
- Do not modify `apps/github.io/src/app/skills/skill-detail-page.stories.tsx`: reuse `EnrichedKubernetes` for visual verification.

---

### Task 1: Group each experience title and summary inside one Blockquote

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-experience-list.spec.tsx`
- Modify: `apps/github.io/src/app/skills/skill-experience-list.tsx`

**Interfaces:**
- Consumes: `SkillExperienceList({ evidence }: SkillExperienceListProps)`, `CapabilityEvidenceItem.title`, and `CapabilityEvidenceItem.summary`.
- Produces: one semantic list item and one Astryx Blockquote per evidence record; every Blockquote contains its record's level-three Heading and secondary Text summary.

- [ ] **Step 1: Re-check the installed Astryx component contracts**

Run:

```bash
pnpm exec astryx component Blockquote --detail full
pnpm exec astryx component Heading --detail full
pnpm exec astryx component Text --detail full
pnpm exec astryx component Layout --detail full
```

Expected: `Blockquote.children` accepts structured React content; `Heading` supports `level={3}`; `Text` supports `as="p"`, `type="body"`, and `color="secondary"`; `VStack` supports `gap` and `paddingBlock`. Do not infer unsupported props or add local visual styling.

- [ ] **Step 2: Write the failing nested-content regression test**

Change the Testing Library import in `skill-experience-list.spec.tsx` to:

```tsx
import { render, within } from '@testing-library/react';
```

Replace the existing blockquote content assertion with:

```tsx
const blockquotes = [...container.querySelectorAll('blockquote')];

expect(blockquotes).toHaveLength(experienceFixtures.length);

blockquotes.forEach((blockquote, index) => {
  const item = experienceFixtures[index];
  const blockquoteQueries = within(blockquote);

  expect(
    blockquoteQueries.getByRole('heading', {
      level: 3,
      name: item.title,
    }),
  ).toBeTruthy();
  expect(
    blockquoteQueries.getByText(item.summary, { selector: 'p' }),
  ).toBeTruthy();
});
```

Keep the existing assertions for the named list, two list items, two level-three headings, two Blockquotes, and zero separators.

- [ ] **Step 3: Run the focused test and confirm the intended failure**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/skill-experience-list.spec.tsx
```

Expected: FAIL because each current Heading is a sibling before its Blockquote, so `within(blockquote).getByRole('heading', ...)` cannot find it.

- [ ] **Step 4: Compose the complete evidence item inside Blockquote**

Add the Astryx Text import in `skill-experience-list.tsx`:

```tsx
import { Text } from '@astryxdesign/core/Text';
```

Replace the contents of each rendered `<li>` with:

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

Keep the existing `<ul>`, `<li>`, list and item StyleX resets, evidence mapping, and `item.id` key unchanged. Do not pass `cite` or `xstyle` to Blockquote.

- [ ] **Step 5: Run focused and detail-page regression tests**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/skill-experience-list.spec.tsx src/app/skills/skill-detail-page.spec.tsx
```

Expected: PASS. The experience test confirms each heading and summary are nested in the same Blockquote, while detail-page coverage confirms all enriched summaries, metadata, projects, and basic-skill omissions remain intact.

- [ ] **Step 6: Inspect and commit the component change**

Run:

```bash
git diff --check
git diff -- apps/github.io/src/app/skills/skill-experience-list.tsx apps/github.io/src/app/skills/skill-experience-list.spec.tsx
git add apps/github.io/src/app/skills/skill-experience-list.tsx apps/github.io/src/app/skills/skill-experience-list.spec.tsx
git diff --cached
git commit -m "fix(github.io): group skill experience blockquotes"
```

Expected: one focused commit containing only the Astryx composition change and its regression test.

---

### Task 2: Verify the shared accent border in Storybook

**Files:**
- Verify: `apps/github.io/src/app/skills/skill-detail-page.stories.tsx`
- Verify: `apps/github.io/src/app/skills/skill-experience-list.tsx`

**Interfaces:**
- Consumes: the Task 1 commit, the `Skill Detail Page / Enriched Kubernetes` story, the `github.io` Nx project, and the host's Tailscale IPv4 address.
- Produces: automated and browser evidence that every experience title and summary share one Blockquote border at phone, iPad, and desktop sizes, plus an iPad-reachable Storybook URL for user sign-off.

- [ ] **Step 1: Run the full relevant verification**

Run:

```bash
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx build github.io
pnpm nx build-storybook github.io
git diff --check
```

Expected: all tests and both builds PASS; lint has zero errors (existing unrelated warnings may remain); `git diff --check` emits no output.

- [ ] **Step 2: Ensure current Storybook is served over Tailscale**

If the existing server at port `41737` is stale, restart Storybook from this linked worktree with:

```bash
pnpm nx storybook github.io --host=0.0.0.0 --port=41737
```

In a separate terminal, obtain the address and probe it:

```bash
tailscale ip -4
curl --fail --silent --show-error --head http://$(tailscale ip -4):41737/
```

Expected: the server listens on `0.0.0.0:41737`, and the Tailscale URL returns HTTP 200. Do not create a public tunnel.

- [ ] **Step 3: Check the enriched story at representative viewports**

Open the direct `Skill Detail Page / Enriched Kubernetes` iframe story and check:

```text
390 × 844
768 × 1024
1440 × 900
```

At each viewport, verify:

- The number of experience Blockquotes equals the number of experience list items.
- Every experience Blockquote contains exactly one level-three heading and its associated summary paragraph.
- Each accent border spans the visual height of both the title and summary.
- Space separates evidence items without dividers or nested cards.
- Headings, summaries, borders, metadata, breadcrumbs, and projects do not clip or overflow.

Use browser evaluation to record the structural relationship:

```js
const list = document.querySelector('ul[aria-label="Supporting experience"]');
const items = [...(list?.querySelectorAll(':scope > li') ?? [])];
items.map((item) => {
  const blockquote = item.querySelector(':scope > blockquote');
  const heading = blockquote?.querySelector('h3');
  const summary = blockquote?.querySelector('p');

  return {
    blockquoteCount: item.querySelectorAll(':scope > blockquote').length,
    heading: heading?.textContent ?? null,
    summary: summary?.textContent ?? null,
    headingInsideBlockquote: heading?.closest('blockquote') === blockquote,
    summaryInsideBlockquote: summary?.closest('blockquote') === blockquote,
  };
});
```

Expected: every result has `blockquoteCount: 1`, non-empty heading and summary text, and both containment booleans `true`.

- [ ] **Step 4: Preserve the iPad review URL and report repository state**

Keep Storybook running at `http://<tailscale-ip>:41737/` for the user's physical iPad review. Save screenshots under this plan's ignored SDD workspace. Then run:

```bash
git status --short --branch
git log -3 --oneline
```

Expected: no uncommitted implementation changes remain. Report the direct enriched-story URL, viewport results, screenshot paths, exact automated outcomes, and the distinction between completed host-side iPad-sized QA and pending user-operated physical-device sign-off.
