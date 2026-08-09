import { continuousDeliveryEvidenceItems } from './continuous-delivery-evidence.data';
import { continuousDeliverySkillEvidenceItems } from './continuous-delivery-skill-evidence.data';
import { continuousIntegrationEvidenceItems } from './continuous-integration-evidence.data';

const expectedSkills = [
  ['continuous-delivery-skill-codepipeline', 'AWS CodePipeline'],
  ['continuous-delivery-skill-github', 'GitHub'],
  ['continuous-delivery-skill-docker', 'Docker'],
  ['continuous-delivery-skill-ecr', 'Amazon ECR'],
  ['continuous-delivery-skill-helm', 'Helm'],
  ['continuous-delivery-skill-eks', 'Amazon EKS'],
  ['continuous-delivery-skill-terraform', 'Terraform'],
  ['continuous-delivery-skill-kubernetes', 'Kubernetes'],
  ['continuous-delivery-skill-github-actions', 'GitHub Actions'],
  ['continuous-delivery-skill-openid-connect', 'OpenID Connect'],
  ['continuous-delivery-skill-nx', 'Nx'],
  ['continuous-delivery-skill-kustomize', 'Kustomize'],
  ['continuous-delivery-skill-argo-cd', 'Argo CD'],
  ['continuous-delivery-skill-sealed-secrets', 'Sealed Secrets'],
] as const;

const expectedSupport = {
  'continuous-delivery-skill-codepipeline': [
    'codepipeline-approval-gated-deployment',
    'terraform-codepipeline-platform',
  ],
  'continuous-delivery-skill-github': [
    'codepipeline-approval-gated-deployment',
    'github-actions-gitops-handoff',
  ],
  'continuous-delivery-skill-docker': [
    'gitops-same-package-environments',
    'reusable-helm-deployment-image',
  ],
  'continuous-delivery-skill-ecr': [
    'ecr-immutable-promotion',
    'gitops-same-package-environments',
  ],
  'continuous-delivery-skill-helm': [
    'codepipeline-approval-gated-deployment',
    'reusable-helm-deployment-image',
  ],
  'continuous-delivery-skill-eks': ['codepipeline-approval-gated-deployment'],
  'continuous-delivery-skill-terraform': [
    'terraform-codepipeline-platform',
    'production-artifacts-version-control',
  ],
  'continuous-delivery-skill-kubernetes': [
    'codepipeline-approval-gated-deployment',
    'argocd-environment-state-from-version-control',
    'argocd-automated-database-migrations',
    'deployment-health-checks',
  ],
  'continuous-delivery-skill-github-actions': [
    'github-actions-gitops-handoff',
    'serialized-deployment-process',
    'deployment-failure-notification',
  ],
  'continuous-delivery-skill-openid-connect': ['github-actions-gitops-handoff'],
  'continuous-delivery-skill-nx': ['github-actions-gitops-handoff'],
  'continuous-delivery-skill-kustomize': [
    'github-actions-gitops-handoff',
    'argocd-environment-state-from-version-control',
    'gitops-same-package-environments',
  ],
  'continuous-delivery-skill-argo-cd': [
    'argocd-environment-state-from-version-control',
    'argocd-automated-database-migrations',
  ],
  'continuous-delivery-skill-sealed-secrets': [
    'sealed-secrets-version-control',
  ],
} as const;

describe('continuousDeliverySkillEvidenceItems', () => {
  it('stores exactly the approved skills in display order', () => {
    expect(
      continuousDeliverySkillEvidenceItems.map(({ id, title }) => [id, title]),
    ).toEqual(expectedSkills);
  });

  it('links every skill to the approved focused experience set', () => {
    for (const skill of continuousDeliverySkillEvidenceItems) {
      expect(skill.supportingEvidenceIds).toEqual(
        expectedSupport[skill.id as keyof typeof expectedSupport],
      );
    }
  });

  it('orders skills by earliest supporting period and delivery flow', () => {
    const experienceById = new Map(
      [
        ...continuousIntegrationEvidenceItems,
        ...continuousDeliveryEvidenceItems,
      ].map((item) => [item.id, item]),
    );
    const earliestDates = continuousDeliverySkillEvidenceItems.map(
      (skill) =>
        skill.supportingEvidenceIds
          ?.map((id) => experienceById.get(id)?.details?.period.startedAt)
          .filter((date): date is string => Boolean(date))
          .sort()[0],
    );

    expect(earliestDates).toEqual([
      '2019-07-05',
      '2019-07-05',
      '2019-07-05',
      '2019-07-05',
      '2019-07-05',
      '2019-07-05',
      '2019-07-05',
      '2019-07-05',
      '2024-05-10',
      '2024-05-10',
      '2024-05-10',
      '2024-05-10',
      '2024-06-03',
      '2024-06-03',
    ]);
  });

  it('supports every skill with public non-skill CD experience', () => {
    const experienceById = new Map(
      [
        ...continuousIntegrationEvidenceItems,
        ...continuousDeliveryEvidenceItems,
      ].map((item) => [item.id, item]),
    );

    for (const skill of continuousDeliverySkillEvidenceItems) {
      expect(skill.type).toBe('skill');
      expect(skill.capabilityKeys).toEqual(['continuous-delivery']);
      expect(skill.supportingEvidenceIds?.length).toBeGreaterThan(0);

      for (const supportId of skill.supportingEvidenceIds ?? []) {
        const support = experienceById.get(supportId);
        expect(support, `${skill.id} support ${supportId}`).toBeDefined();
        expect(support?.type).toBe('experience');
        expect(support?.isPublic).toBe(true);
        expect(support?.capabilityKeys).toContain('continuous-delivery');
      }
    }
  });

  it('keeps skill text public-safe', () => {
    const publicText = JSON.stringify(continuousDeliverySkillEvidenceItems);

    expect(publicText).not.toMatch(/https?:\/\//);
    expect(publicText).not.toMatch(/\b\d{12}\b/);
    expect(publicText).not.toMatch(/employer|customer|client|organization/i);
  });
});
