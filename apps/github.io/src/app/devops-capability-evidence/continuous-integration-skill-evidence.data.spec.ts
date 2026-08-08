import { continuousIntegrationEvidenceItems } from './continuous-integration-evidence.data';
import { continuousIntegrationSkillEvidenceItems } from './continuous-integration-skill-evidence.data';

const expectedSkills = [
  ['continuous-integration-skill-terraform', 'Terraform'],
  ['continuous-integration-skill-codepipeline', 'AWS CodePipeline'],
  ['continuous-integration-skill-codebuild', 'AWS CodeBuild'],
  ['continuous-integration-skill-ecr', 'Amazon ECR'],
  ['continuous-integration-skill-github', 'GitHub'],
  [
    'continuous-integration-skill-parameter-store',
    'AWS Systems Manager Parameter Store',
  ],
  ['continuous-integration-skill-docker', 'Docker'],
  ['continuous-integration-skill-nx', 'Nx'],
  ['continuous-integration-skill-github-actions', 'GitHub Actions'],
  ['continuous-integration-skill-openid-connect', 'OpenID Connect'],
  ['continuous-integration-skill-kustomize', 'Kustomize'],
  ['continuous-integration-skill-helm', 'Helm'],
  ['continuous-integration-skill-argo-cd', 'Argo CD'],
] as const;

const expectedSupport = {
  'continuous-integration-skill-terraform': ['terraform-codepipeline-platform'],
  'continuous-integration-skill-codepipeline': [
    'terraform-codepipeline-platform',
    'codepipeline-webhook-trunk',
  ],
  'continuous-integration-skill-codebuild': [
    'codebuild-pr-gates',
    'codebuild-feedback-tuning',
    'codebuild-runtime-upgrades',
  ],
  'continuous-integration-skill-ecr': [
    'ecr-immutable-promotion',
    'github-actions-oidc-ecr-publishing',
    'reusable-helm-deployment-image',
  ],
  'continuous-integration-skill-github': [
    'codebuild-pr-gates',
    'nx-affected-quality-gates',
  ],
  'continuous-integration-skill-parameter-store': ['codebuild-postgresql-tests'],
  'continuous-integration-skill-docker': [
    'ecr-immutable-promotion',
    'github-actions-container-verification',
    'github-actions-oidc-ecr-publishing',
    'reusable-helm-deployment-image',
  ],
  'continuous-integration-skill-nx': [
    'nx-monorepo-migration',
    'nx-affected-quality-gates',
  ],
  'continuous-integration-skill-github-actions': [
    'nx-affected-quality-gates',
    'github-actions-oidc-ecr-publishing',
    'github-actions-gitops-handoff',
  ],
  'continuous-integration-skill-openid-connect': [
    'github-actions-oidc-ecr-publishing',
  ],
  'continuous-integration-skill-kustomize': [
    'github-actions-gitops-handoff',
    'kustomize-tag-update-reliability',
  ],
  'continuous-integration-skill-helm': ['reusable-helm-deployment-image'],
  'continuous-integration-skill-argo-cd': ['github-actions-gitops-handoff'],
} as const;

describe('continuousIntegrationSkillEvidenceItems', () => {
  it('stores exactly the approved skills in display order', () => {
    expect(
      continuousIntegrationSkillEvidenceItems.map(({ id, title }) => [
        id,
        title,
      ]),
    ).toEqual(expectedSkills);
  });

  it('stores focused links to real experience evidence', () => {
    const experienceById = new Map(
      continuousIntegrationEvidenceItems.map((item) => [item.id, item]),
    );

    for (const item of continuousIntegrationSkillEvidenceItems) {
      expect(item).toMatchObject({
        label: item.title,
        type: 'skill',
        capabilityKeys: ['continuous-integration'],
        technologies: [item.title],
        isPublic: true,
      });
      expect(item.isSensitive).not.toBe(true);
      expect(item.proofUrl).toBeUndefined();
      expect(item.supportingEvidenceIds).toEqual(
        expectedSupport[item.id as keyof typeof expectedSupport],
      );
      expect(item.supportingEvidenceIds?.length).toBeGreaterThan(0);

      for (const supportId of item.supportingEvidenceIds ?? []) {
        expect(experienceById.get(supportId)?.type).toBe('experience');
      }
    }
  });

  it('keeps ids unique and public text free of private identifiers', () => {
    const ids = continuousIntegrationSkillEvidenceItems.map((item) => item.id);
    const publicText = JSON.stringify(continuousIntegrationSkillEvidenceItems);

    expect(new Set(ids)).toHaveProperty('size', 13);
    expect(publicText).not.toMatch(/https?:\/\//);
    expect(publicText).not.toMatch(/\b\d{12}\b/);
    expect(publicText).not.toMatch(/parameter[- ]?path/i);
    expect(publicText).not.toMatch(/employer|customer|client/i);
  });
});
