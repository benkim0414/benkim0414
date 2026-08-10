import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const deploymentAutomationSkillDefinitions = [
  ['deployment-automation-skill-aws-codepipeline', 'AWS CodePipeline'],
  ['deployment-automation-skill-terraform', 'Terraform'],
  ['deployment-automation-skill-github-actions', 'GitHub Actions'],
  ['deployment-automation-skill-argo-cd', 'Argo CD'],
  ['deployment-automation-skill-gitops', 'GitOps'],
  ['deployment-automation-skill-docker', 'Docker'],
  ['deployment-automation-skill-amazon-ecr', 'Amazon ECR'],
  ['deployment-automation-skill-kubernetes', 'Kubernetes'],
  ['deployment-automation-skill-openid-connect', 'OpenID Connect'],
  ['deployment-automation-skill-nx', 'Nx'],
  ['deployment-automation-skill-github-api', 'GitHub API'],
  ['deployment-automation-skill-kustomize', 'Kustomize'],
  ['deployment-automation-skill-sealed-secrets', 'Sealed Secrets'],
] as const;

const expectedSupport = {
  'AWS CodePipeline': ['codepipeline-approval-gated-deployment'],
  Terraform: ['codepipeline-approval-gated-deployment'],
  Docker: ['deployment-traceability-chain', 'image-digest-deployments'],
  'Amazon ECR': ['deployment-traceability-chain', 'image-digest-deployments'],
  Kubernetes: [
    'environment-neutral-deployment-mechanism',
    'automated-sealed-secret-delivery',
    'deterministic-kubernetes-overlays',
  ],
  'GitHub Actions': [
    'merge-triggered-deployment-path',
    'github-actions-gitops-handoff',
  ],
  'OpenID Connect': ['merge-triggered-deployment-path'],
  Nx: ['generator-based-service-onboarding', 'merge-triggered-deployment-path'],
  'GitHub API': ['merge-triggered-deployment-path'],
  Kustomize: [
    'environment-neutral-deployment-mechanism',
    'deterministic-kubernetes-overlays',
  ],
  'Argo CD': [
    'github-actions-gitops-handoff',
    'automated-sealed-secret-delivery',
  ],
  GitOps: [
    'github-actions-gitops-handoff',
    'environment-neutral-deployment-mechanism',
  ],
  'Sealed Secrets': ['automated-sealed-secret-delivery'],
} as const;

export const deploymentAutomationSkillEvidenceItems: readonly CapabilityEvidenceItem[] =
  deploymentAutomationSkillDefinitions.map(([id, name]) => ({
    id,
    title: name,
    label: name,
    type: 'skill',
    capabilityKeys: ['deployment-automation'],
    summary: `Evidence-backed Deployment Automation capability with ${name}.`,
    technologies: [name],
    isPublic: true,
    strength: 'supporting',
    supportingEvidenceIds: expectedSupport[name],
  }));
