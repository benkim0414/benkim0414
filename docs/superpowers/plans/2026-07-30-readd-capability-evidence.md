# Re-add Capability Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-add the compact `CapabilityEvidence` renderer so DORA capability evidence can display as tokens or citations again.

**Architecture:** Restore the deleted compact renderer as a presentational component family beside the existing DORA evidence model. Keep helper responsibilities split across label selection, GitHub repository URL parsing, icon selection, and evidence-type rendering; leave the radar and evidence scoring paths unchanged.

**Tech Stack:** React 19, TypeScript, Nx, Vitest, React Testing Library, Storybook React Vite, Astryx primitives, StyleX, Heroicons, pnpm.

## Global Constraints

- Work in `/home/benkim0414/workspace/benkim0414/.worktrees/readd-capability-evidence`.
- Restore only the compact `capability-evidence.*` files and their focused tests/stories.
- Do not re-add the deleted matrix, timeline, donut, bar list, or certification map visualizations.
- Do not change DORA score calculation or curated radar scores.
- Do not change public or sensitive evidence filtering rules.
- Do not add full evidence cards, modals, summaries, or a generic evidence system outside the DevOps capability evidence model.
- Keep `CapabilityEvidence` presentational: it must not score, filter, summarize, or decide whether evidence is safe to render.
- Existing radar files should remain functionally unchanged.
- Use `label?: string` as the preferred compact-display field.
- Use existing `SkillToken` for `skill` evidence.
- Use existing `CertificationCitation` for `certification` evidence.
- Use Astryx `Token`, Astryx `Citation`, Astryx `Icon`, StyleX, and existing `@heroicons/react` dependency for compact rendering.
- Stage explicit paths only and use conventional commits.

---

## File Structure

- `apps/github.io/src/app/devops-capability-evidence/capability-evidence-url.ts`
  - Parse GitHub repository URLs safely.
  - Export `isGithubRepositoryUrl(url: string | undefined): boolean`.
  - Export `getGithubRepositoryLabel(url: string | undefined): string | undefined`.
- `apps/github.io/src/app/devops-capability-evidence/capability-evidence-label.ts`
  - Export `getCapabilityEvidenceLabel(evidence: CapabilityEvidenceItem): string`.
  - Choose compact labels from `label`, known technology, repository name, short title, or shortened title.
- `apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx`
  - Export icon-selection helpers for compact tokens and citations.
  - Keep brand icon, GitHub source icon, and Heroicons fallback logic outside the renderer.
- `apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx`
  - Export `CapabilityEvidence` and type-specific leaf renderers.
  - Dispatch by `EvidenceType`.
- `apps/github.io/src/app/devops-capability-evidence/capability-evidence.helpers.spec.tsx`
  - Cover label, URL, and icon helper behavior.
- `apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx`
  - Cover renderer dispatch and primitive reuse.
- `apps/github.io/src/app/devops-capability-evidence/capability-evidence.stories.tsx`
  - Show each evidence type, mixed row, brand precedence, GitHub project citation, certification variants, and long title fallback.

## Task 1: Restore Helper Tests And Helpers

**Files:**
- Create: `apps/github.io/src/app/devops-capability-evidence/capability-evidence.helpers.spec.tsx`
- Create: `apps/github.io/src/app/devops-capability-evidence/capability-evidence-url.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/capability-evidence-label.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx`

**Interfaces:**
- Consumes:
  - `CapabilityEvidenceItem` from `./devops-capability-evidence.types`
  - `getSkillBrand(technology: string)` from `../skills/skill-brand`
  - `Icon` and `IconType` from `@astryxdesign/core/Icon`
- Produces:
  - `isGithubRepositoryUrl(url: string | undefined): boolean`
  - `getGithubRepositoryLabel(url: string | undefined): string | undefined`
  - `getCapabilityEvidenceLabel(evidence: CapabilityEvidenceItem): string`
  - `type CapabilityEvidenceIconData = { kind: 'brand'; brand: SkillBrand } | { kind: 'fallback'; icon: IconType }`
  - `getCapabilityEvidenceIconData(evidence: CapabilityEvidenceItem): CapabilityEvidenceIconData | undefined`
  - `renderCapabilityEvidenceIcon(iconData: CapabilityEvidenceIconData | undefined): ReactNode | undefined`
  - `getCapabilityEvidenceCitationIcon(iconData: CapabilityEvidenceIconData | undefined): string | undefined`
  - `getCapabilityEvidenceIcon(evidence: CapabilityEvidenceItem): ReactNode | undefined`

- [ ] **Step 1: Restore the helper test file from history**

Run:

```bash
git checkout 571abd2^ -- apps/github.io/src/app/devops-capability-evidence/capability-evidence.helpers.spec.tsx
```

Expected: `git status --short` shows the helper test file added.

- [ ] **Step 2: Run the helper tests and verify they fail**

Run:

```bash
pnpm exec vitest run apps/github.io/src/app/devops-capability-evidence/capability-evidence.helpers.spec.tsx
```

Expected: FAIL because `capability-evidence-label`, `capability-evidence-icon`, and `capability-evidence-url` are not present yet.

- [ ] **Step 3: Restore the helper source files from history**

Run:

```bash
git checkout 571abd2^ -- \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence-url.ts \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence-label.ts \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx
```

Expected: `git status --short` shows the three helper source files added.

- [ ] **Step 4: Inspect helper source for current dependency compatibility**

Open the restored files and verify these current imports still resolve:

```ts
import { Icon } from '@astryxdesign/core/Icon';
import type { IconType } from '@astryxdesign/core/Icon';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import {
  AcademicCapIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CheckBadgeIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';
import { getSkillBrand, type SkillBrand } from '../skills/skill-brand';
```

Expected: imports match current package dependencies and current local skill brand exports.

- [ ] **Step 5: Run helper tests and verify they pass**

Run:

```bash
pnpm exec vitest run apps/github.io/src/app/devops-capability-evidence/capability-evidence.helpers.spec.tsx
```

Expected: PASS.

- [ ] **Step 6: Inspect the helper diff**

Run:

```bash
git diff -- \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.helpers.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence-url.ts \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence-label.ts \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx
```

Expected: the diff only restores compact helper tests and helper source. No radar, scoring, or non-radar visualization files are modified.

- [ ] **Step 7: Commit helper restoration**

Run:

```bash
git add \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.helpers.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence-url.ts \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence-label.ts \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx
git commit -m "feat(github.io): restore capability evidence helpers"
```

Expected: commit succeeds with only the four helper-related files.

## Task 2: Restore Renderer Tests And Component

**Files:**
- Create: `apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx`
- Create: `apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx`

**Interfaces:**
- Consumes:
  - `CapabilityEvidenceItem` from `./devops-capability-evidence.types`
  - `getCapabilityEvidenceLabel(evidence: CapabilityEvidenceItem): string`
  - `getCapabilityEvidenceIcon(evidence: CapabilityEvidenceItem): ReactNode | undefined`
  - `getCapabilityEvidenceIconData(evidence: CapabilityEvidenceItem): CapabilityEvidenceIconData | undefined`
  - `renderCapabilityEvidenceIcon(iconData: CapabilityEvidenceIconData | undefined): ReactNode | undefined`
  - `getCapabilityEvidenceCitationIcon(iconData: CapabilityEvidenceIconData | undefined): string | undefined`
  - `SkillToken` from `../skills/skill-token`
  - `CertificationCitation` from `../certifications/certification-citation`
- Produces:
  - `interface CapabilityEvidenceProps { evidence: CapabilityEvidenceItem; citationNumber?: number }`
  - `function CapabilityEvidence(props: CapabilityEvidenceProps): ReactElement`
  - `function SkillEvidenceToken(props: EvidenceLeafProps): ReactElement`
  - `function LearningEvidenceToken(props: EvidenceLeafProps): ReactElement`
  - `function ExperienceEvidenceToken(props: EvidenceLeafProps): ReactElement`
  - `function EducationEvidenceToken(props: EvidenceLeafProps): ReactElement`
  - `function CertificationEvidenceCitation(props: EvidenceLeafProps): ReactElement`
  - `function ProjectEvidenceCitation(props: EvidenceLeafProps): ReactElement`

- [ ] **Step 1: Restore renderer tests from history**

Run:

```bash
git checkout 571abd2^ -- apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx
```

Expected: `git status --short` shows the renderer test file added.

- [ ] **Step 2: Run renderer tests and verify they fail**

Run:

```bash
pnpm exec vitest run apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx
```

Expected: FAIL because `capability-evidence.tsx` is not present yet.

- [ ] **Step 3: Restore the renderer component from history**

Run:

```bash
git checkout 571abd2^ -- apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx
```

Expected: `git status --short` shows the renderer source file added.

- [ ] **Step 4: Verify renderer behavior matches the spec**

Open `apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx` and confirm `CapabilityEvidence` dispatches with this behavior:

```tsx
export function CapabilityEvidence({
  evidence,
  citationNumber,
}: CapabilityEvidenceProps): ReactElement {
  switch (evidence.type) {
    case 'skill':
      return <SkillEvidenceToken evidence={evidence} />;
    case 'learning':
      return <LearningEvidenceToken evidence={evidence} />;
    case 'experience':
      return <ExperienceEvidenceToken evidence={evidence} />;
    case 'education':
      return <EducationEvidenceToken evidence={evidence} />;
    case 'certification':
      return (
        <CertificationEvidenceCitation
          citationNumber={citationNumber}
          evidence={evidence}
        />
      );
    case 'project':
      return (
        <ProjectEvidenceCitation
          citationNumber={citationNumber}
          evidence={evidence}
        />
      );
  }
}
```

Expected: the component has no data fetching, scoring, privacy filtering, or radar logic.

- [ ] **Step 5: Run renderer and related primitive tests**

Run:

```bash
pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.helpers.spec.tsx \
  apps/github.io/src/app/certifications/certification-citation.spec.tsx \
  apps/github.io/src/app/skills/skill-token.spec.tsx
```

Expected: PASS.

- [ ] **Step 6: Inspect the renderer diff**

Run:

```bash
git diff -- \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx
```

Expected: the diff only restores compact renderer tests and component source. No radar, scoring, or non-radar visualization files are modified.

- [ ] **Step 7: Commit renderer restoration**

Run:

```bash
git add \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx
git commit -m "feat(github.io): restore capability evidence renderer"
```

Expected: commit succeeds with only the renderer test and source files.

## Task 3: Restore Storybook Coverage And Final Verification

**Files:**
- Create: `apps/github.io/src/app/devops-capability-evidence/capability-evidence.stories.tsx`

**Interfaces:**
- Consumes:
  - `CapabilityEvidence` from `./capability-evidence`
  - `CapabilityEvidenceItem` from `./devops-capability-evidence.types`
- Produces:
  - Storybook meta titled `GitHub.io/DevOps Capability Evidence/Capability Evidence`
  - Stories covering each evidence type, mixed row behavior, brand precedence, GitHub repository project citation, certification variants, and long-title shortening fallback

- [ ] **Step 1: Restore Storybook file from history**

Run:

```bash
git checkout 571abd2^ -- apps/github.io/src/app/devops-capability-evidence/capability-evidence.stories.tsx
```

Expected: `git status --short` shows the Storybook file added.

- [ ] **Step 2: Inspect Storybook scope**

Open `apps/github.io/src/app/devops-capability-evidence/capability-evidence.stories.tsx` and verify it imports only the compact renderer and evidence types:

```ts
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CapabilityEvidence } from './capability-evidence';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';
```

Expected: the story does not import matrix, timeline, donut, bar list, certification map, radar, scoring, or page-level components.

- [ ] **Step 3: Run all focused compact evidence tests**

Run:

```bash
pnpm exec vitest run \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx \
  apps/github.io/src/app/devops-capability-evidence/capability-evidence.helpers.spec.tsx \
  apps/github.io/src/app/certifications/certification-citation.spec.tsx \
  apps/github.io/src/app/skills/skill-token.spec.tsx
```

Expected: PASS.

- [ ] **Step 4: Run current radar tests to confirm no radar regression**

Run:

```bash
pnpm exec vitest run apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx
```

Expected: PASS.

- [ ] **Step 5: Run final app checks**

Run:

```bash
pnpm nx test github.io
pnpm nx build github.io
```

Expected: PASS. If the environment blocks pnpm store access, dependency resolution, or registry access, record the exact command and error in the task handoff.

- [ ] **Step 6: Inspect Storybook diff for excluded files**

Run:

```bash
git diff --name-status
```

Expected output contains only:

```text
A	apps/github.io/src/app/devops-capability-evidence/capability-evidence.stories.tsx
```

Tasks 1 and 2 should already be committed, so their files should not appear in
the working-tree diff at this point.

- [ ] **Step 7: Commit Storybook restoration**

Run:

```bash
git add apps/github.io/src/app/devops-capability-evidence/capability-evidence.stories.tsx
git commit -m "feat(github.io): restore capability evidence stories"
```

Expected: commit succeeds with only the Storybook file.

## Task 4: Review Branch Readiness

**Files:**
- Inspect: all files changed by Tasks 1 through 3

**Interfaces:**
- Consumes:
  - Commits from Tasks 1 through 3
  - Final test output from Task 3
- Produces:
  - A branch readiness summary with changed files, validation commands, and any unresolved failures

- [ ] **Step 1: Confirm branch status**

Run:

```bash
git status --short --branch
```

Expected: clean worktree on `feat/readd-capability-evidence`.

- [ ] **Step 2: Confirm app file diff from the feature branch base**

Run:

```bash
git diff --name-status 54f5978...HEAD -- apps/github.io/src/app/devops-capability-evidence
```

Expected output contains only:

```text
A	apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx
A	apps/github.io/src/app/devops-capability-evidence/capability-evidence-label.ts
A	apps/github.io/src/app/devops-capability-evidence/capability-evidence-url.ts
A	apps/github.io/src/app/devops-capability-evidence/capability-evidence.helpers.spec.tsx
A	apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx
A	apps/github.io/src/app/devops-capability-evidence/capability-evidence.stories.tsx
A	apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx
```

- [ ] **Step 3: Confirm commit history**

Run:

```bash
git log --oneline -5
```

Expected: latest commits include:

```text
feat(github.io): restore capability evidence stories
feat(github.io): restore capability evidence renderer
feat(github.io): restore capability evidence helpers
docs(github.io): plan capability evidence readd
docs(github.io): design capability evidence readd
```

- [ ] **Step 4: Summarize implementation readiness**

Prepare this handoff summary:

```markdown
Capability evidence re-add is ready for review.

Changed app files:
- `capability-evidence-url.ts`
- `capability-evidence-label.ts`
- `capability-evidence-icon.tsx`
- `capability-evidence.tsx`
- `capability-evidence.helpers.spec.tsx`
- `capability-evidence.spec.tsx`
- `capability-evidence.stories.tsx`

Validation:
- `pnpm exec vitest run apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx apps/github.io/src/app/devops-capability-evidence/capability-evidence.helpers.spec.tsx apps/github.io/src/app/certifications/certification-citation.spec.tsx apps/github.io/src/app/skills/skill-token.spec.tsx`
- `pnpm exec vitest run apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence-radar.spec.tsx`
- `pnpm nx test github.io`
- `pnpm nx build github.io`

Scope guard:
- Radar remains unchanged.
- Deleted matrix/timeline/donut/bar-list/certification-map visualizations remain deleted.
```

Expected: summary names any failed verification command with the exact failure; otherwise it reports the branch is ready for code review or handoff.
