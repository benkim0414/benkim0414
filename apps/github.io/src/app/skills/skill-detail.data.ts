import type { SkillDetailRecord } from './skill-detail.types';

export const skillDetailRecords = [
  {
    skillId: 'aws-codepipeline',
    experienceIds: ['aws-codepipeline-codebuild-multistage-delivery'],
    experienceEvidenceIds: [],
    projectIds: ['homelab'],
  },
  {
    skillId: 'aws-codebuild',
    experienceIds: ['aws-codepipeline-codebuild-multistage-delivery'],
    experienceEvidenceIds: [],
    projectIds: ['homelab'],
  },
  {
    skillId: 'terraform',
    experienceIds: ['aws-codepipeline-codebuild-multistage-delivery'],
    experienceEvidenceIds: [],
    projectIds: ['homelab'],
  },
  {
    skillId: 'amazon-ecr',
    experienceIds: ['aws-codepipeline-codebuild-multistage-delivery'],
    experienceEvidenceIds: [],
    projectIds: ['homelab'],
  },
  {
    skillId: 'amazon-eks',
    experienceIds: ['aws-codepipeline-codebuild-multistage-delivery'],
    experienceEvidenceIds: [],
    projectIds: ['homelab'],
  },
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
