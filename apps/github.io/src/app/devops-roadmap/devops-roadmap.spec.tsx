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
