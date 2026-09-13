# Responsive Skill Table Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render skill cards on mobile and an Astryx filterable table on tablet/desktop, with temporary row selection opening the complete skill detail in the template's resizable panel or compact-surface bottom sheet.

**Architecture:** `SkillsPage` owns one shared catalog filter state and the temporary active skill. `SkillTable` becomes controlled for filters and contributes an Astryx table row-activation plugin. Route-only chrome is separated from reusable skill detail content, while a focused `SkillTableDetailLayout` composes the table, resizable `LayoutPanel`, and responsive `BottomSheet` using the official Astryx template contract.

**Tech Stack:** React 19, TypeScript, React Router, Astryx 0.5.4, StyleX, Vitest, Testing Library, Storybook, Nx, pnpm.

**Spec:** `docs/superpowers/specs/2026-09-13-responsive-skill-table-detail-design.md`

## Global Constraints

- Keep `/skills` unchanged while table detail is open; do not add path, query, or history state.
- Keep the existing `/skills/:skillId` route and mobile card navigation behavior.
- Use the existing canonical skills, detail records, evidence, projects, experiences, and `resolveSkillDetail`; add no data model.
- Follow the Astryx filterable-table template: `LayoutPanel` and `ResizeHandle` on non-compact surfaces, tall `BottomSheet` on `(max-width: 768px), (max-width: 1024px) and (pointer: coarse) and (hover: none)`.
- Use Astryx components and semantic tokens; add no dependency, styling system, raw color, arbitrary spacing, or hand-rolled overlay.
- Exclude saved views, grouping, pagination, bulk selection, and unrelated filterable-table template features.
- Preserve explicit resolver integrity errors; only a normal `not-found` result closes the detail safely.
- Follow TDD and commit each task separately with explicit staged paths.

---

## File Structure

- Create `apps/github.io/src/app/skills/skill-detail-content.tsx`: reusable metadata, certifications, experience, evidence, and projects with no route or overlay chrome.
- Create `apps/github.io/src/app/skills/skill-detail-sources.ts`: canonical `SkillDetailSources` shared by the route and table experience.
- Create `apps/github.io/src/app/skills/skill-filter.ts`: pure shared query/category filtering used by cards and table.
- Create `apps/github.io/src/app/skills/skill-table-detail-layout.tsx`: Astryx master-detail layout, responsive surface swap, close behavior, and focus restoration callback.
- Create `apps/github.io/src/app/skills/skill-table-detail-layout.spec.tsx`: focused panel/bottom-sheet behavior tests.
- Modify `apps/github.io/src/app/skills/skill-detail-page.tsx`: retain route framing and delegate the body to `SkillDetailContent`.
- Modify `apps/github.io/src/app/skills/skill-detail-route.tsx`: consume shared canonical detail sources.
- Modify `apps/github.io/src/app/skills/skill-detail-page.spec.tsx`: protect complete extracted detail and route framing.
- Modify `apps/github.io/src/app/skills/skill-table.tsx`: controlled filters, active-row props, and row activation plugin.
- Modify `apps/github.io/src/app/skills/skill-table.spec.tsx`: cover controlled filters, keyboard/pointer activation, active semantics, and interactive-cell exclusion.
- Modify `apps/github.io/src/app/skills/skill-table.stories.tsx`: pass controlled filter state through a story harness.
- Modify `apps/github.io/src/app/skills/skills-page.tsx`: shared state, responsive card/table switch, resolution, and selection invalidation.
- Modify `apps/github.io/src/app/skills/skills-page.spec.tsx`: cover responsive presentation, persistence, selection lifecycle, and unchanged URL.
- Modify `apps/github.io/src/app/skills/skills-page.stories.tsx`: add mobile, desktop-open, and coarse-tablet-open examples.
- Modify `apps/github.io/src/app/skills/skills-page.stories.spec.ts`: require the new visual states.
- Update generated OpenWiki only through the repository's documented workflow if `docs/agents/openwiki.md` says this implementation requires it.

### Task 1: Extract reusable skill detail content and canonical sources

**Files:**
- Create: `apps/github.io/src/app/skills/skill-detail-content.tsx`
- Create: `apps/github.io/src/app/skills/skill-detail-sources.ts`
- Modify: `apps/github.io/src/app/skills/skill-detail-page.tsx`
- Modify: `apps/github.io/src/app/skills/skill-detail-route.tsx`
- Test: `apps/github.io/src/app/skills/skill-detail-page.spec.tsx`

**Interfaces:**
- Produces: `SkillDetailContent({detail}: {readonly detail: ResolvedSkillDetail}): ReactElement`, containing metadata, certifications, experience, evidence, and projects but not the host-specific title/description header.
- Produces: `skillDetailSources: SkillDetailSources` containing the exact canonical arrays currently imported by `SkillDetailRoute`.
- Preserves: `SkillDetailPageProps` and `SkillDetailRoute` public behavior.

- [ ] **Step 1: Add failing assertions that route framing and the full detail body remain distinct**

In `skill-detail-page.spec.tsx`, retain the current complete-content assertions and add a focused assertion that the reusable body has no route chrome:

```tsx
import { SkillDetailContent } from './skill-detail-content';

it('renders reusable detail sections without route-only chrome', () => {
  const detail = resolveExpectedDetail('kubernetes');

  const { queryByRole, getByTestId } = render(
    <Theme theme={neutralTheme}>
      <SkillDetailContent detail={detail} />
    </Theme>,
  );

  expect(getByTestId('skill-metadata')).toBeTruthy();
  expect(queryByRole('navigation', { name: 'Skill breadcrumb' })).toBeNull();
  expect(queryByRole('heading', { name: detail.skill.name })).toBeNull();
});
```

Use the file's existing resolver fixture/helper rather than inventing duplicate skill detail data. Keep the existing tests that assert experience/evidence/projects so extraction cannot silently omit sections.

- [ ] **Step 2: Run the focused test and verify the missing module failure**

Run:

```bash
pnpm nx test github.io --testFile=src/app/skills/skill-detail-page.spec.tsx
```

Expected: FAIL because `./skill-detail-content` does not exist.

- [ ] **Step 3: Extract the existing detail body and share its canonical sources**

Move the existing JSX beginning with `<Card variant="muted" width="100%" xstyle={styles.metadataCard}>` through the conditional Projects section from `SkillDetailPage` into `SkillDetailContent`. Keep the title and description outside this component because their heading level, close action, and focus behavior belong to the route or panel host:

```tsx
export interface SkillDetailContentProps {
  readonly detail: ResolvedSkillDetail;
}

export function SkillDetailContent(
  props: SkillDetailContentProps,
): ReactElement;
```

Implement that function by moving the exact existing metadata `Card`, Experience section, and Projects section into its returned `VStack gap={6}`. Move their existing imports and StyleX definitions with them. Do not move breadcrumbs, the name/description header, `headingRef`, or the route focus effect.

Keep route focus on its existing level-1 heading. `SkillDetailPage` becomes route chrome plus the reusable body:

```tsx
<VStack aria-label="Skill detail" as="main" data-testid="skill-detail-content" gap={6} paddingBlock={6} paddingInline={4}>
  <Breadcrumbs label="Skill breadcrumb">
    <BreadcrumbItem href="/skills">Skills</BreadcrumbItem>
    <BreadcrumbItem isCurrent>{detail.skill.name}</BreadcrumbItem>
  </Breadcrumbs>
  <VStack gap={3} hAlign="start">
    <Heading ref={headingRef} level={1} tabIndex={-1}>{detail.skill.name}</Heading>
    <Text as="p" type="body" color="secondary">{detail.skill.description}</Text>
  </VStack>
  <SkillDetailContent detail={detail} />
</VStack>
```

Create shared sources:

```ts
export const skillDetailSources: SkillDetailSources = {
  skills,
  detailRecords: skillDetailRecords,
  evidenceItems: devOpsCapabilityEvidenceItems,
  projects: sampleProjects,
  experiences,
};
```

Then replace the six direct data imports in `SkillDetailRoute` with `skillDetailSources`.

- [ ] **Step 4: Run detail and resolver tests**

Run:

```bash
pnpm nx test github.io --testFile=src/app/skills/skill-detail-page.spec.tsx
pnpm nx test github.io --testFile=src/app/skills/skill-detail-resolver.spec.ts
```

Expected: PASS with one visible skill title, all prior detail sections present, and unchanged route resolution.

- [ ] **Step 5: Commit the extraction**

Inspect `git diff`, then stage only:

```bash
git add apps/github.io/src/app/skills/skill-detail-content.tsx apps/github.io/src/app/skills/skill-detail-sources.ts apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-route.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx
git diff --cached
git commit -m "refactor(github.io): share skill detail content"
```

### Task 2: Make catalog filtering shared and table rows activatable

**Files:**
- Create: `apps/github.io/src/app/skills/skill-filter.ts`
- Modify: `apps/github.io/src/app/skills/skills-page.tsx`
- Modify: `apps/github.io/src/app/skills/skill-table.tsx`
- Modify: `apps/github.io/src/app/skills/skill-table.spec.tsx`
- Modify: `apps/github.io/src/app/skills/skill-table.stories.tsx`

**Interfaces:**
- Produces: `filterSkills(skills, query, selectedCategories): Skill[]` using description-aware `skillMatchesQuery` and OR category semantics.
- Produces: controlled `SkillTableProps` fields `query`, `selectedCategories`, `onQueryChange`, `onSelectedCategoriesChange`, `activeSkillId`, and `onSkillActivate`.
- Produces: `SkillRowActivation = {readonly skillId: string; readonly row: HTMLTableRowElement}`.
- Consumes later: `SkillsPage` and `SkillTableDetailLayout` use the active-row callback to restore focus.

- [ ] **Step 1: Add failing controlled-filter and row-activation tests**

Update the table render helper with controlled defaults and add tests equivalent to:

```tsx
const onSkillActivate = vi.fn();

renderSkillTable({
  query: '',
  selectedCategories: [],
  activeSkillId: 'terraform',
  onSkillActivate,
});

const kubernetesRow = getByRole('row', { name: /Kubernetes/ });
fireEvent.click(kubernetesRow);
expect(onSkillActivate).toHaveBeenCalledWith({
  skillId: 'kubernetes',
  row: kubernetesRow,
});

kubernetesRow.focus();
fireEvent.keyDown(kubernetesRow, { key: 'Enter' });
expect(onSkillActivate).toHaveBeenCalledTimes(2);
expect(getByRole('row', { name: /Terraform/ }).getAttribute('aria-current')).toBe('true');
```

Add a Space-key assertion and prove clicks originating from `input`, `button`, `a`, `select`, or `textarea` do not activate the row. Add a controlled-filter assertion showing a parent prop update changes results and callbacks receive new query/category values.

- [ ] **Step 2: Run table tests and verify the new prop/behavior failures**

Run:

```bash
pnpm nx test github.io --testFile=src/app/skills/skill-table.spec.tsx
```

Expected: FAIL because the controlled and activation props do not exist.

- [ ] **Step 3: Extract one shared filter function**

Create:

```ts
export function filterSkills(
  skills: readonly Skill[],
  query: string,
  selectedCategories: readonly SkillCategory[],
): Skill[] {
  return skills.filter(
    (skill) =>
      skillMatchesQuery(skill, query) &&
      (selectedCategories.length === 0 ||
        selectedCategories.some((category) =>
          skill.categories.includes(category),
        )),
  );
}
```

Use this helper in `SkillsPage` and `SkillTable`. This intentionally upgrades the table's name-only search to match the mobile catalog's existing description-aware search.

- [ ] **Step 4: Implement controlled table filters and the template row-activation plugin**

Define the exact props:

```ts
export interface SkillRowActivation {
  readonly skillId: string;
  readonly row: HTMLTableRowElement;
}

export interface SkillTableProps {
  readonly skills: readonly Skill[];
  readonly query: string;
  readonly selectedCategories: readonly SkillCategory[];
  readonly activeSkillId: string | null;
  readonly onQueryChange: (query: string) => void;
  readonly onSelectedCategoriesChange: (categories: SkillCategory[]) => void;
  readonly onSkillActivate: (activation: SkillRowActivation) => void;
}
```

Follow the Astryx template's `TablePlugin` rather than putting click handlers in cells:

```tsx
const rowActivation = useMemo<TablePlugin<SkillTableRow>>(
  () => ({
    transformBodyRow: (props, item) => {
      const isActive = item.id === activeSkillId;

      return {
        ...props,
        htmlProps: {
          ...props.htmlProps,
          tabIndex: 0,
          'aria-current': isActive ? true : undefined,
          onClick: (event) => {
            if ((event.target as HTMLElement).closest('input, button, a, select, textarea')) return;
            onSkillActivate({ skillId: item.id, row: event.currentTarget });
          },
          onKeyDown: (event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onSkillActivate({ skillId: item.id, row: event.currentTarget });
            }
          },
        },
        xstyle: isActive
          ? [...props.xstyle, styles.clickableRow, styles.activeRow]
          : [...props.xstyle, styles.clickableRow],
      };
    },
  }),
  [activeSkillId, onSkillActivate],
);
```

Use token-backed StyleX for the pointer cursor and active row overlay, matching the template's `--table-row-overlay` approach. Compose `plugins={{sortable, rowActivation}}` with activation after sorting. Replace local table filter state with controlled props and callbacks. Update the story through a small stateful `render` harness so its controls remain interactive.

- [ ] **Step 5: Run table and page filter tests**

Run:

```bash
pnpm nx test github.io --testFile=src/app/skills/skill-table.spec.tsx
pnpm nx test github.io --testFile=src/app/skills/skills-page.spec.tsx
```

Expected: PASS for table sorting/filtering/activation and the unchanged mobile catalog filters.

- [ ] **Step 6: Commit shared filtering and row activation**

Inspect `git diff`, then stage only:

```bash
git add apps/github.io/src/app/skills/skill-filter.ts apps/github.io/src/app/skills/skills-page.tsx apps/github.io/src/app/skills/skill-table.tsx apps/github.io/src/app/skills/skill-table.spec.tsx apps/github.io/src/app/skills/skill-table.stories.tsx
git diff --cached
git commit -m "feat(github.io): activate controlled skill table rows"
```

### Task 3: Compose the Astryx responsive master-detail layout

**Files:**
- Create: `apps/github.io/src/app/skills/skill-table-detail-layout.tsx`
- Create: `apps/github.io/src/app/skills/skill-table-detail-layout.spec.tsx`
- Modify: `apps/github.io/src/app/skills/skills-page.tsx`
- Modify: `apps/github.io/src/app/skills/skills-page.spec.tsx`

**Interfaces:**
- Consumes: `SkillTable`, `SkillRowActivation`, `SkillDetailContent`, `ResolvedSkillDetail`.
- Produces: `SkillTableDetailLayoutProps` with controlled filters, `activeDetail: ResolvedSkillDetail | null`, `onSkillActivate: (activation: SkillRowActivation) => void`, and `onClose: (restoreFocus: boolean) => void`.
- Uses exact template constants: `TABLE_QUERY = '(min-width: 768px)'`, `COMPACT_SURFACE_QUERY = '(max-width: 768px), (max-width: 1024px) and (pointer: coarse) and (hover: none)'`, and detail width 380/320/560.

- [ ] **Step 1: Add failing master-detail surface tests**

Create a match-media test helper that can return results per query. Cover both branches:

```tsx
setMediaMatches({
  '(min-width: 768px)': true,
  [COMPACT_SURFACE_QUERY]: false,
});

renderLayout({ activeDetail: kubernetesDetail });
expect(getByRole('region', { name: 'Kubernetes details' })).toBeTruthy();
expect(getByRole('separator', { name: 'Resize skill details' })).toBeTruthy();
expect(queryByRole('dialog', { name: 'Kubernetes details' })).toBeNull();
```

For the compact surface, assert the resizable panel is absent and the open tall `BottomSheet` dialog contains the same `SkillDetailContent`. Assert its `onOpenChange(false)` path calls `onClose(true)`. Verify the labeled close button does the same. On the non-compact branch, dispatch Escape and assert `onClose(true)` is called once.

- [ ] **Step 2: Run the new layout test and verify the missing module failure**

Run:

```bash
pnpm nx test github.io --testFile=src/app/skills/skill-table-detail-layout.spec.tsx
```

Expected: FAIL because `skill-table-detail-layout.tsx` does not exist.

- [ ] **Step 3: Implement the template-aligned panel and bottom sheet**

Export the queries for deterministic tests and stories:

```ts
export const TABLE_QUERY = '(min-width: 768px)';
export const COMPACT_SURFACE_QUERY =
  '(max-width: 768px), (max-width: 1024px) and (pointer: coarse) and (hover: none)';
```

Use the exact resize budget:

```tsx
const detailWidth = useResizable({
  defaultSize: 380,
  minSizePx: 320,
  maxSizePx: 560,
});
```

Build one `detailBody`, unaware of which host contains it. Its header renders the skill name at heading level 2, the description, and a labeled `IconButton` that calls `onClose(true)`; `SkillDetailContent` follows with every reusable detail section. While a non-compact detail is active, attach a document `keydown` effect that calls `onClose(true)` for Escape and removes the listener during cleanup. Compose the non-compact surface exactly as the template does:

```tsx
const detailPanel = activeDetail == null ? undefined : (
  <>
    <ResizeHandle
      resizable={detailWidth.props}
      isReversed
      isAlwaysVisible={false}
      label="Resize skill details"
    />
    <LayoutPanel
      resizable={detailWidth.props}
      hasDivider
      isScrollable
      padding={0}
      label={`${activeDetail.skill.name} details`}
    >
      {detailBody}
    </LayoutPanel>
  </>
);
```

Render `BottomSheet` at every table width so changing pointer/width does not tear down its state:

```tsx
<BottomSheet
  isOpen={isCompactSurface && activeDetail != null}
  onOpenChange={(open) => !open && onClose(true)}
  label={activeDetail == null ? 'Skill details' : `${activeDetail.skill.name} details`}
  height="tall"
>
  {detailBody}
</BottomSheet>
```

Place the table in `LayoutContent` and supply `end={isCompactSurface ? undefined : detailPanel}`. Use Astryx `Layout`, `LayoutContent`, `LayoutPanel`, `BottomSheet`, `ResizeHandle`, `useResizable`, and `useMediaQuery`; do not add custom fixed positioning.

- [ ] **Step 4: Integrate temporary selection and focus restoration in `SkillsPage`**

Keep the active row element in a ref, not React state:

```tsx
const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
const activeRowRef = useRef<HTMLTableRowElement | null>(null);

const handleSkillActivate = ({ skillId, row }: SkillRowActivation) => {
  activeRowRef.current = row;
  setActiveSkillId(skillId);
};

const closeActiveSkill = (restoreFocus: boolean) => {
  const row = activeRowRef.current;
  setActiveSkillId(null);
  activeRowRef.current = null;
  if (restoreFocus && row?.isConnected) requestAnimationFrame(() => row.focus());
};
```

Derive `activeDetail` with `resolveSkillDetail(activeSkillId, skillDetailSources)`; do not store the resolved object. If the active ID is absent from `filteredSkills` or resolution is `not-found`, clear it in an effect without focus restoration. Let resolver integrity exceptions surface.

Use `useMediaQuery(TABLE_QUERY)` to conditionally render exactly one collection presentation: cards below the breakpoint, `SkillTableDetailLayout` at and above it. Preserve the page heading and one shared filter state. Mobile cards continue linking to the standalone route.

- [ ] **Step 5: Add page integration tests**

Extend `skills-page.spec.tsx` to prove:

```tsx
expect(getAllByTestId('skill-card')).toHaveLength(3); // mobile query
expect(queryByRole('table')).toBeNull();

setMediaMatches({ [TABLE_QUERY]: true, [COMPACT_SURFACE_QUERY]: false });
expect(getByRole('table')).toBeTruthy();
expect(queryAllByTestId('skill-card')).toHaveLength(0);
```

At table width, activate Kubernetes and assert the current `window.location.pathname` remains `/skills`, the row has `aria-current="true"`, and the full detail metadata plus experience/project fixture content is visible. Activate Terraform and prove the detail swaps. Close it and assert focus returns to the Terraform row. Apply a filter that removes the active row and assert the detail closes without attempting to focus a disconnected row. Rerender across the responsive query with active filters and assert the same filtered IDs remain visible.

- [ ] **Step 6: Run the focused master-detail suite**

Run:

```bash
pnpm nx test github.io --testFile=src/app/skills/skill-table-detail-layout.spec.tsx
pnpm nx test github.io --testFile=src/app/skills/skills-page.spec.tsx
pnpm nx test github.io --testFile=src/app/skills/skill-detail-page.spec.tsx
```

Expected: PASS across mobile cards, desktop panel, compact-surface sheet, full detail reuse, unchanged URL, and focus restoration.

- [ ] **Step 7: Commit the responsive master-detail experience**

Inspect `git diff`, then stage only:

```bash
git add apps/github.io/src/app/skills/skill-table-detail-layout.tsx apps/github.io/src/app/skills/skill-table-detail-layout.spec.tsx apps/github.io/src/app/skills/skills-page.tsx apps/github.io/src/app/skills/skills-page.spec.tsx
git diff --cached
git commit -m "feat(github.io): add responsive skill table detail"
```

### Task 4: Add visual states, run full verification, and maintain OpenWiki

**Files:**
- Modify: `apps/github.io/src/app/skills/skills-page.stories.tsx`
- Modify: `apps/github.io/src/app/skills/skills-page.stories.spec.ts`
- Modify if required by documented workflow: generated files under `openwiki/`

**Interfaces:**
- Consumes: completed `SkillsPage`, exported responsive queries, and canonical skills.
- Produces: deterministic mobile, desktop-open, and coarse-tablet-open Storybook states.

- [ ] **Step 1: Add failing story-manifest assertions**

Update `skills-page.stories.spec.ts` to require these named exports:

```ts
expect(skillsPageStories).toMatchObject({
  MobileCards: expect.any(Object),
  DesktopTableDetail: expect.any(Object),
  CoarseTabletBottomSheet: expect.any(Object),
});
```

- [ ] **Step 2: Run the story test and verify the missing exports fail**

Run:

```bash
pnpm nx test github.io --testFile=src/app/skills/skills-page.stories.spec.ts
```

Expected: FAIL naming the absent story exports.

- [ ] **Step 3: Add deterministic visual stories**

Add `MobileCards`, `DesktopTableDetail`, and `CoarseTabletBottomSheet`. Use Storybook viewport parameters and a `play` function that activates a stable row by accessible name:

```tsx
export const DesktopTableDetail: Story = {
  parameters: { viewport: { defaultViewport: 'desktop' } },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('row', { name: /Kubernetes/ }));
    await expect(canvas.getByRole('region', { name: 'Kubernetes details' })).toBeVisible();
  },
};
```

For coarse tablet, set `window.matchMedia` in the story loader/decorator so `TABLE_QUERY` matches and `COMPACT_SURFACE_QUERY` matches, then activate the row and assert the labeled dialog is visible. Restore the original matcher after the story to prevent cross-story leakage.

- [ ] **Step 4: Run focused and full project verification**

Run:

```bash
pnpm nx test github.io --testFile=src/app/skills/skills-page.stories.spec.ts
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx build github.io
```

Expected: all commands exit 0. Preserve complete failure output and fix only failures caused by this branch.

- [ ] **Step 5: Run Storybook/browser visual checks**

Start the repository's existing Storybook target discovered from `apps/github.io/project.json`. Inspect the three stories at mobile, tablet, and desktop widths. Verify:

- cards and card links remain usable on mobile;
- the table is not clipped at rest;
- the non-compact panel starts at 380px and resizes within 320–560px;
- the resize handle and panel draw only one divider;
- coarse tablet opens a tall bottom sheet and leaves the table intact underneath;
- long metadata, evidence, experience, and projects scroll inside the detail surface;
- selection highlight, Escape dismissal, close control, and restored row focus are visible;
- no heading, toolbar, table cell, or detail content overlaps or clips.

- [ ] **Step 6: Run the repository OpenWiki decision workflow**

Read `docs/agents/openwiki.md` and follow its exact post-implementation commands. Record one of `updated`, `unchanged`, or `blocked` for the handoff. Do not hand-edit generated pages unless that document explicitly directs it.

- [ ] **Step 7: Run `/review` and resolve blocking findings**

Review the complete branch against the approved spec, this plan, `AGENTS.md`, and `apps/github.io/AGENTS.md`. Re-run affected focused tests after any correction. Keep corrections in a separate logical commit with explicit paths, for example:

```bash
git add apps/github.io/src/app/skills/skills-page.tsx apps/github.io/src/app/skills/skills-page.spec.tsx
git diff --cached
git commit -m "fix(github.io): address skill table detail review"
```

- [ ] **Step 8: Commit stories and any required generated wiki update**

Inspect `git diff` and `git diff --cached`. Stage only story files and any verified OpenWiki outputs:

```bash
git add apps/github.io/src/app/skills/skills-page.stories.tsx apps/github.io/src/app/skills/skills-page.stories.spec.ts
git diff --cached
git commit -m "test(github.io): cover responsive skill table detail"
```

If OpenWiki produced tracked changes, stage those explicit paths and commit them separately with the concrete subject `docs(github.io): update responsive skill table wiki`.

- [ ] **Step 9: Confirm awaiting-handoff state**

Run:

```bash
git status --short --branch
git log --oneline --decorate -8
```

Expected: clean `feat/skills-table-detail` worktree with local commits only. Do not push, open a pull request, merge, or deploy; report verification and OpenWiki status and wait for the user's explicit handoff request.
