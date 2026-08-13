# Home Skill Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `HomePage` the app home, remove the obsolete mobile app shell and story, and route both skill cards and command-palette selections to durable skill detail pages with `Home / Skills / [Skill name]` breadcrumbs.

**Architecture:** `App` owns the router, neutral Astryx theme, and Astryx-to-React-Router link adapter. A shared route helper builds every skill detail path; `SkillCard` delegates navigation and nested-link handling to Astryx `ClickableCard`, while `HomePage` uses `useNavigate` for command-palette selection. The route URL is the only active-page state.

**Tech Stack:** React 19, React Router 7, Astryx Core, StyleX, TypeScript, Vitest, Testing Library, Storybook 10, Nx, pnpm.

## Global Constraints

- Work only in the linked worktree at `.worktrees/home-skill-navigation` on branch `feat/home-skill-navigation`.
- Use `pnpm` and the verified Nx project name `github.io`.
- Use route-native client navigation; do not add selected-skill page state.
- Keep `/skills/:skillId` as the skill detail URL and centralize its construction.
- Use Astryx `ClickableCard` and `LinkProvider`; do not add custom card overlay CSS or local card click handlers.
- Keep certification citation links independent from the card route link.
- Keep command-palette skill results text-only.
- Do not add `/skills`, `SkillsPage`, a placeholder page, a redirect, or a disabled breadcrumb link.
- Do not redesign `HomePage`, `SkillCard`, `CommandPalette`, breadcrumbs, or skill detail content.
- Do not change skill IDs, canonical skill data, or skill detail resolution.
- Do not rewrite historical specs or solution documents.
- Stage explicit paths only; never use `git add .`, `git add -A`, `git add --all`, or `git add -u`.
- Use conventional commits and stop after local commits; do not push, open a PR, merge, or deploy.

## File Structure

- Create `apps/github.io/src/app/router-link.tsx`: adapt Astryx's `href` link contract to React Router's `to` contract.
- Create `apps/github.io/src/app/skills/skill-route.ts`: own `getSkillDetailPath(skillId: string): string`.
- Create `apps/github.io/src/app/skills/skill-route.spec.ts`: test canonical path construction and URL encoding.
- Modify `apps/github.io/src/app/skills/skill-card.tsx`: replace static `Card` with Astryx `ClickableCard` using the route helper.
- Modify `apps/github.io/src/app/skills/skill-card.spec.tsx`: provide router/link context and verify the card route link, preserved sizing, and independent citations.
- Modify `apps/github.io/src/app/skills/skill-carousel.spec.tsx`: provide router/link context while retaining carousel coverage.
- Modify `apps/github.io/src/app/app.tsx`: make `/` render `HomePage`, own shared providers, and remove per-route theme wrappers.
- Modify `apps/github.io/src/app/app.spec.tsx`: verify route-authoritative card and palette navigation plus existing direct/not-found routes.
- Modify `apps/github.io/src/app/skills/home-page.tsx`: remove `onSkillSelect` and navigate on a valid command selection.
- Modify `apps/github.io/src/app/skills/home-page.spec.tsx`: provide router/link context and verify navigation instead of callback delivery.
- Modify `apps/github.io/.storybook/preview.ts`: provide `MemoryRouter`, Astryx `LinkProvider`, and the existing neutral theme to every story.
- Delete `apps/github.io/src/app/app-shell.tsx`: remove temporary selected-skill state and duplicate detail resolution.
- Delete `apps/github.io/src/app/app-shell.stories.tsx`: remove the final `Mobile Skills Page` story.
- Modify `apps/github.io/src/app/skills/skill-detail-page.tsx`: render `Home / Skills / [Skill name]`.
- Modify `apps/github.io/src/app/skills/skill-detail-page.spec.tsx`: provide router/link context and assert breadcrumb order and link/current semantics.

---

### Task 1: Shared Router Adapter and Clickable Skill Cards

**Files:**

- Create: `apps/github.io/src/app/router-link.tsx`
- Create: `apps/github.io/src/app/skills/skill-route.ts`
- Create: `apps/github.io/src/app/skills/skill-route.spec.ts`
- Modify: `apps/github.io/src/app/skills/skill-card.tsx`
- Modify: `apps/github.io/src/app/skills/skill-card.spec.tsx`

**Interfaces:**

- Consumes: React Router `Link`, Astryx `LinkProvider`, Astryx `ClickableCard`, existing `Skill`, `SkillCardProps`, and `CertificationCitation`.
- Produces: `RouterLink(props: RouterLinkProps): ReactElement`, where `RouterLinkProps` accepts `href: string` plus anchor-compatible props; `getSkillDetailPath(skillId: string): string`; `SkillCard` with one accessible route link named after `skill.name`.
- Preserves: `SkillCardProps`, `data-testid="skill-card"`, the article's `aria-labelledby`, default/compact presentation, content-driven height, full-width behavior, and certification citation links.

- [ ] **Step 1: Add failing route-helper tests**

Create `apps/github.io/src/app/skills/skill-route.spec.ts`:

```ts
import { getSkillDetailPath } from './skill-route';

describe('getSkillDetailPath', () => {
  it('builds the canonical skill detail path', () => {
    expect(getSkillDetailPath('kubernetes')).toBe('/skills/kubernetes');
  });

  it('encodes a supplied route segment', () => {
    expect(getSkillDetailPath('c sharp')).toBe('/skills/c%20sharp');
  });
});
```

- [ ] **Step 2: Add failing clickable-card tests with provider context**

In `skill-card.spec.tsx`, import `ReactNode`, Astryx `LinkProvider`, React Router `MemoryRouter`, and the future `RouterLink`. Add this local renderer and replace every direct `render(...)` call in the file with `renderSkillCard(...)`:

```tsx
function RouterTestProviders({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <LinkProvider component={RouterLink}>{children}</LinkProvider>
    </MemoryRouter>
  );
}

function renderSkillCard(ui: ReactNode) {
  return render(ui, { wrapper: RouterTestProviders });
}
```

Add focused assertions:

```tsx
it('links the card to its canonical skill detail route', () => {
  const { getByRole } = renderSkillCard(<SkillCard skill={baseSkill} />);

  expect(getByRole('link', { name: 'Kubernetes' }).getAttribute('href')).toBe(
    '/skills/kubernetes',
  );
});

it('keeps certification links independent from the card route link', () => {
  const { getByRole } = renderSkillCard(
    <SkillCard
      skill={{
        ...baseSkill,
        certifications: [
          {
            title: 'CKA',
            url: 'https://example.com/cka',
            skills: ['Kubernetes'],
            expiresAt: '2028-02-26T10:59:00+11:00',
          },
        ],
      }}
    />,
  );

  const cardLink = getByRole('link', { name: 'Kubernetes' });
  const citationLink = getByRole('doc-noteref', { name: 'Citation 1: CKA' });

  expect(cardLink.contains(citationLink)).toBe(false);
  expect(cardLink.getAttribute('href')).toBe('/skills/kubernetes');
  expect(citationLink.getAttribute('href')).toBe('https://example.com/cka');
});
```

Retain all existing tests, including `.astryx-card` height assertions and duplicate title IDs.

- [ ] **Step 3: Run the focused tests and confirm RED**

Run:

```sh
pnpm nx test github.io -- --run src/app/skills/skill-route.spec.ts src/app/skills/skill-card.spec.tsx
```

Expected: FAIL because `skill-route.ts` and `RouterLink` do not exist and `SkillCard` is not clickable.

- [ ] **Step 4: Implement the centralized route helper**

Create `apps/github.io/src/app/skills/skill-route.ts`:

```ts
export function getSkillDetailPath(skillId: string): string {
  return `/skills/${encodeURIComponent(skillId)}`;
}
```

- [ ] **Step 5: Implement the Astryx-to-React-Router adapter**

Create `apps/github.io/src/app/router-link.tsx`:

```tsx
import { forwardRef, type ComponentProps, type ReactElement } from 'react';
import { Link } from 'react-router-dom';

export interface RouterLinkProps extends Omit<
  ComponentProps<'a'>,
  'href' | 'ref'
> {
  href: string;
}

export const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  function RouterLink({ href, ...props }, ref): ReactElement {
    return <Link ref={ref} to={href} {...props} />;
  },
);
```

- [ ] **Step 6: Replace static Card with ClickableCard**

In `skill-card.tsx`:

```tsx
import { ClickableCard } from '@astryxdesign/core/ClickableCard';
import { getSkillDetailPath } from './skill-route';
```

Replace the existing outer opening tag:

```tsx
<ClickableCard
  href={getSkillDetailPath(skill.id)}
  label={skill.name}
  padding={4}
  xstyle={[styles.root, isFullWidth && styles.fullWidth]}
>
```

Replace the matching outer `</Card>` with `</ClickableCard>`. Leave the
existing article and every child between those tags byte-for-byte unchanged.
Remove the old `Card` import. Do not add an `onClick`, local focus style, or
nested route link.

- [ ] **Step 7: Run focused tests and confirm GREEN**

Run:

```sh
pnpm nx test github.io -- --run src/app/skills/skill-route.spec.ts src/app/skills/skill-card.spec.tsx
```

Expected: PASS for both files; `SkillCard` still renders `.astryx-card`, remains content-driven, exposes `/skills/kubernetes`, and keeps citation links separate.

- [ ] **Step 8: Run direct consumer regressions**

Run:

```sh
pnpm nx test github.io -- --run src/app/skills/skill-carousel.spec.tsx src/app/skills/skill-list.spec.tsx
```

Expected: `skill-carousel.spec.tsx` fails outside provider context. Import
`ReactNode`, `MemoryRouter`, `LinkProvider`, and `RouterLink`, add the same
`RouterTestProviders` component from Step 2, and replace each direct render
with:

```tsx
render(ui, { wrapper: RouterTestProviders });
```

`skill-list.spec.tsx` does not render `SkillCard`; it remains a regression-only
check and should not be edited. Re-run the same command. Expected: PASS with
unchanged carousel/list assertions.

- [ ] **Step 9: Inspect and commit the shared navigation slice**

Run:

```sh
git diff --check
git diff -- apps/github.io/src/app/router-link.tsx apps/github.io/src/app/skills/skill-route.ts apps/github.io/src/app/skills/skill-route.spec.ts apps/github.io/src/app/skills/skill-card.tsx apps/github.io/src/app/skills/skill-card.spec.tsx apps/github.io/src/app/skills/skill-carousel.spec.tsx apps/github.io/src/app/skills/skill-list.spec.tsx
git status --short
```

Stage only paths actually changed by this task, then commit:

```sh
git add apps/github.io/src/app/router-link.tsx apps/github.io/src/app/skills/skill-route.ts apps/github.io/src/app/skills/skill-route.spec.ts apps/github.io/src/app/skills/skill-card.tsx apps/github.io/src/app/skills/skill-card.spec.tsx apps/github.io/src/app/skills/skill-carousel.spec.tsx apps/github.io/src/app/skills/skill-list.spec.tsx
git diff --cached --check
git commit -m "feat(github.io): link skill cards to details"
```

Omit unchanged consumer test paths from `git add`.

---

### Task 2: Route-Authoritative Home and Command Palette

**Files:**

- Modify: `apps/github.io/src/app/app.tsx`
- Modify: `apps/github.io/src/app/app.spec.tsx`
- Modify: `apps/github.io/src/app/skills/home-page.tsx`
- Modify: `apps/github.io/src/app/skills/home-page.spec.tsx`
- Modify: `apps/github.io/.storybook/preview.ts`
- Delete: `apps/github.io/src/app/app-shell.tsx`
- Delete: `apps/github.io/src/app/app-shell.stories.tsx`

**Interfaces:**

- Consumes: Task 1 `RouterLink`, `getSkillDetailPath`, existing `HomePage`, `SkillDetailRoute`, and `NotFoundPage`.
- Produces: exported `AppProviders({ children }: { children: ReactNode }): ReactElement`; `AppRoutes(): ReactElement` with `/` mapped directly to `HomePage`; `HomePageProps` containing only optional `skills` and `highlightedSkills`.
- Preserves: neutral theme on every route, home layout/search behavior, text-only command results, valid detail routes, and not-found handling.

- [ ] **Step 1: Rewrite the app integration expectation for route navigation**

In `app.spec.tsx`, import `useLocation` and add this test helper:

```tsx
function LocationProbe() {
  const location = useLocation();
  return <output aria-label="Current location">{location.pathname}</output>;
}
```

Where testing `AppRoutes` with `MemoryRouter`, render `<LocationProbe />` beside `<AppRoutes />`.

Replace the old `replaces home content with the selected skill page` test with two tests. The card test must select the link named for the highlighted Kubernetes card and click it:

```tsx
it('navigates from a home skill card to its detail route', async () => {
  const { getByRole, queryByRole } = render(<App />);

  fireEvent.click(getByRole('link', { name: 'Kubernetes' }));

  await waitFor(() => {
    expect(window.location.pathname).toBe('/skills/kubernetes');
  });
  expect(getByRole('heading', { level: 1, name: 'Kubernetes' })).toBeTruthy();
  expect(queryByRole('main', { name: 'Home' })).toBeNull();
});
```

Keep the existing palette interaction but assert the URL:

```tsx
it('navigates from a command result to its detail route', async () => {
  const { getByRole, queryByRole } = render(<App />);

  fireEvent.click(getByRole('button', { name: 'Search skills' }));
  fireEvent.change(getByRole('combobox', { name: 'Search skills' }), {
    target: { value: 'terraform' },
  });
  const option = await waitFor(() =>
    getByRole('option', { name: 'Terraform' }),
  );
  expect(within(option).queryByRole('img')).toBeNull();
  fireEvent.click(option);

  await waitFor(() => {
    expect(window.location.pathname).toBe('/skills/terraform');
  });
  expect(getByRole('heading', { level: 1, name: 'Terraform' })).toBeTruthy();
  expect(queryByRole('main', { name: 'Home' })).toBeNull();
});
```

Retain tests for root home layout, valid direct detail routes, unknown skill routes, and wildcard routes.

- [ ] **Step 2: Replace the HomePage callback test with navigation output**

In `home-page.spec.tsx`, import `MemoryRouter`, `useLocation`, `LinkProvider`, `RouterLink`, and `getSkillDetailPath`. Change `renderHomePage` to include both providers and a location probe:

```tsx
function LocationProbe() {
  const location = useLocation();
  return <output aria-label="Current location">{location.pathname}</output>;
}

const renderHomePage = (props: ComponentProps<typeof HomePage> = {}) =>
  render(
    <MemoryRouter>
      <LinkProvider component={RouterLink}>
        <Theme theme={neutralTheme}>
          <HomePage {...props} />
          <LocationProbe />
        </Theme>
      </LinkProvider>
    </MemoryRouter>,
  );
```

Replace the callback assertion with:

```tsx
it('navigates to the selected skill while keeping results text-only', async () => {
  const { getByLabelText, getByRole } = renderHomePage();

  fireEvent.click(getByRole('button', { name: 'Search skills' }));
  const terraformOption = await waitFor(() =>
    getByRole('option', { name: 'Terraform' }),
  );

  expect(within(terraformOption).queryByRole('img')).toBeNull();
  fireEvent.click(terraformOption);

  expect(getByLabelText('Current location').textContent).toBe(
    getSkillDetailPath('terraform'),
  );
});
```

- [ ] **Step 3: Run app and home tests and confirm RED**

Run:

```sh
pnpm nx test github.io -- --run src/app/app.spec.tsx src/app/skills/home-page.spec.tsx
```

Expected: FAIL because `AppShell` still owns selection, `HomePage` still calls `onSkillSelect`, and shared providers are not configured at app scope.

- [ ] **Step 4: Make HomePage navigate from command selection**

In `home-page.tsx`:

```tsx
import { useNavigate } from 'react-router-dom';
import { getSkillDetailPath } from './skill-route';
```

Remove `onSkillSelect` from `HomePageProps` and component destructuring. Instantiate navigation:

```tsx
const navigate = useNavigate();
```

Replace the callback in `onValueChange`:

```tsx
if (selectedSkill) {
  navigate(getSkillDetailPath(selectedSkill.id));
}
```

Keep `selectedSkillId` because `CommandPalette` remains controlled until navigation unmounts the page. Do not add an effect or manually close the dialog.

- [ ] **Step 5: Make App own providers and direct routes**

In `app.tsx`, remove `AppShell`. Import `ReactNode`, Astryx `LinkProvider`, `RouterLink`, and `HomePage`. Add:

```tsx
export function AppProviders({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <LinkProvider component={RouterLink}>
      <Theme theme={neutralTheme}>{children}</Theme>
    </LinkProvider>
  );
}
```

Make the route elements direct:

```tsx
export function AppRoutes(): ReactElement {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/skills/:skillId" element={<SkillDetailRoute />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export function App(): ReactElement {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}
```

Import `AppProviders` in `app.spec.tsx` and wrap every direct `AppRoutes`
rendering as follows:

```tsx
<MemoryRouter initialEntries={['/skills/kubernetes']}>
  <AppProviders>
    <AppRoutes />
    <LocationProbe />
  </AppProviders>
</MemoryRouter>
```

Use each test's existing initial route. Do not duplicate providers inside
individual routes.

- [ ] **Step 6: Delete obsolete shell files and prove active references are gone**

Delete:

- `apps/github.io/src/app/app-shell.tsx`
- `apps/github.io/src/app/app-shell.stories.tsx`

Run:

```sh
rg -n "AppShell|Mobile Skills Page|onSkillSelect" apps/github.io/src apps/github.io/.storybook
```

Expected: no matches. Do not edit historical files under `docs/`.

- [ ] **Step 7: Give Storybook the router and Astryx link adapter**

In `.storybook/preview.ts`, import `MemoryRouter`, Astryx `LinkProvider`, and `RouterLink`. Replace the single decorator body with provider order matching the app:

```tsx
(Story) =>
  createElement(
    MemoryRouter,
    undefined,
    createElement(
      LinkProvider,
      { component: RouterLink },
      createElement(Theme, { theme: neutralTheme }, createElement(Story)),
    ),
  );
```

Keep existing CSS imports and preview parameters unchanged.

- [ ] **Step 8: Run the route-authority tests and confirm GREEN**

Run:

```sh
pnpm nx test github.io -- --run src/app/app.spec.tsx src/app/skills/home-page.spec.tsx src/app/skills/home-page.stories.spec.ts
```

Expected: PASS; card and palette actions both render detail pages at their canonical URLs, and the Home story hierarchy remains `GitHub.io/Home/Home Page`.

- [ ] **Step 9: Inspect and commit the app routing slice**

Run:

```sh
git diff --check
git diff -- apps/github.io/src/app/app.tsx apps/github.io/src/app/app.spec.tsx apps/github.io/src/app/skills/home-page.tsx apps/github.io/src/app/skills/home-page.spec.tsx apps/github.io/.storybook/preview.ts apps/github.io/src/app/app-shell.tsx apps/github.io/src/app/app-shell.stories.tsx
git status --short
```

Stage and commit explicitly:

```sh
git add apps/github.io/src/app/app.tsx apps/github.io/src/app/app.spec.tsx apps/github.io/src/app/skills/home-page.tsx apps/github.io/src/app/skills/home-page.spec.tsx apps/github.io/.storybook/preview.ts apps/github.io/src/app/app-shell.tsx apps/github.io/src/app/app-shell.stories.tsx
git diff --cached --check
git commit -m "refactor(github.io): make home route authoritative"
```

---

### Task 3: Future-Ready Skill Breadcrumb Hierarchy

**Files:**

- Modify: `apps/github.io/src/app/skills/skill-detail-page.tsx`
- Modify: `apps/github.io/src/app/skills/skill-detail-page.spec.tsx`

**Interfaces:**

- Consumes: Task 2 app-level `LinkProvider` behavior, existing Astryx `Breadcrumbs` and `BreadcrumbItem`, and `ResolvedSkillDetail`.
- Produces: breadcrumb order `Home`, `Skills`, current skill; `Home` routes to `/`; `Skills` is non-interactive; current skill has `aria-current="page"`.
- Preserves: `label="Skill breadcrumb"`, page heading focus behavior, metadata, evidence, projects, and certification content.

- [ ] **Step 1: Add a failing breadcrumb contract test**

In `skill-detail-page.spec.tsx`, import `ReactNode`, Astryx `LinkProvider`, React Router `MemoryRouter`, and `RouterLink`. Add:

```tsx
function SkillDetailTestProviders({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter initialEntries={['/skills/kubernetes']}>
      <LinkProvider component={RouterLink}>{children}</LinkProvider>
    </MemoryRouter>
  );
}

function renderSkillDetail(ui: ReactNode) {
  return render(ui, { wrapper: SkillDetailTestProviders });
}
```

Replace direct `render(<SkillDetailPage ... />)` calls with this helper. The
Testing Library wrapper persists when the existing focus test calls `rerender`,
so its bare `rerender(<SkillDetailPage ... />)` call remains valid. Add:

```tsx
it('renders Home, Skills, and the current skill in breadcrumb order', () => {
  const detail = getResolvedDetail('kubernetes');
  const { getByRole } = renderSkillDetail(<SkillDetailPage detail={detail} />);
  const breadcrumb = getByRole('navigation', { name: 'Skill breadcrumb' });
  const items = [...breadcrumb.querySelectorAll('li')];

  expect(items.map((item) => item.lastElementChild?.textContent)).toEqual([
    'Home',
    'Skills',
    'Kubernetes',
  ]);
  expect(
    within(breadcrumb).getByRole('link', { name: 'Home' }).getAttribute('href'),
  ).toBe('/');
  expect(within(breadcrumb).queryByRole('link', { name: 'Skills' })).toBeNull();
  expect(
    within(breadcrumb).getByText('Kubernetes').getAttribute('aria-current'),
  ).toBe('page');
});
```

Use the DOM emitted by installed Astryx `0.1.4`; do not test StyleX class names.

- [ ] **Step 2: Run the detail-page test and confirm RED**

Run:

```sh
pnpm nx test github.io -- --run src/app/skills/skill-detail-page.spec.tsx
```

Expected: FAIL because the first breadcrumb is currently linked as `Skills` and there are only two items.

- [ ] **Step 3: Implement the three-item breadcrumb**

In `skill-detail-page.tsx`, change only the breadcrumb children:

```tsx
<Breadcrumbs label="Skill breadcrumb">
  <BreadcrumbItem href="/">Home</BreadcrumbItem>
  <BreadcrumbItem isCurrent={false}>Skills</BreadcrumbItem>
  <BreadcrumbItem isCurrent>{detail.skill.name}</BreadcrumbItem>
</Breadcrumbs>
```

`isCurrent={false}` prevents Astryx auto-current detection while rendering
plain text without an `href`. Do not add `/skills` or an `onClick`.

- [ ] **Step 4: Run the detail and route tests and confirm GREEN**

Run:

```sh
pnpm nx test github.io -- --run src/app/skills/skill-detail-page.spec.tsx src/app/app.spec.tsx
```

Expected: PASS; detail rendering remains intact and the Home breadcrumb uses client-side routing through the provider.

- [ ] **Step 5: Inspect and commit the breadcrumb slice**

Run:

```sh
git diff --check
git diff -- apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx
git status --short
```

Stage and commit explicitly:

```sh
git add apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx
git diff --cached --check
git commit -m "feat(github.io): expand skill breadcrumbs"
```

---

### Task 4: Full Verification and Awaiting-Handoff Gate

**Files:**

- Modify only if verification reveals an issue: files already listed in Tasks 1–3.

**Interfaces:**

- Consumes: all completed tasks and local commits.
- Produces: verified `github.io` tests, lint, production build, Storybook build, stale-reference scan, and clean worktree ready for `/review` and user-directed handoff.

- [ ] **Step 1: Run the stale-reference and diff checks**

Run:

```sh
rg -n "AppShell|Mobile Skills Page|onSkillSelect" apps/github.io/src apps/github.io/.storybook
git diff --check HEAD~3..HEAD
git status --short --branch
```

Expected: `rg` exits `1` with no matches; diff check emits nothing; worktree has no uncommitted implementation changes.

- [ ] **Step 2: Run the complete test suite**

Run:

```sh
pnpm nx test github.io
```

Expected: PASS. The baseline was 57 files and 570 tests before this change;
the final count should increase with `skill-route.spec.ts`. Existing jsdom
warnings about canvas and `window.scrollTo` may still appear but must not fail
the target.

- [ ] **Step 3: Run lint**

Run:

```sh
pnpm nx lint github.io
```

Expected: PASS with no errors. Fix warnings introduced by this change; do not refactor unrelated warnings.

- [ ] **Step 4: Run the production build**

Run:

```sh
pnpm nx build github.io
```

Expected: PASS and produce the existing `github.io` build output without route/type errors.

- [ ] **Step 5: Build Storybook**

Run:

```sh
pnpm nx build-storybook github.io
```

Expected: PASS. Confirm no story import refers to deleted `AppShell`, and router-backed cards render during story compilation.

- [ ] **Step 6: Exercise the card and breadcrumb stories visually**

Run:

```sh
pnpm nx storybook github.io
```

Inspect at minimum:

- `GitHub.io/Home/Home Page` — top skill cards retain dimensions and palette opens.
- `GitHub.io/Skills/Skill Card` / `With Multiple Certifications` — the card has visible keyboard focus, card navigation works, and certification citation opens its own URL without triggering the skill route.
- `GitHub.io/Skills/Skill Detail Page` — breadcrumb visibly reads `Home / Skills / [Skill name]`, with only `Home` interactive.

Stop the dev server after inspection. Record any inability to perform browser inspection; do not claim it passed without observing it.

- [ ] **Step 7: Run `/review` before finalizing non-trivial changes**

Review the branch diff against:

- `docs/superpowers/specs/2026-08-13-home-skill-navigation-design.md`
- this implementation plan
- root `AGENTS.md`

Resolve any blocking findings with a new focused test and a separate conventional commit. Re-run the affected focused command and the full command that exposed the issue.

- [ ] **Step 8: Report awaiting handoff**

Run:

```sh
git status --short --branch
git log --oneline --decorate -6
```

Expected: clean `feat/home-skill-navigation` worktree containing the two design commits, plan commit, and implementation commits. Report changed behavior, verification results, any known warnings, and that no push/PR/deploy occurred. Stop in `awaiting handoff`; only the repository's manual `handoff` profile may push, open a PR, or deploy after explicit user approval.
