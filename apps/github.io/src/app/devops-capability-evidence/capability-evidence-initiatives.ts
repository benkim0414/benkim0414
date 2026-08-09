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
} as const satisfies Record<string, CapabilityEvidenceInitiative>;
