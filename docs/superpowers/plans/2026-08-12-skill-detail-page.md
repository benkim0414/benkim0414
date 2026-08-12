# Skill Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add clean, shareable skill detail routes with an Astryx-first editorial page, using Kubernetes as the complete example while every existing skill retains a valid basic view.

**Architecture:** Keep the existing compact `Skill` records unchanged and add explicit enrichment records resolved into a page view model. Render that model through focused experience, detail-page, and not-found components, then select them with React Router. Build a second Vite HTML entry as `404.html` so GitHub Pages can serve the SPA for direct clean-path visits without changing the requested browser URL.

**Tech Stack:** React 19, TypeScript, React Router DOM 7.18.2, Astryx 0.1.4, StyleX, Nx/Vite, Vitest, Testing Library, Storybook 10.

## Global Constraints

- Work only in the linked worktree at `/home/benkim0414/workspace/benkim0414/.worktrees/skill-detail-page` on branch `feat/skill-detail-page`.
- Run official Astryx CLI docs before using each new Astryx component; at minimum inspect `Breadcrumbs`, `Divider`, `Heading`, `Layout`, `Link`, and `Text`.
- Astryx is authoritative; use Material Design 3 only if Astryx has no applicable component or guidance. No current MD3 gap is approved.
- Do not modify `mobile-skills-page.tsx`, `skill-card.tsx`, `skill-card-list.tsx`, `skill-list-item.tsx`, or command-palette selection behavior.
- Do not add inbound navigation from cards, lists, or the command palette.
- Keep the existing `Skill` interface and summary records focused on list/card content.
- Reuse only public, non-sensitive evidence and explicit record IDs.
- Kubernetes is the only enriched skill in this implementation; other known skills render basic views without placeholder sections.
- Experience is a divided semantic list, not a collection of cards. Do not nest cards.
- The page is single-column at every viewport: full-width inside phone padding and centered at a wider readable measure on iPad and desktop.
- Stage explicit paths only and commit each task with a conventional subject.
- Before final handoff, run focused tests, full `github.io` tests, lint, app build, Storybook build, responsive browser QA, and Codex `/review`.

## File Structure

### Create

- `apps/github.io/src/app/skills/skill-detail.types.ts` — enrichment, source, resolution, and resolved view-model contracts.
- `apps/github.io/src/app/skills/skill-detail.data.ts` — Kubernetes enrichment record only.
- `apps/github.io/src/app/skills/skill-detail-resolver.ts` — pure ID-based resolution and public-safety validation.
- `apps/github.io/src/app/skills/skill-detail-resolver.spec.ts` — resolver, ordering, integrity, and safety tests.
- `apps/github.io/src/app/skills/skill-experience-list.tsx` — semantic divided experience rows.
- `apps/github.io/src/app/skills/skill-experience-list.spec.tsx` — list semantics and copy tests.
- `apps/github.io/src/app/skills/skill-detail-page.tsx` — responsive editorial page composition.
- `apps/github.io/src/app/skills/skill-detail-page.spec.tsx` — enriched and basic page tests.
- `apps/github.io/src/app/skills/skill-detail-page.stories.tsx` — Kubernetes and basic Storybook states.
- `apps/github.io/src/app/skills/skill-detail-route.tsx` — route-param resolution against production collections.
- `apps/github.io/src/app/not-found-page.tsx` — shared themed not-found content.
- `apps/github.io/src/app/not-found-page.spec.tsx` — not-found semantics and return link test.
- `apps/github.io/src/app/not-found-page.stories.tsx` — not-found visual state.
- `apps/github.io/404.html` — Vite-transformed GitHub Pages SPA fallback entry.

### Modify

- `package.json` — add `react-router-dom` 7.18.2.
- `pnpm-lock.yaml` — lock the new router dependency.
- `apps/github.io/src/app/app.tsx` — expose route composition and wrap it in `BrowserRouter`.
- `apps/github.io/src/app/app.spec.tsx` — cover clean skill routes and preserve root-page behavior.
- `apps/github.io/vite.config.ts` — build both `index.html` and `404.html` HTML entries.

### Explicitly untouched

- `apps/github.io/src/app/skills/mobile-skills-page.tsx`
- `apps/github.io/src/app/skills/skill-card.tsx`
- `apps/github.io/src/app/skills/skill-card-list.tsx`
- `apps/github.io/src/app/skills/skill-list-item.tsx`
- `apps/github.io/src/app/skills/skill-search.tsx`

---

### Task 1: Add validated skill-detail enrichment and resolution

**Files:**

- Create: `apps/github.io/src/app/skills/skill-detail.types.ts`
- Create: `apps/github.io/src/app/skills/skill-detail.data.ts`
- Create: `apps/github.io/src/app/skills/skill-detail-resolver.ts`
- Create: `apps/github.io/src/app/skills/skill-detail-resolver.spec.ts`

**Interfaces:**

- Consumes: existing `Skill`, `CapabilityEvidenceItem`, `Project`, `skills`, `devOpsCapabilityEvidenceItems`, and `sampleProjects` exports.
- Produces: `SkillDetailRecord`, `SkillDetailSources`, `ResolvedSkillDetail`, `SkillDetailResolution`, `skillDetailRecords`, and `resolveSkillDetail(skillId, sources)`.

- [ ] **Step 1: Write resolver tests before production code**

Create `skill-detail-resolver.spec.ts` with production-source coverage and small malformed fixtures:

```ts
import { devOpsCapabilityEvidenceItems } from '../devops-capability-evidence/devops-capability-evidence.data';
import { sampleProjects } from '../projects/project-list.data';
import { skillDetailRecords } from './skill-detail.data';
import { resolveSkillDetail } from './skill-detail-resolver';
import { skills } from './skill-list.data';

const productionSources = {
  skills,
  detailRecords: skillDetailRecords,
  evidenceItems: devOpsCapabilityEvidenceItems,
  projects: sampleProjects,
};

describe('resolveSkillDetail', () => {
  it('resolves Kubernetes enrichment in its authored order', () => {
    const result = resolveSkillDetail('kubernetes', productionSources);

    expect(result.status).toBe('found');
    if (result.status !== 'found') return;

    expect(result.value.skill.name).toBe('Kubernetes');
    expect(result.value.experienceEvidence.map(({ id }) => id)).toEqual([
      'argocd-environment-state-from-version-control',
      'deterministic-kubernetes-overlays',
      'reusable-kubernetes-deployment-foundations',
    ]);
    expect(result.value.projects.map(({ id }) => id)).toEqual(['homelab']);
  });

  it('resolves a known skill without invented enrichment', () => {
    const result = resolveSkillDetail('react', productionSources);

    expect(result).toMatchObject({
      status: 'found',
      value: {
        experienceSummary: undefined,
        experienceEvidence: [],
        projects: [],
      },
    });
  });

  it('distinguishes an unknown skill from a basic known skill', () => {
    expect(resolveSkillDetail('unknown-skill', productionSources)).toEqual({
      status: 'not-found',
    });
  });

  it('rejects missing, private, and sensitive evidence references', () => {
    const kubernetesDetail = skillDetailRecords[0];

    expect(() =>
      resolveSkillDetail('kubernetes', {
        ...productionSources,
        detailRecords: [
          { ...kubernetesDetail, experienceEvidenceIds: ['missing-evidence'] },
        ],
      }),
    ).toThrow('missing evidence "missing-evidence"');

    for (const evidence of [
      { ...devOpsCapabilityEvidenceItems[0], id: 'private', isPublic: false },
      {
        ...devOpsCapabilityEvidenceItems[0],
        id: 'sensitive',
        isPublic: true,
        isSensitive: true,
      },
    ]) {
      expect(() =>
        resolveSkillDetail('kubernetes', {
          ...productionSources,
          detailRecords: [
            { ...kubernetesDetail, experienceEvidenceIds: [evidence.id] },
          ],
          evidenceItems: [...devOpsCapabilityEvidenceItems, evidence],
        }),
      ).toThrow(/public, non-sensitive evidence/);
    }
  });

  it('rejects missing project references', () => {
    expect(() =>
      resolveSkillDetail('kubernetes', {
        ...productionSources,
        detailRecords: [
          { ...skillDetailRecords[0], projectIds: ['missing-project'] },
        ],
      }),
    ).toThrow('missing project "missing-project"');
  });

  it('validates every production detail record', () => {
    for (const detail of skillDetailRecords) {
      expect(resolveSkillDetail(detail.skillId, productionSources)).toMatchObject({
        status: 'found',
      });
    }
  });
});
```

- [ ] **Step 2: Run the new test and confirm it fails for missing modules**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-detail-resolver.spec.ts
```

Expected: FAIL because the skill-detail modules do not exist.

- [ ] **Step 3: Define the exact data contracts**

Create `skill-detail.types.ts`:

```ts
import type { CapabilityEvidenceItem } from '../devops-capability-evidence/devops-capability-evidence.types';
import type { Project } from '../projects/project-list.types';
import type { Skill } from './skill-list.types';

export interface SkillDetailRecord {
  readonly skillId: string;
  readonly experienceSummary: string;
  readonly experienceEvidenceIds: readonly string[];
  readonly projectIds: readonly string[];
}

export interface SkillDetailSources {
  readonly skills: readonly Skill[];
  readonly detailRecords: readonly SkillDetailRecord[];
  readonly evidenceItems: readonly CapabilityEvidenceItem[];
  readonly projects: readonly Project[];
}

export interface ResolvedSkillDetail {
  readonly skill: Skill;
  readonly experienceSummary?: string;
  readonly experienceEvidence: readonly CapabilityEvidenceItem[];
  readonly projects: readonly Project[];
}

export type SkillDetailResolution =
  | { readonly status: 'found'; readonly value: ResolvedSkillDetail }
  | { readonly status: 'not-found' };
```

- [ ] **Step 4: Add the Kubernetes enrichment record**

Create `skill-detail.data.ts` with only supported, public claims:

```ts
import type { SkillDetailRecord } from './skill-detail.types';

export const skillDetailRecords = [
  {
    skillId: 'kubernetes',
    experienceSummary:
      'Kubernetes has been a core part of my delivery and infrastructure work. I have used it to operate application platforms, manage version-controlled environments with Argo CD, build deterministic Kustomize overlays, and maintain reusable deployment foundations across professional and homelab projects.',
    experienceEvidenceIds: [
      'argocd-environment-state-from-version-control',
      'deterministic-kubernetes-overlays',
      'reusable-kubernetes-deployment-foundations',
    ],
    projectIds: ['homelab'],
  },
] as const satisfies readonly SkillDetailRecord[];
```

- [ ] **Step 5: Implement pure resolution with explicit integrity failures**

Create `skill-detail-resolver.ts`. Build maps from the supplied collections, return `{ status: 'not-found' }` only when the skill itself is unknown, preserve each ID array's order, and enforce enrichment integrity:

```ts
import type {
  SkillDetailResolution,
  SkillDetailSources,
} from './skill-detail.types';

export function resolveSkillDetail(
  skillId: string,
  sources: SkillDetailSources,
): SkillDetailResolution {
  const skill = sources.skills.find((candidate) => candidate.id === skillId);

  if (!skill) return { status: 'not-found' };

  const record = sources.detailRecords.find(
    (candidate) => candidate.skillId === skillId,
  );

  if (!record) {
    return {
      status: 'found',
      value: {
        skill,
        experienceSummary: undefined,
        experienceEvidence: [],
        projects: [],
      },
    };
  }

  const evidenceById = new Map(
    sources.evidenceItems.map((item) => [item.id, item]),
  );
  const projectById = new Map(
    sources.projects.map((project) => [project.id, project]),
  );
  const experienceEvidence = record.experienceEvidenceIds.map((evidenceId) => {
    const evidence = evidenceById.get(evidenceId);

    if (!evidence) {
      throw new Error(
        `Skill detail "${skillId}" references missing evidence "${evidenceId}".`,
      );
    }
    if (!evidence.isPublic || evidence.isSensitive) {
      throw new Error(
        `Skill detail "${skillId}" must reference public, non-sensitive evidence; received "${evidenceId}".`,
      );
    }

    return evidence;
  });
  const projects = record.projectIds.map((projectId) => {
    const project = projectById.get(projectId);

    if (!project) {
      throw new Error(
        `Skill detail "${skillId}" references missing project "${projectId}".`,
      );
    }

    return project;
  });

  return {
    status: 'found',
    value: {
      skill,
      experienceSummary: record.experienceSummary,
      experienceEvidence,
      projects,
    },
  };
}
```

Known skills without a matching `SkillDetailRecord` must return a found value with `experienceSummary: undefined`, `experienceEvidence: []`, and `projects: []`.

- [ ] **Step 6: Run focused tests until green**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-detail-resolver.spec.ts
```

Expected: PASS with all resolver and production-integrity cases green.

- [ ] **Step 7: Inspect and commit the data slice**

```bash
git diff --check
git diff -- apps/github.io/src/app/skills/skill-detail.types.ts apps/github.io/src/app/skills/skill-detail.data.ts apps/github.io/src/app/skills/skill-detail-resolver.ts apps/github.io/src/app/skills/skill-detail-resolver.spec.ts
git add apps/github.io/src/app/skills/skill-detail.types.ts apps/github.io/src/app/skills/skill-detail.data.ts apps/github.io/src/app/skills/skill-detail-resolver.ts apps/github.io/src/app/skills/skill-detail-resolver.spec.ts
git diff --cached
git commit -m "feat(github.io): resolve skill detail evidence"
```

---

### Task 2: Build the Astryx editorial detail surface

**Files:**

- Create: `apps/github.io/src/app/skills/skill-experience-list.tsx`
- Create: `apps/github.io/src/app/skills/skill-experience-list.spec.tsx`
- Create: `apps/github.io/src/app/skills/skill-detail-page.tsx`
- Create: `apps/github.io/src/app/skills/skill-detail-page.spec.tsx`
- Create: `apps/github.io/src/app/skills/skill-detail-page.stories.tsx`
- Create: `apps/github.io/src/app/not-found-page.tsx`
- Create: `apps/github.io/src/app/not-found-page.spec.tsx`
- Create: `apps/github.io/src/app/not-found-page.stories.tsx`

**Interfaces:**

- Consumes: `ResolvedSkillDetail`, existing `SkillCategory`, `SkillRating`, `ProjectCard`, and `CertificationCitation`.
- Produces: `SkillExperienceList({ evidence })`, `SkillDetailPage({ detail })`, and `NotFoundPage()`.

- [ ] **Step 1: Refresh the official Astryx component contracts**

Run:

```bash
pnpm exec astryx component Breadcrumbs --detail compact
pnpm exec astryx component Divider --detail compact
pnpm exec astryx component Heading --detail compact
pnpm exec astryx component Layout --detail compact
pnpm exec astryx component Link --detail compact
pnpm exec astryx component Text --detail compact
pnpm exec astryx docs spacing
pnpm exec astryx docs typography
```

Expected: the installed CLI confirms the component props used below. If the installed API differs, update this plan's prop spelling before implementation; do not invent props.

- [ ] **Step 2: Write the experience-list tests**

Use two existing public evidence items as fixtures and assert list semantics, visible titles/summaries, stable source IDs as keys, and no card wrappers:

```tsx
const { getByRole, getAllByRole, queryByTestId } = render(
  <SkillExperienceList evidence={experienceFixtures} />,
);

expect(getByRole('list', { name: 'Supporting experience' })).toBeTruthy();
expect(getAllByRole('listitem')).toHaveLength(2);
expect(getByRole('heading', {
  level: 3,
  name: 'Environment state from version control',
})).toBeTruthy();
expect(queryByTestId('skill-card')).toBeNull();
expect(queryByTestId('project-card')).toBeNull();
```

- [ ] **Step 3: Run the experience-list test and confirm it fails**

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-experience-list.spec.tsx
```

Expected: FAIL because `SkillExperienceList` does not exist.

- [ ] **Step 4: Implement semantic divided experience rows**

Create `skill-experience-list.tsx`. Define `styles.list` with zero margin/padding and no list marker, and `styles.item` with no list marker:

```tsx
export interface SkillExperienceListProps {
  evidence: readonly CapabilityEvidenceItem[];
}

export function SkillExperienceList({
  evidence,
}: SkillExperienceListProps): ReactElement {
  return (
    <ul aria-label="Supporting experience" {...stylex.props(styles.list)}>
      {evidence.map((item, index) => (
        <li key={item.id} {...stylex.props(styles.item)}>
          {index > 0 ? <Divider variant="subtle" /> : null}
          <VStack gap={1} paddingBlock={3}>
            <Heading level={3}>{item.title}</Heading>
            <Text as="p" type="body" color="secondary">
              {item.summary}
            </Text>
          </VStack>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 5: Run the experience-list test until green**

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-experience-list.spec.tsx
```

Expected: PASS.

- [ ] **Step 6: Write enriched, basic, and not-found page tests**

In `skill-detail-page.spec.tsx`, resolve Kubernetes and React through the production resolver, then assert:

```tsx
expect(getByRole('main')).toBeTruthy();
expect(getByRole('navigation', { name: 'Skill breadcrumb' })).toBeTruthy();
expect(getByRole('heading', { level: 1, name: 'Kubernetes' })).toBeTruthy();
expect(getByText('Container')).toBeTruthy();
expect(getByText('Cloud')).toBeTruthy();
expect(getByText('4 out of 5')).toBeTruthy();
expect(getByRole('heading', {
  level: 2,
  name: "How I've used Kubernetes",
})).toBeTruthy();
expect(getByRole('heading', { level: 2, name: 'Projects' })).toBeTruthy();
expect(getByRole('heading', { level: 3, name: 'benkim0414/homelab' }))
  .toBeTruthy();
expect(getByRole('heading', { level: 2, name: 'Certifications' }))
  .toBeTruthy();
```

For React, assert the visible `h1`, description, category, and rating, then assert that `How I've used React`, `Projects`, and `Certifications` headings are absent.

Also render the React detail, rerender the same component with Kubernetes, and assert that the new Kubernetes `h1` becomes `document.activeElement`. Assert separately that the initial React render does not steal focus. This covers client-side changes between detail IDs without disrupting direct page loads.

In `not-found-page.spec.tsx`, assert one visible `h1` named `Skill not found`, explanatory body text, and a normal link named `Back to Skills` with `href="/"`.

- [ ] **Step 7: Run the page tests and confirm they fail**

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-detail-page.spec.tsx apps/github.io/src/app/not-found-page.spec.tsx
```

Expected: FAIL because the page components do not exist.

- [ ] **Step 8: Implement `SkillDetailPage` with the approved hierarchy**

Use this structure in `skill-detail-page.tsx`:

```tsx
<VStack
  as="main"
  gap={6}
  paddingBlock={6}
  paddingInline={4}
  xstyle={styles.page}
>
  <Breadcrumbs label="Skill breadcrumb">
    <BreadcrumbItem href="/">Skills</BreadcrumbItem>
    <BreadcrumbItem isCurrent>{detail.skill.name}</BreadcrumbItem>
  </Breadcrumbs>

  <VStack gap={3} hAlign="start">
    <Heading level={1}>{detail.skill.name}</Heading>
    <HStack gap={1} wrap="wrap">
      {detail.skill.categories.map((category) => (
        <SkillCategory key={category} name={category} />
      ))}
    </HStack>
    <SkillRating level={detail.skill.level} />
    <Text as="p" type="body" color="secondary">
      {detail.skill.description}
    </Text>
  </VStack>

  {detail.experienceSummary ? (
    <section aria-labelledby="skill-experience-heading">
      <VStack gap={3}>
        <Heading id="skill-experience-heading" level={2}>
          {`How I've used ${detail.skill.name}`}
        </Heading>
        <Text as="p" type="body">{detail.experienceSummary}</Text>
        <SkillExperienceList evidence={detail.experienceEvidence} />
      </VStack>
    </section>
  ) : null}

  {detail.projects.length > 0 ? (
    <section aria-labelledby="skill-projects-heading">
      <VStack gap={3}>
        <Heading id="skill-projects-heading" level={2}>Projects</Heading>
        {detail.projects.map((project) => (
          <ProjectCard key={project.id} isFullWidth project={project} />
        ))}
      </VStack>
    </section>
  ) : null}

  {certifications.length > 0 ? (
    <section aria-labelledby="skill-certifications-heading">
      <VStack gap={3}>
        <Heading id="skill-certifications-heading" level={2}>
          Certifications
        </Heading>
        <ul {...stylex.props(styles.certificationList)}>
          {certifications.map((certification, index) => (
            <li
              key={`${certification.title}-${certification.url}-${certification.expiresAt}`}
              {...stylex.props(styles.certificationItem)}
            >
              <CertificationCitation {...certification} number={index + 1} />
            </li>
          ))}
        </ul>
      </VStack>
    </section>
  ) : null}
</VStack>
```

Before returning, set `const certifications = detail.skill.certifications ?? []`. Define `styles.page` with `width: '100%'`, centered inline margins, and a readable maximum width derived from `spacingVars['--spacing-12']`, such as `calc(var(--spacing-12) * 14)`. Define `certificationList` and `certificationItem` as reset, wrapping semantic-list styles backed by Astryx spacing tokens. Do not use raw color, font-size, line-height, radius, or pixel padding values.

Keep a ref to the page `Heading`. Track the previous `detail.skill.id` in a second ref; in an effect, focus the heading with `tabIndex={-1}` only when that ID changes after the initial render. Update the previous-ID ref after the comparison. This preserves direct-load focus while supporting in-place `/skills/:skillId` changes.

Render each resolved project with `<ProjectCard isFullWidth project={project} />`. Render certifications as a reset semantic list of the existing `CertificationCitation` components. Use section `h2` headings only when the corresponding collection is non-empty.

- [ ] **Step 9: Implement the Astryx not-found page**

Create `not-found-page.tsx` with a centered, responsive `main`. Keep it a plain navigation link; do not add a button or card:

```tsx
export function NotFoundPage(): ReactElement {
  return (
    <VStack
      as="main"
      gap={3}
      hAlign="start"
      paddingBlock={6}
      paddingInline={4}
      xstyle={styles.page}
    >
      <Heading level={1}>Skill not found</Heading>
      <Text as="p" type="body" color="secondary">
        The requested skill does not exist.
      </Text>
      <Link href="/" isStandalone>Back to Skills</Link>
    </VStack>
  );
}
```

- [ ] **Step 10: Run focused component tests until green**

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/skills/skill-experience-list.spec.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx apps/github.io/src/app/not-found-page.spec.tsx
```

Expected: PASS with enriched, basic, and error states covered.

- [ ] **Step 11: Add focused Storybook states**

In `skill-detail-page.stories.tsx`, resolve the production Kubernetes and React records once at module scope, throw if either does not resolve, and publish:

- `EnrichedKubernetes` at `GitHub.io/Skills/Skill Detail Page` with `layout: 'fullscreen'`.
- `BasicSkill` using React with `layout: 'fullscreen'`.
- `defaultViewport: 'responsive'` on `EnrichedKubernetes`; set the responsive canvas to exactly 768 × 1024 during Task 4 iPad QA because the repository does not define a named iPad viewport.

In `not-found-page.stories.tsx`, publish `Default` at `GitHub.io/Pages/Not Found` with `layout: 'fullscreen'`.

- [ ] **Step 12: Inspect and commit the presentation slice**

```bash
git diff --check
git diff -- apps/github.io/src/app/skills/skill-experience-list.tsx apps/github.io/src/app/skills/skill-experience-list.spec.tsx apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx apps/github.io/src/app/skills/skill-detail-page.stories.tsx apps/github.io/src/app/not-found-page.tsx apps/github.io/src/app/not-found-page.spec.tsx apps/github.io/src/app/not-found-page.stories.tsx
git add apps/github.io/src/app/skills/skill-experience-list.tsx apps/github.io/src/app/skills/skill-experience-list.spec.tsx apps/github.io/src/app/skills/skill-detail-page.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx apps/github.io/src/app/skills/skill-detail-page.stories.tsx apps/github.io/src/app/not-found-page.tsx apps/github.io/src/app/not-found-page.spec.tsx apps/github.io/src/app/not-found-page.stories.tsx
git diff --cached
git commit -m "feat(github.io): add skill detail surface"
```

---

### Task 3: Wire clean routes and the GitHub Pages fallback

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `apps/github.io/src/app/skills/skill-detail-route.tsx`
- Modify: `apps/github.io/src/app/app.tsx`
- Modify: `apps/github.io/src/app/app.spec.tsx`
- Create: `apps/github.io/404.html`
- Modify: `apps/github.io/vite.config.ts`

**Interfaces:**

- Consumes: `resolveSkillDetail`, production collections, `SkillDetailPage`, `NotFoundPage`, and the unchanged `AppShell` root page.
- Produces: `SkillDetailRoute()`, exported `AppRoutes()`, `App()` backed by `BrowserRouter`, and build outputs `dist/apps/github.io/index.html` plus `dist/apps/github.io/404.html`.

- [ ] **Step 1: Add the approved router dependency**

Run:

```bash
pnpm add -w 'react-router-dom@^7.18.2'
```

Expected: only `package.json` and `pnpm-lock.yaml` change, and the installed major version remains 7.

- [ ] **Step 2: Write route-level tests before route code**

Preserve all current `App` assertions. Add `beforeEach(() => window.history.replaceState({}, '', '/'))` so BrowserRouter tests do not leak paths. Add focused `AppRoutes` tests using `MemoryRouter`:

```tsx
render(
  <MemoryRouter initialEntries={['/skills/kubernetes']}>
    <AppRoutes />
  </MemoryRouter>,
);

expect(getByRole('heading', { level: 1, name: 'Kubernetes' })).toBeTruthy();
expect(getByRole('heading', {
  level: 2,
  name: "How I've used Kubernetes",
})).toBeTruthy();
```

Add corresponding cases for `/skills/react`, `/skills/not-real`, and `/not-a-route`. Both unknown cases must render `Skill not found`. Keep the existing root test and explicitly assert that root rendering still has no skill-detail breadcrumb links and that command-palette filtering behavior is unchanged.

- [ ] **Step 3: Run app tests and confirm the route cases fail**

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/app.spec.tsx
```

Expected: FAIL because `AppRoutes` and the detail route do not exist.

- [ ] **Step 4: Implement production skill route resolution**

Create `skill-detail-route.tsx`:

```tsx
export function SkillDetailRoute(): ReactElement {
  const { skillId = '' } = useParams<{ skillId: string }>();
  const resolution = resolveSkillDetail(skillId, {
    skills,
    detailRecords: skillDetailRecords,
    evidenceItems: devOpsCapabilityEvidenceItems,
    projects: sampleProjects,
  });

  if (resolution.status === 'not-found') {
    return <NotFoundPage />;
  }

  return <SkillDetailPage detail={resolution.value} />;
}
```

Keep resolution outside the presentational page and do not add list/card click handlers.

- [ ] **Step 5: Implement route composition without editing the mobile page**

In `app.tsx`, export `AppRoutes` and keep `App` as the browser entry:

```tsx
export function AppRoutes(): ReactElement {
  return (
    <Routes>
      <Route path="/" element={<AppShell />} />
      <Route
        path="/skills/:skillId"
        element={
          <Theme theme={neutralTheme}>
            <SkillDetailRoute />
          </Theme>
        }
      />
      <Route
        path="*"
        element={
          <Theme theme={neutralTheme}>
            <NotFoundPage />
          </Theme>
        }
      />
    </Routes>
  );
}

export function App(): ReactElement {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
```

Do not change `AppShell`; it remains the root route's existing neutral-theme boundary around `MobileSkillsPage`.

- [ ] **Step 6: Run app and full focused tests until green**

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/app.spec.tsx apps/github.io/src/app/skills/skill-detail-resolver.spec.ts apps/github.io/src/app/skills/skill-experience-list.spec.tsx apps/github.io/src/app/skills/skill-detail-page.spec.tsx apps/github.io/src/app/not-found-page.spec.tsx
```

Expected: PASS, including unchanged root and command-palette tests.

- [ ] **Step 7: Add the transformed GitHub Pages fallback entry**

Create `apps/github.io/404.html` exactly as a second Vite HTML entry. Do not add redirect JavaScript: GitHub Pages serves the custom 404 document while preserving `window.location.pathname`, and BrowserRouter resolves that clean path.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Skill | Ben Kim</title>
    <base href="/" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="stylesheet" href="/src/styles.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Update `vite.config.ts` to import `resolve` from `node:path` and configure both HTML inputs:

```ts
build: {
  outDir: '../../dist/apps/github.io',
  emptyOutDir: true,
  reportCompressedSize: true,
  rollupOptions: {
    input: {
      main: resolve(__dirname, 'index.html'),
      notFound: resolve(__dirname, '404.html'),
    },
  },
  commonjsOptions: {
    transformMixedEsModules: true,
  },
},
```

- [ ] **Step 8: Verify both production HTML entries**

Run:

```bash
pnpm nx build github.io
test -f dist/apps/github.io/index.html
test -f dist/apps/github.io/404.html
rg -n 'assets/.*\.js' dist/apps/github.io/index.html dist/apps/github.io/404.html
```

Expected: build succeeds; both HTML files exist; both reference transformed production JavaScript assets rather than `/src/main.tsx`.

- [ ] **Step 9: Inspect and commit the routing slice**

```bash
git diff --check
git diff -- package.json pnpm-lock.yaml apps/github.io/src/app/app.tsx apps/github.io/src/app/app.spec.tsx apps/github.io/src/app/skills/skill-detail-route.tsx apps/github.io/404.html apps/github.io/vite.config.ts
git add package.json pnpm-lock.yaml apps/github.io/src/app/app.tsx apps/github.io/src/app/app.spec.tsx apps/github.io/src/app/skills/skill-detail-route.tsx apps/github.io/404.html apps/github.io/vite.config.ts
git diff --cached
git commit -m "feat(github.io): route skill detail pages"
```

---

### Task 4: Run integrated quality and responsive review

**Files:**

- Verify only; modify only the exact task-owned files needed to correct an observed failure.

**Interfaces:**

- Consumes: all deliverables from Tasks 1–3.
- Produces: a reviewed, locally verified branch ready for the repository's manual handoff gate.

- [ ] **Step 1: Confirm the parallel-work boundary remained intact**

```bash
git diff db13731..HEAD -- apps/github.io/src/app/skills/mobile-skills-page.tsx apps/github.io/src/app/skills/skill-card.tsx apps/github.io/src/app/skills/skill-card-list.tsx apps/github.io/src/app/skills/skill-list-item.tsx apps/github.io/src/app/skills/skill-search.tsx
```

Expected: no output.

- [ ] **Step 2: Run the full relevant verification suite**

```bash
pnpm nx test github.io
pnpm nx lint github.io
pnpm nx build github.io
pnpm nx build-storybook github.io
test -f dist/apps/github.io/404.html
```

Expected: every command exits zero. If a command fails, diagnose it, add or adjust a regression test when behavior changes, rerun the focused command, then rerun this full sequence.

- [ ] **Step 3: Run responsive Storybook QA**

Start Storybook on a non-loopback interface:

```bash
pnpm nx storybook github.io --host 0.0.0.0
```

Use the machine's Tailscale IPv4 address with the reported port for iPad review. Inspect `EnrichedKubernetes`, `BasicSkill`, and `Not Found` at representative phone, iPad, and desktop viewports. Confirm:

- one visible `h1` and sequential headings;
- readable centered width on iPad/desktop;
- full-width content inside phone padding;
- wrapping category badges;
- divided experience rows without cards;
- full-width but unnested project card;
- readable certification citations;
- visible keyboard focus on links;
- no clipping, overlap, unexpected horizontal scrolling, or empty section headings.

- [ ] **Step 4: Exercise clean URLs through the production preview**

Run the built app preview on a non-loopback host:

```bash
pnpm exec vite preview --config apps/github.io/vite.config.ts --host 0.0.0.0
```

Verify `/`, `/skills/kubernetes`, `/skills/react`, and `/skills/not-real` in the browser. The transformed custom-404 artifact was verified in Task 3; do not add redirect JavaScript or change the browser path during this preview check.

Expected: root remains unchanged; Kubernetes is enriched; React is basic; unknown skill is friendly not-found; the custom 404 entry loads production assets without redirect loops.

- [ ] **Step 5: Run Codex `/review` and resolve findings**

Review the complete diff against `docs/superpowers/specs/2026-08-12-skill-detail-page-design.md`, with special attention to public evidence safety, route fallback behavior, semantic heading order, Astryx component contracts, and untouched parallel mobile files. Resolve all confirmed findings with focused tests and separate conventional fix commits.

- [ ] **Step 6: Record final branch evidence**

```bash
git status --short --branch
git log --oneline db13731..HEAD
git diff --stat db13731..HEAD
```

Expected: clean worktree; self-contained data, presentation, and routing commits; no push, PR, merge, or deployment. Stop in the repository's awaiting-handoff state.
