# Storybook Story Organization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize GitHub.io Storybook into route-review pages, shared navigation, and reusable domain components.

**Architecture:** Keep existing story files colocated with their subjects and introduce one route catalogue based on `AppRoutes`. Explicit Storybook titles define the reviewer-facing taxonomy, while the preview decorator continues to own the theme, router, and link-provider context. A metadata regression test is the single source of truth for the expected sidebar taxonomy and canonical routes.

**Tech Stack:** React, TypeScript, Storybook for React/Vite, React Router, Vitest, Nx, pnpm.

**Spec:** `docs/superpowers/specs/2026-08-30-storybook-story-organization-design.md`

## Global Constraints

- Do not create a production `pages/` source directory or change application routes, navigation behavior, UI, or data.
- Keep story files colocated with the screen or reusable component they document.
- Use `Pages`, `Navigation`, and `Components/<domain>` as the only top-level Storybook taxonomy.
- Preserve the global preview decorator as the owner of theme, router, and link-adapter setup.
- Treat changed story titles as Storybook URL/ID migrations and update title- or ID-sensitive tests in the same task.
- Do not add dependencies.

---

## File structure

| File | Responsibility |
| --- | --- |
| `apps/github.io/src/app/app-routes.stories.tsx` | Canonical route-aware stories for Home, Skills, Skill Detail, Roadmap, and Not Found. |
| `apps/github.io/.storybook/story-taxonomy.spec.ts` | Imports every story metadata export and asserts its title plus each canonical route parameter. |
| `apps/github.io/.storybook/preview.ts` | Adds deterministic sidebar order only if existing Storybook defaults do not meet the required `Pages`, `Navigation`, `Components` journey. |
| Existing `*.stories.tsx` files | Change only `meta.title` values to the agreed taxonomy; retain fixtures and play functions. |

## Task 1: Add canonical route-page stories and their metadata tests

**Files:**
- Create: `apps/github.io/src/app/app-routes.stories.tsx`
- Create: `apps/github.io/.storybook/story-taxonomy.spec.ts`
- Modify: `apps/github.io/.storybook/story-routes.spec.ts`

**Interfaces:**
- Consumes: `AppRoutes` from `src/app/app.tsx`, and the existing preview `appRoute` convention (`context.parameters['appRoute']` is a string).
- Produces: a `Pages` story group with `Home`, `Skills`, `SkillDetail`, `Roadmap`, and `NotFound` named exports; each export declares its canonical `appRoute`.

- [ ] **Step 1: Write the failing taxonomy test**

Create `apps/github.io/.storybook/story-taxonomy.spec.ts`. Import the default metadata and named route stories from `../src/app/app-routes.stories`, then assert the following exact contract:

```ts
expect(pageMeta.title).toBe('Pages');
expect(Home.parameters?.appRoute).toBe('/');
expect(Skills.parameters?.appRoute).toBe('/skills');
expect(SkillDetail.parameters?.appRoute).toBe('/skills/kubernetes');
expect(Roadmap.parameters?.appRoute).toBe('/roadmap');
expect(NotFound.parameters?.appRoute).toBe('/missing');
```

Also render the `NotFound` story through the existing `decorateStory` helper in `story-routes.spec.ts` and assert that the not-found page heading/recovery link is visible. This proves the fallback route is exercised through `AppRoutes`, rather than by directly rendering `NotFoundPage`.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `pnpm nx test github.io --testPathPattern=story-taxonomy|story-routes`

Expected: FAIL because `app-routes.stories.tsx` and its route-story exports do not yet exist.

- [ ] **Step 3: Create the minimal route catalogue**

Create `apps/github.io/src/app/app-routes.stories.tsx` with `AppRoutes` as its component, a `Pages` title, fullscreen layout, and five named stories:

```ts
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AppRoutes } from './app';

const meta = {
  component: AppRoutes,
  parameters: { layout: 'fullscreen' },
  title: 'Pages',
} satisfies Meta<typeof AppRoutes>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = { parameters: { appRoute: '/' } };
export const Skills: Story = { parameters: { appRoute: '/skills' } };
export const SkillDetail: Story = {
  parameters: { appRoute: '/skills/kubernetes' },
};
export const Roadmap: Story = { parameters: { appRoute: '/roadmap' } };
export const NotFound: Story = { parameters: { appRoute: '/missing' } };
```

Use the existing preview decorator unchanged: a string `appRoute` already causes it to create a `MemoryRouter` at that URL and render `AppRoutes` directly.

- [ ] **Step 4: Make the route assertion precise and run it**

Use the existing `NotFoundPage` accessible heading and recovery-link contract from `apps/github.io/src/app/not-found-page.spec.tsx`; do not introduce new production test IDs. Run:

`pnpm nx test github.io --testPathPattern=story-taxonomy|story-routes`

Expected: PASS.

- [ ] **Step 5: Commit the route catalogue**

```bash
git add apps/github.io/src/app/app-routes.stories.tsx \
  apps/github.io/.storybook/story-taxonomy.spec.ts \
  apps/github.io/.storybook/story-routes.spec.tsx
git commit -m "test(github.io): cover canonical Storybook routes"
```

## Task 2: Move existing stories to the agreed taxonomy

**Files:**
- Modify: `apps/github.io/src/app/global-navigation-layout.stories.tsx`
- Modify: `apps/github.io/src/app/global-navigation-footer.stories.tsx`
- Modify: `apps/github.io/src/app/skills/*.stories.tsx`
- Modify: `apps/github.io/src/app/projects/project-card.stories.tsx`
- Modify: `apps/github.io/src/app/certifications/certification-citation.stories.tsx`
- Modify: `apps/github.io/src/app/devops-roadmap/*.stories.tsx`
- Modify: `apps/github.io/src/app/devops-capability-evidence/*.stories.tsx`
- Modify: `apps/github.io/src/app/not-found-page.stories.tsx`
- Modify: `apps/github.io/.storybook/story-taxonomy.spec.ts`

**Interfaces:**
- Consumes: every story's default metadata object and its current fixtures, args, and play functions.
- Produces: a complete title mapping with no legacy `GitHub.io/` titles and no top-level domain category outside `Pages`, `Navigation`, or `Components`.

- [ ] **Step 1: Extend the failing metadata test with the complete title map**

In `story-taxonomy.spec.ts`, import each default metadata object and assert this exact mapping. Retain existing named stories and fixtures; the test only checks story metadata.

| Current files | Required title |
| --- | --- |
| `global-navigation-layout.stories.tsx`, `global-navigation-footer.stories.tsx` | `Navigation/Global Navigation`, `Navigation/Footer` |
| `not-found-page.stories.tsx` | `Components/Pages/Not Found Page` |
| `skills/home-page.stories.tsx`, `skills/skills-page.stories.tsx`, `skills/skill-detail-page.stories.tsx` | `Components/Skills/Home Page`, `Components/Skills/Skills Page`, `Components/Skills/Skill Detail Page` |
| all other `skills/*.stories.tsx` | `Components/Skills/<existing component name>` |
| `projects/project-card.stories.tsx` | `Components/Projects/Project Card` |
| `certifications/certification-citation.stories.tsx` | `Components/Certifications/Certification Citation` |
| `devops-roadmap/devops-roadmap.stories.tsx`, `devops-roadmap/roadmap-page.stories.tsx` | `Components/DevOps Roadmap/Timeline`, `Components/DevOps Roadmap/Roadmap Page` |
| all `devops-capability-evidence/*.stories.tsx` | `Components/DevOps Capability Evidence/<existing component name>` |

The direct-render page stories deliberately become `Components/*` stories: the new `Pages` route catalogue is the canonical page-review surface, while these stories retain their existing isolated variants (`Empty`, `BasicSkill`, and so on).

- [ ] **Step 2: Run the taxonomy test and verify it fails**

Run: `pnpm nx test github.io --testPathPattern=story-taxonomy`

Expected: FAIL with mismatched legacy titles such as `GitHub.io/Skills/Skill Card`.

- [ ] **Step 3: Update titles only**

Change every `title` property according to the table. Do not rename source files, exports, fixtures, args, play functions, or production components. In particular, preserve:

```ts
export const Empty: Story = { args: { skills: [] } };
export const FilterControlsOpen: Story = { play: async (...) => { /* existing play */ } };
export const EnrichedKubernetes: Story = { args: { detail: kubernetesResolution.value } };
```

Leave `global-navigation-layout.stories.tsx`'s route variants intact under `Navigation/Global Navigation`; they cover shell behavior and complement the new `Pages` stories.

- [ ] **Step 4: Run focused metadata and existing Storybook tests**

Run: `pnpm nx test github.io --testPathPattern=story-taxonomy|story-routes|stories`

Expected: PASS. If a snapshot, title assertion, or Storybook ID assertion fails, update only the expectation that refers to the deliberately migrated title/ID.

- [ ] **Step 5: Commit the taxonomy migration**

```bash
git add apps/github.io/src/app/global-navigation-layout.stories.tsx \
  apps/github.io/src/app/global-navigation-footer.stories.tsx \
  apps/github.io/src/app/skills/home-greeting.stories.tsx \
  apps/github.io/src/app/skills/home-page.stories.tsx \
  apps/github.io/src/app/skills/skill-avatar.stories.tsx \
  apps/github.io/src/app/skills/skill-card.stories.tsx \
  apps/github.io/src/app/skills/skill-carousel.stories.tsx \
  apps/github.io/src/app/skills/skill-category.stories.tsx \
  apps/github.io/src/app/skills/skill-confidence.stories.tsx \
  apps/github.io/src/app/skills/skill-detail-page.stories.tsx \
  apps/github.io/src/app/skills/skill-experience-card-list.stories.tsx \
  apps/github.io/src/app/skills/skill-experience-card.stories.tsx \
  apps/github.io/src/app/skills/skill-list-item.stories.tsx \
  apps/github.io/src/app/skills/skill-list.stories.tsx \
  apps/github.io/src/app/skills/skill-search.stories.tsx \
  apps/github.io/src/app/skills/skill-section.stories.tsx \
  apps/github.io/src/app/skills/skills-page.stories.tsx \
  apps/github.io/src/app/skills/skill-token.stories.tsx \
  apps/github.io/src/app/projects/project-card.stories.tsx \
  apps/github.io/src/app/certifications/certification-citation.stories.tsx \
  apps/github.io/src/app/devops-roadmap/devops-roadmap.stories.tsx \
  apps/github.io/src/app/devops-roadmap/roadmap-page.stories.tsx \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.stories.tsx \
  apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.stories.tsx \
  apps/github.io/src/app/devops-capability-evidence/dora-capability-card.stories.tsx \
  apps/github.io/src/app/not-found-page.stories.tsx \
  apps/github.io/.storybook/story-taxonomy.spec.ts
git commit -m "refactor(github.io): organize Storybook stories"
```

## Task 3: Make sidebar order deterministic and verify Storybook output

**Files:**
- Modify: `apps/github.io/.storybook/preview.ts`
- Modify: `apps/github.io/.storybook/story-taxonomy.spec.ts`

**Interfaces:**
- Consumes: the title contract created by Tasks 1 and 2.
- Produces: Storybook manager configuration whose root ordering is `Pages`, then `Navigation`, then `Components`, with normal ordering within those groups.

- [ ] **Step 1: Write the failing configuration assertion**

In `story-taxonomy.spec.ts`, import `preview` and assert the manager order is present:

```ts
expect(preview.parameters?.options?.storySort).toEqual({
  order: ['Pages', 'Navigation', 'Components'],
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `pnpm nx test github.io --testPathPattern=story-taxonomy`

Expected: FAIL because the preview has no `options.storySort` configuration.

- [ ] **Step 3: Add the minimal Storybook sort policy**

Extend the existing `parameters` object in `apps/github.io/.storybook/preview.ts` without changing its decorator:

```ts
parameters: {
  options: {
    storySort: {
      order: ['Pages', 'Navigation', 'Components'],
    },
  },
  controls: {
    // existing matcher configuration
  },
},
```

- [ ] **Step 4: Run final app and Storybook validation**

Run, in order:

```bash
pnpm nx lint github.io
pnpm nx test github.io
pnpm nx build github.io
pnpm nx build-storybook github.io
```

Expected: each command exits successfully. Open the generated Storybook or the development Storybook target and confirm the sidebar begins with `Pages`, followed by `Navigation` and `Components`; confirm the five route stories use `/`, `/skills`, `/skills/kubernetes`, `/roadmap`, and `/missing`.

- [ ] **Step 5: Commit deterministic ordering**

```bash
git add apps/github.io/.storybook/preview.ts \
  apps/github.io/.storybook/story-taxonomy.spec.ts
git commit -m "chore(github.io): order Storybook review groups"
```

## Plan self-review

- **Spec coverage:** Tasks 1–2 provide canonical route pages, retain navigation separately, and migrate reusable stories by domain. Task 3 provides the optional-but-required-by-approved-design deterministic ordering and verifies Storybook output. No production routes, UI, data, dependencies, or physical `pages/` directory are included.
- **Placeholder scan:** No deferred work markers or unspecified test steps remain; title mapping, route values, expected failures, commands, and commit subjects are explicit.
- **Type consistency:** `appRoute` is consistently the existing string story parameter; every route story renders `AppRoutes`, which the preview decorator already recognizes.
