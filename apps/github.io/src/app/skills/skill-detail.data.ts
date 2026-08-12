import type { SkillDetailRecord } from './skill-detail.types';

export const skillDetailRecords = [
  {
    skillId: 'kubernetes',
    experienceSummary:
      "I've used Kubernetes to operate application platforms, manage GitOps environments with Argo CD, and build reusable Kustomize foundations across professional and homelab projects.",
    experienceEvidenceIds: [
      'argocd-environment-state-from-version-control',
      'deterministic-kubernetes-overlays',
      'reusable-kubernetes-deployment-foundations',
    ],
    projectIds: ['homelab'],
  },
] as const satisfies readonly SkillDetailRecord[];
