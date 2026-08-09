import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const continuousDeliverySkillDefinitions = [
  {
    id: 'continuous-delivery-skill-codepipeline',
    name: 'AWS CodePipeline',
    supportingEvidenceIds: [
      'codepipeline-approval-gated-deployment',
      'terraform-codepipeline-platform',
    ],
  },
  {
    id: 'continuous-delivery-skill-github',
    name: 'GitHub',
    supportingEvidenceIds: [
      'codepipeline-approval-gated-deployment',
      'github-actions-gitops-handoff',
    ],
  },
  {
    id: 'continuous-delivery-skill-docker',
    name: 'Docker',
    supportingEvidenceIds: [
      'gitops-same-package-environments',
      'reusable-helm-deployment-image',
    ],
  },
  {
    id: 'continuous-delivery-skill-ecr',
    name: 'Amazon ECR',
    supportingEvidenceIds: [
      'ecr-immutable-promotion',
      'gitops-same-package-environments',
    ],
  },
  {
    id: 'continuous-delivery-skill-helm',
    name: 'Helm',
    supportingEvidenceIds: [
      'codepipeline-approval-gated-deployment',
      'reusable-helm-deployment-image',
    ],
  },
  {
    id: 'continuous-delivery-skill-eks',
    name: 'Amazon EKS',
    supportingEvidenceIds: ['codepipeline-approval-gated-deployment'],
  },
  {
    id: 'continuous-delivery-skill-terraform',
    name: 'Terraform',
    supportingEvidenceIds: [
      'terraform-codepipeline-platform',
      'production-artifacts-version-control',
    ],
  },
  {
    id: 'continuous-delivery-skill-kubernetes',
    name: 'Kubernetes',
    supportingEvidenceIds: [
      'codepipeline-approval-gated-deployment',
      'argocd-environment-state-from-version-control',
      'argocd-automated-database-migrations',
      'deployment-health-checks',
    ],
  },
  {
    id: 'continuous-delivery-skill-github-actions',
    name: 'GitHub Actions',
    supportingEvidenceIds: [
      'github-actions-gitops-handoff',
      'serialized-deployment-process',
      'deployment-failure-notification',
    ],
  },
  {
    id: 'continuous-delivery-skill-openid-connect',
    name: 'OpenID Connect',
    supportingEvidenceIds: ['github-actions-gitops-handoff'],
  },
  {
    id: 'continuous-delivery-skill-nx',
    name: 'Nx',
    supportingEvidenceIds: ['github-actions-gitops-handoff'],
  },
  {
    id: 'continuous-delivery-skill-kustomize',
    name: 'Kustomize',
    supportingEvidenceIds: [
      'github-actions-gitops-handoff',
      'argocd-environment-state-from-version-control',
      'gitops-same-package-environments',
    ],
  },
  {
    id: 'continuous-delivery-skill-argo-cd',
    name: 'Argo CD',
    supportingEvidenceIds: [
      'argocd-environment-state-from-version-control',
      'argocd-automated-database-migrations',
    ],
  },
  {
    id: 'continuous-delivery-skill-sealed-secrets',
    name: 'Sealed Secrets',
    supportingEvidenceIds: ['sealed-secrets-version-control'],
  },
] as const;

export const continuousDeliverySkillEvidenceItems: readonly CapabilityEvidenceItem[] =
  continuousDeliverySkillDefinitions.map(
    ({ id, name, supportingEvidenceIds }) => ({
      id,
      title: name,
      label: name,
      type: 'skill',
      capabilityKeys: ['continuous-delivery'],
      summary: `Evidence-backed Continuous Delivery capability with ${name}.`,
      technologies: [name],
      isPublic: true,
      strength: 'strong',
      supportingEvidenceIds,
    }),
  );
