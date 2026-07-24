# Certification Citations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add reusable certification citations and render CKA, CKAD, and KCNA below the Container Orchestration roadmap node's Kubernetes skill.

**Architecture:** Extract shared skill brand metadata from `SkillToken` so both skill tokens and certifications use the same Simple Icons map, colors, SVG paths, data URLs, and contrast helper. Add a reusable `CertificationCitation` component under `apps/github.io/src/app/certifications/` that wraps Astryx `Citation`, derives active/expired status from `expiresAt`, and uses the first known linked skill as its primary brand. Update roadmap types, data, node rendering, CSS, and height estimation so certifications appear on their own line below skills, wrap normally with flex, and reserve one fixed certification-section allowance whenever present.

**Tech Stack:** React 19, TypeScript, Vitest, React Testing Library, Astryx `Citation`, Astryx `VisuallyHidden`, Simple Icons, React Flow, Nx `github.io` project.

**Superseding user decision:** Certifications use normal flex wrapping with no items-per-row setting. Node-height estimation reserves one fixed certification-section allowance whenever a node has at least one certification.

## Global Constraints

- Keep certification UI reusable outside roadmap nodes.
- Use Astryx `Citation` in `variant="label"` mode for certifications.
- Certification data uses `skills: readonly string[]` because a certification can link to multiple skills.
- Use the first linked skill with known brand metadata as the primary certification icon and color.
- Active certifications use the Astryx label secondary text color for the title and the primary skill brand color for the logo.
- Expired certifications use the Astryx label secondary text color for the title and the same secondary color for the primary skill logo when available.
- If a linked skill has known brand color metadata but no available logo, use the brand color as a Citation border accent instead of changing the text color.
- `expiresAt` must be a full ISO 8601 date-time string with timezone offset.
- Treat supplied expiry times as Australia/Melbourne local times.
- Do not add certificate verification API calls, runtime PDF parsing, filtering UI, a new route, or visible expiry date text in roadmap nodes.
- Stage explicit paths only. Do not use `git add -A`, `git add --all`, `git add -u`, `git add .`, `git commit -a`, or `git commit -am`.

---

### Task 1: Extract Shared Skill Brand Metadata

**Files:**
- Create: `apps/github.io/src/app/skills/skill-brand.ts`
- Create: `apps/github.io/src/app/skills/skill-brand.spec.ts`
- Modify: `apps/github.io/src/app/skills/skill-token.tsx`
- Verify: `apps/github.io/src/app/skills/skill-token.spec.tsx`
- Modify: `apps/github.io/src/styles.css`

**Interfaces:**
- Produces:
  - `export interface SkillBrand { name: string; color: string; foreground: string; iconPath?: string; iconDataUrl?: string; }`
  - `export function getSkillBrand(label: string): SkillBrand | undefined`
- Consumes: selected Simple Icons imports already used by `SkillToken`.

- [ ] **Step 1: Write failing shared brand tests**

Create `apps/github.io/src/app/skills/skill-brand.spec.ts`:

```ts
import { getSkillBrand } from './skill-brand';

describe('getSkillBrand', () => {
  it('returns brand metadata for mapped skills', () => {
    const brand = getSkillBrand('Kubernetes');

    expect(brand).toMatchObject({
      name: 'Kubernetes',
      color: '#326CE5',
      foreground: '#ffffff',
    });
    expect(brand?.iconPath).toBeTruthy();
    expect(brand?.iconDataUrl).toContain('data:image/svg+xml;utf8,');
    expect(brand?.iconDataUrl).toContain('fill%3D%22%23326CE5%22');
  });

  it('returns undefined for skills without Simple Icons metadata', () => {
    expect(getSkillBrand('Forward Proxy')).toBeUndefined();
  });

  it('chooses neutral text for light brand colors', () => {
    expect(getSkillBrand('Docker')?.foreground).toBe('#111827');
  });

  it('chooses inverse text for dark brand colors', () => {
    expect(getSkillBrand('GitHub')?.foreground).toBe('#ffffff');
  });
});
```

- [ ] **Step 2: Run the new tests to verify they fail**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io -- --run src/app/skills/skill-brand.spec.ts
```

Expected: FAIL because `apps/github.io/src/app/skills/skill-brand.ts` does not exist yet.

- [ ] **Step 3: Create the shared skill brand helper**

Create `apps/github.io/src/app/skills/skill-brand.ts`:

```ts
import {
  siAnsible,
  siArgo,
  siCircleci,
  siCloudflare,
  siConsul,
  siDatadog,
  siDocker,
  siGit,
  siGithub,
  siGithubactions,
  siGitlab,
  siGo,
  siGrafana,
  siIstio,
  siJfrog,
  siKubernetes,
  siNginx,
  siPrometheus,
  siPython,
  siTerraform,
  siVault,
  type SimpleIcon,
} from 'simple-icons';

export interface SkillBrand {
  name: string;
  color: string;
  foreground: string;
  iconPath?: string;
  iconDataUrl?: string;
}

const skillIcons: Readonly<Record<string, SimpleIcon>> = {
  Ansible: siAnsible,
  ArgoCD: siArgo,
  'Circle CI': siCircleci,
  Cloudflare: siCloudflare,
  Consul: siConsul,
  Datadog: siDatadog,
  Docker: siDocker,
  Git: siGit,
  GitHub: siGithub,
  'GitHub Actions': siGithubactions,
  'GitLab CI': siGitlab,
  Go: siGo,
  Grafana: siGrafana,
  Istio: siIstio,
  Artifactory: siJfrog,
  Kubernetes: siKubernetes,
  Nginx: siNginx,
  Prometheus: siPrometheus,
  Python: siPython,
  Terraform: siTerraform,
  Vault: siVault,
};

const ASTRYX_NEUTRAL_FOREGROUND = '#111827';
const ASTRYX_INVERSE_FOREGROUND = '#ffffff';

function relativeLuminance(hex: string) {
  const channels = [0, 2, 4].map(
    (offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255,
  );
  const linearChannels = channels.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return (
    0.2126 * linearChannels[0] +
    0.7152 * linearChannels[1] +
    0.0722 * linearChannels[2]
  );
}

function contrastRatio(firstLuminance: number, secondLuminance: number) {
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function brandForeground(hex: string) {
  const backgroundLuminance = relativeLuminance(hex);
  const neutralContrast = contrastRatio(
    relativeLuminance(ASTRYX_NEUTRAL_FOREGROUND.slice(1)),
    backgroundLuminance,
  );
  const inverseContrast = contrastRatio(
    relativeLuminance(ASTRYX_INVERSE_FOREGROUND.slice(1)),
    backgroundLuminance,
  );

  return neutralContrast >= inverseContrast
    ? ASTRYX_NEUTRAL_FOREGROUND
    : ASTRYX_INVERSE_FOREGROUND;
}

function toIconDataUrl(icon: SimpleIcon, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${color}" d="${icon.path}"/></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getSkillBrand(label: string): SkillBrand | undefined {
  const icon = skillIcons[label];

  if (!icon) {
    return undefined;
  }

  const color = `#${icon.hex}`;

  return {
    name: label,
    color,
    foreground: brandForeground(icon.hex),
    iconPath: icon.path,
    iconDataUrl: toIconDataUrl(icon, color),
  };
}
```

- [ ] **Step 4: Refactor `SkillToken` to consume the helper**

Replace `apps/github.io/src/app/skills/skill-token.tsx` with:

```tsx
import type { CSSProperties } from 'react';

import { getSkillBrand, type SkillBrand } from './skill-brand';

export interface SkillTokenProps {
  label: string;
  variant?: 'purple';
}

function tokenStyle(brand: SkillBrand | undefined): CSSProperties | undefined {
  if (!brand) {
    return undefined;
  }

  return {
    '--skill-token-background': brand.color,
    '--skill-token-foreground': brand.foreground,
  } as CSSProperties;
}

export function SkillToken({
  label,
  variant = 'purple',
}: SkillTokenProps): JSX.Element {
  const brand = getSkillBrand(label);

  return (
    <span
      className={`skill-token skill-token--${variant}`}
      data-has-icon={String(Boolean(brand))}
      data-token-color={brand?.color}
      style={tokenStyle(brand)}
    >
      {brand ? (
        <svg
          aria-hidden="true"
          className="skill-token__icon"
          focusable="false"
          viewBox="0 0 24 24"
        >
          <path d={brand.iconPath} fill="currentColor" />
        </svg>
      ) : null}
      <span className="skill-token__label">{label}</span>
    </span>
  );
}
```

- [ ] **Step 5: Run skill tests**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io -- --run src/app/skills/skill-brand.spec.ts src/app/skills/skill-token.spec.tsx
```

Expected: PASS for both spec files.

- [ ] **Step 6: Inspect the diff**

Run:

```bash
git diff -- apps/github.io/src/app/skills/skill-brand.ts apps/github.io/src/app/skills/skill-brand.spec.ts apps/github.io/src/app/skills/skill-token.tsx apps/github.io/src/styles.css
```

Expected: `SkillToken` keeps the same public API and rendered class names/data attributes, while Simple Icons lookup and contrast helpers move to `skill-brand.ts`.

- [ ] **Step 7: Commit Task 1**

Run:

```bash
git add apps/github.io/src/app/skills/skill-brand.ts apps/github.io/src/app/skills/skill-brand.spec.ts apps/github.io/src/app/skills/skill-token.tsx
git diff --cached
git commit -m "refactor(github.io): share skill brand metadata"
```

Expected: commit succeeds with only the helper, helper tests, and `SkillToken` refactor staged.

---

### Task 2: Add Reusable Certification Citation

**Files:**
- Create: `apps/github.io/src/app/certifications/certification-citation.tsx`
- Create: `apps/github.io/src/app/certifications/certification-citation.spec.tsx`
- Create: `apps/github.io/src/app/certifications/certification-citation.stories.tsx`
- Modify: `apps/github.io/src/styles.css`

**Interfaces:**
- Consumes: `getSkillBrand(label: string): SkillBrand | undefined` from Task 1.
- Produces:
  - `export interface CertificationCitationProps { title: string; url: string; skills: readonly string[]; expiresAt: string; number?: number; currentDate?: Date; }`
  - `export function CertificationCitation(props: CertificationCitationProps): JSX.Element`

- [ ] **Step 1: Write failing certification citation tests**

Create `apps/github.io/src/app/certifications/certification-citation.spec.tsx`:

```tsx
import { render } from '@testing-library/react';

import { CertificationCitation } from './certification-citation';

const certificateUrl = 'https://example.com/certificate.pdf';

describe('CertificationCitation', () => {
  it('renders an Astryx label citation link for a certification', () => {
    const { getByRole } = render(
      <CertificationCitation
        currentDate={new Date('2026-07-23T00:00:00+10:00')}
        expiresAt="2027-04-20T10:00:00+10:00"
        number={2}
        skills={['Kubernetes']}
        title="CKA"
        url={certificateUrl}
      />,
    );

    const citation = getByRole('doc-noteref', { name: 'Citation 2: CKA' });

    expect(citation).toBeTruthy();
    expect(citation.getAttribute('href')).toBe(certificateUrl);
    expect(citation.getAttribute('target')).toBe('_blank');
  });

  it('uses the first known linked skill as the primary brand', () => {
    const { container } = render(
      <CertificationCitation
        currentDate={new Date('2026-07-23T00:00:00+10:00')}
        expiresAt="2028-02-25T11:00:00+11:00"
        skills={['Unknown Skill', 'Kubernetes']}
        title="CKAD"
        url={certificateUrl}
      />,
    );

    const wrapper = container.querySelector('.certification-citation');

    expect(wrapper?.getAttribute('data-certification-primary-skill')).toBe('Kubernetes');
    expect(wrapper?.getAttribute('style')).toContain('--certification-citation-color: #326CE5');
    expect(container.querySelector('img')?.getAttribute('src')).toContain('data:image/svg+xml;utf8,');
  });

  it('marks future expiry dates as active', () => {
    const { container, getByText } = render(
      <CertificationCitation
        currentDate={new Date('2026-07-23T00:00:00+10:00')}
        expiresAt="2028-02-26T10:59:00+11:00"
        skills={['Kubernetes']}
        title="KCNA"
        url={certificateUrl}
      />,
    );

    expect(container.querySelector('.certification-citation')?.getAttribute('data-certification-status')).toBe('active');
    expect(getByText('Active certification')).toBeTruthy();
  });

  it('marks past expiry dates as expired', () => {
    const { container, getByText } = render(
      <CertificationCitation
        currentDate={new Date('2029-01-01T00:00:00+11:00')}
        expiresAt="2028-02-26T10:59:00+11:00"
        skills={['Kubernetes']}
        title="KCNA"
        url={certificateUrl}
      />,
    );

    expect(container.querySelector('.certification-citation')?.getAttribute('data-certification-status')).toBe('expired');
    expect(getByText('Expired certification')).toBeTruthy();
  });

  it('falls back gracefully when no linked skill has brand metadata', () => {
    const { container } = render(
      <CertificationCitation
        currentDate={new Date('2026-07-23T00:00:00+10:00')}
        expiresAt="2028-02-26T10:59:00+11:00"
        skills={['Unknown Skill']}
        title="Custom Cert"
        url={certificateUrl}
      />,
    );

    const wrapper = container.querySelector('.certification-citation');

    expect(wrapper?.getAttribute('data-certification-primary-skill')).toBeNull();
    expect(wrapper?.getAttribute('style')).not.toContain('--certification-citation-color');
    expect(container.querySelector('img')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the certification citation tests to verify they fail**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io -- --run src/app/certifications/certification-citation.spec.tsx
```

Expected: FAIL because `CertificationCitation` does not exist yet.

- [ ] **Step 3: Implement `CertificationCitation`**

Create `apps/github.io/src/app/certifications/certification-citation.tsx`:

```tsx
import { Citation } from '@astryxdesign/core/Citation';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import type { CSSProperties } from 'react';

import { getSkillBrand, type SkillBrand } from '../skills/skill-brand';

export interface CertificationCitationProps {
  title: string;
  url: string;
  skills: readonly string[];
  expiresAt: string;
  number?: number;
  currentDate?: Date;
}

function findPrimaryBrand(skills: readonly string[]) {
  for (const skill of skills) {
    const brand = getSkillBrand(skill);

    if (brand) {
      return { skill, brand };
    }
  }

  return undefined;
}

function isActive(expiresAt: string, currentDate: Date) {
  return new Date(expiresAt).getTime() > currentDate.getTime();
}

function citationStyle(brand: SkillBrand | undefined): CSSProperties | undefined {
  if (!brand) {
    return undefined;
  }

  return {
    '--certification-citation-color': brand.color,
    '--certification-citation-foreground': brand.foreground,
  } as CSSProperties;
}

export function CertificationCitation({
  title,
  url,
  skills,
  expiresAt,
  number = 1,
  currentDate = new Date(),
}: CertificationCitationProps): JSX.Element {
  const primary = findPrimaryBrand(skills);
  const status = isActive(expiresAt, currentDate) ? 'active' : 'expired';

  return (
    <span
      className={`certification-citation certification-citation--${status}`}
      data-certification-primary-skill={primary?.skill}
      data-certification-status={status}
      style={citationStyle(primary?.brand)}
    >
      <Citation
        className="certification-citation__source"
        number={number}
        source={{
          title,
          url,
          icon: primary?.brand.iconDataUrl,
        }}
        variant="label"
      />
      <VisuallyHidden>
        {status === 'active' ? 'Active certification' : 'Expired certification'}
      </VisuallyHidden>
    </span>
  );
}
```

- [ ] **Step 4: Add certification citation styles**

Append these styles near `.skill-token` in `apps/github.io/src/styles.css`:

```css
.certification-citation {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
}

.certification-citation__source {
  max-width: 100%;
}
```

- [ ] **Step 5: Add Storybook stories**

Create `apps/github.io/src/app/certifications/certification-citation.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { CertificationCitation } from './certification-citation';

const meta: Meta<typeof CertificationCitation> = {
  component: CertificationCitation,
  title: 'GitHub.io/Certifications/Certification Citation',
};

export default meta;
type Story = StoryObj<typeof CertificationCitation>;

export const Active: Story = {
  args: {
    currentDate: new Date('2026-07-23T00:00:00+10:00'),
    expiresAt: '2027-04-20T10:00:00+10:00',
    skills: ['Kubernetes'],
    title: 'CKA',
    url: 'https://example.com/cka.pdf',
  },
};

export const Expired: Story = {
  args: {
    currentDate: new Date('2029-01-01T00:00:00+11:00'),
    expiresAt: '2027-04-20T10:00:00+10:00',
    skills: ['Kubernetes'],
    title: 'CKA',
    url: 'https://example.com/cka.pdf',
  },
};

export const MultipleSkills: Story = {
  args: {
    currentDate: new Date('2026-07-23T00:00:00+10:00'),
    expiresAt: '2028-02-25T11:00:00+11:00',
    skills: ['Unknown Skill', 'Kubernetes'],
    title: 'CKAD',
    url: 'https://example.com/ckad.pdf',
  },
};
```

- [ ] **Step 6: Run certification citation tests**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io -- --run src/app/certifications/certification-citation.spec.tsx
```

Expected: PASS for `certification-citation.spec.tsx`.

- [ ] **Step 7: Commit Task 2**

Run:

```bash
git add apps/github.io/src/app/certifications/certification-citation.tsx apps/github.io/src/app/certifications/certification-citation.spec.tsx apps/github.io/src/app/certifications/certification-citation.stories.tsx apps/github.io/src/styles.css
git diff --cached
git commit -m "feat(github.io): add certification citations"
```

Expected: commit succeeds with the reusable certification component, tests, stories, and styles staged.

---

### Task 3: Render Certifications In Roadmap Nodes

**Files:**
- Modify: `apps/github.io/src/app/devops-roadmap/devops-roadmap.types.ts`
- Modify: `apps/github.io/src/app/devops-roadmap/devops-roadmap.data.ts`
- Modify: `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx`
- Modify: `apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx`
- Modify: `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`
- Modify: `apps/github.io/src/styles.css`

**Interfaces:**
- Consumes: `CertificationCitation` from Task 2.
- Produces: optional `certifications?: readonly Certification[]` on `DevOpsRoadmapItem`.

- [ ] **Step 1: Write failing roadmap tests**

Modify the mocks at the top of `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx` to include:

```tsx
vi.mock('../certifications/certification-citation', () => ({
  CertificationCitation: ({
    title,
    number,
  }: {
    title: string;
    number?: number;
  }) => (
    <a data-certification-number={number} data-testid={`certification-citation-${title}`} href={`#${title}`}>
      {title}
    </a>
  ),
}));
```

Update the mocked React Flow type for `nodeTypes` to include optional certifications:

```ts
nodeTypes: Record<string, (props: { data: { item: { id: string; title: string; skills: readonly string[]; certifications?: readonly unknown[] } } }) => ReactNode>;
```

Add this test inside `describe('devOpsRoadmapItems', ...)`:

```tsx
it('stores Kubernetes certifications under Container Orchestration', () => {
  expect(devOpsRoadmapItems.find((item) => item.id === 'container-orchestration')).toMatchObject({
    title: 'Container Orchestration',
    skills: ['Kubernetes'],
    certifications: [
      {
        title: 'CKA',
        skills: ['Kubernetes'],
        expiresAt: '2027-04-20T10:00:00+10:00',
      },
      {
        title: 'CKAD',
        skills: ['Kubernetes'],
        expiresAt: '2028-02-25T11:00:00+11:00',
      },
      {
        title: 'KCNA',
        skills: ['Kubernetes'],
        expiresAt: '2028-02-26T10:59:00+11:00',
      },
    ],
  });
});
```

Add this test inside `describe('DevOpsRoadmapNode', ...)`:

```tsx
it('renders certification citations below skill tokens', () => {
  const { container, getByTestId } = render(
    <DevOpsRoadmapNode
      item={{
        id: 'container-orchestration',
        title: 'Container Orchestration',
        skills: ['Kubernetes'],
        certifications: [
          {
            title: 'CKA',
            skills: ['Kubernetes'],
            expiresAt: '2027-04-20T10:00:00+10:00',
            url: 'https://example.com/cka.pdf',
          },
        ],
      }}
    />,
  );

  expect(getByTestId('skill-token-Kubernetes')).toBeTruthy();
  expect(getByTestId('certification-citation-CKA')).toBeTruthy();
  expect(container.querySelector('.devops-roadmap-node__skills + .devops-roadmap-node__certifications')).toBeTruthy();
});
```

Add this height test inside `describe('DevOpsRoadmap', ...)`:

```tsx
it('reserves stable timeline space for a certification section', () => {
  const { container } = render(
    <DevOpsRoadmap
      items={[
        {
          id: 'container-orchestration',
          title: 'Container Orchestration',
          skills: ['Kubernetes'],
          certifications: [
            {
              title: 'CKA',
              skills: ['Kubernetes'],
              expiresAt: '2027-04-20T10:00:00+10:00',
              url: 'https://example.com/cka.pdf',
            },
            {
              title: 'CKAD',
              skills: ['Kubernetes'],
              expiresAt: '2028-02-25T11:00:00+11:00',
              url: 'https://example.com/ckad.pdf',
            },
            {
              title: 'KCNA',
              skills: ['Kubernetes'],
              expiresAt: '2028-02-26T10:59:00+11:00',
              url: 'https://example.com/kcna.pdf',
            },
          ],
        },
        { id: 'gitops', title: 'GitOps', skills: ['ArgoCD'] },
      ]}
    />
  );

  const flowWrapper = container.querySelector<HTMLElement>('.devops-roadmap__flow');

  expect(flowWrapper?.style.height).toBe('394px');
  expect(container.querySelector('[data-testid="react-flow"]')?.getAttribute('data-node-positions')).toBe(
    'container-orchestration:0|gitops:246'
  );
});
```

- [ ] **Step 2: Run roadmap tests to verify they fail**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io -- --run src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: FAIL because roadmap types, data, node rendering, and height estimation do not support certifications yet.

- [ ] **Step 3: Update roadmap types**

Replace `apps/github.io/src/app/devops-roadmap/devops-roadmap.types.ts` with:

```ts
import type { CertificationCitationProps } from '../certifications/certification-citation';

export type Certification = Omit<CertificationCitationProps, 'number' | 'currentDate'>;

export interface DevOpsRoadmapItem {
  id: string;
  title: string;
  skills: readonly string[];
  certifications?: readonly Certification[];
}

export interface DevOpsRoadmapProps {
  ariaLabel?: string;
  items?: readonly DevOpsRoadmapItem[];
  isReversed?: boolean;
}
```

- [ ] **Step 4: Add Container Orchestration certifications to roadmap data**

In `apps/github.io/src/app/devops-roadmap/devops-roadmap.data.ts`, replace the Container Orchestration item with:

```ts
  {
    id: 'container-orchestration',
    title: 'Container Orchestration',
    skills: ['Kubernetes'],
    certifications: [
      {
        title: 'CKA',
        skills: ['Kubernetes'],
        expiresAt: '2027-04-20T10:00:00+10:00',
        url: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-02c68021-40fe-473f-8087-6309221395ca-certificate.pdf',
      },
      {
        title: 'CKAD',
        skills: ['Kubernetes'],
        expiresAt: '2028-02-25T11:00:00+11:00',
        url: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-83c53ec1-bf5d-4b01-ae0a-c79be21d7cf2-certificate.pdf',
      },
      {
        title: 'KCNA',
        skills: ['Kubernetes'],
        expiresAt: '2028-02-26T10:59:00+11:00',
        url: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-8a295e12-57c5-4008-b8ba-171b09419221-certificate.pdf',
      },
    ],
  },
```

- [ ] **Step 5: Render certifications below skills**

Update `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx`:

```tsx
import { Handle, Position } from '@xyflow/react';

import { CertificationCitation } from '../certifications/certification-citation';
import { SkillToken } from '../skills/skill-token';
import type { DevOpsRoadmapItem } from './devops-roadmap.types';

interface DevOpsRoadmapNodeProps {
  item: DevOpsRoadmapItem;
}

export function DevOpsRoadmapNode({ item }: DevOpsRoadmapNodeProps) {
  return (
    <article className="devops-roadmap-node" aria-label={item.title}>
      <Handle
        aria-hidden="true"
        className="devops-roadmap-node__handle"
        id="target"
        position={Position.Top}
        type="target"
      />
      <h3 className="devops-roadmap-node__title">{item.title}</h3>
      {item.skills.length > 0 ? (
        <ul className="devops-roadmap-node__skills" aria-label={`${item.title} skills`}>
          {item.skills.map((skill) => (
            <li className="devops-roadmap-node__skill" key={skill}>
              <SkillToken label={skill} />
            </li>
          ))}
        </ul>
      ) : null}
      {item.certifications?.length ? (
        <ul className="devops-roadmap-node__certifications" aria-label={`${item.title} certifications`}>
          {item.certifications.map((certification, index) => (
            <li className="devops-roadmap-node__certification" key={certification.title}>
              <CertificationCitation {...certification} number={index + 1} />
            </li>
          ))}
        </ul>
      ) : null}
      <Handle
        aria-hidden="true"
        className="devops-roadmap-node__handle"
        id="source"
        position={Position.Bottom}
        type="source"
      />
    </article>
  );
}
```

- [ ] **Step 6: Update React Flow height estimation**

Update constants and `getEstimatedNodeHeight` in `apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx`:

```tsx
const BASE_NODE_HEIGHT = 148;
const NODE_GAP = 48;
const EXTRA_SKILL_ROW_HEIGHT = 50;
const CERTIFICATION_SECTION_HEIGHT = 50;
const SKILLS_PER_ROW = 2;
```

```tsx
function getEstimatedNodeHeight(item: DevOpsRoadmapItem) {
  const skillRows = Math.ceil(item.skills.length / SKILLS_PER_ROW);
  const extraRows = Math.max(0, skillRows - 1);
  const certificationSectionHeight = item.certifications?.length ? CERTIFICATION_SECTION_HEIGHT : 0;

  return (
    BASE_NODE_HEIGHT +
    extraRows * EXTRA_SKILL_ROW_HEIGHT +
    certificationSectionHeight
  );
}
```

- [ ] **Step 7: Add roadmap certification layout styles**

Add these styles next to the existing roadmap node skill styles in `apps/github.io/src/styles.css`:

```css
.devops-roadmap-node__certifications {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  padding: 0;
  margin: 0;
  list-style: none;
}

.devops-roadmap-node__certification {
  display: inline-flex;
  max-width: 100%;
}
```

- [ ] **Step 8: Run roadmap tests**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io -- --run src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: PASS for `devops-roadmap.spec.tsx`.

- [ ] **Step 9: Run all focused tests**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io -- --run src/app/skills/skill-brand.spec.ts src/app/skills/skill-token.spec.tsx src/app/certifications/certification-citation.spec.tsx src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: PASS for all four spec files.

- [ ] **Step 10: Commit Task 3**

Run:

```bash
git add apps/github.io/src/app/devops-roadmap/devops-roadmap.types.ts apps/github.io/src/app/devops-roadmap/devops-roadmap.data.ts apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx apps/github.io/src/styles.css
git diff --cached
git commit -m "feat(github.io): show roadmap certifications"
```

Expected: commit succeeds with only roadmap type, data, rendering, test, and CSS changes staged.

---

### Task 4: Final Verification And Review Prep

**Files:**
- Verify only. Do not edit unless a verification failure identifies a concrete bug.

**Interfaces:**
- Consumes: all outputs from Tasks 1-3.
- Produces: verified branch ready for code review/handoff.

- [ ] **Step 1: Run the focused test suite**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io -- --run src/app/skills/skill-brand.spec.ts src/app/skills/skill-token.spec.tsx src/app/certifications/certification-citation.spec.tsx src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: PASS for all focused specs.

- [ ] **Step 2: Run the project lint if available**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx lint github.io
```

Expected: PASS. If this target does not exist, record the exact Nx error in the final handoff and rely on focused tests.

- [ ] **Step 3: Inspect final diff**

Run:

```bash
git status --short
git log --oneline -5
git diff HEAD~3..HEAD -- apps/github.io/src/app/skills apps/github.io/src/app/certifications apps/github.io/src/app/devops-roadmap apps/github.io/src/styles.css
```

Expected: changes are scoped to shared skill brand metadata, certification citation component, roadmap certification rendering, styles, tests, and stories.

- [ ] **Step 4: Request code review**

Run Codex `/review` or the available local review workflow against the current branch diff.

Expected: no blocking findings. If findings appear, fix them in a separate focused commit with a conventional subject.
