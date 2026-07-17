import { render } from '@testing-library/react';

import { devOpsRoadmapItems } from './devops-roadmap.data';
import { DevOpsRoadmapNode } from './devops-roadmap-node';

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
