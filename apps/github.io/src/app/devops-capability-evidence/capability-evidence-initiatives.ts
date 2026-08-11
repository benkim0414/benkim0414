import type { CapabilityEvidenceInitiative } from './devops-capability-evidence.types';

export const capabilityEvidenceInitiatives = {
  awsCodePipelinePlatform: {
    id: 'aws-codepipeline-platform',
    label: 'AWS CodePipeline platform',
  },
  githubActionsMonorepo: {
    id: 'github-actions-monorepo',
    label: 'GitHub Actions monorepo migration',
  },
  deliveryRepositoryPractices: {
    id: 'delivery-repository-practices',
    label: 'Delivery repository practices',
  },
  automatedTestingPractices: {
    id: 'automated-testing-practices',
    label: 'Automated testing practices',
  },
  observabilityPlatform: {
    id: 'observability-platform',
    label: 'Observability platform',
  },
  securityGovernance: {
    id: 'security-governance',
    label: 'Security governance',
  },
  documentationSystem: {
    id: 'documentation-system',
    label: 'Documentation system',
  },
} as const satisfies Record<string, CapabilityEvidenceInitiative>;
