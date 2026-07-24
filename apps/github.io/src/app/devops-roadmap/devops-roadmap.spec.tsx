import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { vi } from 'vitest';

import { devOpsRoadmapItems } from './devops-roadmap.data';
import { DevOpsRoadmapNode } from './devops-roadmap-node';
import { DevOpsRoadmap } from './devops-roadmap';

vi.mock('../skills/skill-token', () => ({
  SkillToken: ({ label }: { label: string }) => (
    <span className="skill-token" data-testid={`skill-token-${label}`}>
      {label}
    </span>
  ),
}));

vi.mock('../certifications/certification-citation', () => ({
  CertificationCitation: ({
    title,
    number,
  }: {
    title: string;
    number?: number;
  }) => (
    <a
      data-certification-number={number}
      data-testid={`certification-citation-${title}`}
      href={`#${title}`}
    >
      {title}
    </a>
  ),
}));

vi.mock('@xyflow/react', () => ({
  Background: () => <div data-testid="react-flow-background" />,
  Handle: ({
    id,
    position,
    type,
  }: {
    id: string;
    position: string;
    type: string;
  }) => (
    <div
      data-handle-position={position}
      data-handle-type={type}
      data-testid={`handle-${id}`}
    />
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
    nodes: Array<{
      id: string;
      data: { item: { title: string } };
      position: { y: number };
    }>;
    edges: Array<{ id: string }>;
    nodeTypes: Record<
      string,
      (props: {
        data: {
          item: {
            id: string;
            title: string;
            skills: readonly string[];
            certifications?: readonly unknown[];
          };
        };
      }) => ReactNode
    >;
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
      data-node-positions={nodes
        .map((node) => `${node.id}:${node.position.y}`)
        .join('|')}
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
    expect(
      devOpsRoadmapItems.find((item) => item.id === 'containers'),
    ).toMatchObject({
      title: 'Containers',
      skills: ['Docker'],
    });
    expect(
      devOpsRoadmapItems.find((item) => item.id === 'application-monitoring'),
    ).toMatchObject({
      title: 'Application Monitoring',
      skills: [],
    });
  });

  it('stores Kubernetes certifications under Container Orchestration', () => {
    expect(
      devOpsRoadmapItems.find((item) => item.id === 'container-orchestration'),
    ).toMatchObject({
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
    });
  });
});

describe('DevOpsRoadmapNode', () => {
  it('renders the core node title and purple-ticked skill tokens', () => {
    const { getByRole, getByTestId } = render(
      <DevOpsRoadmapNode
        item={{
          id: 'containers',
          title: 'Containers',
          skills: ['Docker'],
        }}
      />,
    );

    expect(getByRole('article', { name: 'Containers' })).toBeTruthy();
    expect(getByTestId('skill-token-Docker')).toBeTruthy();
  });

  it('does not render an empty chip list when a node has no purple-ticked skills', () => {
    const { container, getByText } = render(
      <DevOpsRoadmapNode
        item={{
          id: 'cloud-design-patterns',
          title: 'Cloud Design Patterns',
          skills: [],
        }}
      />,
    );

    expect(getByText('Cloud Design Patterns')).toBeTruthy();
    expect(container.querySelector('[data-roadmap-node-skills]')).toBeNull();
  });

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
    expect(
      container.querySelector(
        '[data-roadmap-node-skills] + [data-roadmap-node-certifications]',
      ),
    ).toBeTruthy();
  });

  it('renders hidden target and source handles for timeline edges', () => {
    const { getByTestId } = render(
      <DevOpsRoadmapNode
        item={{
          id: 'containers',
          title: 'Containers',
          skills: ['Docker'],
        }}
      />,
    );

    expect(getByTestId('handle-target').getAttribute('data-handle-type')).toBe(
      'target',
    );
    expect(
      getByTestId('handle-target').getAttribute('data-handle-position'),
    ).toBe('top');
    expect(getByTestId('handle-source').getAttribute('data-handle-type')).toBe(
      'source',
    );
    expect(
      getByTestId('handle-source').getAttribute('data-handle-position'),
    ).toBe('bottom');
  });
});

describe('DevOpsRoadmap', () => {
  it('renders only the readonly roadmap diagram', () => {
    const { container, getByRole, getByTestId, getByText } = render(
      <DevOpsRoadmap
        items={[
          {
            id: 'language',
            title: 'Learn a Programming Language',
            skills: ['Python', 'Go'],
          },
          { id: 'containers', title: 'Containers', skills: ['Docker'] },
        ]}
      />,
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
    expect(getByTestId('react-flow').getAttribute('data-nodes-draggable')).toBe(
      'false',
    );
    expect(
      getByTestId('react-flow').getAttribute('data-nodes-connectable'),
    ).toBe('false');
    expect(
      getByTestId('react-flow').getAttribute('data-elements-selectable'),
    ).toBe('false');
    expect(getByTestId('react-flow').getAttribute('data-nodes-focusable')).toBe(
      'false',
    );
    expect(
      getByTestId('react-flow').getAttribute('data-disable-keyboard-a11y'),
    ).toBe('true');
  });

  it('gives the React Flow wrapper a definite timeline height', () => {
    const { container } = render(
      <DevOpsRoadmap
        items={[
          {
            id: 'language',
            title: 'Learn a Programming Language',
            skills: ['Python', 'Go'],
          },
          { id: 'containers', title: 'Containers', skills: ['Docker'] },
        ]}
      />,
    );

    const flowWrapper = container.querySelector<HTMLElement>(
      '.devops-roadmap__flow',
    );

    expect(flowWrapper?.getAttribute('style')).toBe('--x-height: 344px;');
    expect(
      container
        .querySelector('[data-testid="react-flow"]')
        ?.getAttribute('data-node-positions'),
    ).toBe('language:0|containers:196');
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
      />,
    );

    const flowWrapper = container.querySelector<HTMLElement>(
      '.devops-roadmap__flow',
    );

    expect(flowWrapper?.getAttribute('style')).toBe('--x-height: 444px;');
    expect(
      container
        .querySelector('[data-testid="react-flow"]')
        ?.getAttribute('data-node-positions'),
    ).toBe('terminal-knowledge:0|containers:296');
  });

  it('reserves stable timeline space for certification rows', () => {
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
      />,
    );

    const flowWrapper = container.querySelector<HTMLElement>(
      '.devops-roadmap__flow',
    );

    expect(flowWrapper?.getAttribute('style')).toBe('--x-height: 394px;');
    expect(
      container
        .querySelector('[data-testid="react-flow"]')
        ?.getAttribute('data-node-positions'),
    ).toBe('container-orchestration:0|gitops:246');
  });

  it('preserves the default roadmap data order in the rendered timeline', () => {
    const { getAllByRole } = render(<DevOpsRoadmap />);

    expect(
      getAllByRole('heading', { level: 3 }).map(
        (heading) => heading.textContent,
      ),
    ).toEqual(devOpsRoadmapItems.map((item) => item.title));
  });

  it('can render the roadmap in reverse order without mutating source data', () => {
    const originalOrder = devOpsRoadmapItems.map((item) => item.title);
    const { getAllByRole } = render(<DevOpsRoadmap isReversed />);

    expect(
      getAllByRole('heading', { level: 3 }).map(
        (heading) => heading.textContent,
      ),
    ).toEqual(originalOrder.toReversed());
    expect(devOpsRoadmapItems.map((item) => item.title)).toEqual(originalOrder);
  });
});
