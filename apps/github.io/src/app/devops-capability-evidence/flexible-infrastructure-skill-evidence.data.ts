import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const flexibleInfrastructureSkillDefinitions = [
  ['flexible-infrastructure-skill-terraform', 'Terraform'],
  ['flexible-infrastructure-skill-aws', 'AWS'],
  ['flexible-infrastructure-skill-kubernetes', 'Kubernetes'],
  ['flexible-infrastructure-skill-kubectl', 'kubectl'],
  ['flexible-infrastructure-skill-helm', 'Helm'],
  ['flexible-infrastructure-skill-docker', 'Docker'],
  ['flexible-infrastructure-skill-amazon-ecr', 'Amazon ECR'],
  ['flexible-infrastructure-skill-aws-iam', 'AWS IAM'],
  ['flexible-infrastructure-skill-irsa', 'IRSA'],
  ['flexible-infrastructure-skill-kustomize', 'Kustomize'],
  ['flexible-infrastructure-skill-argo-cd', 'Argo CD'],
  ['flexible-infrastructure-skill-gitops', 'GitOps'],
] as const;

const expectedSupport = {
  Terraform: [
    'terraform-managed-cloud-foundations',
    'irsa-service-accounts',
    'terraform-scoped-iam',
    'terraform-codepipeline-platform',
  ],
  AWS: [
    'terraform-managed-cloud-foundations',
    'terraform-codepipeline-platform',
  ],
  Kubernetes: [
    'irsa-service-accounts',
    'argocd-environment-state-from-version-control',
    'deterministic-kubernetes-overlays',
    'reusable-kubernetes-deployment-foundations',
  ],
  kubectl: ['reusable-kubernetes-deployment-foundations'],
  Helm: ['reusable-kubernetes-deployment-foundations'],
  Docker: [
    'terraform-codepipeline-platform',
    'reusable-kubernetes-deployment-foundations',
  ],
  'Amazon ECR': [
    'terraform-managed-cloud-foundations',
    'terraform-codepipeline-platform',
  ],
  'AWS IAM': ['irsa-service-accounts', 'terraform-scoped-iam'],
  IRSA: ['irsa-service-accounts', 'terraform-scoped-iam'],
  Kustomize: [
    'argocd-environment-state-from-version-control',
    'deterministic-kubernetes-overlays',
  ],
  'Argo CD': ['argocd-environment-state-from-version-control'],
  GitOps: [
    'argocd-environment-state-from-version-control',
    'deterministic-kubernetes-overlays',
  ],
} as const;

export const flexibleInfrastructureSkillEvidenceItems: readonly CapabilityEvidenceItem[] =
  flexibleInfrastructureSkillDefinitions.map(([id, name]) => ({
    id,
    title: name,
    label: name,
    type: 'skill',
    capabilityKeys: ['flexible-infrastructure'],
    summary: `Evidence-backed Flexible Infrastructure capability with ${name}.`,
    technologies: [name],
    isPublic: true,
    strength: 'supporting',
    supportingEvidenceIds: expectedSupport[name],
  }));
