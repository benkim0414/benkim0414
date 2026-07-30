import type {
  CapabilityEvidenceItem,
  DoraCapabilityDefinition,
  DoraCapabilityScore,
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

export const curatedDevOpsCapabilityRadarScores = [
  {
    capabilityKey: 'version-control',
    label: 'Versioning',
    score: 4,
    maxScore: 5,
    evidenceIds: ['devops-roadmap-project'],
    strongestEvidenceId: 'devops-roadmap-project',
    evidenceCounts: { project: 1 },
  },
  {
    capabilityKey: 'trunk-based-development',
    label: 'Trunk',
    score: 4,
    maxScore: 5,
    evidenceIds: [],
    evidenceCounts: {},
  },
  {
    capabilityKey: 'continuous-integration',
    label: 'CI',
    score: 4,
    maxScore: 5,
    evidenceIds: ['github-actions-delivery'],
    strongestEvidenceId: 'github-actions-delivery',
    evidenceCounts: { experience: 1 },
  },
  {
    capabilityKey: 'test-automation',
    label: 'Tests',
    score: 3,
    maxScore: 5,
    evidenceIds: [],
    evidenceCounts: {},
  },
  {
    capabilityKey: 'pervasive-security',
    label: 'Security',
    score: 2,
    maxScore: 5,
    evidenceIds: [],
    evidenceCounts: {},
  },
  {
    capabilityKey: 'continuous-delivery',
    label: 'Delivery',
    score: 4,
    maxScore: 5,
    evidenceIds: ['github-actions-delivery'],
    strongestEvidenceId: 'github-actions-delivery',
    evidenceCounts: { experience: 1 },
  },
  {
    capabilityKey: 'deployment-automation',
    label: 'Deploys',
    score: 4,
    maxScore: 5,
    evidenceIds: ['github-actions-delivery'],
    strongestEvidenceId: 'github-actions-delivery',
    evidenceCounts: { experience: 1 },
  },
  {
    capabilityKey: 'flexible-infrastructure',
    label: 'Infrastructure',
    score: 4,
    maxScore: 5,
    evidenceIds: [
      'kubernetes-learning',
      'cncf-kubernetes-certification',
      'kubernetes-skill',
    ],
    strongestEvidenceId: 'cncf-kubernetes-certification',
    evidenceCounts: { certification: 1, learning: 1, skill: 1 },
  },
  {
    capabilityKey: 'monitoring-observability',
    label: 'Observability',
    score: 3,
    maxScore: 5,
    evidenceIds: [
      'kubernetes-learning',
      'cncf-kubernetes-certification',
      'kubernetes-skill',
    ],
    strongestEvidenceId: 'cncf-kubernetes-certification',
    evidenceCounts: { certification: 1, learning: 1, skill: 1 },
  },
  {
    capabilityKey: 'documentation-quality',
    label: 'Docs',
    score: 4,
    maxScore: 5,
    evidenceIds: ['devops-roadmap-project'],
    strongestEvidenceId: 'devops-roadmap-project',
    evidenceCounts: { project: 1 },
  },
] as const satisfies readonly DoraCapabilityScore[];

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
    label: 'CI/CD workflow',
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
    label: 'Kubernetes',
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
    label: 'Kubernetes cert',
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
    label: 'DevOps roadmap',
    type: 'project',
    proofUrl: 'https://github.com/benkim0414/benkim0414',
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
