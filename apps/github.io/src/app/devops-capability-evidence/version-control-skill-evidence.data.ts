import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const versionControlSkillDefinitions = [
  {
    id: 'version-control-skill-git',
    name: 'Git',
    supportingEvidenceIds: [
      'codepipeline-webhook-trunk',
      'merge-commit-history',
      'conventional-commit-governance',
    ],
  },
  {
    id: 'version-control-skill-github',
    name: 'GitHub',
    supportingEvidenceIds: [
      'codepipeline-webhook-trunk',
      'github-actions-gitops-handoff',
      'merge-commit-history',
    ],
  },
  {
    id: 'version-control-skill-codepipeline',
    name: 'AWS CodePipeline',
    supportingEvidenceIds: [
      'codepipeline-webhook-trunk',
      'terraform-codepipeline-platform',
    ],
  },
  {
    id: 'version-control-skill-terraform',
    name: 'Terraform',
    supportingEvidenceIds: ['terraform-codepipeline-platform'],
  },
  {
    id: 'version-control-skill-docker',
    name: 'Docker',
    supportingEvidenceIds: [
      'reusable-helm-deployment-image',
      'gitops-same-package-environments',
    ],
  },
  {
    id: 'version-control-skill-helm',
    name: 'Helm',
    supportingEvidenceIds: ['reusable-helm-deployment-image'],
  },
  {
    id: 'version-control-skill-conventional-commits',
    name: 'Conventional Commits',
    supportingEvidenceIds: ['conventional-commit-governance'],
  },
  {
    id: 'version-control-skill-husky',
    name: 'Husky',
    supportingEvidenceIds: ['conventional-commit-governance'],
  },
  {
    id: 'version-control-skill-nx',
    name: 'Nx',
    supportingEvidenceIds: ['github-actions-gitops-handoff'],
  },
  {
    id: 'version-control-skill-github-actions',
    name: 'GitHub Actions',
    supportingEvidenceIds: ['github-actions-gitops-handoff'],
  },
  {
    id: 'version-control-skill-kustomize',
    name: 'Kustomize',
    supportingEvidenceIds: [
      'github-actions-gitops-handoff',
      'argocd-environment-state-from-version-control',
      'gitops-same-package-environments',
    ],
  },
  {
    id: 'version-control-skill-argo-cd',
    name: 'Argo CD',
    supportingEvidenceIds: [
      'github-actions-gitops-handoff',
      'argocd-environment-state-from-version-control',
      'argocd-automated-database-migrations',
    ],
  },
  {
    id: 'version-control-skill-kubernetes',
    name: 'Kubernetes',
    supportingEvidenceIds: [
      'argocd-environment-state-from-version-control',
      'argocd-automated-database-migrations',
    ],
  },
] as const;

export const versionControlSkillEvidenceItems: readonly CapabilityEvidenceItem[] =
  versionControlSkillDefinitions.map(({ id, name, supportingEvidenceIds }) => ({
    id,
    title: name,
    label: name,
    type: 'skill',
    capabilityKeys: ['version-control'],
    summary: `Evidence-backed Version Control capability with ${name}.`,
    technologies: [name],
    isPublic: true,
    strength: 'strong',
    supportingEvidenceIds,
  }));
