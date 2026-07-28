# Capability Evidence Compact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build compact reusable React evidence components for one `CapabilityEvidenceItem` at a time.

**Architecture:** `CapabilityEvidence` is a thin dispatcher that delegates to one evidence-type leaf component. Shared helpers derive compact labels and choose icons by checking technology brands, GitHub repository URLs, and Heroicons fallbacks rendered through Astryx `Icon`.

**Tech Stack:** React 19, TypeScript, Nx, Vitest, Testing Library, Storybook, Astryx, StyleX, `simple-icons`, `@heroicons/react`.

## Global Constraints

- Work from the linked worktree at `.worktrees/feat-capability-evidence-compact`.
- Do not add full evidence cards, summaries, modals, or expanded detail surfaces.
- Use `CapabilityEvidenceItem` directly; do not introduce a generic evidence abstraction.
- Do not filter private or sensitive evidence inside `CapabilityEvidence`.
- Compact components render `label` or a short derived label, not long descriptive `title` text.
- Reuse existing `SkillToken` for skill evidence.
- Reuse existing `CertificationCitation` for certification evidence.
- Render project evidence as Astryx `Citation`.
- Render non-brand type fallback icons through Astryx `Icon`.
- Use Heroicons 24 outline icons only for missing evidence-type icons.
- Prefer technology brand icons, then GitHub repository source icons for projects, then evidence-type fallback icons.
- Keep Tailwind out of component internals; use Astryx primitives and StyleX for narrow overrides.
- Stage explicit paths only; do not use `git add -A`, `git add .`, or `git commit -a`.

---

## File Structure

- Modify `package.json` and `pnpm-lock.yaml`: add `@heroicons/react`.
- Modify `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts`: add optional `label?: string`.
- Modify `apps/github.io/src/app/certifications/certification-citation.tsx`: relax `url`, `skills`, and `expiresAt`.
- Modify `apps/github.io/src/app/certifications/certification-citation.spec.tsx`: cover optional URL and optional expiry.
- Create `apps/github.io/src/app/devops-capability-evidence/capability-evidence-label.ts`: compact label derivation.
- Create `apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx`: icon precedence and rendering helpers.
- Create `apps/github.io/src/app/devops-capability-evidence/capability-evidence-url.ts`: GitHub repository URL detection and repository label helper.
- Create `apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx`: dispatcher and leaf components.
- Create `apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx`: focused component tests.
- Create `apps/github.io/src/app/devops-capability-evidence/capability-evidence.stories.tsx`: Storybook coverage.
- Modify `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts`: add labels and proof URLs to representative seed evidence where useful.

---

### Task 1: Relax CertificationCitation And Add Compact Labels

**Files:**
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts`
- Modify: `apps/github.io/src/app/certifications/certification-citation.tsx`
- Modify: `apps/github.io/src/app/certifications/certification-citation.spec.tsx`

**Interfaces:**
- Produces: `CapabilityEvidenceItem.label?: string`
- Produces: `CertificationCitationProps.url?: string`
- Produces: `CertificationCitationProps.skills?: readonly string[]`
- Produces: `CertificationCitationProps.expiresAt?: string`

- [ ] **Step 1: Add failing tests for optional certification props**

Add these tests to `apps/github.io/src/app/certifications/certification-citation.spec.tsx`:

```tsx
it('renders an unlinked label citation when url is omitted', () => {
  const { getByLabelText, queryByRole } = render(
    <CertificationCitation
      currentDate={new Date('2026-07-23T00:00:00+10:00')}
      expiresAt="2027-04-20T10:00:00+10:00"
      skills={['Kubernetes']}
      title="CKA"
    />,
  );

  expect(getByLabelText('Citation 1: CKA').tagName.toLowerCase()).toBe('span');
  expect(queryByRole('doc-noteref')).toBeNull();
});

it('omits certification status when expiresAt is omitted', () => {
  const { container, queryByText } = render(
    <CertificationCitation
      skills={['Kubernetes']}
      title="CKA"
      url={certificateUrl}
    />,
  );

  expect(
    container
      .querySelector('[data-testid="certification-citation"]')
      ?.getAttribute('data-certification-status'),
  ).toBeNull();
  expect(queryByText('Active certification')).toBeNull();
  expect(queryByText('Expired certification')).toBeNull();
});

it('supports omitted skills without brand lookup', () => {
  const { container, getByRole } = render(
    <CertificationCitation title="Custom Cert" url={certificateUrl} />,
  );

  expect(getByRole('doc-noteref', { name: 'Citation 1: Custom Cert' })).toBeTruthy();
  expect(
    container
      .querySelector('[data-testid="certification-citation"]')
      ?.getAttribute('data-certification-primary-skill'),
  ).toBeNull();
  expect(container.querySelector('img')).toBeNull();
});
```

- [ ] **Step 2: Run the certification tests and confirm they fail**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/certifications/certification-citation.spec.tsx
```

Expected: TypeScript or runtime failures because `url`, `skills`, and `expiresAt` are still required or status is always rendered.

- [ ] **Step 3: Relax the evidence type**

In `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts`, add `label?: string` after `title: string`:

```ts
export interface CapabilityEvidenceItem {
  id: string;
  title: string;
  label?: string;
  type: EvidenceType;
  capabilityKeys: readonly DoraCapabilityKey[];
  date?: string;
  endDate?: string;
  issuer?: string;
  organization?: string;
  summary: string;
  technologies?: readonly string[];
  proofUrl?: string;
  isPublic: boolean;
  isSensitive?: boolean;
  strength: EvidenceStrength;
  supportingEvidenceIds?: readonly string[];
}
```

- [ ] **Step 4: Relax CertificationCitation props and status logic**

In `apps/github.io/src/app/certifications/certification-citation.tsx`, change the prop interface:

```ts
export interface CertificationCitationProps {
  title: string;
  url?: string;
  skills?: readonly string[];
  expiresAt?: string;
  number?: number;
  currentDate?: Date;
}
```

Change the component defaults and status calculation:

```ts
export function CertificationCitation({
  title,
  url,
  skills = [],
  expiresAt,
  number = 1,
  currentDate = new Date(),
}: CertificationCitationProps): ReactElement {
  const primary = findPrimaryBrand(skills);
  const status = expiresAt
    ? isActive(expiresAt, currentDate)
      ? 'active'
      : 'expired'
    : undefined;
```

Keep the current icon color rule, but branch on optional status:

```ts
const icon = primary?.brand.iconPath
  ? iconDataUrl(
      primary.brand.iconPath,
      status === 'expired'
        ? ASTRYX_CITATION_LABEL_TEXT
        : primary.brand.color,
    )
  : undefined;
```

Only render status attributes and hidden text when `status` exists:

```tsx
<span
  {...stylex.props(styles.root)}
  data-certification-primary-skill={primary?.skill}
  data-certification-status={status}
  data-testid="certification-citation"
>
  <Citation
    number={number}
    source={{ title, url, icon }}
    variant="label"
    xstyle={hasSkillLogo && styles.sourceWithIcon}
  />
  {status ? (
    <VisuallyHidden>
      {status === 'active' ? 'Active certification' : 'Expired certification'}
    </VisuallyHidden>
  ) : null}
</span>
```

- [ ] **Step 5: Run certification tests**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/certifications/certification-citation.spec.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

```bash
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.types.ts apps/github.io/src/app/certifications/certification-citation.tsx apps/github.io/src/app/certifications/certification-citation.spec.tsx
git diff --cached
git commit -m "refactor(github.io): relax certification citations"
```

---

### Task 2: Add Label, URL, And Icon Helpers

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `apps/github.io/src/app/devops-capability-evidence/capability-evidence-label.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/capability-evidence-url.ts`
- Create: `apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx`
- Create: `apps/github.io/src/app/devops-capability-evidence/capability-evidence.helpers.spec.tsx`

**Interfaces:**
- Consumes: `CapabilityEvidenceItem.label?: string`
- Produces: `getCapabilityEvidenceLabel(evidence: CapabilityEvidenceItem): string`
- Produces: `isGithubRepositoryUrl(url: string | undefined): boolean`
- Produces: `getGithubRepositoryLabel(url: string | undefined): string | undefined`
- Produces: `getCapabilityEvidenceIcon(evidence: CapabilityEvidenceItem): ReactNode | undefined`

- [ ] **Step 1: Add Heroicons dependency**

Run:

```bash
pnpm add @heroicons/react
```

Expected: `package.json` and `pnpm-lock.yaml` update with `@heroicons/react`.

- [ ] **Step 2: Write failing helper tests**

Create `apps/github.io/src/app/devops-capability-evidence/capability-evidence.helpers.spec.tsx`:

```tsx
import { render } from '@testing-library/react';

import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';
import { getCapabilityEvidenceIcon } from './capability-evidence-icon';
import {
  getGithubRepositoryLabel,
  isGithubRepositoryUrl,
} from './capability-evidence-url';
import { getCapabilityEvidenceLabel } from './capability-evidence-label';

function evidence(
  overrides: Partial<CapabilityEvidenceItem>,
): CapabilityEvidenceItem {
  return {
    id: 'evidence',
    title: 'Very long capability evidence title that should not be compact text',
    type: 'learning',
    capabilityKeys: ['flexible-infrastructure'],
    summary: 'Public-safe evidence summary for helper tests.',
    isPublic: true,
    strength: 'strong',
    ...overrides,
  };
}

describe('capability evidence compact helpers', () => {
  it('prefers explicit compact labels over long titles', () => {
    expect(getCapabilityEvidenceLabel(evidence({ label: 'CKA' }))).toBe('CKA');
  });

  it('derives a known technology label before falling back to title', () => {
    expect(
      getCapabilityEvidenceLabel(
        evidence({ technologies: ['Kubernetes'], title: 'Long Kubernetes learning path' }),
      ),
    ).toBe('Kubernetes');
  });

  it('detects GitHub repository URLs but not profiles or pull requests', () => {
    expect(isGithubRepositoryUrl('https://github.com/benkim0414/devops-roadmap')).toBe(true);
    expect(isGithubRepositoryUrl('https://github.com/benkim0414')).toBe(false);
    expect(isGithubRepositoryUrl('https://github.com/benkim0414/devops-roadmap/pull/1')).toBe(false);
  });

  it('derives a repository label from a GitHub repository URL', () => {
    expect(
      getGithubRepositoryLabel('https://github.com/benkim0414/devops-roadmap'),
    ).toBe('devops-roadmap');
  });

  it('prefers known technology icons over type fallback icons', () => {
    const icon = getCapabilityEvidenceIcon(
      evidence({ technologies: ['Kubernetes'], type: 'learning' }),
    );
    const { container } = render(<>{icon}</>);

    expect(container.querySelector('svg path')?.getAttribute('d')).toBeTruthy();
    expect(container.textContent).toBe('');
  });

  it('uses a fallback icon when no technology brand exists', () => {
    const icon = getCapabilityEvidenceIcon(evidence({ technologies: ['Unknown'] }));
    const { container } = render(<>{icon}</>);

    expect(container.querySelector('.astryx-icon, svg')).toBeTruthy();
  });
});
```

- [ ] **Step 3: Run helper tests and confirm they fail**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/devops-capability-evidence/capability-evidence.helpers.spec.tsx
```

Expected: FAIL because helper modules do not exist.

- [ ] **Step 4: Implement URL helper**

Create `apps/github.io/src/app/devops-capability-evidence/capability-evidence-url.ts`:

```ts
const GITHUB_HOSTS = new Set(['github.com', 'www.github.com']);

export function isGithubRepositoryUrl(url: string | undefined): boolean {
  if (!url) {
    return false;
  }

  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/').filter(Boolean);

    return (
      GITHUB_HOSTS.has(parsed.hostname.toLowerCase()) &&
      pathParts.length === 2
    );
  } catch {
    return false;
  }
}

export function getGithubRepositoryLabel(
  url: string | undefined,
): string | undefined {
  if (!isGithubRepositoryUrl(url)) {
    return undefined;
  }

  return new URL(url).pathname.split('/').filter(Boolean)[1];
}
```

- [ ] **Step 5: Implement label helper**

Create `apps/github.io/src/app/devops-capability-evidence/capability-evidence-label.ts`:

```ts
import { getSkillBrand } from '../skills/skill-brand';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';
import { getGithubRepositoryLabel } from './capability-evidence-url';

const MAX_COMPACT_TITLE_LENGTH = 28;

function firstKnownTechnology(
  technologies: readonly string[] | undefined,
): string | undefined {
  return technologies?.find((technology) => getSkillBrand(technology));
}

export function getCapabilityEvidenceLabel(
  evidence: CapabilityEvidenceItem,
): string {
  const technology = firstKnownTechnology(evidence.technologies);
  const repositoryLabel =
    evidence.type === 'project'
      ? getGithubRepositoryLabel(evidence.proofUrl)
      : undefined;

  return (
    evidence.label ??
    technology ??
    repositoryLabel ??
    (evidence.title.length <= MAX_COMPACT_TITLE_LENGTH
      ? evidence.title
      : evidence.title.slice(0, MAX_COMPACT_TITLE_LENGTH - 1).trimEnd() + '…')
  );
}
```

- [ ] **Step 6: Implement icon helper**

Create `apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx`:

```tsx
import { Icon } from '@astryxdesign/core/Icon';
import {
  AcademicCapIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CheckBadgeIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline';
import type { ReactNode } from 'react';

import { getSkillBrand } from '../skills/skill-brand';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';
import { isGithubRepositoryUrl } from './capability-evidence-url';

function firstKnownTechnologyIcon(
  technologies: readonly string[] | undefined,
): ReactNode | undefined {
  const brand = technologies
    ?.map((technology) => getSkillBrand(technology))
    .find(Boolean);

  return brand?.iconPath ? (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d={brand.iconPath} fill="currentColor" />
    </svg>
  ) : undefined;
}

export function getCapabilityEvidenceIcon(
  evidence: CapabilityEvidenceItem,
): ReactNode | undefined {
  const technologyIcon = firstKnownTechnologyIcon(evidence.technologies);

  if (technologyIcon) {
    return technologyIcon;
  }

  if (evidence.type === 'project' && isGithubRepositoryUrl(evidence.proofUrl)) {
    const githubIcon = getSkillBrand('GitHub');

    return githubIcon?.iconPath ? (
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
        <path d={githubIcon.iconPath} fill="currentColor" />
      </svg>
    ) : undefined;
  }

  const fallbackIcon = {
    certification: CheckBadgeIcon,
    education: AcademicCapIcon,
    experience: BriefcaseIcon,
    learning: BookOpenIcon,
    project: CodeBracketIcon,
    skill: undefined,
  }[evidence.type];

  return fallbackIcon ? (
    <Icon icon={fallbackIcon} size="sm" color="inherit" />
  ) : undefined;
}
```

- [ ] **Step 7: Run helper tests**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/devops-capability-evidence/capability-evidence.helpers.spec.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit Task 2**

```bash
git add package.json pnpm-lock.yaml apps/github.io/src/app/devops-capability-evidence/capability-evidence-label.ts apps/github.io/src/app/devops-capability-evidence/capability-evidence-url.ts apps/github.io/src/app/devops-capability-evidence/capability-evidence-icon.tsx apps/github.io/src/app/devops-capability-evidence/capability-evidence.helpers.spec.tsx
git diff --cached
git commit -m "feat(github.io): add capability evidence helpers"
```

---

### Task 3: Add Compact Evidence Components

**Files:**
- Create: `apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx`
- Create: `apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx`

**Interfaces:**
- Consumes: `getCapabilityEvidenceLabel(evidence)`
- Consumes: `getCapabilityEvidenceIcon(evidence)`
- Produces: `CapabilityEvidence({ evidence, citationNumber }: CapabilityEvidenceProps)`
- Produces: `SkillEvidenceToken`, `LearningEvidenceToken`, `ExperienceEvidenceToken`, `EducationEvidenceToken`, `CertificationEvidenceCitation`, `ProjectEvidenceCitation`

- [ ] **Step 1: Write failing component tests**

Create `apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx`:

```tsx
import { render, screen } from '@testing-library/react';

import { CapabilityEvidence } from './capability-evidence';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

function evidence(
  overrides: Partial<CapabilityEvidenceItem>,
): CapabilityEvidenceItem {
  return {
    id: 'evidence',
    title: 'Long evidence title that should not render when label exists',
    label: 'Evidence',
    type: 'learning',
    capabilityKeys: ['flexible-infrastructure'],
    summary: 'Public-safe evidence summary.',
    isPublic: true,
    strength: 'strong',
    ...overrides,
  };
}

describe('CapabilityEvidence', () => {
  it('renders skill evidence with the existing skill token', () => {
    render(
      <CapabilityEvidence
        evidence={evidence({ label: undefined, title: 'Kubernetes', type: 'skill' })}
      />,
    );

    expect(screen.getByTestId('skill-token')).toBeTruthy();
    expect(screen.getByText('Kubernetes')).toBeTruthy();
  });

  it.each([
    ['learning', 'Learning evidence: Kubernetes'],
    ['experience', 'Experience evidence: CI/CD workflow'],
    ['education', 'Education evidence: Computer Science'],
  ] as const)('renders %s evidence as a compact token', (type, label) => {
    render(
      <CapabilityEvidence
        evidence={evidence({
          label: label.split(': ')[1],
          type,
          proofUrl: 'https://example.com/proof',
        })}
      />,
    );

    expect(screen.getByLabelText(label)).toBeTruthy();
    expect(screen.getByRole('link', { name: label })).toHaveAttribute(
      'href',
      'https://example.com/proof',
    );
  });

  it('renders certification evidence through CertificationCitation', () => {
    render(
      <CapabilityEvidence
        citationNumber={3}
        evidence={evidence({
          label: 'CKA',
          proofUrl: 'https://example.com/cka',
          technologies: ['Kubernetes'],
          type: 'certification',
        })}
      />,
    );

    expect(screen.getByRole('doc-noteref', { name: 'Citation 3: CKA' })).toBeTruthy();
  });

  it('renders project evidence as a citation', () => {
    render(
      <CapabilityEvidence
        citationNumber={4}
        evidence={evidence({
          label: undefined,
          proofUrl: 'https://github.com/benkim0414/devops-roadmap',
          title: 'Long public repository project evidence title',
          type: 'project',
        })}
      />,
    );

    expect(
      screen.getByRole('doc-noteref', { name: 'Citation 4: devops-roadmap' }),
    ).toBeTruthy();
  });

  it('does not filter evidence marked non-public', () => {
    render(
      <CapabilityEvidence
        evidence={evidence({
          isPublic: false,
          label: 'Renderer only',
          type: 'experience',
        })}
      />,
    );

    expect(
      screen.getByLabelText('Experience evidence: Renderer only'),
    ).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run component tests and confirm they fail**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx
```

Expected: FAIL because `capability-evidence.tsx` does not exist.

- [ ] **Step 3: Implement compact evidence components**

Create `apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx`:

```tsx
import { Citation } from '@astryxdesign/core/Citation';
import { Token } from '@astryxdesign/core/Token';
import type { ReactElement } from 'react';

import { CertificationCitation } from '../certifications/certification-citation';
import { SkillToken } from '../skills/skill-token';
import { getCapabilityEvidenceIcon } from './capability-evidence-icon';
import { getCapabilityEvidenceLabel } from './capability-evidence-label';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

export interface CapabilityEvidenceProps {
  evidence: CapabilityEvidenceItem;
  citationNumber?: number;
}

interface EvidenceLeafProps {
  evidence: CapabilityEvidenceItem;
  citationNumber?: number;
}

function evidenceAriaLabel(evidence: CapabilityEvidenceItem, label: string) {
  return `${evidence.type[0].toUpperCase()}${evidence.type.slice(1)} evidence: ${label}`;
}

export function SkillEvidenceToken({ evidence }: EvidenceLeafProps): ReactElement {
  return <SkillToken label={getCapabilityEvidenceLabel(evidence)} />;
}

function EvidenceToken({ evidence }: EvidenceLeafProps): ReactElement {
  const label = getCapabilityEvidenceLabel(evidence);

  return (
    <Token
      aria-label={evidenceAriaLabel(evidence, label)}
      color="gray"
      href={evidence.proofUrl}
      icon={getCapabilityEvidenceIcon(evidence)}
      label={label}
      size="sm"
    />
  );
}

export function LearningEvidenceToken(props: EvidenceLeafProps): ReactElement {
  return <EvidenceToken {...props} />;
}

export function ExperienceEvidenceToken(props: EvidenceLeafProps): ReactElement {
  return <EvidenceToken {...props} />;
}

export function EducationEvidenceToken(props: EvidenceLeafProps): ReactElement {
  return <EvidenceToken {...props} />;
}

export function CertificationEvidenceCitation({
  evidence,
  citationNumber = 1,
}: EvidenceLeafProps): ReactElement {
  return (
    <CertificationCitation
      number={citationNumber}
      skills={evidence.technologies}
      title={getCapabilityEvidenceLabel(evidence)}
      url={evidence.proofUrl}
    />
  );
}

export function ProjectEvidenceCitation({
  evidence,
  citationNumber = 1,
}: EvidenceLeafProps): ReactElement {
  const label = getCapabilityEvidenceLabel(evidence);

  return (
    <Citation
      aria-label={evidenceAriaLabel(evidence, label)}
      number={citationNumber}
      source={{
        title: label,
        url: evidence.proofUrl,
      }}
      variant="label"
    />
  );
}

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

- [ ] **Step 4: Run component tests**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit Task 3**

```bash
git add apps/github.io/src/app/devops-capability-evidence/capability-evidence.tsx apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx
git diff --cached
git commit -m "feat(github.io): add compact capability evidence"
```

---

### Task 4: Add Stories And Representative Seed Labels

**Files:**
- Create: `apps/github.io/src/app/devops-capability-evidence/capability-evidence.stories.tsx`
- Modify: `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts`

**Interfaces:**
- Consumes: `CapabilityEvidence`
- Consumes: `CapabilityEvidenceItem.label?: string`

- [ ] **Step 1: Add compact labels and proof URLs to seed evidence**

In `apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts`, update representative items:

```ts
{
  id: 'github-actions-delivery',
  title: 'CI/CD workflow ownership',
  label: 'CI/CD workflow',
  type: 'experience',
  ...
}
```

```ts
{
  id: 'kubernetes-learning',
  title: 'Kubernetes operations learning path',
  label: 'Kubernetes',
  type: 'learning',
  ...
}
```

```ts
{
  id: 'cncf-kubernetes-certification',
  title: 'CNCF Kubernetes certification',
  label: 'Kubernetes cert',
  type: 'certification',
  ...
}
```

```ts
{
  id: 'devops-roadmap-project',
  title: 'DevOps roadmap portfolio project',
  label: 'DevOps roadmap',
  type: 'project',
  proofUrl: 'https://github.com/benkim0414/benkim0414',
  ...
}
```

- [ ] **Step 2: Create Storybook stories**

Create `apps/github.io/src/app/devops-capability-evidence/capability-evidence.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { CapabilityEvidence } from './capability-evidence';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const baseEvidence = {
  id: 'story-evidence',
  capabilityKeys: ['flexible-infrastructure'],
  summary: 'Public-safe evidence summary for compact display.',
  isPublic: true,
  strength: 'strong',
} as const;

const meta = {
  component: CapabilityEvidence,
  title: 'DevOps Capability Evidence/CapabilityEvidence',
} satisfies Meta<typeof CapabilityEvidence>;

export default meta;

type Story = StoryObj<typeof meta>;

function item(
  evidence: Omit<CapabilityEvidenceItem, keyof typeof baseEvidence>,
): CapabilityEvidenceItem {
  return { ...baseEvidence, ...evidence };
}

export const Skill: Story = {
  args: {
    evidence: item({
      id: 'skill',
      title: 'Kubernetes',
      type: 'skill',
    }),
  },
};

export const Learning: Story = {
  args: {
    evidence: item({
      id: 'learning',
      label: 'Kubernetes',
      proofUrl: 'https://www.cncf.io/training/',
      technologies: ['Kubernetes'],
      title: 'Kubernetes operations learning path',
      type: 'learning',
    }),
  },
};

export const Experience: Story = {
  args: {
    evidence: item({
      id: 'experience',
      label: 'CI/CD workflow',
      technologies: ['GitHub Actions'],
      title: 'CI/CD workflow ownership for a four-developer product team',
      type: 'experience',
    }),
  },
};

export const Education: Story = {
  args: {
    evidence: item({
      id: 'education',
      label: 'Computer Science',
      title: 'Bachelor of Computer Science from University of Example',
      type: 'education',
    }),
  },
};

export const Certification: Story = {
  args: {
    citationNumber: 1,
    evidence: item({
      id: 'certification',
      label: 'CKA',
      proofUrl: 'https://example.com/cka',
      technologies: ['Kubernetes'],
      title: 'Certified Kubernetes Administrator',
      type: 'certification',
    }),
  },
};

export const Project: Story = {
  args: {
    citationNumber: 2,
    evidence: item({
      id: 'project',
      proofUrl: 'https://github.com/benkim0414/benkim0414',
      title: 'DevOps roadmap portfolio project with React, TypeScript, Nx, and GitHub Pages',
      type: 'project',
    }),
  },
};

export const MixedRow = {
  render: () => {
    const evidence = [
      Skill.args.evidence,
      Learning.args.evidence,
      Experience.args.evidence,
      Education.args.evidence,
      Certification.args.evidence,
      Project.args.evidence,
    ].filter(Boolean) as CapabilityEvidenceItem[];

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {evidence.map((entry, index) => (
          <CapabilityEvidence
            key={entry.id}
            citationNumber={index + 1}
            evidence={entry}
          />
        ))}
      </div>
    );
  },
} satisfies Story;
```

- [ ] **Step 3: Run data and component tests**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
pnpm nx test github.io -- --run apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx
```

Expected: PASS.

- [ ] **Step 4: Commit Task 4**

```bash
git add apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts apps/github.io/src/app/devops-capability-evidence/capability-evidence.stories.tsx
git diff --cached
git commit -m "docs(github.io): add compact evidence stories"
```

---

### Task 5: Final Verification And Review

**Files:**
- Review all files changed by Tasks 1-4.

**Interfaces:**
- Consumes: all components, helpers, tests, stories, and dependency changes from prior tasks.
- Produces: verified local branch ready for code review or handoff.

- [ ] **Step 1: Inspect the complete diff**

Run:

```bash
git status --short --branch
git diff HEAD~4..HEAD --stat
git diff HEAD~4..HEAD
```

Expected: Only compact evidence, certification citation compatibility, story, test, and dependency changes are present.

- [ ] **Step 2: Run focused tests**

Run:

```bash
pnpm nx test github.io -- --run apps/github.io/src/app/certifications/certification-citation.spec.tsx
pnpm nx test github.io -- --run apps/github.io/src/app/devops-capability-evidence/capability-evidence.helpers.spec.tsx
pnpm nx test github.io -- --run apps/github.io/src/app/devops-capability-evidence/capability-evidence.spec.tsx
pnpm nx test github.io -- --run apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.spec.ts
```

Expected: PASS.

- [ ] **Step 3: Run app-level verification**

Run:

```bash
pnpm nx test github.io
pnpm nx build github.io
```

Expected: PASS. If failures are unrelated to compact evidence changes, document the failing command and the relevant error lines in the final handoff.

- [ ] **Step 4: Run review**

Run the repo's requested review flow for non-trivial changes:

```bash
/review
```

Expected: Address any blocking findings with focused follow-up commits. If `/review` is not available in the current execution surface, state that and perform a manual diff review focused on regressions, accessibility, dependency impact, and missing tests.

- [ ] **Step 5: Final status**

Run:

```bash
git status --short --branch
git log --oneline -5
```

Expected: Working tree clean on `feat/capability-evidence-compact` with logical commits for the plan tasks.
