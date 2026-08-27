import type { SkillDetailRecord } from './skill-detail.types';

export const skillDetailRecords = [
  {
    skillId: 'kubernetes',
    experienceIds: ['aws-codepipeline-codebuild-multistage-delivery'],
    experienceEvidenceIds: [
      'argocd-environment-state-from-version-control',
      'deterministic-kubernetes-overlays',
      'reusable-kubernetes-deployment-foundations',
    ],
    projectIds: ['homelab'],
  },
] as const satisfies readonly SkillDetailRecord[];
