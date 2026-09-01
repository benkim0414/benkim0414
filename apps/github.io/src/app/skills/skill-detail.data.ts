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
    experienceIds: [
      'aws-codepipeline-codebuild-multistage-delivery',
      'eks-platform-operations',
      'identity-access-hardening',
    ],
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
    experienceIds: [
      'aws-codepipeline-codebuild-multistage-delivery',
      'eks-platform-operations',
    ],
    experienceEvidenceIds: [],
    projectIds: ['homelab'],
  },
  {
    skillId: 'kubernetes',
    experienceIds: [
      'aws-codepipeline-codebuild-multistage-delivery',
      'eks-platform-operations',
      'production-reliability-engineering',
      'identity-access-hardening',
    ],
    experienceEvidenceIds: [
      'argocd-environment-state-from-version-control',
      'deterministic-kubernetes-overlays',
      'reusable-kubernetes-deployment-foundations',
    ],
    projectIds: ['homelab'],
  },
  {
    skillId: 'nx',
    experienceIds: ['nx-monorepo-service-consolidation'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'typescript',
    experienceIds: ['nx-monorepo-service-consolidation'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'postgresql',
    experienceIds: [
      'nx-monorepo-service-consolidation',
      'production-reliability-engineering',
    ],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'docker',
    experienceIds: ['nx-monorepo-service-consolidation'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'helm',
    experienceIds: ['eks-platform-operations'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'kustomize',
    experienceIds: ['eks-platform-operations', 'gitops-deployment-reliability'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'grafana',
    experienceIds: [
      'production-observability-stack',
      'production-reliability-engineering',
    ],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'prometheus',
    experienceIds: [
      'production-observability-stack',
      'production-reliability-engineering',
    ],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'loki',
    experienceIds: ['production-observability-stack'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'alertmanager',
    experienceIds: ['production-observability-stack'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'alloy',
    experienceIds: ['production-observability-stack'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'sentry',
    experienceIds: ['production-observability-stack'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'argo-cd',
    experienceIds: ['gitops-deployment-reliability'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'sealed-secrets',
    experienceIds: ['gitops-deployment-reliability'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'github-actions',
    experienceIds: ['gitops-deployment-reliability'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
  {
    skillId: 'aws-iam',
    experienceIds: ['identity-access-hardening'],
    experienceEvidenceIds: [],
    projectIds: [],
  },
] as const satisfies readonly SkillDetailRecord[];
