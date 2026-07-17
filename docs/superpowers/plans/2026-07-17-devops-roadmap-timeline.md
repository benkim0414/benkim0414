# DevOps Roadmap Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone, read-only React Flow DevOps roadmap timeline component using roadmap.sh core nodes and purple-ticked skills.

**Architecture:** Add an isolated `devops-roadmap` feature folder under `apps/github.io/src/app`. Keep roadmap content in typed local data, render a custom Astryx-styled node body through `@xyflow/react`, and leave the existing skills page untouched.

**Tech Stack:** React 19, TypeScript, Nx 23, Vite, Vitest, Testing Library, Storybook 10, Astryx `@astryxdesign/core`, Astryx neutral theme, React Flow via `@xyflow/react`.

## Global Constraints

- Render only the yellow core knowledge nodes from the roadmap.sh DevOps diagram/PDF.
- Preserve the roadmap.sh diagram order from top to bottom.
- Show each core node title as the primary node label.
- Show only the purple-ticked roadmap recommendation/opinion items as chips under the matching core node.
- Use React Flow through the current `@xyflow/react` package.
- Keep the component read-only: no dragging, connecting, editing, or node selection workflows.
- Follow Astryx design guidance, components, and theme tokens before introducing local styling.
- Do not replace the current skills list page or remove existing skills components.
- Do not render the full roadmap.sh DevOps graph.
- Do not include non-core nodes, unticked items, or user-defined chips outside the roadmap.sh purple-ticked items.
- Do not add page routing, navigation, persistence, filtering, search, or editing in v1.
- Do not reuse implementations from existing roadmap-related worktrees.
- Source content is the roadmap.sh DevOps PDF as accessed on 2026-07-17.

---

## File Structure

- Create `apps/github.io/src/app/devops-roadmap/devops-roadmap.types.ts`: public roadmap item and component prop types.
- Create `apps/github.io/src/app/devops-roadmap/devops-roadmap.data.ts`: ordered core node data transcribed from roadmap.sh.
- Create `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx`: custom React Flow node body with Astryx `Badge` chips.
- Create `apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx`: React Flow wrapper, fixed vertical layout, read-only configuration.
- Create `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`: focused rendering and read-only behavior tests.
- Create `apps/github.io/src/app/devops-roadmap/devops-roadmap.stories.tsx`: default and compact fixture stories.
- Modify `apps/github.io/src/main.tsx`: import React Flow base CSS once.
- Modify `apps/github.io/src/styles.css`: minimal roadmap layout styles using Astryx tokens.
- Modify `package.json` and `pnpm-lock.yaml`: add `@xyflow/react`.

## Roadmap Data Snapshot

Use this exact data in v1. It is transcribed from the roadmap.sh DevOps PDF screenshot as accessed on 2026-07-17, filtered to yellow core nodes and purple-ticked skills only.

```ts
export const devOpsRoadmapItems = [
  { id: 'learn-programming-language', title: 'Learn a Programming Language', skills: ['Python', 'Go'] },
  { id: 'operating-system', title: 'Operating System', skills: ['FreeBSD', 'Ubuntu / Debian', 'RHEL / Derivatives'] },
  { id: 'terminal-knowledge', title: 'Terminal Knowledge', skills: ['Bash', 'Process Monitoring', 'Performance Monitoring', 'Networking Tools', 'Text Manipulation', 'Vim / Nano / Emacs'] },
  { id: 'version-control-systems', title: 'Version Control Systems', skills: ['Git'] },
  { id: 'vcs-hosting', title: 'VCS Hosting', skills: ['GitHub'] },
  { id: 'containers', title: 'Containers', skills: ['Docker'] },
  { id: 'setup-x', title: 'What is and how to setup X ?', skills: ['Forward Proxy', 'Reverse Proxy', 'Caching Server', 'Firewall', 'Load Balancer', 'Nginx'] },
  { id: 'networking-protocols', title: 'Networking & Protocols', skills: ['DNS', 'HTTP', 'HTTPS', 'SSL / TLS', 'SSH'] },
  { id: 'cloud-providers', title: 'Cloud Providers', skills: ['AWS', 'Azure', 'Google Cloud'] },
  { id: 'serverless', title: 'Serverless', skills: ['AWS Lambda', 'Cloudflare'] },
  { id: 'provisioning', title: 'Provisioning', skills: ['Terraform'] },
  { id: 'configuration-management', title: 'Configuration Management', skills: ['Ansible'] },
  { id: 'ci-cd-tools', title: 'CI / CD Tools', skills: ['GitLab CI', 'Circle CI', 'GitHub Actions'] },
  { id: 'secret-management', title: 'Secret Management', skills: ['Vault'] },
  { id: 'infrastructure-monitoring', title: 'Infrastructure Monitoring', skills: ['Prometheus', 'Grafana', 'Datadog'] },
  { id: 'logs-management', title: 'Logs Management', skills: ['Loki', 'Elastic Stack'] },
  { id: 'container-orchestration', title: 'Container Orchestration', skills: ['Kubernetes'] },
  { id: 'application-monitoring', title: 'Application Monitoring', skills: [] },
  { id: 'artifact-management', title: 'Artifact Management', skills: ['Artifactory'] },
  { id: 'gitops', title: 'GitOps', skills: ['ArgoCD'] },
  { id: 'service-mesh', title: 'Service Mesh', skills: ['Istio', 'Consul'] },
  { id: 'cloud-design-patterns', title: 'Cloud Design Patterns', skills: [] },
] as const;
```

### Task 1: Add React Flow Dependency and Typed Roadmap Data

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `apps/github.io/src/app/devops-roadmap/devops-roadmap.types.ts`
- Create: `apps/github.io/src/app/devops-roadmap/devops-roadmap.data.ts`
- Test: `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`

**Interfaces:**
- Produces: `DevOpsRoadmapItem` with `{ id: string; title: string; skills: readonly string[] }`.
- Produces: `DevOpsRoadmapProps` with `{ items?: readonly DevOpsRoadmapItem[]; heading?: string; isHeadingHidden?: boolean }`.
- Produces: `devOpsRoadmapItems: readonly DevOpsRoadmapItem[]`.

- [ ] **Step 1: Add React Flow**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm add @xyflow/react
```

Expected: `package.json` has `@xyflow/react` under `dependencies`, and `pnpm-lock.yaml` is updated.

- [ ] **Step 2: Write the failing data test**

Create `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`:

```tsx
import { devOpsRoadmapItems } from './devops-roadmap.data';

describe('devOpsRoadmapItems', () => {
  it('keeps roadmap.sh core nodes in vertical timeline order', () => {
    expect(devOpsRoadmapItems.map((item) => item.title)).toEqual([
      'Learn a Programming Language',
      'Operating System',
      'Terminal Knowledge',
      'Version Control Systems',
      'VCS Hosting',
      'Containers',
      'What is and how to setup X ?',
      'Networking & Protocols',
      'Cloud Providers',
      'Serverless',
      'Provisioning',
      'Configuration Management',
      'CI / CD Tools',
      'Secret Management',
      'Infrastructure Monitoring',
      'Logs Management',
      'Container Orchestration',
      'Application Monitoring',
      'Artifact Management',
      'GitOps',
      'Service Mesh',
      'Cloud Design Patterns',
    ]);
  });

  it('stores only purple-ticked skills under each core node', () => {
    expect(devOpsRoadmapItems[0]).toMatchObject({
      title: 'Learn a Programming Language',
      skills: ['Python', 'Go'],
    });
    expect(devOpsRoadmapItems.find((item) => item.id === 'containers')).toMatchObject({
      title: 'Containers',
      skills: ['Docker'],
    });
    expect(devOpsRoadmapItems.find((item) => item.id === 'application-monitoring')).toMatchObject({
      title: 'Application Monitoring',
      skills: [],
    });
  });
});
```

- [ ] **Step 3: Run the data test to verify it fails**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io --runInBand --testFile=apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: FAIL because `./devops-roadmap.data` does not exist.

- [ ] **Step 4: Add types**

Create `apps/github.io/src/app/devops-roadmap/devops-roadmap.types.ts`:

```ts
export interface DevOpsRoadmapItem {
  id: string;
  title: string;
  skills: readonly string[];
}

export interface DevOpsRoadmapProps {
  items?: readonly DevOpsRoadmapItem[];
  heading?: string;
  isHeadingHidden?: boolean;
}
```

- [ ] **Step 5: Add roadmap data**

Create `apps/github.io/src/app/devops-roadmap/devops-roadmap.data.ts`:

```ts
import type { DevOpsRoadmapItem } from './devops-roadmap.types';

// Source: roadmap.sh DevOps PDF, accessed 2026-07-17.
export const devOpsRoadmapItems = [
  { id: 'learn-programming-language', title: 'Learn a Programming Language', skills: ['Python', 'Go'] },
  { id: 'operating-system', title: 'Operating System', skills: ['FreeBSD', 'Ubuntu / Debian', 'RHEL / Derivatives'] },
  { id: 'terminal-knowledge', title: 'Terminal Knowledge', skills: ['Bash', 'Process Monitoring', 'Performance Monitoring', 'Networking Tools', 'Text Manipulation', 'Vim / Nano / Emacs'] },
  { id: 'version-control-systems', title: 'Version Control Systems', skills: ['Git'] },
  { id: 'vcs-hosting', title: 'VCS Hosting', skills: ['GitHub'] },
  { id: 'containers', title: 'Containers', skills: ['Docker'] },
  { id: 'setup-x', title: 'What is and how to setup X ?', skills: ['Forward Proxy', 'Reverse Proxy', 'Caching Server', 'Firewall', 'Load Balancer', 'Nginx'] },
  { id: 'networking-protocols', title: 'Networking & Protocols', skills: ['DNS', 'HTTP', 'HTTPS', 'SSL / TLS', 'SSH'] },
  { id: 'cloud-providers', title: 'Cloud Providers', skills: ['AWS', 'Azure', 'Google Cloud'] },
  { id: 'serverless', title: 'Serverless', skills: ['AWS Lambda', 'Cloudflare'] },
  { id: 'provisioning', title: 'Provisioning', skills: ['Terraform'] },
  { id: 'configuration-management', title: 'Configuration Management', skills: ['Ansible'] },
  { id: 'ci-cd-tools', title: 'CI / CD Tools', skills: ['GitLab CI', 'Circle CI', 'GitHub Actions'] },
  { id: 'secret-management', title: 'Secret Management', skills: ['Vault'] },
  { id: 'infrastructure-monitoring', title: 'Infrastructure Monitoring', skills: ['Prometheus', 'Grafana', 'Datadog'] },
  { id: 'logs-management', title: 'Logs Management', skills: ['Loki', 'Elastic Stack'] },
  { id: 'container-orchestration', title: 'Container Orchestration', skills: ['Kubernetes'] },
  { id: 'application-monitoring', title: 'Application Monitoring', skills: [] },
  { id: 'artifact-management', title: 'Artifact Management', skills: ['Artifactory'] },
  { id: 'gitops', title: 'GitOps', skills: ['ArgoCD'] },
  { id: 'service-mesh', title: 'Service Mesh', skills: ['Istio', 'Consul'] },
  { id: 'cloud-design-patterns', title: 'Cloud Design Patterns', skills: [] },
] satisfies readonly DevOpsRoadmapItem[];
```

- [ ] **Step 6: Run the data test to verify it passes**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io --runInBand --testFile=apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml apps/github.io/src/app/devops-roadmap/devops-roadmap.types.ts apps/github.io/src/app/devops-roadmap/devops-roadmap.data.ts apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
git diff --cached
git commit -m "feat(github.io): add devops roadmap data"
```

### Task 2: Build the Astryx-Styled Custom Roadmap Node

**Files:**
- Create: `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx`
- Modify: `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`
- Modify: `apps/github.io/src/styles.css`

**Interfaces:**
- Consumes: `DevOpsRoadmapItem`.
- Produces: `DevOpsRoadmapNode({ item }: { item: DevOpsRoadmapItem })`.

- [ ] **Step 1: Add failing node rendering tests**

Append to `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`:

```tsx
import { render } from '@testing-library/react';

import { DevOpsRoadmapNode } from './devops-roadmap-node';

describe('DevOpsRoadmapNode', () => {
  it('renders the core node title and purple-ticked skill chips', () => {
    const { getByText } = render(
      <DevOpsRoadmapNode
        item={{
          id: 'containers',
          title: 'Containers',
          skills: ['Docker'],
        }}
      />
    );

    expect(getByText('Containers')).toBeTruthy();
    expect(getByText('Docker')).toBeTruthy();
  });

  it('does not render an empty chip list when a node has no purple-ticked skills', () => {
    const { container, getByText } = render(
      <DevOpsRoadmapNode
        item={{
          id: 'cloud-design-patterns',
          title: 'Cloud Design Patterns',
          skills: [],
        }}
      />
    );

    expect(getByText('Cloud Design Patterns')).toBeTruthy();
    expect(container.querySelector('.devops-roadmap-node__skills')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the node tests to verify they fail**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io --runInBand --testFile=apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: FAIL because `./devops-roadmap-node` does not exist.

- [ ] **Step 3: Implement the custom node**

Create `apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx`:

```tsx
import { Badge } from '@astryxdesign/core/Badge';

import type { DevOpsRoadmapItem } from './devops-roadmap.types';

interface DevOpsRoadmapNodeProps {
  item: DevOpsRoadmapItem;
}

export function DevOpsRoadmapNode({ item }: DevOpsRoadmapNodeProps) {
  return (
    <article className="devops-roadmap-node" aria-label={item.title}>
      <h3 className="devops-roadmap-node__title">{item.title}</h3>
      {item.skills.length > 0 ? (
        <ul className="devops-roadmap-node__skills" aria-label={`${item.title} skills`}>
          {item.skills.map((skill) => (
            <li className="devops-roadmap-node__skill" key={skill}>
              <Badge label={skill} />
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
```

- [ ] **Step 4: Add node styles**

Append to `apps/github.io/src/styles.css`:

```css
.devops-roadmap-node {
  display: grid;
  gap: var(--spacing-3);
  width: min(100%, 320px);
  padding: var(--spacing-4);
  color: var(--color-text-primary);
  background: var(--color-background-surface, var(--color-background-body));
  border: 1px solid var(--color-border-subtle, rgba(15, 23, 42, 0.16));
  border-radius: var(--radius-2, 8px);
  box-shadow: var(--shadow-xs, 0 1px 2px rgba(15, 23, 42, 0.08));
}

.devops-roadmap-node__title {
  margin: 0;
  font-size: var(--font-size-lg);
  line-height: var(--line-height-tight);
}

.devops-roadmap-node__skills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  padding: 0;
  margin: 0;
  list-style: none;
}

.devops-roadmap-node__skill {
  display: inline-flex;
}

.devops-roadmap-node__skill [class*='badge'],
.devops-roadmap-node__skill [class*='Badge'] {
  color: var(--color-purple-700, #5b2bd6);
  background: var(--color-purple-100, #eee7ff);
  border-color: var(--color-purple-300, #c7b6ff);
}
```

- [ ] **Step 5: Run the node tests to verify they pass**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io --runInBand --testFile=apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx apps/github.io/src/styles.css
git diff --cached
git commit -m "feat(github.io): render devops roadmap nodes"
```

### Task 3: Build the Read-Only React Flow Timeline

**Files:**
- Create: `apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx`
- Modify: `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`
- Modify: `apps/github.io/src/main.tsx`
- Modify: `apps/github.io/src/styles.css`

**Interfaces:**
- Consumes: `devOpsRoadmapItems`.
- Consumes: `DevOpsRoadmapNode`.
- Produces: `DevOpsRoadmap(props: DevOpsRoadmapProps)`.
- Produces: internal `buildTimelineElements(items: readonly DevOpsRoadmapItem[])` returning `{ nodes: Node[]; edges: Edge[]; height: number }`.

- [ ] **Step 1: Import React Flow CSS once**

Modify `apps/github.io/src/main.tsx` so imports are:

```tsx
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-neutral/theme.css';
import '@xyflow/react/dist/style.css';
import './styles.css';
```

- [ ] **Step 2: Add failing timeline tests with a React Flow mock**

Append to `apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx`:

```tsx
import type { ReactNode } from 'react';
import { vi } from 'vitest';

import { DevOpsRoadmap } from './devops-roadmap';

vi.mock('@xyflow/react', () => ({
  Background: () => <div data-testid="react-flow-background" />,
  ReactFlow: ({
    nodes,
    edges,
    nodeTypes,
    nodesDraggable,
    nodesConnectable,
    elementsSelectable,
    panOnDrag,
    zoomOnScroll,
    zoomOnDoubleClick,
    fitView,
    children,
  }: {
    nodes: Array<{ id: string; data: { item: { title: string } } }>;
    edges: Array<{ id: string }>;
    nodeTypes: Record<string, (props: { data: { item: { id: string; title: string; skills: readonly string[] } } }) => ReactNode>;
    nodesDraggable: boolean;
    nodesConnectable: boolean;
    elementsSelectable: boolean;
    panOnDrag: boolean;
    zoomOnScroll: boolean;
    zoomOnDoubleClick: boolean;
    fitView: boolean;
    children: ReactNode;
  }) => (
    <div
      data-edge-count={edges.length}
      data-elements-selectable={String(elementsSelectable)}
      data-fit-view={String(fitView)}
      data-node-count={nodes.length}
      data-nodes-connectable={String(nodesConnectable)}
      data-nodes-draggable={String(nodesDraggable)}
      data-pan-on-drag={String(panOnDrag)}
      data-testid="react-flow"
      data-zoom-on-double-click={String(zoomOnDoubleClick)}
      data-zoom-on-scroll={String(zoomOnScroll)}
    >
      {nodes.map((node) => {
        const NodeComponent = nodeTypes.roadmapNode;
        return <NodeComponent data={node.data} key={node.id} />;
      })}
      {children}
    </div>
  ),
}));

describe('DevOpsRoadmap', () => {
  it('renders a semantic readonly roadmap section', () => {
    const { getByRole, getByTestId, getByText } = render(
      <DevOpsRoadmap
        items={[
          { id: 'language', title: 'Learn a Programming Language', skills: ['Python', 'Go'] },
          { id: 'containers', title: 'Containers', skills: ['Docker'] },
        ]}
      />
    );

    expect(getByRole('region', { name: 'DevOps Roadmap' })).toBeTruthy();
    expect(getByText('Learn a Programming Language')).toBeTruthy();
    expect(getByText('Python')).toBeTruthy();
    expect(getByText('Go')).toBeTruthy();
    expect(getByText('Containers')).toBeTruthy();
    expect(getByText('Docker')).toBeTruthy();
    expect(getByTestId('react-flow')).toHaveAttribute('data-node-count', '2');
    expect(getByTestId('react-flow')).toHaveAttribute('data-edge-count', '1');
    expect(getByTestId('react-flow')).toHaveAttribute('data-nodes-draggable', 'false');
    expect(getByTestId('react-flow')).toHaveAttribute('data-nodes-connectable', 'false');
    expect(getByTestId('react-flow')).toHaveAttribute('data-elements-selectable', 'false');
  });

  it('preserves the default roadmap data order in the rendered timeline', () => {
    const { getAllByRole } = render(<DevOpsRoadmap />);

    expect(getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual(
      devOpsRoadmapItems.map((item) => item.title)
    );
  });
});
```

- [ ] **Step 3: Run timeline tests to verify they fail**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io --runInBand --testFile=apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: FAIL because `./devops-roadmap` does not exist.

- [ ] **Step 4: Implement the timeline component**

Create `apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx`:

```tsx
import { useId, useMemo } from 'react';
import { Background, ReactFlow, type Edge, type Node } from '@xyflow/react';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';

import { devOpsRoadmapItems } from './devops-roadmap.data';
import { DevOpsRoadmapNode } from './devops-roadmap-node';
import type { DevOpsRoadmapItem, DevOpsRoadmapProps } from './devops-roadmap.types';

const NODE_WIDTH = 320;
const NODE_HEIGHT = 148;
const NODE_GAP = 48;
const TIMELINE_X = 0;
const nodeTypes = {
  roadmapNode: ({ data }: { data: { item: DevOpsRoadmapItem } }) => (
    <DevOpsRoadmapNode item={data.item} />
  ),
};

function buildTimelineElements(items: readonly DevOpsRoadmapItem[]) {
  const nodes: Node<{ item: DevOpsRoadmapItem }>[] = items.map((item, index) => ({
    id: item.id,
    type: 'roadmapNode',
    position: {
      x: TIMELINE_X,
      y: index * (NODE_HEIGHT + NODE_GAP),
    },
    data: { item },
    draggable: false,
    selectable: false,
  }));

  const edges: Edge[] = items.slice(1).map((item, index) => ({
    id: `${items[index].id}-${item.id}`,
    source: items[index].id,
    target: item.id,
    type: 'smoothstep',
    animated: false,
    focusable: false,
  }));

  return {
    nodes,
    edges,
    height: Math.max(NODE_HEIGHT, items.length * NODE_HEIGHT + Math.max(0, items.length - 1) * NODE_GAP),
  };
}

export function DevOpsRoadmap({
  items = devOpsRoadmapItems,
  heading = 'DevOps Roadmap',
  isHeadingHidden = false,
}: DevOpsRoadmapProps) {
  const headingId = useId();
  const { nodes, edges, height } = useMemo(() => buildTimelineElements(items), [items]);
  const headingElement = isHeadingHidden ? (
    <VisuallyHidden as="h2" id={headingId}>
      {heading}
    </VisuallyHidden>
  ) : (
    <h2 className="devops-roadmap__heading" id={headingId}>
      {heading}
    </h2>
  );

  return (
    <section aria-labelledby={headingId} className="devops-roadmap">
      {headingElement}
      <div className="devops-roadmap__flow" style={{ minHeight: height }}>
        <ReactFlow
          colorMode="light"
          edges={edges}
          elementsSelectable={false}
          fitView
          nodes={nodes}
          nodesConnectable={false}
          nodesDraggable={false}
          nodeTypes={nodeTypes}
          panOnDrag={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
          zoomOnDoubleClick={false}
          zoomOnPinch={false}
          zoomOnScroll={false}
        >
          <Background />
        </ReactFlow>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Add timeline styles**

Append to `apps/github.io/src/styles.css`:

```css
.devops-roadmap {
  display: grid;
  gap: var(--spacing-4);
}

.devops-roadmap__heading {
  margin: 0;
  font-size: var(--font-size-2xl);
}

.devops-roadmap__flow {
  width: 100%;
  min-width: 0;
}

.devops-roadmap__flow .react-flow__node {
  width: min(100%, 320px);
}

.devops-roadmap__flow .react-flow__handle {
  opacity: 0;
  pointer-events: none;
}

.devops-roadmap__flow .react-flow__edge-path {
  stroke: var(--color-border-strong, var(--color-text-secondary));
  stroke-width: 2;
}

@media (max-width: 640px) {
  .devops-roadmap-node {
    width: min(100%, 280px);
    padding: var(--spacing-3);
  }
}
```

- [ ] **Step 6: Run timeline tests to verify they pass**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io --runInBand --testFile=apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx apps/github.io/src/main.tsx apps/github.io/src/styles.css
git diff --cached
git commit -m "feat(github.io): render devops roadmap timeline"
```

### Task 4: Add Storybook Coverage

**Files:**
- Create: `apps/github.io/src/app/devops-roadmap/devops-roadmap.stories.tsx`

**Interfaces:**
- Consumes: `DevOpsRoadmap`.
- Consumes: `DevOpsRoadmapItem`.
- Produces: Storybook stories `Default`, `CompactFixture`, and `HiddenHeading`.

- [ ] **Step 1: Add the Storybook stories**

Create `apps/github.io/src/app/devops-roadmap/devops-roadmap.stories.tsx`:

```tsx
import type { Meta, StoryObj } from '@storybook/react-vite';

import { DevOpsRoadmap } from './devops-roadmap';
import type { DevOpsRoadmapItem } from './devops-roadmap.types';

const compactItems: readonly DevOpsRoadmapItem[] = [
  { id: 'language', title: 'Learn a Programming Language', skills: ['Python', 'Go'] },
  { id: 'containers', title: 'Containers', skills: ['Docker'] },
  { id: 'provisioning', title: 'Provisioning', skills: ['Terraform'] },
];

const meta: Meta<typeof DevOpsRoadmap> = {
  component: DevOpsRoadmap,
  title: 'GitHub.io/DevOps Roadmap/Timeline',
};

export default meta;
type Story = StoryObj<typeof DevOpsRoadmap>;

export const Default: Story = {};

export const CompactFixture: Story = {
  args: {
    items: compactItems,
    heading: 'DevOps Roadmap Fixture',
  },
};

export const HiddenHeading: Story = {
  args: {
    items: compactItems,
    heading: 'DevOps Roadmap',
    isHeadingHidden: true,
  },
};
```

- [ ] **Step 2: Build Storybook**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx build-storybook github.io
```

Expected: PASS and the story `GitHub.io/DevOps Roadmap/Timeline` is included.

- [ ] **Step 3: Commit**

```bash
git add apps/github.io/src/app/devops-roadmap/devops-roadmap.stories.tsx
git diff --cached
git commit -m "feat(github.io): add devops roadmap stories"
```

### Task 5: Run Full Verification and Polish

**Files:**
- Modify only files from earlier tasks if verification exposes concrete issues.

**Interfaces:**
- Consumes: all previous task outputs.
- Produces: verified standalone component without wiring it into the main page.

- [ ] **Step 1: Run focused tests**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io --runInBand --testFile=apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx
```

Expected: PASS.

- [ ] **Step 2: Run all app tests**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx test github.io
```

Expected: PASS.

- [ ] **Step 3: Run lint**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx lint github.io
```

Expected: PASS.

- [ ] **Step 4: Run production build**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx build github.io
```

Expected: PASS.

- [ ] **Step 5: Run Storybook build**

Run:

```bash
PATH=/tmp/corepack-shims:$PATH corepack pnpm nx build-storybook github.io
```

Expected: PASS.

- [ ] **Step 6: Inspect final diff**

Run:

```bash
git status --short
git diff
```

Expected: either a clean tree after previous commits, or only verification fixes in files from this plan.

- [ ] **Step 7: Commit verification fixes if any were needed**

If Step 6 shows verification fixes, commit only those paths:

```bash
git add apps/github.io/src/app/devops-roadmap/devops-roadmap.tsx apps/github.io/src/app/devops-roadmap/devops-roadmap-node.tsx apps/github.io/src/app/devops-roadmap/devops-roadmap.spec.tsx apps/github.io/src/styles.css
git diff --cached
git commit -m "fix(github.io): polish devops roadmap timeline"
```

Expected: commit is created only when there were actual verification fixes.
