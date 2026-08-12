import type { SkillDetailRecord } from './skill-detail.types';

export const skillDetailRecords = [
  {
    skillId: 'kubernetes',
    experienceEvidenceIds: [
      'argocd-environment-state-from-version-control',
      'deterministic-kubernetes-overlays',
      'reusable-kubernetes-deployment-foundations',
    ],
    projectIds: ['homelab'],
  },
] as const satisfies readonly SkillDetailRecord[];
