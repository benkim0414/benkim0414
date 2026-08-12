# Skill Detail Metadata List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate skill categories, rating, and optional certifications into one responsive Astryx `MetadataList` on every skill detail page.

**Architecture:** Keep `SkillDetailPage` as the composition boundary and reuse the existing `SkillCategory`, `SkillRating`, and `CertificationCitation` components as metadata values. Replace the loose category/rating elements and standalone certification section with one semantic, single-column `MetadataList`; no resolver or data-model changes are required.

**Tech Stack:** React 19, TypeScript, Astryx `MetadataList`, `MetadataListItem`, `HStack`, existing Astryx-backed skill components, StyleX, Vitest, Testing Library, Storybook, Nx, pnpm.

## Global Constraints

- Astryx is authoritative; use Material Design 3 only when Astryx has no applicable component or guidance. No MD3 fallback is needed for this change.
- Render one untitled Astryx `MetadataList` immediately after the description with `columns="single"` and `label={{ position: 'top' }}`.
- Render rows in this order: `Categories`, `Rating`, then `Certifications` when certifications exist.
- Reuse `SkillCategory`, `SkillRating`, and `CertificationCitation`; do not redesign their internals or duplicate their data.
- Omit the Certifications row when no certifications exist; do not render placeholder text.
- Remove the loose category/rating presentation and standalone Certifications section.
- Preserve certification ordering, links, numbering, status, badge imagery, and hover-card behavior.
- Preserve semantic list markup for category and certification collections while using Astryx layout primitives for wrapping and spacing.
- Do not modify routing, the resolver, source data, experience blockquotes, projects, skill cards, skill list items, command-palette behavior, or the mobile skills page.
- Keep the centered single-column page responsive and free of clipping or horizontal overflow at phone, iPad, and desktop widths.
- Do not push, deploy, merge, or create a pull request during implementation.

---

## File Structure

- Modify `apps/github.io/src/app/skills/skill-detail-page.tsx`: compose the Astryx metadata list and remove the superseded certification section.
- Modify `apps/github.io/src/app/skills/skill-detail-page.spec.tsx`: lock down row semantics, ordering, optional certification behavior, and absence of duplicated presentation.
- Reuse `apps/github.io/src/app/skills/skill-detail-page.stories.tsx` unchanged: its enriched Kubernetes and basic React stories already exercise both certification states for responsive visual QA.

### Task 1: Consolidate skill summary metadata

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-detail-page.spec.tsx`
- Modify: `apps/github.io/src/app/skills/skill-detail-page.tsx`
- Verify unchanged: `apps/github.io/src/app/skills/skill-detail-page.stories.tsx`

**Interfaces:**
- Consumes: `SkillDetailPage({ detail }: { detail: ResolvedSkillDetail })`, `detail.skill.categories`, `detail.skill.level`, `detail.skill.certifications`, `SkillCategory`, `SkillRating`, and `CertificationCitation`.
- Produces: one `MetadataList` identified by `data-testid="skill-metadata"`, with visible `Categories`, `Rating`, and conditional `Certifications` labels; no exported API changes.

- [ ] **Step 1: Reconfirm the installed Astryx contracts**

Run:

```bash
pnpm exec astryx component MetadataList --detail compact
pnpm exec astryx component MetadataListItem --detail compact
```

Expected: the docs confirm that `MetadataList` supports `columns="single"`, top-positioned labels, an optional title, and component-valued `MetadataListItem` children. Do not infer unsupported props or add local styling for Astryx-owned anatomy.

- [ ] **Step 2: Write failing tests for the enriched metadata list**

In the Kubernetes test in `skill-detail-page.spec.tsx`, include `getAllByTestId`, `getAllByText`, `getByTestId`, `queryByRole`, and `within` from the render result or Testing Library as appropriate. Replace the standalone Certifications-heading expectation with these assertions:

```tsx
const metadata = getByTestId('skill-metadata');
const metadataQueries = within(metadata);

expect(metadata.querySelector('dl')).toBeTruthy();
expect(
  metadataQueries.getByText('Categories', { selector: 'dt' }),
).toBeTruthy();
expect(
  metadataQueries.getByText('Rating', { selector: 'dt' }),
).toBeTruthy();
expect(
  metadataQueries.getByText('Certifications', { selector: 'dt' }),
).toBeTruthy();
expect(
  [...metadata.querySelectorAll(':scope > dl > div > dt')].map(
    ({ textContent }) => textContent,
  ),
).toEqual(['Categories', 'Rating', 'Certifications']);
expect(getAllByText('Container')).toHaveLength(1);
expect(getAllByText('Cloud')).toHaveLength(1);
expect(getAllByText('4 out of 5')).toHaveLength(1);
expect(getAllByTestId('certification-citation')).toHaveLength(
  detail.skill.certifications?.length ?? 0,
);
expect(
  queryByRole('heading', { level: 2, name: 'Certifications' }),
).toBeNull();
```

Keep the existing `In practice`, blockquote, project, breadcrumb, and page-heading assertions unchanged. The direct-child selector deliberately excludes nested certification hover-card metadata lists from the outer row-order assertion.

- [ ] **Step 3: Write the failing test for an uncertified basic skill**

In the React test, add assertions that its metadata list contains Categories and Rating but omits Certifications:

```tsx
const metadata = getByTestId('skill-metadata');
const metadataQueries = within(metadata);

expect(
  metadataQueries.getByText('Categories', { selector: 'dt' }),
).toBeTruthy();
expect(
  metadataQueries.getByText('Rating', { selector: 'dt' }),
).toBeTruthy();
expect(
  metadataQueries.queryByText('Certifications', { selector: 'dt' }),
).toBeNull();
expect(metadataQueries.queryAllByTestId('certification-citation')).toHaveLength(
  0,
);
expect(
  queryByRole('heading', { level: 2, name: 'Certifications' }),
).toBeNull();
```

Retain the existing assertions that `In practice` and `Projects` are absent. Import `within` from `@testing-library/react` if the project version exports it there; otherwise import it from `@testing-library/dom`, following the repository's existing convention discovered with `rg "import .*within" apps/github.io/src`.

- [ ] **Step 4: Run the focused test and verify the RED state**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-detail-page.spec.tsx
```

Expected: FAIL because the existing page has no `skill-metadata` element or MetadataList row labels. Record the relevant assertion failure before editing production code.

- [ ] **Step 5: Implement the Astryx metadata list**

In `skill-detail-page.tsx`, add:

```tsx
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
```

Rename the existing list-reset styles so both metadata collections can share them, while Astryx `HStack` owns flex layout, gaps, and wrapping:

```tsx
const styles = stylex.create({
  page: {
    width: '100%',
    maxWidth: `calc(${spacingVars['--spacing-12']} * 14)`,
    marginInline: 'auto',
  },
  metadataValueList: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  metadataValueItem: {
    display: 'inline-flex',
    maxWidth: '100%',
    listStyle: 'none',
  },
});
```

Keep only the title and description in the existing introductory `VStack`, then insert the metadata list immediately after it:

```tsx
<VStack gap={3} hAlign="start">
  <Heading ref={headingRef} level={1} tabIndex={-1}>
    {detail.skill.name}
  </Heading>
  <Text as="p" type="body" color="secondary">
    {detail.skill.description}
  </Text>
</VStack>

<MetadataList
  columns="single"
  data-testid="skill-metadata"
  label={{ position: 'top' }}
>
  <MetadataListItem label="Categories">
    <HStack
      as="ul"
      gap={1}
      wrap="wrap"
      xstyle={styles.metadataValueList}
    >
      {detail.skill.categories.map((category) => (
        <li key={category} {...stylex.props(styles.metadataValueItem)}>
          <SkillCategory name={category} />
        </li>
      ))}
    </HStack>
  </MetadataListItem>

  <MetadataListItem label="Rating">
    <SkillRating level={detail.skill.level} />
  </MetadataListItem>

  {certifications.length > 0 ? (
    <MetadataListItem label="Certifications">
      <HStack
        as="ul"
        gap={2}
        wrap="wrap"
        xstyle={styles.metadataValueList}
      >
        {certifications.map((certification, index) => (
          <li
            key={`${certification.title}-${certification.url}-${certification.expiresAt}`}
            {...stylex.props(styles.metadataValueItem)}
          >
            <CertificationCitation {...certification} number={index + 1} />
          </li>
        ))}
      </HStack>
    </MetadataListItem>
  ) : null}
</MetadataList>
```

Delete the old category `HStack`, loose `SkillRating`, and entire standalone Certifications `<section>`. Keep `const certifications = detail.skill.certifications ?? []`, the focus effect, experience section, and projects section unchanged. Do not provide a `title` prop to `MetadataList`.

- [ ] **Step 6: Run the focused test and verify the GREEN state**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-detail-page.spec.tsx
```

Expected: all `SkillDetailPage` tests PASS. If the direct-child selector differs from the installed Astryx DOM, inspect the rendered semantic structure and adjust only the test selector; retain the required `dl`/`dt`/`dd` contract and exact row order.

- [ ] **Step 7: Run focused static verification**

Run:

```bash
pnpm nx lint github.io --skip-nx-cache
pnpm nx build github.io --skip-nx-cache
git diff --check
```

Expected: lint and build exit 0, apart from already-documented warnings; `git diff --check` prints nothing.

- [ ] **Step 8: Inspect and commit the logical change**

Inspect both unstaged and staged changes, then stage only the two task files:

```bash
git diff -- apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx
git add apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx
git diff --cached
git commit -m "feat(github.io): consolidate skill detail metadata"
```

Expected: one conventional commit containing only the component and its focused test.

### Task 2: Verify Storybook responsiveness and the complete branch

**Files:**
- Verify unchanged: `apps/github.io/src/app/skills/skill-detail-page.stories.tsx`
- Verify: all files changed on `feat/skill-detail-page` relative to `main`

**Interfaces:**
- Consumes: the `EnrichedKubernetes` and `BasicSkill` Storybook stories and the completed `SkillDetailPage` metadata contract.
- Produces: recorded verification evidence only; no source-code changes unless a verified defect requires returning to Task 1 with a failing regression test.

- [ ] **Step 1: Build Storybook**

Run:

```bash
pnpm nx build-storybook github.io --skip-nx-cache
```

Expected: exit 0. Existing non-blocking Vite, CSS directive, or chunk-size warnings may be documented but must not be treated as new failures.

- [ ] **Step 2: Serve Storybook for iPad access over Tailscale**

Reuse the existing Storybook server if it is healthy. Otherwise run it from this worktree on all interfaces:

```bash
pnpm nx storybook github.io --host 0.0.0.0 --port 41737
```

Confirm the host's Tailscale IPv4 address with:

```bash
tailscale ip -4
```

Expected iPad URL while connected to the same tailnet:

```text
http://<tailscale-ip>:41737/?path=/story/github-io-skills-skill-detail-page--enriched-kubernetes
```

Do not change firewall, router, Tailscale ACL, or deployment settings within this task.

- [ ] **Step 3: Perform responsive visual and accessibility QA**

Inspect both `EnrichedKubernetes` and `BasicSkill` at representative widths:

- phone: `390 × 844`;
- iPad portrait: `768 × 1024`;
- desktop: `1440 × 1000`.

At every width confirm:

- one centered reading column with no horizontal overflow;
- description followed immediately by the untitled metadata list;
- labels appear above values in exact order;
- category badges and certification citations wrap without clipping;
- Kubernetes has three metadata rows and no Certifications `h2`;
- React has two metadata rows and no blank Certifications row;
- rating accessibility text remains `4 out of 5` or `3 out of 5` as applicable;
- certification links, hover cards, and touch targets still work;
- `In practice`, projects, blockquotes, breadcrumbs, and focus treatment are unchanged.

Expected: both stories satisfy the approved responsive contract. If a defect is found, add a failing focused regression test, make the smallest Astryx-aligned fix, rerun Task 1 verification, and create a separate conventional fix commit.

- [ ] **Step 4: Run fresh final verification on the exact branch HEAD**

Run each command without relying on cached earlier results:

```bash
pnpm nx test github.io --skip-nx-cache
pnpm nx lint github.io --skip-nx-cache
pnpm nx build github.io --skip-nx-cache
pnpm nx build-storybook github.io --skip-nx-cache
git diff --check
git status --short --branch
```

Expected: all commands exit 0; the full test suite passes; the worktree is clean on `feat/skill-detail-page`. Document pre-existing warnings separately from failures.

- [ ] **Step 5: Stop at the handoff gate**

Report the implementation commit, test/build results, responsive QA findings, Storybook Tailscale URL, and any pre-existing warnings. Keep the linked worktree and branch intact. Do not push, open a pull request, merge, or deploy without the user's explicit handoff instruction.
