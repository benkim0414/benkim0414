import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { vi } from 'vitest';

import { devOpsRoadmapItems } from './devops-roadmap.data';
import { DevOpsRoadmapNode } from './devops-roadmap-node';
import { DevOpsRoadmap } from './devops-roadmap';

vi.mock('@astryxdesign/core/Badge', () => ({
  Badge: ({ label, variant }: { label: ReactNode; variant?: string }) => (
    <span data-badge-variant={variant}>{label}</span>
  ),
}));

vi.mock('@xyflow/react', () => ({
  Background: () => <div data-testid="react-flow-background" />,
  Handle: ({ id, position, type }: { id: string; position: string; type: string }) => (
    <div data-handle-position={position} data-handle-type={type} data-testid={`handle-${id}`} />
  ),
  Position: {
    Bottom: 'bottom',
    Top: 'top',
  },
  ReactFlow: ({
    nodes,
    edges,
    nodeTypes,
    nodesDraggable,
    nodesConnectable,
    elementsSelectable,
    nodesFocusable,
    disableKeyboardA11y,
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
    nodesFocusable: boolean;
    disableKeyboardA11y: boolean;
    panOnDrag: boolean;
    zoomOnScroll: boolean;
    zoomOnDoubleClick: boolean;
    fitView: boolean;
    children: ReactNode;
  }) => (
    <div
      data-edge-count={edges.length}
      data-disable-keyboard-a11y={String(disableKeyboardA11y)}
      data-elements-selectable={String(elementsSelectable)}
      data-fit-view={String(fitView)}
      data-node-count={nodes.length}
      data-nodes-connectable={String(nodesConnectable)}
      data-nodes-draggable={String(nodesDraggable)}
      data-nodes-focusable={String(nodesFocusable)}
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
    expect(getByText('Docker').getAttribute('data-badge-variant')).toBe('purple');
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

  it('renders hidden target and source handles for timeline edges', () => {
    const { getByTestId } = render(
      <DevOpsRoadmapNode
        item={{
          id: 'containers',
          title: 'Containers',
          skills: ['Docker'],
        }}
      />
    );

    expect(getByTestId('handle-target').getAttribute('data-handle-type')).toBe('target');
    expect(getByTestId('handle-target').getAttribute('data-handle-position')).toBe('top');
    expect(getByTestId('handle-source').getAttribute('data-handle-type')).toBe('source');
    expect(getByTestId('handle-source').getAttribute('data-handle-position')).toBe('bottom');
  });
});

describe('DevOpsRoadmap', () => {
  it('renders only the readonly roadmap diagram', () => {
    const { container, getByRole, getByTestId, getByText } = render(
      <DevOpsRoadmap
        items={[
          { id: 'language', title: 'Learn a Programming Language', skills: ['Python', 'Go'] },
          { id: 'containers', title: 'Containers', skills: ['Docker'] },
        ]}
      />
    );

    expect(container.querySelector('.devops-roadmap__heading')).toBeNull();
    expect(container.querySelector('.devops-roadmap')).toBeNull();
    expect(getByRole('group', { name: 'DevOps roadmap diagram' })).toBeTruthy();
    expect(getByText('Learn a Programming Language')).toBeTruthy();
    expect(getByText('Python')).toBeTruthy();
    expect(getByText('Go')).toBeTruthy();
    expect(getByText('Containers')).toBeTruthy();
    expect(getByText('Docker')).toBeTruthy();
    expect(getByTestId('react-flow').getAttribute('data-node-count')).toBe('2');
    expect(getByTestId('react-flow').getAttribute('data-edge-count')).toBe('1');
    expect(getByTestId('react-flow').getAttribute('data-nodes-draggable')).toBe('false');
    expect(getByTestId('react-flow').getAttribute('data-nodes-connectable')).toBe('false');
    expect(getByTestId('react-flow').getAttribute('data-elements-selectable')).toBe('false');
    expect(getByTestId('react-flow').getAttribute('data-nodes-focusable')).toBe('false');
    expect(getByTestId('react-flow').getAttribute('data-disable-keyboard-a11y')).toBe('true');
  });

  it('gives the React Flow wrapper a definite timeline height', () => {
    const { container } = render(
      <DevOpsRoadmap
        items={[
          { id: 'language', title: 'Learn a Programming Language', skills: ['Python', 'Go'] },
          { id: 'containers', title: 'Containers', skills: ['Docker'] },
        ]}
      />
    );

    const flowWrapper = container.querySelector<HTMLElement>('.devops-roadmap__flow');

    expect(flowWrapper?.style.height).toBe('640px');
  });

  it('reserves stable timeline space for chip-heavy nodes', () => {
    const { container } = render(
      <DevOpsRoadmap
        items={[
          {
            id: 'terminal-knowledge',
            title: 'Terminal Knowledge',
            skills: [
              'Bash',
              'Process Monitoring',
              'Performance Monitoring',
              'Networking Tools',
              'Text Manipulation',
              'Vim / Nano / Emacs',
            ],
          },
          { id: 'containers', title: 'Containers', skills: ['Docker'] },
        ]}
      />
    );

    const flowWrapper = container.querySelector<HTMLElement>('.devops-roadmap__flow');

    expect(flowWrapper?.style.height).toBe('640px');
  });

  it('preserves the default roadmap data order in the rendered timeline', () => {
    const { getAllByRole } = render(<DevOpsRoadmap />);

    expect(getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual(
      devOpsRoadmapItems.map((item) => item.title)
    );
  });

  it('can render the roadmap in reverse order without mutating source data', () => {
    const originalOrder = devOpsRoadmapItems.map((item) => item.title);
    const { getAllByRole } = render(<DevOpsRoadmap isReversed />);

    expect(getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual(
      originalOrder.toReversed()
    );
    expect(devOpsRoadmapItems.map((item) => item.title)).toEqual(originalOrder);
  });
});
