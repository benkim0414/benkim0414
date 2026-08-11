import { continuousDeliveryEvidenceItems } from './continuous-delivery-evidence.data';
import { continuousDeliverySkillEvidenceItems } from './continuous-delivery-skill-evidence.data';
import { continuousIntegrationEvidenceItems } from './continuous-integration-evidence.data';
import { continuousIntegrationSkillEvidenceItems } from './continuous-integration-skill-evidence.data';
import { deploymentAutomationEvidenceItems } from './deployment-automation-evidence.data';
import { deploymentAutomationSkillEvidenceItems } from './deployment-automation-skill-evidence.data';
import { documentationQualityEvidenceItems } from './documentation-quality-evidence.data';
import { documentationQualitySkillEvidenceItems } from './documentation-quality-skill-evidence.data';
import { flexibleInfrastructureEvidenceItems } from './flexible-infrastructure-evidence.data';
import { flexibleInfrastructureSkillEvidenceItems } from './flexible-infrastructure-skill-evidence.data';
import { kubernetesCertificationEvidenceItems } from './kubernetes-certification-evidence.data';
import { monitoringObservabilityEvidenceItems } from './monitoring-observability-evidence.data';
import { monitoringObservabilitySkillEvidenceItems } from './monitoring-observability-skill-evidence.data';
import { pervasiveSecurityEvidenceItems } from './pervasive-security-evidence.data';
import { pervasiveSecuritySkillEvidenceItems } from './pervasive-security-skill-evidence.data';
import { testAutomationEvidenceItems } from './test-automation-evidence.data';
import { testAutomationSkillEvidenceItems } from './test-automation-skill-evidence.data';
import { trunkBasedDevelopmentEvidenceItems } from './trunk-based-development-evidence.data';
import { trunkBasedDevelopmentSkillEvidenceItems } from './trunk-based-development-skill-evidence.data';
import { versionControlEvidenceItems } from './version-control-evidence.data';
import { versionControlSkillEvidenceItems } from './version-control-skill-evidence.data';
import type {
  CapabilityEvidenceItem,
  DoraCapabilityDefinition,
  DoraCapabilityScore,
  EvidenceType,
} from './devops-capability-evidence.types';

export const doraCapabilityDefinitions = [
  {
    key: 'continuous-delivery',
    label: 'Continuous Delivery',
    shortLabel: 'Delivery',
  },
  {
    key: 'deployment-automation',
    label: 'Deployment Automation',
    shortLabel: 'Deploys',
  },
  {
    key: 'continuous-integration',
    label: 'Continuous Integration',
    shortLabel: 'CI',
  },
  { key: 'test-automation', label: 'Test Automation', shortLabel: 'Tests' },
  {
    key: 'monitoring-observability',
    label: 'Monitoring and Observability',
    shortLabel: 'Observability',
  },
  {
    key: 'flexible-infrastructure',
    label: 'Flexible Infrastructure',
    shortLabel: 'Infrastructure',
  },
  {
    key: 'pervasive-security',
    label: 'Pervasive Security',
    shortLabel: 'Security',
  },
  {
    key: 'trunk-based-development',
    label: 'Trunk-Based Development',
    shortLabel: 'Trunk',
  },
  {
    key: 'documentation-quality',
    label: 'Documentation Quality',
    shortLabel: 'Docs',
  },
  {
    key: 'version-control',
    label: 'Version Control',
    shortLabel: 'Versioning',
  },
] as const satisfies readonly DoraCapabilityDefinition[];

export const curatedDevOpsCapabilityRadarScores = [
  {
    capabilityKey: 'version-control',
    label: 'Versioning',
    score: 4,
    maxScore: 5,
    evidenceIds: [
      'terraform-codepipeline-platform',
      'github-actions-gitops-handoff',
      'argocd-environment-state-from-version-control',
      'argocd-automated-database-migrations',
      'merge-commit-history',
      'version-control-skill-git',
      'version-control-skill-github',
      'version-control-skill-codepipeline',
      'version-control-skill-terraform',
      'version-control-skill-docker',
      'version-control-skill-helm',
      'version-control-skill-conventional-commits',
      'version-control-skill-husky',
      'version-control-skill-nx',
      'version-control-skill-github-actions',
      'version-control-skill-kustomize',
      'version-control-skill-argo-cd',
      'version-control-skill-kubernetes',
    ],
    strongestEvidenceId: 'terraform-codepipeline-platform',
    evidenceCounts: { experience: 5, skill: 13 },
    evidenceSummary:
      'Built and maintained version-controlled delivery platforms spanning reusable Terraform pipelines and GitOps-managed Kubernetes environments, with traceable infrastructure, configuration, automation, and database changes.',
  },
  {
    capabilityKey: 'trunk-based-development',
    label: 'Trunk',
    score: 4,
    maxScore: 5,
    evidenceIds: [
      'single-trunk-repository-flow',
      'short-lived-branch-flow',
      'small-change-landings',
      'nx-affected-quality-gates',
      'merge-commit-history',
      'trunk-based-development-skill-git',
      'trunk-based-development-skill-github',
      'trunk-based-development-skill-nx',
      'trunk-based-development-skill-github-actions',
      'trunk-based-development-skill-conventional-commits',
      'trunk-based-development-skill-husky',
    ],
    strongestEvidenceId: 'single-trunk-repository-flow',
    evidenceCounts: { experience: 5, skill: 6 },
    evidenceSummary:
      'Created and maintained single-trunk delivery repositories, integrating short-lived branches and small change batches with merge-preserved history and affected quality gates.',
  },
  {
    capabilityKey: 'continuous-integration',
    label: 'CI',
    score: 4,
    maxScore: 5,
    evidenceIds: [
      'terraform-codepipeline-platform',
      'codebuild-pr-gates',
      'nx-affected-quality-gates',
      'github-actions-gitops-handoff',
      'kustomize-tag-update-reliability',
      ...continuousIntegrationSkillEvidenceItems.map((item) => item.id),
    ],
    strongestEvidenceId: 'terraform-codepipeline-platform',
    evidenceCounts: { experience: 5, skill: 13 },
    evidenceSummary:
      'Built and evolved CI from reusable AWS CodePipeline and CodeBuild pipelines to monorepo GitHub Actions, with affected quality gates and immutable artifacts.',
  },
  {
    capabilityKey: 'test-automation',
    label: 'Tests',
    score: 3,
    maxScore: 5,
    evidenceIds: [
      'jest-testcontainers-postgres',
      'prometheus-alert-rule-tests',
      'container-health-smoke-tests',
      'service-generator-unit-tests',
      'nx-affected-quality-gates',
      'test-automation-skill-aws-codebuild',
      'test-automation-skill-postgresql',
      'test-automation-skill-parameter-store',
      'test-automation-skill-jest',
      'test-automation-skill-testcontainers',
      'test-automation-skill-nx',
      'test-automation-skill-github-actions',
      'test-automation-skill-docker',
      'test-automation-skill-typescript',
      'test-automation-skill-prometheus',
      'test-automation-skill-promtool',
    ],
    strongestEvidenceId: 'jest-testcontainers-postgres',
    evidenceCounts: { experience: 5, skill: 11 },
    evidenceSummary:
      'Built automated test coverage across database-backed services, affected quality gates, service generators, Prometheus rules, and container health checks.',
  },
  {
    capabilityKey: 'pervasive-security',
    label: 'Security',
    score: 2,
    maxScore: 5,
    evidenceIds: [
      'terraform-scoped-iam',
      'iam-mfa-coverage',
      'iam-security-alerting',
      'irsa-service-accounts',
      'automated-sealed-secret-delivery',
      'pervasive-security-skill-terraform',
      'pervasive-security-skill-aws-iam',
      'pervasive-security-skill-irsa',
      'pervasive-security-skill-openid-connect',
      'pervasive-security-skill-kubernetes',
      'pervasive-security-skill-kubernetes-rbac',
      'pervasive-security-skill-sealed-secrets',
      'pervasive-security-skill-argo-cd',
      'pervasive-security-skill-aws-eventbridge',
      'pervasive-security-skill-aws-lambda',
      'pervasive-security-skill-docker',
      'pervasive-security-skill-amazon-ecr',
    ],
    strongestEvidenceId: 'terraform-scoped-iam',
    evidenceCounts: { experience: 5, skill: 12 },
    evidenceSummary:
      'Implemented Terraform-managed least-privilege access, complete MFA coverage, identity security alerting, IRSA workload identity, and encrypted secret delivery.',
  },
  {
    capabilityKey: 'continuous-delivery',
    label: 'Delivery',
    score: 4,
    maxScore: 5,
    evidenceIds: [
      'codepipeline-approval-gated-deployment',
      'github-actions-gitops-handoff',
      'argocd-environment-state-from-version-control',
      'gitops-same-package-environments',
      'argocd-automated-database-migrations',
      ...continuousDeliverySkillEvidenceItems.map((item) => item.id),
    ],
    strongestEvidenceId: 'codepipeline-approval-gated-deployment',
    evidenceCounts: { experience: 5, skill: 14 },
    evidenceSummary:
      'Built approval-gated and GitOps delivery across AWS CodePipeline and GitHub Actions, with immutable artifacts, automated migrations, and reliable Kubernetes reconciliation.',
  },
  {
    capabilityKey: 'deployment-automation',
    label: 'Deploys',
    score: 4,
    maxScore: 5,
    evidenceIds: [
      'merge-triggered-deployment-path',
      'environment-neutral-deployment-mechanism',
      'generator-based-service-onboarding',
      'automated-sealed-secret-delivery',
      'deterministic-kubernetes-overlays',
      'deployment-automation-skill-aws-codepipeline',
      'deployment-automation-skill-terraform',
      'deployment-automation-skill-github-actions',
      'deployment-automation-skill-argo-cd',
      'deployment-automation-skill-gitops',
      'deployment-automation-skill-docker',
      'deployment-automation-skill-amazon-ecr',
      'deployment-automation-skill-kubernetes',
      'deployment-automation-skill-openid-connect',
      'deployment-automation-skill-nx',
      'deployment-automation-skill-github-api',
      'deployment-automation-skill-kustomize',
      'deployment-automation-skill-sealed-secrets',
    ],
    strongestEvidenceId: 'merge-triggered-deployment-path',
    evidenceCounts: { experience: 5, skill: 13 },
    evidenceSummary:
      'Built merge-triggered deployment automation across environments, with generator-based onboarding, automated secret delivery, and deterministic Kubernetes rendering.',
  },
  {
    capabilityKey: 'flexible-infrastructure',
    label: 'Infrastructure',
    score: 4,
    maxScore: 5,
    evidenceIds: [
      'terraform-managed-cloud-foundations',
      'irsa-service-accounts',
      'terraform-scoped-iam',
      'terraform-codepipeline-platform',
      'argocd-environment-state-from-version-control',
      'flexible-infrastructure-skill-terraform',
      'flexible-infrastructure-skill-aws',
      'flexible-infrastructure-skill-kubernetes',
      'flexible-infrastructure-skill-kubectl',
      'flexible-infrastructure-skill-helm',
      'flexible-infrastructure-skill-docker',
      'flexible-infrastructure-skill-amazon-ecr',
      'flexible-infrastructure-skill-aws-iam',
      'flexible-infrastructure-skill-irsa',
      'flexible-infrastructure-skill-kustomize',
      'flexible-infrastructure-skill-argo-cd',
      'flexible-infrastructure-skill-gitops',
    ],
    strongestEvidenceId: 'terraform-managed-cloud-foundations',
    evidenceCounts: { experience: 5, skill: 12 },
    evidenceSummary:
      'Built reusable Terraform and Kubernetes foundations with workload identity, scoped IAM, delivery-platform provisioning, and GitOps-managed environments.',
  },
  {
    capabilityKey: 'monitoring-observability',
    label: 'Observability',
    score: 3,
    maxScore: 5,
    evidenceIds: [
      'version-controlled-observability-stack',
      'tested-kubernetes-workload-alerts',
      'alertmanager-notification-routing',
      'alert-suppression-controls',
      'encrypted-alert-destinations',
      'monitoring-observability-skill-prometheus',
      'monitoring-observability-skill-promtool',
      'monitoring-observability-skill-alertmanager',
      'monitoring-observability-skill-loki',
      'monitoring-observability-skill-grafana',
      'monitoring-observability-skill-grafana-alloy',
      'monitoring-observability-skill-kubernetes',
      'monitoring-observability-skill-helm',
      'monitoring-observability-skill-argo-cd',
      'monitoring-observability-skill-kustomize',
      'monitoring-observability-skill-sealed-secrets',
      'monitoring-observability-skill-aws-eventbridge',
      'monitoring-observability-skill-aws-lambda',
    ],
    strongestEvidenceId: 'version-controlled-observability-stack',
    evidenceCounts: { experience: 5, skill: 13 },
    evidenceSummary:
      'Built a version-controlled cloud native observability platform with tested workload alerts, routed notifications, suppression controls, and encrypted alert destinations.',
  },
  {
    capabilityKey: 'documentation-quality',
    label: 'Docs',
    score: 4,
    maxScore: 5,
    evidenceIds: [
      'structured-documentation-corpus',
      'indexed-solution-documentation',
      'current-documentation-maintenance',
      'documentation-change-integration',
      'cross-verified-documentation-claims',
      'documentation-quality-skill-markdown',
      'documentation-quality-skill-yaml',
      'documentation-quality-skill-git',
    ],
    strongestEvidenceId: 'structured-documentation-corpus',
    evidenceCounts: { experience: 5, skill: 3 },
    evidenceSummary:
      'Maintained a structured, indexed, and current documentation system, integrating documentation with engineering changes and cross-verifying operational claims.',
  },
] as const satisfies readonly DoraCapabilityScore[];

export const evidenceTypeLabels = {
  skill: 'Skills',
  learning: 'Learning',
  experience: 'Experience',
  education: 'Education',
  certification: 'Certifications',
  project: 'Projects',
} as const satisfies Record<EvidenceType, string>;

export function composeCanonicalCapabilityEvidenceItems(
  items: readonly CapabilityEvidenceItem[],
): readonly CapabilityEvidenceItem[] {
  const canonicalItemsById = new Map<string, CapabilityEvidenceItem>();
  const catalog: CapabilityEvidenceItem[] = [];

  for (const item of items) {
    const existing = canonicalItemsById.get(item.id);

    if (!existing) {
      canonicalItemsById.set(item.id, item);
      catalog.push(item);
      continue;
    }

    if (existing !== item) {
      throw new Error(
        `Conflicting duplicate capability evidence ID: ${item.id}`,
      );
    }
  }

  return catalog;
}

export const devOpsCapabilityEvidenceItems: readonly CapabilityEvidenceItem[] =
  composeCanonicalCapabilityEvidenceItems([
    ...continuousIntegrationEvidenceItems,
    ...continuousIntegrationSkillEvidenceItems,
    ...continuousDeliveryEvidenceItems,
    ...continuousDeliverySkillEvidenceItems,
    ...versionControlEvidenceItems,
    ...versionControlSkillEvidenceItems,
    ...trunkBasedDevelopmentEvidenceItems,
    ...trunkBasedDevelopmentSkillEvidenceItems,
    ...deploymentAutomationEvidenceItems,
    ...deploymentAutomationSkillEvidenceItems,
    ...flexibleInfrastructureEvidenceItems,
    ...flexibleInfrastructureSkillEvidenceItems,
    ...testAutomationEvidenceItems,
    ...testAutomationSkillEvidenceItems,
    ...monitoringObservabilityEvidenceItems,
    ...monitoringObservabilitySkillEvidenceItems,
    ...pervasiveSecurityEvidenceItems,
    ...pervasiveSecuritySkillEvidenceItems,
    ...documentationQualityEvidenceItems,
    ...documentationQualitySkillEvidenceItems,
    ...kubernetesCertificationEvidenceItems,
    {
      id: 'kubernetes-workloads',
      title: 'Kubernetes workload practice',
      label: 'Workloads',
      type: 'learning',
      date: '2026-03-01',
      endDate: '2026-04-05',
      capabilityKeys: ['flexible-infrastructure'],
      summary:
        'Practiced Kubernetes workloads and services as part of an operations-focused learning path.',
      technologies: ['Kubernetes'],
      isPublic: true,
      strength: 'strong',
    },
    {
      id: 'kubectl-troubleshooting',
      title: 'kubectl troubleshooting practice',
      label: 'kubectl',
      type: 'learning',
      date: '2026-03-01',
      endDate: '2026-04-05',
      capabilityKeys: ['flexible-infrastructure', 'monitoring-observability'],
      summary:
        'Practiced kubectl workflows and troubleshooting patterns for Kubernetes operational diagnosis.',
      technologies: ['Kubernetes', 'kubectl'],
      isPublic: true,
      strength: 'strong',
    },
    {
      id: 'cluster-operations',
      title: 'Kubernetes cluster operations practice',
      label: 'Cluster ops',
      type: 'learning',
      date: '2026-03-01',
      endDate: '2026-04-05',
      capabilityKeys: ['flexible-infrastructure', 'monitoring-observability'],
      summary:
        'Practiced Kubernetes cluster operations that connect infrastructure management with observability-oriented workflows.',
      technologies: ['Kubernetes'],
      isPublic: true,
      strength: 'strong',
    },
    {
      id: 'portfolio-radar',
      title: 'DevOps capability portfolio radar',
      label: 'Portfolio radar',
      type: 'project',
      proofUrl: 'https://github.com/benkim0414/benkim0414',
      capabilityKeys: ['documentation-quality'],
      summary:
        'Built a portfolio visualization that maps DevOps topics, skills, certifications, and capability evidence.',
      technologies: ['React', 'TypeScript', 'Nx'],
      isPublic: true,
      strength: 'strong',
    },
    {
      id: 'roadmap-repository',
      title: 'DevOps roadmap repository',
      label: 'Roadmap repo',
      type: 'project',
      proofUrl: 'https://github.com/benkim0414/benkim0414',
      capabilityKeys: ['documentation-quality', 'version-control'],
      summary:
        'Maintained the portfolio roadmap source in version control with structured documentation-oriented project data.',
      technologies: ['GitHub', 'TypeScript', 'Nx'],
      isPublic: true,
      strength: 'strong',
    },
    {
      id: 'kubernetes-skill',
      title: 'Kubernetes',
      type: 'skill',
      capabilityKeys: ['flexible-infrastructure', 'monitoring-observability'],
      summary:
        'Kubernetes skill shown because it is backed by learning and operations evidence.',
      technologies: ['Kubernetes'],
      isPublic: true,
      strength: 'supporting',
      supportingEvidenceIds: [
        'kubernetes-workloads',
        'kubectl-troubleshooting',
        'cluster-operations',
      ],
    },
  ] as const satisfies readonly CapabilityEvidenceItem[]);
