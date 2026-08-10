import { flexibleInfrastructureEvidenceItems } from './flexible-infrastructure-evidence.data';
import { flexibleInfrastructureSkillEvidenceItems } from './flexible-infrastructure-skill-evidence.data';

const expectedSkills = [
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

describe('flexibleInfrastructureSkillEvidenceItems', () => {
  it('stores the approved skill IDs and titles in display order', () => {
    expect(
      flexibleInfrastructureSkillEvidenceItems.map(({ id, title }) => [
        id,
        title,
      ]),
    ).toEqual(expectedSkills);
  });

  it('links every skill to its approved flexible infrastructure experience', () => {
    for (const skill of flexibleInfrastructureSkillEvidenceItems) {
      expect(skill.supportingEvidenceIds).toEqual(
        expectedSupport[skill.title as keyof typeof expectedSupport],
      );
    }
  });

  it('orders skills by nondecreasing earliest supporting period', () => {
    const experienceById = new Map(
      flexibleInfrastructureEvidenceItems.map((item) => [item.id, item]),
    );
    const earliestDates = flexibleInfrastructureSkillEvidenceItems.map(
      (skill) =>
        skill.supportingEvidenceIds
          ?.map((id) => experienceById.get(id)?.details?.period.startedAt)
          .filter((date): date is string => Boolean(date))
          .sort()[0],
    );

    expect(earliestDates).toEqual([...earliestDates].sort());
  });

  it('exposes public supporting flexible infrastructure skill records', () => {
    for (const skill of flexibleInfrastructureSkillEvidenceItems) {
      expect(skill.type).toBe('skill');
      expect(skill.capabilityKeys).toEqual(['flexible-infrastructure']);
      expect(skill.technologies).toEqual([skill.title]);
      expect(skill.isPublic).toBe(true);
      expect(skill.strength).toBe('supporting');
      expect(skill.date).toBeUndefined();
      expect(skill.endDate).toBeUndefined();
      expect(skill.details).toBeUndefined();
      expect(skill.citationIcon).toBeUndefined();
      expect(skill.issuer).toBeUndefined();
      expect(skill.organization).toBeUndefined();
      expect(skill.learningKind).toBeUndefined();
      expect(skill.proofUrl).toBeUndefined();
      expect(skill.isSensitive).toBeUndefined();
    }
  });

  it('resolves support to public compatible experiences', () => {
    const experienceById = new Map(
      flexibleInfrastructureEvidenceItems.map((item) => [item.id, item]),
    );

    for (const skill of flexibleInfrastructureSkillEvidenceItems) {
      expect(skill.supportingEvidenceIds?.length).toBeGreaterThan(0);

      for (const supportId of skill.supportingEvidenceIds ?? []) {
        const support = experienceById.get(supportId);
        expect(support, `${skill.id} support ${supportId}`).toBeDefined();
        expect(support?.type).toBe('experience');
        expect(support?.isPublic).toBe(true);
        expect(support?.capabilityKeys).toContain('flexible-infrastructure');
      }
    }
  });

  it('keeps public skill text free of sensitive identifiers', () => {
    const publicText = JSON.stringify(flexibleInfrastructureSkillEvidenceItems);

    expect(publicText).not.toMatch(/https?:\/\//);
    expect(publicText).not.toMatch(/\b\d{12}\b/);
    expect(publicText).not.toMatch(/employer|customer|client|organization/i);
  });
});
