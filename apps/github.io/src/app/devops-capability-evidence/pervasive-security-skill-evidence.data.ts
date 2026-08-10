import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const pervasiveSecuritySkillDefinitions = [
  {
    id: 'pervasive-security-skill-terraform',
    name: 'Terraform',
    supports: ['terraform-scoped-iam', 'irsa-service-accounts'],
  },
  {
    id: 'pervasive-security-skill-aws-iam',
    name: 'AWS IAM',
    supports: [
      'terraform-scoped-iam',
      'iam-mfa-coverage',
      'irsa-service-accounts',
    ],
  },
  {
    id: 'pervasive-security-skill-irsa',
    name: 'IRSA',
    supports: ['irsa-service-accounts'],
  },
  {
    id: 'pervasive-security-skill-openid-connect',
    name: 'OpenID Connect',
    supports: ['irsa-service-accounts'],
  },
  {
    id: 'pervasive-security-skill-kubernetes',
    name: 'Kubernetes',
    supports: [
      'irsa-service-accounts',
      'automated-sealed-secret-delivery',
      'kubernetes-rbac-governance',
    ],
  },
  {
    id: 'pervasive-security-skill-kubernetes-rbac',
    name: 'Kubernetes RBAC',
    supports: ['kubernetes-rbac-governance'],
  },
  {
    id: 'pervasive-security-skill-sealed-secrets',
    name: 'Sealed Secrets',
    supports: ['automated-sealed-secret-delivery'],
  },
  {
    id: 'pervasive-security-skill-argo-cd',
    name: 'Argo CD',
    supports: ['automated-sealed-secret-delivery'],
  },
  {
    id: 'pervasive-security-skill-aws-eventbridge',
    name: 'AWS EventBridge',
    supports: ['iam-security-alerting'],
  },
  {
    id: 'pervasive-security-skill-aws-lambda',
    name: 'AWS Lambda',
    supports: ['iam-security-alerting'],
  },
  {
    id: 'pervasive-security-skill-docker',
    name: 'Docker',
    supports: ['image-digest-deployments'],
  },
  {
    id: 'pervasive-security-skill-amazon-ecr',
    name: 'Amazon ECR',
    supports: ['image-digest-deployments'],
  },
] as const;

export const pervasiveSecuritySkillEvidenceItems: readonly CapabilityEvidenceItem[] =
  pervasiveSecuritySkillDefinitions.map(({ id, name, supports }) => ({
    id,
    title: name,
    label: name,
    type: 'skill',
    capabilityKeys: ['pervasive-security'],
    summary: `Evidence-backed Pervasive Security capability with ${name}.`,
    technologies: [name],
    isPublic: true,
    strength: 'supporting',
    supportingEvidenceIds: supports,
  }));
