# Certification Citation HoverCard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show complete certification details in an accessible Astryx HoverCard while preserving `CertificationCitation` as a direct certificate link.

**Architecture:** Extend `CertificationCitation` with one optional, complete `CertificationMetadata` value object and keep status derived from `expiresAt`. Render the existing Astryx `Citation` as the trigger for a read-only Astryx `MetadataList` only when the URL, expiry, and metadata are valid; otherwise preserve the current citation-only path. Add the three concrete CNCF credential records to the skill catalog and roadmap without teaching the reusable component about known certificate titles.

**Tech Stack:** React 19, TypeScript, Astryx `Citation`, `HoverCard`, `MetadataList`, StyleX, Vitest, Testing Library, Storybook, Nx, pnpm.

## Global Constraints

- Work only in `/home/benkim0414/workspace/benkim0414/.worktrees/certification-hovercard` on branch `feat/certification-hovercard`.
- Use Astryx components and their default placement, collision handling, spacing, surface styling, and delays; do not add dependencies or a new styling system.
- Keep the HoverCard supplementary and read-only. Do not put links, buttons, or other focusable controls in its Metadata List.
- Keep the Citation as the direct certificate link for click, `Enter`, and mobile tap; do not add a mobile Popover or repeat the URL in metadata.
- Show exactly four metadata rows in this order: `ID`, `Name`, `Status`, `Completed`.
- Store completion dates as ISO `YYYY-MM-DD` calendar dates and display fixed English abbreviated-month dates without timezone drift.
- Derive `Active` or `Expired` from `expiresAt` and `currentDate`; do not store status in `CertificationMetadata`.
- Render no HoverCard for missing, empty, or invalid preview data. The underlying Citation must still render.
- Preserve existing citation numbering, accessible name, target, status attributes, badge priority, skill-brand fallback, and expired-icon treatment.
- Keep generic capability evidence unchanged because it does not identify a specific credential.
- Stage explicit paths only and commit each task with the conventional subject shown in that task.
- Before UI edits, review the official installed Astryx contracts in `node_modules/@astryxdesign/core/src/HoverCard/HoverCard.doc.mjs` and `node_modules/@astryxdesign/core/src/MetadataList/MetadataList.doc.mjs`, and run `pnpm exec astryx docs principles` from the dependency-bearing main checkout.

## File Structure

- Modify `apps/github.io/src/app/certifications/certification-citation.tsx`: define the shared metadata contract, validate and format dates, and compose Citation, HoverCard, and Metadata List.
- Modify `apps/github.io/src/app/certifications/certification-citation.spec.tsx`: cover semantic metadata, status, accessibility wiring, date formatting, direct links, and conservative fallbacks.
- Modify `apps/github.io/src/app/skills/skill-list.types.ts`: allow concrete skill certifications to carry `CertificationMetadata`.
- Modify `apps/github.io/src/app/skills/skill-list.data.ts`: add KCNA, CKAD, and CKA credential metadata.
- Modify `apps/github.io/src/app/skills/skill-list.data.spec.ts`: lock the skill-catalog credential values.
- Modify `apps/github.io/src/app/devops-roadmap/devops-roadmap.data.ts`: add CKA, CKAD, and KCNA credential metadata.
- Modify `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`: lock the roadmap credential values.
- Modify `apps/github.io/src/app/certifications/certification-citation.stories.tsx`: provide complete active and expired HoverCard fixtures while retaining a generic fixture.
- Modify `apps/github.io/src/app/certifications/certification-citation.stories.spec.ts`: lock the Storybook metadata fixtures and generic fallback.

---

### Task 1: Add The Accessible Certification Metadata HoverCard

**Files:**
- Modify: `apps/github.io/src/app/certifications/certification-citation.tsx`
- Test: `apps/github.io/src/app/certifications/certification-citation.spec.tsx`

**Interfaces:**
- Consumes: Astryx `HoverCard`, `MetadataList`, `MetadataListItem`, the existing `Citation`, and current `expiresAt`/`currentDate` status inputs.
- Produces: `export interface CertificationMetadata { id: string; name: string; completedAt: string }` and `CertificationCitationProps.metadata?: CertificationMetadata`.
- Preserves: `CertificationCitation(props: CertificationCitationProps): ReactElement` and every existing prop and data attribute.

- [ ] **Step 1: Review the installed Astryx contracts before changing UI code**

From `/home/benkim0414/workspace/benkim0414`, run:

```bash
pnpm exec astryx docs principles
sed -n '1,130p' node_modules/@astryxdesign/core/src/HoverCard/HoverCard.doc.mjs
sed -n '1,130p' node_modules/@astryxdesign/core/src/MetadataList/MetadataList.doc.mjs
```

Confirm that `HoverCard` opens on hover/focus, attaches `aria-describedby`, supports `Escape`, and is intended for supplementary content. Confirm that `MetadataList` renders read-only key/value data with semantic definition-list markup.

- [ ] **Step 2: Write failing tests for complete metadata and accessibility wiring**

Update the Testing Library import:

```ts
import { render } from '@testing-library/react';
```

No additional Testing Library helper is required. Add this fixture below `certificateUrl`:

```ts
const ckaMetadata = {
  id: 'LF-assbyzy17c',
  name: 'Certified Kubernetes Administrator',
  completedAt: '2025-04-20',
} as const;
```

Add these tests inside the existing `CertificationCitation` suite:

```tsx
it('describes a concrete certification with semantic metadata', () => {
  const { getByRole } = render(
    <CertificationCitation
      currentDate={new Date('2026-07-23T00:00:00+10:00')}
      expiresAt="2027-04-20T10:00:00+10:00"
      metadata={ckaMetadata}
      skills={['Kubernetes']}
      title="CKA"
      url={certificateUrl}
    />,
  );

  const citation = getByRole('doc-noteref', { name: 'Citation 1: CKA' });
  const hoverCard = getByRole('dialog', { hidden: true });

  expect(citation.getAttribute('href')).toBe(certificateUrl);
  expect(citation.getAttribute('aria-describedby')?.split(' ')).toContain(
    hoverCard.id,
  );
  expect(
    Array.from(hoverCard.querySelectorAll('dt'), (item) => item.textContent),
  ).toEqual(['ID', 'Name', 'Status', 'Completed']);
  expect(
    Array.from(hoverCard.querySelectorAll('dd'), (item) => item.textContent),
  ).toEqual([
    'LF-assbyzy17c',
    'Certified Kubernetes Administrator',
    'Active',
    'Apr 20, 2025',
  ]);
});

it('shows expired metadata without changing the citation link', () => {
  const { getByRole } = render(
    <CertificationCitation
      currentDate={new Date('2029-01-01T00:00:00+11:00')}
      expiresAt="2027-04-20T10:00:00+10:00"
      metadata={ckaMetadata}
      skills={['Kubernetes']}
      title="CKA"
      url={certificateUrl}
    />,
  );

  const citation = getByRole('doc-noteref', { name: 'Citation 1: CKA' });
  const hoverCard = getByRole('dialog', { hidden: true });

  expect(citation.getAttribute('href')).toBe(certificateUrl);
  expect(
    Array.from(hoverCard.querySelectorAll('dd'), (item) => item.textContent),
  ).toContain('Expired');
});
```

The first test locks the semantic row order, exact copy, fixed date formatting, direct link, and Astryx accessibility connection. The second proves that status remains derived.

- [ ] **Step 3: Write failing tests for generic and invalid-data fallbacks**

Add these tests:

```tsx
it('keeps generic certifications free of an incomplete hover card', () => {
  const { queryByRole } = render(
    <CertificationCitation
      currentDate={new Date('2026-07-23T00:00:00+10:00')}
      expiresAt="2027-04-20T10:00:00+10:00"
      skills={['Kubernetes']}
      title="Generic certification"
      url={certificateUrl}
    />,
  );

  expect(queryByRole('dialog', { hidden: true })).toBeNull();
});

it.each([
  ['an empty credential ID', { ...ckaMetadata, id: '' }, '2027-04-20T10:00:00+10:00'],
  ['an empty credential name', { ...ckaMetadata, name: '' }, '2027-04-20T10:00:00+10:00'],
  ['an invalid completion date', { ...ckaMetadata, completedAt: '2025-02-30' }, '2027-04-20T10:00:00+10:00'],
  ['an invalid expiry date', ckaMetadata, 'not-a-date'],
])('omits the hover card for %s', (_label, metadata, expiresAt) => {
  const { getByRole, queryByRole } = render(
    <CertificationCitation
      currentDate={new Date('2026-07-23T00:00:00+10:00')}
      expiresAt={expiresAt}
      metadata={metadata}
      title="CKA"
      url={certificateUrl}
    />,
  );

  expect(getByRole('doc-noteref', { name: 'Citation 1: CKA' })).toBeTruthy();
  expect(queryByRole('dialog', { hidden: true })).toBeNull();
});
```

Also add `metadata={ckaMetadata}` to the existing `renders an unlinked label citation when url is omitted` test and assert:

```ts
expect(queryByRole('dialog', { hidden: true })).toBeNull();
```

Destructure `queryByRole` from that test's render result. This explicitly covers the missing-URL branch while retaining its existing unlinked-Citation assertion.

- [ ] **Step 4: Run the focused test to verify the new tests fail**

Run from the dependency-bearing main checkout while pointing Vitest at the linked worktree:

```bash
cd /home/benkim0414/workspace/benkim0414
pnpm exec vitest run \
  --config "$PWD/.worktrees/certification-hovercard/apps/github.io/vite.config.ts" \
  "$PWD/.worktrees/certification-hovercard/apps/github.io/src/app/certifications/certification-citation.spec.tsx"
```

Expected: FAIL because `CertificationCitationProps` has no `metadata` prop and no HoverCard dialog is rendered.

- [ ] **Step 5: Add the metadata contract, date validation, and status helper**

In `certification-citation.tsx`, add the Astryx imports:

```ts
import { HoverCard } from '@astryxdesign/core/HoverCard';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
```

Add the public value object immediately before `CertificationCitationProps`, then add its optional prop:

```ts
export interface CertificationMetadata {
  id: string;
  name: string;
  completedAt: string;
}

export interface CertificationCitationProps {
  title: string;
  url?: string;
  skills?: readonly string[];
  expiresAt?: string;
  citationIcon?: string;
  fallbackIcon?: ReactNode;
  metadata?: CertificationMetadata;
  number?: number;
  currentDate?: Date;
}
```

Replace `isActive` with helpers that reject invalid timestamps and preserve calendar dates:

```ts
type CertificationStatus = 'active' | 'expired';

const completedDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
});

function getCertificationStatus(
  expiresAt: string | undefined,
  currentDate: Date,
): CertificationStatus | undefined {
  if (!expiresAt) {
    return undefined;
  }

  const expiresAtTime = new Date(expiresAt).getTime();
  const currentTime = currentDate.getTime();

  if (Number.isNaN(expiresAtTime) || Number.isNaN(currentTime)) {
    return undefined;
  }

  return expiresAtTime > currentTime ? 'active' : 'expired';
}

function formatCompletedAt(completedAt: string): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(completedAt)) {
    return undefined;
  }

  const date = new Date(`${completedAt}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== completedAt
  ) {
    return undefined;
  }

  return completedDateFormatter.format(date);
}
```

- [ ] **Step 6: Compose Citation, HoverCard, and Metadata List**

Destructure `metadata` in `CertificationCitation`. Replace the nested status expression with:

```ts
const status = getCertificationStatus(expiresAt, currentDate);
const completedAt = metadata
  ? formatCompletedAt(metadata.completedAt)
  : undefined;
const hasCompleteMetadata = Boolean(
  url &&
    status &&
    completedAt &&
    metadata?.id.trim() &&
    metadata.name.trim(),
);
const statusLabel = status === 'active' ? 'Active' : 'Expired';
```

Build the existing Citation once before the return:

```tsx
const citation = (
  <Citation
    number={number}
    source={{
      title,
      url,
      icon,
    }}
    variant="label"
    xstyle={hasSkillLogo && styles.sourceWithIcon}
  />
);
```

In the return, keep `fallbackIcon` before the citation and replace the direct `Citation` with:

```tsx
{hasCompleteMetadata && metadata && completedAt ? (
  <HoverCard
    content={
      <MetadataList columns="single">
        <MetadataListItem label="ID">{metadata.id}</MetadataListItem>
        <MetadataListItem label="Name">{metadata.name}</MetadataListItem>
        <MetadataListItem label="Status">{statusLabel}</MetadataListItem>
        <MetadataListItem label="Completed">
          {completedAt}
        </MetadataListItem>
      </MetadataList>
    }
    hasHoverIndication={false}
  >
    {citation}
  </HoverCard>
) : (
  citation
)}
```

Keep the existing `VisuallyHidden` block after this branch. Continue using lowercase `status` for `data-certification-status` and icon-color behavior. Do not add local hover/focus state or event handlers; Astryx owns those interactions.

- [ ] **Step 7: Run focused component and StyleX tests**

```bash
cd /home/benkim0414/workspace/benkim0414
pnpm exec vitest run \
  --config "$PWD/.worktrees/certification-hovercard/apps/github.io/vite.config.ts" \
  "$PWD/.worktrees/certification-hovercard/apps/github.io/src/app/certifications/certification-citation.spec.tsx" \
  "$PWD/.worktrees/certification-hovercard/apps/github.io/src/app/certifications/certification-citation-xstyle.spec.tsx"
```

Expected: PASS. If the xstyle test fails because its mocked Citation is now wrapped, update only the mock DOM/ref behavior needed for Astryx HoverCard to locate the anchor; do not weaken its existing xstyle assertions.

- [ ] **Step 8: Commit the component behavior**

From the linked worktree:

```bash
git add apps/github.io/src/app/certifications/certification-citation.tsx apps/github.io/src/app/certifications/certification-citation.spec.tsx
git diff --cached --check
git diff --cached
git commit -m "feat(github.io): show certification metadata hovercard"
```

---

### Task 2: Add Concrete CNCF Credential Metadata

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-list.types.ts`
- Modify: `apps/github.io/src/app/skills/skill-list.data.ts`
- Test: `apps/github.io/src/app/skills/skill-list.data.spec.ts`
- Modify: `apps/github.io/src/app/devops-roadmap/devops-roadmap.data.ts`
- Test: `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`

**Interfaces:**
- Consumes: `CertificationMetadata` exported by Task 1.
- Produces: `SkillCertification.metadata?: CertificationMetadata` and complete metadata values on all concrete CKA, CKAD, and KCNA skill/roadmap records.
- Preserves: existing certificate titles, URLs, expiry timestamps, skills, badge images, ordering, and roadmap type derivation.

- [ ] **Step 1: Extend the existing data assertions with exact metadata**

In `skill-list.data.spec.ts`, add these nested properties to the matching KCNA, CKAD, and CKA expected objects:

```ts
metadata: {
  id: 'LF-bau2ptq4ve',
  name: 'Kubernetes and Cloud Native Associate',
  completedAt: '2025-03-21',
},
```

```ts
metadata: {
  id: 'LF-kyh6ajhr7y',
  name: 'Certified Kubernetes Application Developer',
  completedAt: '2026-02-25',
},
```

```ts
metadata: {
  id: 'LF-assbyzy17c',
  name: 'Certified Kubernetes Administrator',
  completedAt: '2025-04-20',
},
```

In `devops-roadmap.spec.tsx`, add the same nested blocks to CKA, CKAD, and KCNA respectively in the `stores Kubernetes certifications under Container Orchestration` expectation. Match by title, not array position copied from the skill catalog, because the roadmap order is CKA, CKAD, KCNA.

- [ ] **Step 2: Run the two data tests to verify they fail**

```bash
cd /home/benkim0414/workspace/benkim0414
pnpm exec vitest run \
  --config "$PWD/.worktrees/certification-hovercard/apps/github.io/vite.config.ts" \
  "$PWD/.worktrees/certification-hovercard/apps/github.io/src/app/skills/skill-list.data.spec.ts" \
  "$PWD/.worktrees/certification-hovercard/apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx"
```

Expected: FAIL because the concrete records do not contain `metadata`.

- [ ] **Step 3: Extend `SkillCertification` with the shared metadata type**

At the top of `skill-list.types.ts`, add:

```ts
import type { CertificationMetadata } from '../certifications/certification-citation';
```

Add the optional field to `SkillCertification`:

```ts
export interface SkillCertification {
  title: string;
  url: string;
  skills: readonly string[];
  expiresAt: string;
  citationIcon?: string;
  metadata?: CertificationMetadata;
}
```

Do not change `devops-roadmap.types.ts`; its `Certification` type already derives from `CertificationCitationProps` and inherits `metadata` from Task 1.

- [ ] **Step 4: Add the three metadata objects to both production data surfaces**

In `skill-list.data.ts`, add each metadata block from Step 1 to its matching KCNA, CKAD, or CKA record.

In `devops-roadmap.data.ts`, add each metadata block from Step 1 to its matching CKA, CKAD, or KCNA record.

Keep every existing field and array order unchanged. Do not add metadata to `devops-capability-evidence.data.ts`.

- [ ] **Step 5: Run data and consumer regression tests**

```bash
cd /home/benkim0414/workspace/benkim0414
pnpm exec vitest run \
  --config "$PWD/.worktrees/certification-hovercard/apps/github.io/vite.config.ts" \
  "$PWD/.worktrees/certification-hovercard/apps/github.io/src/app/skills/skill-list.data.spec.ts" \
  "$PWD/.worktrees/certification-hovercard/apps/github.io/src/app/skills/skill-card.spec.tsx" \
  "$PWD/.worktrees/certification-hovercard/apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx" \
  "$PWD/.worktrees/certification-hovercard/apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx"
```

Expected: PASS. The capability-evidence test confirms the generic citation path remains unchanged.

- [ ] **Step 6: Commit the concrete credential data**

```bash
git add apps/github.io/src/app/skills/skill-list.types.ts apps/github.io/src/app/skills/skill-list.data.ts apps/github.io/src/app/skills/skill-list.data.spec.ts apps/github.io/src/app/devops-roadmap/devops-roadmap.data.ts apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
git diff --cached --check
git diff --cached
git commit -m "feat(github.io): add certification credential metadata"
```

---

### Task 3: Add Storybook HoverCard Fixtures

**Files:**
- Modify: `apps/github.io/src/app/certifications/certification-citation.stories.tsx`
- Test: `apps/github.io/src/app/certifications/certification-citation.stories.spec.ts`

**Interfaces:**
- Consumes: `CertificationCitationProps.metadata` from Task 1 and the exact CKA/CKAD metadata values from Task 2.
- Produces: active and expired concrete HoverCard stories plus retained generic `Unbranded` coverage.
- Preserves: real CNCF badge fixtures and existing story names.

- [ ] **Step 1: Write the failing story-fixture assertions**

Extend the story imports:

```ts
import {
  Active,
  Expired,
  MultipleSkills,
  Unbranded,
} from './certification-citation.stories';
```

Add this test after the badge-image test:

```ts
it('provides complete metadata only for concrete credential stories', () => {
  expect(Active.args?.metadata).toEqual({
    id: 'LF-assbyzy17c',
    name: 'Certified Kubernetes Administrator',
    completedAt: '2025-04-20',
  });
  expect(Expired.args?.metadata).toEqual({
    id: 'LF-assbyzy17c',
    name: 'Certified Kubernetes Administrator',
    completedAt: '2025-04-20',
  });
  expect(MultipleSkills.args?.metadata).toEqual({
    id: 'LF-kyh6ajhr7y',
    name: 'Certified Kubernetes Application Developer',
    completedAt: '2026-02-25',
  });
  expect(Unbranded.args?.metadata).toBeUndefined();
});
```

- [ ] **Step 2: Run the story fixture test to verify it fails**

```bash
cd /home/benkim0414/workspace/benkim0414
pnpm exec vitest run \
  --config "$PWD/.worktrees/certification-hovercard/apps/github.io/vite.config.ts" \
  "$PWD/.worktrees/certification-hovercard/apps/github.io/src/app/certifications/certification-citation.stories.spec.ts"
```

Expected: FAIL because the concrete stories have no metadata.

- [ ] **Step 3: Add exact metadata to the concrete stories**

Add this object to `Active.args` and `Expired.args`:

```ts
metadata: {
  id: 'LF-assbyzy17c',
  name: 'Certified Kubernetes Administrator',
  completedAt: '2025-04-20',
},
```

Add this object to `MultipleSkills.args`:

```ts
metadata: {
  id: 'LF-kyh6ajhr7y',
  name: 'Certified Kubernetes Application Developer',
  completedAt: '2026-02-25',
},
```

Leave `Unbranded` without metadata so it continues exercising the generic citation-only path.

- [ ] **Step 4: Run the story and component tests**

```bash
cd /home/benkim0414/workspace/benkim0414
pnpm exec vitest run \
  --config "$PWD/.worktrees/certification-hovercard/apps/github.io/vite.config.ts" \
  "$PWD/.worktrees/certification-hovercard/apps/github.io/src/app/certifications/certification-citation.stories.spec.ts" \
  "$PWD/.worktrees/certification-hovercard/apps/github.io/src/app/certifications/certification-citation.spec.tsx"
```

Expected: PASS.

- [ ] **Step 5: Commit the Storybook fixtures**

```bash
git add apps/github.io/src/app/certifications/certification-citation.stories.tsx apps/github.io/src/app/certifications/certification-citation.stories.spec.ts
git diff --cached --check
git diff --cached
git commit -m "test(github.io): add certification hovercard stories"
```

---

### Task 4: Run Full Validation And Visual Review

**Files:**
- Verify only; modify production or test files only when a validation failure identifies a feature regression.

**Interfaces:**
- Consumes: all Task 1-3 commits.
- Produces: recorded evidence that focused tests, full app tests, lint, build, and responsive Storybook interactions pass.

- [ ] **Step 1: Run all `github.io` tests against the linked worktree source**

```bash
cd /home/benkim0414/workspace/benkim0414
pnpm exec vitest run \
  --config "$PWD/.worktrees/certification-hovercard/apps/github.io/vite.config.ts"
```

Expected: PASS with no failed test files.

- [ ] **Step 2: Run lint and production build from the linked worktree**

Create an ignored dependency link only if the worktree does not already have one:

```bash
cd /home/benkim0414/workspace/benkim0414/.worktrees/certification-hovercard
test -e node_modules || ln -s ../../node_modules node_modules
pnpm nx lint github.io
pnpm nx build github.io
```

Expected: both commands PASS. If pnpm fails before Nx starts with the documented external-store SQLite error, run the dependency-bearing binaries against the worktree instead:

```bash
cd /home/benkim0414/workspace/benkim0414
pnpm exec eslint \
  "$PWD/.worktrees/certification-hovercard/apps/github.io/src/**/*.{ts,tsx}"
pnpm exec vite build \
  --config "$PWD/.worktrees/certification-hovercard/apps/github.io/vite.config.ts"
```

Record which command path ran; do not report an environment failure as a passing Nx check.

- [ ] **Step 3: Start Storybook from the feature worktree**

Run from the worktree app directory so Storybook resolves the branch's stories and Vite config:

```bash
cd /home/benkim0414/workspace/benkim0414/.worktrees/certification-hovercard/apps/github.io
/home/benkim0414/workspace/benkim0414/node_modules/.bin/storybook dev \
  --host 127.0.0.1 \
  --port 6006 \
  --no-open \
  --ci
```

Expected: Storybook serves the `GitHub.io/Certifications/Certification Citation` stories at `http://127.0.0.1:6006`.

- [ ] **Step 4: Verify desktop pointer and keyboard behavior in a real browser**

Open the Active story at desktop width and verify:

1. Hovering CKA opens a card containing exactly ID, Name, Status, and Completed.
2. Moving the pointer from CKA into the card keeps it visible.
3. The full certificate name wraps without clipping or overlapping another row.
4. Tabbing to CKA opens the same card and preserves a visible focus indicator.
5. Pressing `Escape` closes the card and leaves focus on CKA.
6. Pressing `Enter` follows the existing certificate link behavior.
7. The Expired story says `Expired`; the Active story says `Active`.
8. The Unbranded story has no HoverCard.

Use browser accessibility inspection to confirm that the Citation link's `aria-describedby` includes the HoverCard ID and the content contains one semantic `dl` with four `dt`/`dd` pairs.

- [ ] **Step 5: Verify mobile regression behavior**

At a representative mobile viewport such as `390x844`, verify:

1. The citation badge and short title remain within their parent without clipping or overlap.
2. A tap uses the Citation's certificate link directly; there is no two-step Popover interaction.
3. The HoverCard content does not reserve layout space while closed.

- [ ] **Step 6: Inspect the final branch and commits**

```bash
cd /home/benkim0414/workspace/benkim0414/.worktrees/certification-hovercard
git status --short --branch
git log --oneline --decorate -5
git diff HEAD~3..HEAD --check
git diff --stat HEAD~3..HEAD
```

Expected: clean branch with the design and plan commits followed by the three
task commits, no whitespace errors, and changes limited to the approved spec,
plan, certification component/tests/stories, skill data/type/test, and roadmap
data/test.

If validation requires a code fix, add or update a regression test first, rerun the focused command, and commit the fix separately with a conventional `fix(github.io): ...` or `test(github.io): ...` subject. Do not amend or combine the task commits.
