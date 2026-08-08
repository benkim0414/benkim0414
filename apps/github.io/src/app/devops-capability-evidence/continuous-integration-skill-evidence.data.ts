import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const continuousIntegrationSkillDefinitions = [
  {
    id: 'continuous-integration-skill-codepipeline',
    name: 'AWS CodePipeline',
    supportingEvidenceIds: [
      'terraform-codepipeline-platform',
      'codepipeline-webhook-trunk',
    ],
  },
  {
    id: 'continuous-integration-skill-github',
    name: 'GitHub',
    supportingEvidenceIds: [
      'codebuild-pr-gates',
      'nx-affected-quality-gates',
    ],
  },
  {
    id: 'continuous-integration-skill-codebuild',
    name: 'AWS CodeBuild',
    supportingEvidenceIds: [
      'codebuild-pr-gates',
      'codebuild-feedback-tuning',
      'codebuild-runtime-upgrades',
    ],
  },
  {
    id: 'continuous-integration-skill-parameter-store',
    name: 'AWS Systems Manager Parameter Store',
    supportingEvidenceIds: ['codebuild-postgresql-tests'],
  },
  {
    id: 'continuous-integration-skill-terraform',
    name: 'Terraform',
    supportingEvidenceIds: ['terraform-codepipeline-platform'],
  },
  {
    id: 'continuous-integration-skill-docker',
    name: 'Docker',
    supportingEvidenceIds: [
      'ecr-immutable-promotion',
      'github-actions-container-verification',
      'github-actions-oidc-ecr-publishing',
      'reusable-helm-deployment-image',
    ],
  },
  {
    id: 'continuous-integration-skill-ecr',
    name: 'Amazon ECR',
    supportingEvidenceIds: [
      'ecr-immutable-promotion',
      'github-actions-oidc-ecr-publishing',
      'reusable-helm-deployment-image',
    ],
  },
  {
    id: 'continuous-integration-skill-helm',
    name: 'Helm',
    supportingEvidenceIds: ['reusable-helm-deployment-image'],
  },
  {
    id: 'continuous-integration-skill-nx',
    name: 'Nx',
    supportingEvidenceIds: [
      'nx-monorepo-migration',
      'nx-affected-quality-gates',
    ],
  },
  {
    id: 'continuous-integration-skill-github-actions',
    name: 'GitHub Actions',
    supportingEvidenceIds: [
      'nx-affected-quality-gates',
      'github-actions-oidc-ecr-publishing',
      'github-actions-gitops-handoff',
    ],
  },
  {
    id: 'continuous-integration-skill-openid-connect',
    name: 'OpenID Connect',
    supportingEvidenceIds: ['github-actions-oidc-ecr-publishing'],
  },
  {
    id: 'continuous-integration-skill-kustomize',
    name: 'Kustomize',
    supportingEvidenceIds: [
      'github-actions-gitops-handoff',
      'kustomize-tag-update-reliability',
    ],
  },
  {
    id: 'continuous-integration-skill-argo-cd',
    name: 'Argo CD',
    supportingEvidenceIds: ['github-actions-gitops-handoff'],
  },
] as const;

export const continuousIntegrationSkillEvidenceItems: readonly CapabilityEvidenceItem[] =
  continuousIntegrationSkillDefinitions.map(
    ({ id, name, supportingEvidenceIds }) => ({
      id,
      title: name,
      label: name,
      type: 'skill',
      capabilityKeys: ['continuous-integration'],
      summary: `Evidence-backed Continuous Integration capability with ${name}.`,
      technologies: [name],
      isPublic: true,
      strength: 'strong',
      supportingEvidenceIds,
    }),
  );
