# DevOps Roadmap Token Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add reusable brand-colored `SkillToken` chips with optional Simple Icons logos, and use them inside DevOps roadmap nodes.

**Architecture:** Introduce a small shared `SkillToken` component under `apps/github.io/src/app/skills/` because the component is intended for reuse beyond the roadmap. Keep Simple Icons lookup explicit and deterministic in the token module. Update `DevOpsRoadmapNode` to render `SkillToken` for each purple-ticked skill without changing roadmap data order, reverse behavior, or React Flow layout.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, Astryx design tokens/components, `simple-icons@16.26.0`, React Flow.

## Global Constraints

- Component name must be `SkillToken`.
- The component must be reusable beyond the DevOps roadmap.
- When a Simple Icons match exists, the whole token background uses that icon's brand color.
- When no Simple Icons match exists, render text-only with the current purple roadmap token treatment.
- Logos are optional; do not render initials, placeholders, broken images, or fallback icons.
- Logo glyphs are decorative and must use `aria-hidden="true"`.
- Use a readable foreground color on brand-colored tokens; do not sacrifice label contrast for exact logo-color purity.
- No runtime icon search, network lookup, UI controls, visible roadmap heading, or roadmap order changes.
- Preserve existing reverse-order, diagram-only, accessible group label, and content-aware row spacing behavior.

---

## File Structure

- Create `apps/github.io/src/app/skills/skill-token.tsx`: reusable token component, Simple Icons lookup, SVG rendering, color contrast helper.
- Create `apps/github.io/src/app/skills/skill-token.spec.tsx`: focused tests for mapped icons, unmapped fallback, brand color, contrast, and accessibility.
- Modify `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx`: replace direct Astryx `Badge` usage with `SkillToken`.
- Modify `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`: remove `Badge` mock/assertion and assert roadmap nodes render brand-colored tokens plus text-only fallback.
- Modify `apps/github.io/src/styles.css`: add token styles and remove roadmap-specific token assumptions if needed.

---

### Task 1: Add Reusable `SkillToken`

**Files:**
- Create: `apps/github.io/src/app/skills/skill-token.tsx`
- Create: `apps/github.io/src/app/skills/skill-token.spec.tsx`
- Modify: `apps/github.io/src/styles.css`

**Interfaces:**
- Produces: `export interface SkillTokenProps { label: string; variant?: 'purple'; }`
- Produces: `export function SkillToken({ label, variant = 'purple' }: SkillTokenProps): JSX.Element`
- Produces: a `.skill-token` element with `data-has-icon="true"` when a mapped icon exists and `data-token-color="#<hex>"` for mapped icons.
- Consumes: selected imports from `simple-icons`, including `siPython`, `siGo`, `siGit`, `siGithub`, `siDocker`, `siNginx`, `siCloudflare`, `siTerraform`, `siAnsible`, `siGitlab`, `siCircleci`, `siGithubactions`, `siVault`, `siPrometheus`, `siGrafana`, `siDatadog`, `siKubernetes`, `siJfrog`, `siArgo`, `siIstio`, and `siConsul`.

- [ ] **Step 1: Write the failing tests**

Create `apps/github.io/src/app/skills/skill-token.spec.tsx`:

```tsx
import { render } from '@testing-library/react';

import { SkillToken } from './skill-token';

describe('SkillToken', () => {
  it('renders a mapped Simple Icons skill as a brand-colored token', () => {
    const { container, getByText } = render(<SkillToken label="Docker" />);
    const token = getByText('Docker').closest('.skill-token');
    const icon = container.querySelector('.skill-token__icon');

    expect(token).toBeTruthy();
    expect(token?.getAttribute('data-has-icon')).toBe('true');
    expect(token?.getAttribute('data-token-color')).toBe('#2496ED');
    expect(token?.getAttribute('style')).toContain('--skill-token-background: #2496ED');
    expect(icon).toBeTruthy();
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps unmapped skills text-only with the purple roadmap treatment', () => {
    const { container, getByText } = render(<SkillToken label="Forward Proxy" />);
    const token = getByText('Forward Proxy').closest('.skill-token');

    expect(token).toBeTruthy();
    expect(token?.getAttribute('data-has-icon')).toBe('false');
    expect(token?.getAttribute('data-token-color')).toBeNull();
    expect(container.querySelector('.skill-token__icon')).toBeNull();
    expect(token?.classList.contains('skill-token--purple')).toBe(true);
  });

  it('keeps the visible label as the accessible token text', () => {
    const { getByText } = render(<SkillToken label="GitHub Actions" />);

    expect(getByText('GitHub Actions').textContent).toBe('GitHub Actions');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io src/app/skills/skill-token.spec.tsx
```

Expected: FAIL because `./skill-token` does not exist.

- [ ] **Step 3: Implement the component**

Create `apps/github.io/src/app/skills/skill-token.tsx`:

```tsx
import type { CSSProperties } from 'react';
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

export interface SkillTokenProps {
  label: string;
  variant?: 'purple';
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

function readableForeground(hex: string) {
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.62 ? '#111827' : '#ffffff';
}

function tokenStyle(icon: SimpleIcon | undefined): CSSProperties | undefined {
  if (!icon) {
    return undefined;
  }

  const background = `#${icon.hex}`;

  return {
    '--skill-token-background': background,
    '--skill-token-foreground': readableForeground(icon.hex),
  } as CSSProperties;
}

export function SkillToken({ label, variant = 'purple' }: SkillTokenProps) {
  const icon = skillIcons[label];
  const tokenColor = icon ? `#${icon.hex}` : undefined;

  return (
    <span
      className={`skill-token skill-token--${variant}`}
      data-has-icon={String(Boolean(icon))}
      data-token-color={tokenColor}
      style={tokenStyle(icon)}
    >
      {icon ? (
        <svg
          aria-hidden="true"
          className="skill-token__icon"
          focusable="false"
          viewBox="0 0 24 24"
        >
          <path d={icon.path} fill="currentColor" />
        </svg>
      ) : null}
      <span className="skill-token__label">{label}</span>
    </span>
  );
}
```

- [ ] **Step 4: Add token styles**

Modify `apps/github.io/src/styles.css` after `.skill-list__item-copy > :not(.skill-list__name)` and before `.skill-avatar`:

```css
.skill-token {
  --skill-token-background: var(--color-purple-100, #eee7ff);
  --skill-token-foreground: var(--color-purple-700, #5b2bd6);

  display: inline-flex;
  align-items: center;
  max-width: 100%;
  min-height: var(--spacing-5);
  gap: var(--spacing-1);
  padding-block: 0;
  padding-inline: var(--spacing-2);
  color: var(--skill-token-foreground);
  background: var(--skill-token-background);
  border-radius: var(--radius-full, 999px);
  font-size: var(--text-supporting-size, 0.75rem);
  font-weight: var(--font-weight-medium, 500);
  line-height: var(--text-supporting-leading, 1rem);
}

.skill-token__icon {
  flex: 0 0 auto;
  width: 0.875rem;
  height: 0.875rem;
}

.skill-token__label {
  min-width: 0;
  overflow-wrap: anywhere;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io src/app/skills/skill-token.spec.tsx
```

Expected: PASS for `skill-token.spec.tsx`.

- [ ] **Step 6: Commit Task 1**

Run:

```bash
git add apps/github.io/src/app/skills/skill-token.tsx apps/github.io/src/app/skills/skill-token.spec.tsx apps/github.io/src/styles.css
PATH=/tmp/corepack-shims:$PATH git commit -m "feat(github.io): add reusable skill token"
```

Expected: commit succeeds.

---

### Task 2: Use `SkillToken` In DevOps Roadmap Nodes

**Files:**
- Modify: `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx`
- Modify: `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`

**Interfaces:**
- Consumes: `SkillToken` from `../skills/skill-token`.
- Preserves: `DevOpsRoadmapNode({ item }: { item: DevOpsRoadmapItem })`.
- Preserves: `.devops-roadmap-node__skills` and `.devops-roadmap-node__skill` list structure.

- [ ] **Step 1: Write/update failing roadmap tests**

Modify the top of `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`.

Remove this mock:

```tsx
vi.mock('@astryxdesign/core/Badge', () => ({
  Badge: ({ label, variant }: { label: ReactNode; variant?: string }) => (
    <span data-badge-variant={variant}>{label}</span>
  ),
}));
```

Add this mock:

```tsx
vi.mock('../skills/skill-token', () => ({
  SkillToken: ({ label }: { label: string }) => (
    <span className="skill-token" data-testid={`skill-token-${label}`}>
      {label}
    </span>
  ),
}));
```

Update the node test named `renders the core node title and purple-ticked skill chips`:

```tsx
  it('renders the core node title and purple-ticked skill tokens', () => {
    const { getByTestId, getByText } = render(
      <DevOpsRoadmapNode
        item={{
          id: 'containers',
          title: 'Containers',
          skills: ['Docker'],
        }}
      />
    );

    expect(getByText('Containers')).toBeTruthy();
    expect(getByTestId('skill-token-Docker')).toBeTruthy();
  });
```

- [ ] **Step 2: Run the roadmap spec to verify it fails**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: FAIL because `DevOpsRoadmapNode` still imports and renders Astryx `Badge`, not `SkillToken`.

- [ ] **Step 3: Update `DevOpsRoadmapNode`**

Modify `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx`:

```tsx
import { Handle, Position } from '@xyflow/react';

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

- [ ] **Step 4: Run roadmap tests**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: PASS for `devops-roadmap.spec.tsx`.

- [ ] **Step 5: Commit Task 2**

Run:

```bash
git add apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
PATH=/tmp/corepack-shims:$PATH git commit -m "feat(github.io): use skill tokens in roadmap"
```

Expected: commit succeeds.

---

### Task 3: Storybook And Full Verification

**Files:**
- Modify: `apps/github.io/src/app/skills/skill-token.stories.tsx`
- Verify: `apps/github.io/src/app/devops-roadmap/devops-roadmap.stories.tsx`

**Interfaces:**
- Consumes: `SkillToken` from `./skill-token`.
- Produces: Storybook story title `GitHub.io/Skills/Skill Token`.

- [ ] **Step 1: Add the Storybook story**

Create `apps/github.io/src/app/skills/skill-token.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { SkillToken } from './skill-token';

const meta: Meta<typeof SkillToken> = {
  component: SkillToken,
  title: 'GitHub.io/Skills/Skill Token',
};

export default meta;
type Story = StoryObj<typeof SkillToken>;

export const BrandColored: Story = {
  args: {
    label: 'Docker',
  },
};

export const TextOnly: Story = {
  args: {
    label: 'Forward Proxy',
  },
};
```

- [ ] **Step 2: Run Storybook build**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx build-storybook github.io
```

Expected: PASS and includes `GitHub.io/Skills/Skill Token`.

- [ ] **Step 3: Run full validation**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx lint github.io
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx build github.io
```

Expected: all PASS.

- [ ] **Step 4: Commit Task 3**

Run:

```bash
git add apps/github.io/src/app/skills/skill-token.stories.tsx
PATH=/tmp/corepack-shims:$PATH git commit -m "test(github.io): add skill token story"
```

Expected: commit succeeds.

---

## Self-Review

- Spec coverage: `SkillToken` reuse is covered in Task 1; roadmap usage is covered in Task 2; Simple Icons brand-colored whole-token behavior is covered in Task 1 tests/styles; missing-icon text-only behavior is covered in Task 1; Storybook and full validation are covered in Task 3.
- Placeholder scan: no unresolved marker text or unspecified implementation steps remain.
- Type consistency: `SkillTokenProps`, `SkillToken`, and import paths are consistent across tasks.
