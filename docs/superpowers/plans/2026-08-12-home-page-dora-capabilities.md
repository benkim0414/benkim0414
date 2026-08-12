# Home Page DORA Capabilities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Repository instructions preselect subagent-driven development.

**Goal:** Rename the mobile skills landing surface to `HomePage`, keep a text-only searchable skill reference and labeled top-five carousel, and replace the full skills list with an explained, evidence-backed DORA capability collection.

**Architecture:** `HomePage` remains the composition root inside `AppShell`: it owns the constrained mobile frame, command-palette visibility, and section ordering while delegating skill presentation to `SkillCarousel` and capability presentation to `DoraCapabilityCard`. It consumes the canonical skill and DORA data modules directly, removes page-level skill selection state, and relies on each DORA card to project its own evidence and score summary.

**Tech Stack:** React 19, TypeScript, Nx, pnpm, Vitest, Testing Library, Storybook, Astryx (`TopNav`, `CommandPalette`, `Banner`, `Link`, `Layout`, `Text`), Tailwind utilities backed by Astryx tokens.

## Global Constraints

- Work only in the linked worktree `/home/benkim0414/workspace/benkim0414/.worktrees/home-page-dora-capabilities` on branch `feat/home-page-dora-capabilities`.
- Use pnpm and focused Nx targets for `github.io`; do not add dependencies or tooling.
- Before changing UI code, re-run `pnpm exec astryx docs layout` and inspect `Banner`, `CommandPalette`, `Link`, `Heading`, and `TopNav` with `pnpm exec astryx component <name>`.
- Preserve the existing `max-w-md`, `h-dvh`, persistent-navigation, fixed-carousel, and scrollable-main frame.
- Use visible labels exactly as `Top skills` and `DORA capabilities`.
- Use banner title exactly as `About DORA capabilities`.
- Use this banner description exactly: `DORA capabilities are technical, process, and cultural practices associated with stronger software delivery and organizational performance. Each card connects a capability to supporting experience, certifications, and technical skills.`
- Use external link text exactly as `Learn more` and destination exactly as `https://dora.dev/capabilities/`.
- Do not implement a skill-detail page, route, navigation action, DORA card redesign, evidence/scoring change, or broader responsive-shell work.
- Stage explicit paths only and use conventional commits with the `github.io` scope.
- Keep each task in a separate logical commit and run both the specification and code-quality review gates required by `superpowers:subagent-driven-development`.

---

## File Map

- Rename `apps/github.io/src/app/skills/mobile-skills-page.tsx` to `apps/github.io/src/app/skills/home-page.tsx`: own the mobile home frame, skill search, labeled carousel, DORA introduction, and capability-card composition.
- Rename `apps/github.io/src/app/skills/mobile-skills-page.spec.tsx` to `apps/github.io/src/app/skills/home-page.spec.tsx`: verify the component contract with focused Astryx mocks and configurable skill props.
- Rename `apps/github.io/src/app/skills/mobile-skills-page.stories.tsx` to `apps/github.io/src/app/skills/home-page.stories.tsx`: expose the default, constrained-search-catalog, and empty-skill states for visual review.
- Modify `apps/github.io/src/app/app-shell.tsx`: render `HomePage` under the existing neutral Astryx theme.
- Modify `apps/github.io/src/app/app.spec.tsx`: exercise the real app root, real command palette, immutable home content after selection, and final DORA composition.
- Do not change `DoraCapabilityCard`, `SkillCarousel`, or any skill/DORA data module; they are consumed through their existing interfaces.

---

### Task 1: Establish the renamed home surface and reference-only skill search

**Files:**

- Rename: `apps/github.io/src/app/skills/mobile-skills-page.tsx` → `apps/github.io/src/app/skills/home-page.tsx`
- Rename: `apps/github.io/src/app/skills/mobile-skills-page.spec.tsx` → `apps/github.io/src/app/skills/home-page.spec.tsx`
- Rename: `apps/github.io/src/app/skills/mobile-skills-page.stories.tsx` → `apps/github.io/src/app/skills/home-page.stories.tsx`
- Modify: `apps/github.io/src/app/app-shell.tsx`
- Modify: `apps/github.io/src/app/app.spec.tsx`

**Interfaces:**

- Consumes: `Skill`, `skills`, `highlightedSkills`, `SkillCarousel`, `createStaticSource`, and Astryx `CommandPalette`.
- Produces: `HomePageProps { skills?: readonly Skill[]; highlightedSkills?: readonly Skill[] }` and `HomePage(props: HomePageProps): ReactElement` from `./skills/home-page`.
- Preserves for Task 2: the existing `All skills` region temporarily, so this task can prove that renaming and removing page-level selection are independently safe before the content replacement.

- [ ] **Step 1: Re-check the Astryx contracts used by this task**

Run:

```bash
pnpm exec astryx docs layout
pnpm exec astryx component CommandPalette
pnpm exec astryx component Heading
pnpm exec astryx component TopNav
```

Expected: each command exits successfully and confirms that `renderItem` is optional while `value` and `onValueChange` are picker-mode props.

- [ ] **Step 2: Rename the focused test and write failing home/search assertions**

Run:

```bash
git mv apps/github.io/src/app/skills/mobile-skills-page.spec.tsx apps/github.io/src/app/skills/home-page.spec.tsx
```

In `home-page.spec.tsx`, change the import, renderer, and suite names to `HomePage`, then change the command-palette mock so default text rendering works when `renderItem` is absent:

```tsx
type MockCommandItem = {
  id: string;
  label: string;
  auxiliaryData: { group: string };
};

CommandPalette: ({
  emptyBootstrapText,
  isOpen,
  input,
  label,
  renderItem,
  searchSource,
}: {
  emptyBootstrapText: ReactNode;
  isOpen: boolean;
  input: ReactNode;
  label: string;
  renderItem?: (item: MockCommandItem) => ReactNode;
  searchSource: { bootstrap: () => MockCommandItem[] };
}) => {
  if (!isOpen) return null;
  const items = searchSource.bootstrap();
  if (items.length === 0) {
    return (
      <div aria-label={label} role="dialog">
        {input}
        {emptyBootstrapText}
      </div>
    );
  }
  const groups = [...new Set(items.map((item) => item.auxiliaryData.group))];
  return (
    <div aria-label={label} role="dialog">
      {input}
      <div role="listbox">
        {groups.map((group) => (
          <div key={group}>
            <div>{group}</div>
            {items
              .filter((item) => item.auxiliaryData.group === group)
              .map((item) => (
                <div key={item.id}>{renderItem ? renderItem(item) : item.label}</div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
},
```

Replace the avatar test with:

```tsx
it('renders skill command results as names without avatars', async () => {
  const { getByRole } = renderHomePage();

  fireEvent.click(getByRole('button', { name: 'Search skills' }));
  const dialog = getByRole('dialog', { name: 'Search skills' });

  await waitFor(() => {
    expect(within(dialog).getByText('Skills')).toBeTruthy();
    expect(within(dialog).getByText('Kubernetes')).toBeTruthy();
  });
  expect(within(dialog).queryByRole('img', { name: 'Kubernetes' })).toBeNull();
});
```

Rename the shell test and assert the new page name and label:

```tsx
expect(getByRole('main', { name: 'Home' })).toBeTruthy();
expect(getByRole('heading', { level: 1, name: 'Home' })).toBeTruthy();
expect(getByRole('heading', { level: 2, name: 'Top skills' })).toBeTruthy();
```

In `app.spec.tsx`, replace the picker-filter test with a failing immutability test that clicks the real Terraform option and expects the full temporary skills list to remain:

```tsx
it('keeps home content unchanged when a skill command is selected', async () => {
  const { getAllByTestId, getByLabelText, getByRole } = render(<App />);

  fireEvent.click(getByRole('button', { name: 'Search skills' }));
  fireEvent.change(getByRole('combobox', { name: 'Search skills' }), {
    target: { value: 'terraform' },
  });
  const terraformOption = await waitFor(() =>
    getByRole('option', { name: 'Terraform' }),
  );
  expect(within(terraformOption).queryByRole('img')).toBeNull();
  fireEvent.click(terraformOption);

  expect(within(getByLabelText('Highlighted skills')).getAllByTestId('skill-card')).toHaveLength(5);
  expect(within(getByRole('region', { name: 'All skills' })).getAllByTestId('skill-card')).toHaveLength(17);
  expect(getAllByTestId('skill-card')).toHaveLength(22);
});
```

- [ ] **Step 3: Run the focused tests and confirm the rename contract fails**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/home-page.spec.tsx src/app/app.spec.tsx
```

Expected: FAIL because `./home-page` and `HomePage` do not exist yet and the app still exposes the old page semantics.

- [ ] **Step 4: Rename the source/story and implement the minimal home/search behavior**

Run:

```bash
git mv apps/github.io/src/app/skills/mobile-skills-page.tsx apps/github.io/src/app/skills/home-page.tsx
git mv apps/github.io/src/app/skills/mobile-skills-page.stories.tsx apps/github.io/src/app/skills/home-page.stories.tsx
```

In `home-page.tsx`:

- Rename `MobileSkillsPageProps` to `HomePageProps` and `MobileSkillsPage` to `HomePage`.
- Remove `SkillAvatar`, `HStack`, `SkillCommandResult`, `selectedSkillId`, `visibleSkills`, `listEmptyMessage`, `renderItem`, `value`, and `onValueChange`.
- Keep `skill` inside `auxiliaryData` because the search keyword function still reads its description, categories, and keywords.
- Add the hidden page title before the section headings and label the fixed carousel region:

```tsx
<VisuallyHidden as="h1" id="home-page-title">
  Home
</VisuallyHidden>
<CommandPalette
  isOpen={isSearchOpen}
  input={
    <CommandPaletteInput
      aria-label="Search skills"
      placeholder="Search skills"
    />
  }
  label="Search skills"
  maxHeight="min(80vh, 480px)"
  searchSource={skillSearchSource}
  width="min(calc(100vw - 32px), 448px)"
  emptyBootstrapText="No skills"
  emptySearchText="No skills"
  onOpenChange={setIsSearchOpen}
/>
<VStack
  className="shrink-0 bg-[var(--color-background-surface)]"
  gap={3}
  paddingBlock={4}
>
  <div className="px-4">
    <Text as="h2" type="body" weight="bold">
      Top skills
    </Text>
  </div>
  <SkillCarousel
    ariaLabel="Highlighted skills"
    emptyMessage="No highlighted skills have been supplied."
    padding={4}
    skills={highlightedSkills}
    variant="compact"
  />
</VStack>
<VStack
  aria-labelledby="home-page-title"
  as="main"
  className="min-h-0 flex-1"
  gap={3}
  isScrollable
  paddingBlock={4}
  paddingInline={4}
>
  <Text as="h2" type="body" weight="bold">
    All skills
  </Text>
  <SkillCardList heading="All skills" skills={skills} variant="compact" />
</VStack>
```

In `home-page.stories.tsx`, import and type against `HomePage`, set the title to `GitHub.io/Home/Home Page`, rename `SingleListSkill` to `SingleSearchSkill`, and keep the existing props for default, single-skill search data, and empty-skill data.

In `app-shell.tsx`, use:

```tsx
import { HomePage } from './skills/home-page';

export function AppShell() {
  return (
    <Theme theme={neutralTheme}>
      <HomePage />
    </Theme>
  );
}
```

- [ ] **Step 5: Run focused tests and the stale-name scan**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/home-page.spec.tsx src/app/app.spec.tsx
rg -n "MobileSkillsPage|mobile-skills-page" apps/github.io
```

Expected: both test files PASS; `rg` exits 1 with no matches.

- [ ] **Step 6: Review and commit the renamed home/search slice**

Run the task's specification-compliance and code-quality review gates. Resolve findings, then inspect and commit only these files:

```bash
git diff
git add apps/github.io/src/app/skills/home-page.tsx apps/github.io/src/app/skills/home-page.spec.tsx apps/github.io/src/app/skills/home-page.stories.tsx apps/github.io/src/app/app-shell.tsx apps/github.io/src/app/app.spec.tsx
git diff --cached
git commit -m "feat(github.io): establish home page skill search"
```

Expected: one commit containing the rename, text-only command results, immutable page content after selection, and the `Top skills` label.

---

### Task 2: Replace the full skills list with explained DORA capability cards

**Files:**

- Modify: `apps/github.io/src/app/skills/home-page.tsx`
- Modify: `apps/github.io/src/app/skills/home-page.spec.tsx`
- Modify: `apps/github.io/src/app/app.spec.tsx`
- Modify: `apps/github.io/src/app/skills/home-page.stories.tsx` only if visual QA exposes a story-specific viewport or state problem.

**Interfaces:**

- Consumes: `doraCapabilityDefinitions`, `devOpsCapabilityEvidenceItems`, `curatedDevOpsCapabilityRadarScores`, `doraCapabilityDescriptions`, and `DoraCapabilityCard`.
- Produces: a canonical ten-card DORA section under `DORA capabilities`; no new exported component or data type.
- Preserves: `HomePageProps`, text-only skill search, the five-skill carousel, and the mobile scroll-shell contract from Task 1.

- [ ] **Step 1: Re-check the Astryx information and link contracts**

Run:

```bash
pnpm exec astryx component Banner
pnpm exec astryx component Link
pnpm exec astryx component Heading
pnpm exec astryx docs layout
```

Expected: commands exit successfully; `Banner` requires `status` and `title`, accepts `description` and `endContent`, and `Link` supports `isExternalLink` and `isStandalone`.

- [ ] **Step 2: Write failing component tests for the DORA section**

Replace assertions for the `All skills` list in `home-page.spec.tsx` with these focused contracts:

```tsx
it('keeps top skills fixed above the scrollable DORA section', () => {
  const { getByLabelText, getByRole } = renderHomePage();
  const carousel = getByLabelText('Highlighted skills');
  const main = getByRole('main', { name: 'Home' });
  const doraHeading = getByRole('heading', {
    level: 2,
    name: 'DORA capabilities',
  });

  expect(getByRole('heading', { level: 2, name: 'Top skills' }))
    .toBeTruthy();
  expect(carousel.parentElement?.nextElementSibling).toBe(main);
  expect(main.contains(carousel)).toBe(false);
  expect(main.contains(doraHeading)).toBe(true);
  expect(main.className).toContain('flex-1');
  expect(main.className).toContain('astryx-stack');
});

it('explains DORA and uses a secondary button for the official capability catalog', () => {
  const { getByRole, getByText } = renderHomePage();

  expect(getByText('About DORA capabilities')).toBeTruthy();
  expect(
    getByText(
      'DORA capabilities are technical, process, and cultural practices associated with stronger software delivery and organizational performance. Each card connects a capability to supporting experience, certifications, and technical skills.',
    ),
  ).toBeTruthy();
  const cta = getByRole('link', { name: 'Learn more' });
  expect(cta.className).toContain('astryx-button');
  expect(cta.getAttribute('data-variant')).toBe('secondary');
  expect(cta.getAttribute('href')).toBe('https://dora.dev/capabilities/');
  expect(cta.getAttribute('target')).toBe('_blank');
  expect(cta.getAttribute('rel')).toContain('noopener');
  expect(cta.getAttribute('rel')).toContain('noreferrer');
});

it('renders all evidence-backed DORA cards in canonical order', () => {
  const { getAllByTestId } = renderHomePage();
  const cards = getAllByTestId('dora-capability-card');

  expect(cards).toHaveLength(doraCapabilityDefinitions.length);
  expect(
    cards.map((card) => within(card).getByRole('heading', { level: 3 }).textContent),
  ).toEqual(doraCapabilityDefinitions.map((capability) => capability.label));
  expect(
    within(cards[0]!).getByText(
      doraCapabilityDescriptions[doraCapabilityDefinitions[0].key],
    ),
  ).toBeTruthy();
  expect(within(cards[0]!).getByText('Relevant experience')).toBeTruthy();
});
```

Update the configurable-props tests so `skills={[]}` is verified by opening the palette and observing `No skills`, while `highlightedSkills={[]}` is verified through `No highlighted skills have been supplied.`. Remove assertions that supplied non-highlighted skills render as page cards.

Update `app.spec.tsx` to assert five skill cards, ten DORA cards, the banner link, and unchanged DORA content after clicking a skill command:

```tsx
const capabilityCardsBefore = getAllByTestId('dora-capability-card').map(
  (card) => card.textContent,
);
fireEvent.click(terraformOption);
expect(getAllByTestId('skill-card')).toHaveLength(5);
expect(getAllByTestId('dora-capability-card')).toHaveLength(10);
expect(getAllByTestId('dora-capability-card').map((card) => card.textContent))
  .toEqual(capabilityCardsBefore);
```

- [ ] **Step 3: Run focused tests and confirm the old full-list page fails**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/home-page.spec.tsx src/app/app.spec.tsx
```

Expected: FAIL because the page still renders `All skills`, has no DORA banner, and has no capability cards.

- [ ] **Step 4: Implement the DORA section with canonical data**

Replace `SkillCardList` with the existing DORA surfaces. The final `home-page.tsx` imports must include:

```tsx
import { Banner } from '@astryxdesign/core/Banner';
import { Link } from '@astryxdesign/core/Link';

import { DoraCapabilityCard } from '../devops-capability-evidence/dora-capability-card';
import { doraCapabilityDescriptions } from '../devops-capability-evidence/dora-capability-card.evidence';
import {
  curatedDevOpsCapabilityRadarScores,
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from '../devops-capability-evidence/devops-capability-evidence.data';
```

Replace the scrollable main contents with:

```tsx
<VStack
  aria-labelledby="home-page-title"
  as="main"
  className="min-h-0 flex-1"
  gap={3}
  isScrollable
  paddingBlock={4}
  paddingInline={4}
>
  <Text as="h2" type="body" weight="bold">
    DORA capabilities
  </Text>
  <Banner
    description="DORA capabilities are technical, process, and cultural practices associated with stronger software delivery and organizational performance. Each card connects a capability to supporting experience, certifications, and technical skills."
    endContent={
      <Button
        href="https://dora.dev/capabilities/"
        label="Learn more"
        rel="noopener noreferrer"
        target="_blank"
        variant="secondary"
      />
    }
    status="info"
    title="About DORA capabilities"
  />
  {doraCapabilityDefinitions.map((capability) => (
    <DoraCapabilityCard
      capability={capability}
      description={doraCapabilityDescriptions[capability.key]}
      evidence={devOpsCapabilityEvidenceItems}
      key={capability.key}
      scores={curatedDevOpsCapabilityRadarScores}
    />
  ))}
</VStack>
```

Do not introduce a home-specific evidence filter or score map. Remove the unused `SkillCardList` import.

- [ ] **Step 5: Run focused and complete automated verification**

Run:

```bash
pnpm nx test github.io -- --run src/app/skills/home-page.spec.tsx src/app/app.spec.tsx
pnpm nx lint github.io
pnpm nx test github.io
pnpm nx build github.io
pnpm nx build-storybook github.io
rg -n "MobileSkillsPage|mobile-skills-page|SkillCommandResult|selectedSkillId|visibleSkills" apps/github.io
```

Expected:

- Focused tests PASS.
- Lint, all tests, app build, and Storybook build exit 0.
- The full suite reports no failed tests; known jsdom canvas/scroll warnings may remain if the exit code is still 0.
- The stale-code `rg` exits 1 with no matches.

- [ ] **Step 6: Perform focused Storybook visual QA**

Run:

```bash
pnpm nx storybook github.io --host 127.0.0.1
```

Open the `GitHub.io/Home/Home Page` default and empty stories at a mobile viewport matching the existing `max-w-md` page. Verify:

- `Top skills` is visibly associated with the five-card carousel.
- The top navigation and carousel region stay fixed while the DORA region scrolls.
- The banner title, description, and external link wrap without clipping.
- All ten capability cards fit the constrained width without horizontal overflow.
- The empty carousel state stays beneath `Top skills`.
- Opening search shows text-only skill results; choosing one closes the palette without changing the carousel or DORA cards.

Stop the Storybook server after inspection. If any visual issue is found, add or adjust a focused regression test before changing the implementation, rerun Step 5, and repeat visual QA.

- [ ] **Step 7: Review and commit the DORA home slice**

Run the task's specification-compliance and code-quality review gates and the repository-required Codex `/review` over the complete branch diff. Resolve findings in explicit, logical fix commits if needed. Then inspect and commit the Task 2 files:

```bash
git diff
git add apps/github.io/src/app/skills/home-page.tsx apps/github.io/src/app/skills/home-page.spec.tsx apps/github.io/src/app/app.spec.tsx
git diff --cached
git commit -m "feat(github.io): showcase DORA capabilities on home"
git status --short --branch
```

If Storybook required a story-only adjustment, include the explicit path `apps/github.io/src/app/skills/home-page.stories.tsx` in the `git add` command. Expected: the feature files are committed, generated build output is not staged, and the branch is clean.

---

## Completion Gate

Before reporting implementation complete, fresh evidence must show:

- Both task commits and any review-fix commits are present on `feat/home-page-dora-capabilities`.
- `git status --short --branch` is clean.
- `pnpm nx lint github.io`, `pnpm nx test github.io`, `pnpm nx build github.io`, and `pnpm nx build-storybook github.io` all exit 0.
- Storybook visual QA has covered default and empty home stories at the constrained mobile width.
- No stale `MobileSkillsPage`, picker-state, or custom command-result identifiers remain.
- No push, PR, merge, or deployment occurs; stop in the repository's awaiting-handoff state.
