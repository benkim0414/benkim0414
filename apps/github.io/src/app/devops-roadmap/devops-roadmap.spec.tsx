import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { vi } from 'vitest';

import { devOpsRoadmapItems } from './devops-roadmap.data';
import { DevOpsRoadmapNode } from './devops-roadmap-node';
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
    expect(getByTestId('react-flow').getAttribute('data-node-count')).toBe('2');
    expect(getByTestId('react-flow').getAttribute('data-edge-count')).toBe('1');
    expect(getByTestId('react-flow').getAttribute('data-nodes-draggable')).toBe('false');
    expect(getByTestId('react-flow').getAttribute('data-nodes-connectable')).toBe('false');
    expect(getByTestId('react-flow').getAttribute('data-elements-selectable')).toBe('false');
  });

  it('preserves the default roadmap data order in the rendered timeline', () => {
    const { getAllByRole } = render(<DevOpsRoadmap />);

    expect(getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual(
      devOpsRoadmapItems.map((item) => item.title)
    );
  });
});
