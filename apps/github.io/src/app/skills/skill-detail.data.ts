import type { SkillDetailRecord } from './skill-detail.types';

export const skillDetailRecords = [
  {
    skillId: 'kubernetes',
    experienceSummary:
      'Kubernetes has been a core part of my delivery and infrastructure work. I have used it to operate application platforms, manage version-controlled environments with Argo CD, build deterministic Kustomize overlays, and maintain reusable deployment foundations across professional and homelab projects.',
    experienceEvidenceIds: [
      'argocd-environment-state-from-version-control',
      'deterministic-kubernetes-overlays',
      'reusable-kubernetes-deployment-foundations',
    ],
    projectIds: ['homelab'],
  },
] as const satisfies readonly SkillDetailRecord[];
