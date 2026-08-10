import { pervasiveSecurityEvidenceItems } from './pervasive-security-evidence.data';
import { pervasiveSecuritySkillEvidenceItems } from './pervasive-security-skill-evidence.data';
import { expectPublicSafeEvidence } from './public-evidence-safety.test-helpers';

const expectedSkillSet = [
  ['pervasive-security-skill-terraform', 'Terraform'],
  ['pervasive-security-skill-aws-iam', 'AWS IAM'],
  ['pervasive-security-skill-irsa', 'IRSA'],
  ['pervasive-security-skill-openid-connect', 'OpenID Connect'],
  ['pervasive-security-skill-kubernetes', 'Kubernetes'],
  ['pervasive-security-skill-kubernetes-rbac', 'Kubernetes RBAC'],
  ['pervasive-security-skill-sealed-secrets', 'Sealed Secrets'],
  ['pervasive-security-skill-argo-cd', 'Argo CD'],
  ['pervasive-security-skill-aws-eventbridge', 'AWS EventBridge'],
  ['pervasive-security-skill-aws-lambda', 'AWS Lambda'],
  ['pervasive-security-skill-docker', 'Docker'],
  ['pervasive-security-skill-amazon-ecr', 'Amazon ECR'],
] as const;

const expectedSupport = {
  'pervasive-security-skill-terraform': [
    'terraform-scoped-iam',
    'irsa-service-accounts',
  ],
  'pervasive-security-skill-aws-iam': [
    'terraform-scoped-iam',
    'iam-mfa-coverage',
    'irsa-service-accounts',
  ],
  'pervasive-security-skill-irsa': ['irsa-service-accounts'],
  'pervasive-security-skill-openid-connect': ['irsa-service-accounts'],
  'pervasive-security-skill-kubernetes': [
    'irsa-service-accounts',
    'automated-sealed-secret-delivery',
    'kubernetes-rbac-governance',
  ],
  'pervasive-security-skill-kubernetes-rbac': ['kubernetes-rbac-governance'],
  'pervasive-security-skill-sealed-secrets': [
    'automated-sealed-secret-delivery',
  ],
  'pervasive-security-skill-argo-cd': ['automated-sealed-secret-delivery'],
  'pervasive-security-skill-aws-eventbridge': ['iam-security-alerting'],
  'pervasive-security-skill-aws-lambda': ['iam-security-alerting'],
  'pervasive-security-skill-docker': ['image-digest-deployments'],
  'pervasive-security-skill-amazon-ecr': ['image-digest-deployments'],
} as const;

const approvedPublicSkillText = [
  'Terraform',
  'Evidence-backed Pervasive Security capability with Terraform.',
  'AWS IAM',
  'Evidence-backed Pervasive Security capability with AWS IAM.',
  'IRSA',
  'Evidence-backed Pervasive Security capability with IRSA.',
  'OpenID Connect',
  'Evidence-backed Pervasive Security capability with OpenID Connect.',
  'Kubernetes',
  'Evidence-backed Pervasive Security capability with Kubernetes.',
  'Kubernetes RBAC',
  'Evidence-backed Pervasive Security capability with Kubernetes RBAC.',
  'Sealed Secrets',
  'Evidence-backed Pervasive Security capability with Sealed Secrets.',
  'Argo CD',
  'Evidence-backed Pervasive Security capability with Argo CD.',
  'AWS EventBridge',
  'Evidence-backed Pervasive Security capability with AWS EventBridge.',
  'AWS Lambda',
  'Evidence-backed Pervasive Security capability with AWS Lambda.',
  'Docker',
  'Evidence-backed Pervasive Security capability with Docker.',
  'Amazon ECR',
  'Evidence-backed Pervasive Security capability with Amazon ECR.',
] as const;

describe('pervasiveSecuritySkillEvidenceItems', () => {
  it('stores exactly the approved skill IDs and titles in workflow order', () => {
    expect(
      pervasiveSecuritySkillEvidenceItems.map(({ id, title }) => [id, title]),
    ).toEqual(expectedSkillSet);
  });

  it('orders skills by earliest support date while keeping workflow ties stable', () => {
    const experienceById = new Map(
      pervasiveSecurityEvidenceItems.map((item) => [item.id, item]),
    );
    const chronology = pervasiveSecuritySkillEvidenceItems.map((skill) => {
      const supportDates = (skill.supportingEvidenceIds ?? []).map(
        (supportId) => experienceById.get(supportId)?.details?.period.startedAt,
      );
      const earliestSupportDate = supportDates.reduce<string | undefined>(
        (earliest, date) =>
          date && (!earliest || date < earliest) ? date : earliest,
        undefined,
      );

      return [skill.title, earliestSupportDate];
    });

    expect(chronology).toEqual([
      ['Terraform', '2024-06-03'],
      ['AWS IAM', '2024-06-03'],
      ['IRSA', '2024-06-03'],
      ['OpenID Connect', '2024-06-03'],
      ['Kubernetes', '2024-06-03'],
      ['Kubernetes RBAC', '2024-06-03'],
      ['Sealed Secrets', '2024-06-03'],
      ['Argo CD', '2024-06-03'],
      ['AWS EventBridge', '2024-06-03'],
      ['AWS Lambda', '2024-06-03'],
      ['Docker', '2024-06-03'],
      ['Amazon ECR', '2024-06-03'],
    ]);
  });

  it('links each public skill to its approved public Pervasive Security experience', () => {
    const experienceById = new Map(
      pervasiveSecurityEvidenceItems.map((item) => [item.id, item]),
    );

    for (const skill of pervasiveSecuritySkillEvidenceItems) {
      expect(skill).toMatchObject({
        label: skill.title,
        type: 'skill',
        capabilityKeys: ['pervasive-security'],
        technologies: [skill.title],
        isPublic: true,
        strength: 'supporting',
      });
      expect(skill.isSensitive).not.toBe(true);
      expect(skill.date).toBeUndefined();
      expect(skill.endDate).toBeUndefined();
      expect(skill.details).toBeUndefined();
      expect(skill.organization).toBeUndefined();
      expect(skill.proofUrl).toBeUndefined();
      expect(skill.supportingEvidenceIds).toEqual(
        expectedSupport[skill.id as keyof typeof expectedSupport],
      );
      expect(skill.supportingEvidenceIds?.length).toBeGreaterThan(0);

      for (const supportId of skill.supportingEvidenceIds ?? []) {
        const support = experienceById.get(supportId);
        expect(support, `${skill.id} support ${supportId}`).toBeDefined();
        expect(support?.type).toBe('experience');
        expect(support?.type).not.toBe('skill');
        expect(support?.isPublic).toBe(true);
        expect(support?.capabilityKeys).toContain('pervasive-security');
      }
    }
  });

  it('keeps the published skill catalog public-safe and reviewable', () => {
    expectPublicSafeEvidence(
      pervasiveSecuritySkillEvidenceItems,
      approvedPublicSkillText,
    );
  });
});
