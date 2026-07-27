import type {
  CapabilityEvidenceItem,
  DoraCapabilityDefinition,
  EvidenceType,
} from './devops-capability-evidence.types';

export const doraCapabilityDefinitions = [
  {
    key: 'continuous-delivery',
    label: 'Continuous Delivery',
    shortLabel: 'Delivery',
  },
  {
    key: 'deployment-automation',
    label: 'Deployment Automation',
    shortLabel: 'Deploys',
  },
  {
    key: 'continuous-integration',
    label: 'Continuous Integration',
    shortLabel: 'CI',
  },
  { key: 'test-automation', label: 'Test Automation', shortLabel: 'Tests' },
  {
    key: 'monitoring-observability',
    label: 'Monitoring and Observability',
    shortLabel: 'Observability',
  },
  {
    key: 'flexible-infrastructure',
    label: 'Flexible Infrastructure',
    shortLabel: 'Infrastructure',
  },
  {
    key: 'pervasive-security',
    label: 'Pervasive Security',
    shortLabel: 'Security',
  },
  {
    key: 'trunk-based-development',
    label: 'Trunk-Based Development',
    shortLabel: 'Trunk',
  },
  {
    key: 'documentation-quality',
    label: 'Documentation Quality',
    shortLabel: 'Docs',
  },
  {
    key: 'version-control',
    label: 'Version Control',
    shortLabel: 'Versioning',
  },
] as const satisfies readonly DoraCapabilityDefinition[];

export const evidenceTypeLabels = {
  skill: 'Skills',
  learning: 'Learning',
  experience: 'Experience',
  education: 'Education',
  certification: 'Certifications',
  project: 'Projects',
} as const satisfies Record<EvidenceType, string>;

export const devOpsCapabilityEvidenceItems = [
  {
    id: 'github-actions-delivery',
    title: 'CI/CD workflow ownership',
    type: 'experience',
    organization: 'Current company',
    capabilityKeys: [
      'continuous-delivery',
      'deployment-automation',
      'continuous-integration',
    ],
    summary:
      'Owned CI/CD workflow improvements for a four-developer product team using safe public summary only.',
    technologies: ['GitHub Actions', 'Docker'],
    isPublic: true,
    strength: 'primary',
  },
  {
    id: 'kubernetes-learning',
    title: 'Kubernetes operations learning path',
    type: 'learning',
    date: '2026-03-01',
    endDate: '2026-04-05',
    capabilityKeys: ['flexible-infrastructure', 'monitoring-observability'],
    summary:
      'Practiced workloads, services, troubleshooting, kubectl workflows, and cluster operations.',
    technologies: ['Kubernetes'],
    isPublic: true,
    strength: 'strong',
  },
  {
    id: 'cncf-kubernetes-certification',
    title: 'CNCF Kubernetes certification',
    type: 'certification',
    issuer: 'Cloud Native Computing Foundation',
    capabilityKeys: ['flexible-infrastructure', 'monitoring-observability'],
    summary:
      'Cloud native certification evidence mapped to Kubernetes operations and infrastructure capability.',
    technologies: ['Kubernetes'],
    isPublic: true,
    strength: 'primary',
  },
  {
    id: 'devops-roadmap-project',
    title: 'DevOps roadmap portfolio project',
    type: 'project',
    capabilityKeys: ['documentation-quality', 'version-control'],
    summary:
      'Built a portfolio visualization that maps DevOps topics, skills, and certifications.',
    technologies: ['React', 'TypeScript', 'Nx'],
    isPublic: true,
    strength: 'strong',
  },
  {
    id: 'kubernetes-skill',
    title: 'Kubernetes',
    type: 'skill',
    capabilityKeys: ['flexible-infrastructure', 'monitoring-observability'],
    summary:
      'Kubernetes skill shown because it is backed by learning and operations evidence.',
    technologies: ['Kubernetes'],
    isPublic: true,
    strength: 'supporting',
    supportingEvidenceIds: ['kubernetes-learning'],
  },
] as const satisfies readonly CapabilityEvidenceItem[];
