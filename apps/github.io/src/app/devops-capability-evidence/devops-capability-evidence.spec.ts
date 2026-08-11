import { existsSync, readFileSync } from 'node:fs';
import * as ts from 'typescript';
import {
  composeCanonicalCapabilityEvidenceItems,
  curatedDevOpsCapabilityRadarScores,
  doraCapabilityDefinitions,
  evidenceTypeLabels,
  devOpsCapabilityEvidenceItems,
} from './devops-capability-evidence.data';
import { continuousDeliveryEvidenceItems } from './continuous-delivery-evidence.data';
import { continuousDeliverySkillEvidenceItems } from './continuous-delivery-skill-evidence.data';
import { continuousIntegrationSkillEvidenceItems } from './continuous-integration-skill-evidence.data';
import { continuousIntegrationEvidenceItems } from './continuous-integration-evidence.data';
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
import { expectPublicSafeText } from './public-evidence-safety.test-helpers';
import { testAutomationEvidenceItems } from './test-automation-evidence.data';
import { testAutomationSkillEvidenceItems } from './test-automation-skill-evidence.data';
import { trunkBasedDevelopmentEvidenceItems } from './trunk-based-development-evidence.data';
import { versionControlEvidenceItems } from './version-control-evidence.data';
import {
  getCapabilityEvidenceMatrix,
  getCapabilityEvidenceScores,
  getEvidenceTypeCounts,
  getPublicCapabilityEvidence,
} from './devops-capability-evidence.scoring';
import {
  getCapabilityScoreSummary,
  getEvidenceTypeSummary,
} from './devops-capability-evidence.summary';
import { getDoraCapabilityCardEvidenceRows } from './dora-capability-card.evidence';

const deploymentAutomationExperienceIds = [
  'merge-triggered-deployment-path',
  'environment-neutral-deployment-mechanism',
  'generator-based-service-onboarding',
  'automated-sealed-secret-delivery',
  'deterministic-kubernetes-overlays',
] as const;

const deploymentAutomationScoreEvidenceIds = [
  'merge-triggered-deployment-path',
  'environment-neutral-deployment-mechanism',
  'generator-based-service-onboarding',
  'automated-sealed-secret-delivery',
  'deterministic-kubernetes-overlays',
  'cncf-ckad-certification',
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
] as const;

const flexibleInfrastructureExperienceIds = [
  'terraform-managed-cloud-foundations',
  'irsa-service-accounts',
  'terraform-scoped-iam',
  'terraform-codepipeline-platform',
  'argocd-environment-state-from-version-control',
] as const;

const flexibleInfrastructureScoreEvidenceIds = [
  'terraform-managed-cloud-foundations',
  'irsa-service-accounts',
  'terraform-scoped-iam',
  'terraform-codepipeline-platform',
  'argocd-environment-state-from-version-control',
  'cncf-kcna-certification',
  'cncf-cka-certification',
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
] as const;

const remainingCapabilityScoreContracts = {
  'test-automation': {
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
  'monitoring-observability': {
    score: 3,
    maxScore: 5,
    evidenceIds: [
      'version-controlled-observability-stack',
      'tested-kubernetes-workload-alerts',
      'alertmanager-notification-routing',
      'alert-suppression-controls',
      'encrypted-alert-destinations',
      'cncf-cka-certification',
      'cncf-ckad-certification',
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
    evidenceCounts: { experience: 5, certification: 2, skill: 13 },
    evidenceSummary:
      'Built a version-controlled cloud native observability platform with tested workload alerts, routed notifications, suppression controls, and encrypted alert destinations.',
  },
  'pervasive-security': {
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
  'documentation-quality': {
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
} as const;

const reviewedRemainingCapabilityScoreSummaries = [
  'Built automated test coverage across database-backed services, affected quality gates, service generators, Prometheus rules, and container health checks.',
  'Built a version-controlled cloud native observability platform with tested workload alerts, routed notifications, suppression controls, and encrypted alert destinations.',
  'Implemented Terraform-managed least-privilege access, complete MFA coverage, identity security alerting, IRSA workload identity, and encrypted secret delivery.',
  'Maintained a structured, indexed, and current documentation system, integrating documentation with engineering changes and cross-verifying operational claims.',
] as const;

type RemainingCapabilityKey = keyof typeof remainingCapabilityScoreContracts;

const remainingCapabilityKeys = Object.keys(
  remainingCapabilityScoreContracts,
) as RemainingCapabilityKey[];

const existingLiteralProjectionCapabilityKeys = [
  'version-control',
  'trunk-based-development',
  'deployment-automation',
  'flexible-infrastructure',
] as const;

const unwrapExpression = (expression: ts.Expression): ts.Expression => {
  let current = expression;

  while (
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isParenthesizedExpression(current)
  ) {
    current = current.expression;
  }

  return current;
};

const getPropertyName = (name: ts.PropertyName): string | undefined =>
  ts.isIdentifier(name) || ts.isStringLiteral(name) ? name.text : undefined;

const getLiteralScoreEvidenceIds = <CapabilityKey extends string>(
  source: string,
  capabilityKeys: readonly CapabilityKey[],
): Record<CapabilityKey, readonly string[]> => {
  const sourceFile = ts.createSourceFile(
    'devops-capability-evidence.data.ts',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  let scoreArray: ts.ArrayLiteralExpression | undefined;

  const visit = (node: ts.Node): void => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'curatedDevOpsCapabilityRadarScores' &&
      node.initializer
    ) {
      const initializer = unwrapExpression(node.initializer);

      if (!ts.isArrayLiteralExpression(initializer)) {
        throw new Error(
          'curatedDevOpsCapabilityRadarScores must be an array literal',
        );
      }

      scoreArray = initializer;
      return;
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  if (!scoreArray) {
    throw new Error('curatedDevOpsCapabilityRadarScores was not found');
  }

  const literalEvidenceIds = new Map<CapabilityKey, readonly string[]>();

  for (const scoreElement of scoreArray.elements) {
    if (!ts.isObjectLiteralExpression(scoreElement)) {
      continue;
    }

    const capabilityProperty = scoreElement.properties.find(
      (property): property is ts.PropertyAssignment =>
        ts.isPropertyAssignment(property) &&
        getPropertyName(property.name) === 'capabilityKey',
    );
    const capabilityInitializer = capabilityProperty
      ? unwrapExpression(capabilityProperty.initializer)
      : undefined;

    if (
      !capabilityInitializer ||
      !ts.isStringLiteral(capabilityInitializer) ||
      !capabilityKeys.includes(capabilityInitializer.text as CapabilityKey)
    ) {
      continue;
    }

    const capabilityKey = capabilityInitializer.text as CapabilityKey;
    const hasObjectSpread = scoreElement.properties.some((property) =>
      ts.isSpreadAssignment(property),
    );
    const hasComputedProperty = scoreElement.properties.some(
      (property) =>
        !ts.isSpreadAssignment(property) &&
        ts.isComputedPropertyName(property.name),
    );

    if (hasObjectSpread || hasComputedProperty) {
      throw new Error(
        `${capabilityKey} score object must not contain spreads or computed properties`,
      );
    }

    const evidenceIdsProperties = scoreElement.properties.filter(
      (property) =>
        !ts.isSpreadAssignment(property) &&
        getPropertyName(property.name) === 'evidenceIds',
    );

    if (evidenceIdsProperties.length !== 1) {
      throw new Error(
        `${capabilityKey} evidenceIds must be declared exactly once`,
      );
    }

    const evidenceIdsProperty = evidenceIdsProperties[0];

    if (!evidenceIdsProperty || !ts.isPropertyAssignment(evidenceIdsProperty)) {
      throw new Error(
        `${capabilityKey} evidenceIds must be an array literal of string literals`,
      );
    }

    const evidenceIdsInitializer = unwrapExpression(
      evidenceIdsProperty.initializer,
    );

    if (!ts.isArrayLiteralExpression(evidenceIdsInitializer)) {
      throw new Error(
        `${capabilityKey} evidenceIds must be an array literal of string literals`,
      );
    }

    const evidenceIds: string[] = [];

    for (const element of evidenceIdsInitializer.elements) {
      if (!ts.isStringLiteral(element)) {
        throw new Error(
          `${capabilityKey} evidenceIds must contain only string literals`,
        );
      }

      evidenceIds.push(element.text);
    }

    if (literalEvidenceIds.has(capabilityKey)) {
      throw new Error(`Duplicate ${capabilityKey} score block`);
    }

    literalEvidenceIds.set(capabilityKey, evidenceIds);
  }

  for (const capabilityKey of capabilityKeys) {
    if (!literalEvidenceIds.has(capabilityKey)) {
      throw new Error(`Missing ${capabilityKey} score block`);
    }
  }

  return Object.fromEntries(literalEvidenceIds) as Record<
    CapabilityKey,
    readonly string[]
  >;
};

describe('devOpsCapabilityEvidence data', () => {
  it('defines the first DORA capability dimensions in order', () => {
    expect(
      doraCapabilityDefinitions.map((capability) => capability.key),
    ).toEqual([
      'continuous-delivery',
      'deployment-automation',
      'continuous-integration',
      'test-automation',
      'monitoring-observability',
      'flexible-infrastructure',
      'pervasive-security',
      'trunk-based-development',
      'documentation-quality',
      'version-control',
    ]);
  });

  it('defines approved curated radar scores with shortened labels', () => {
    expect(
      curatedDevOpsCapabilityRadarScores.map((score) => ({
        capabilityKey: score.capabilityKey,
        label: score.label,
        score: score.score,
        maxScore: score.maxScore,
      })),
    ).toEqual([
      {
        capabilityKey: 'version-control',
        label: 'Versioning',
        score: 4,
        maxScore: 5,
      },
      {
        capabilityKey: 'trunk-based-development',
        label: 'Trunk',
        score: 4,
        maxScore: 5,
      },
      {
        capabilityKey: 'continuous-integration',
        label: 'CI',
        score: 4,
        maxScore: 5,
      },
      {
        capabilityKey: 'test-automation',
        label: 'Tests',
        score: 3,
        maxScore: 5,
      },
      {
        capabilityKey: 'pervasive-security',
        label: 'Security',
        score: 2,
        maxScore: 5,
      },
      {
        capabilityKey: 'continuous-delivery',
        label: 'Delivery',
        score: 4,
        maxScore: 5,
      },
      {
        capabilityKey: 'deployment-automation',
        label: 'Deploys',
        score: 4,
        maxScore: 5,
      },
      {
        capabilityKey: 'flexible-infrastructure',
        label: 'Infrastructure',
        score: 4,
        maxScore: 5,
      },
      {
        capabilityKey: 'monitoring-observability',
        label: 'Observability',
        score: 3,
        maxScore: 5,
      },
      {
        capabilityKey: 'documentation-quality',
        label: 'Docs',
        score: 4,
        maxScore: 5,
      },
    ]);

    expect(curatedDevOpsCapabilityRadarScores).toHaveLength(
      doraCapabilityDefinitions.length,
    );
    expect(
      curatedDevOpsCapabilityRadarScores.some((score) => score.score === 5),
    ).toBe(false);
  });

  it('defines LinkedIn-style evidence type labels', () => {
    expect(evidenceTypeLabels).toEqual({
      skill: 'Skills',
      learning: 'Learning',
      experience: 'Experience',
      education: 'Education',
      certification: 'Certifications',
      project: 'Projects',
    });
  });

  it('keeps all seed evidence public or safely summarized', () => {
    expect(devOpsCapabilityEvidenceItems.length).toBeGreaterThan(0);

    for (const item of devOpsCapabilityEvidenceItems) {
      expect(item.summary.length).toBeGreaterThan(24);
      expect(item.capabilityKeys.length).toBeGreaterThan(0);
      expect(['supporting', 'strong', 'primary']).toContain(item.strength);
      expect(item.summary).not.toMatch(
        /incident-\d+|deploy-\d+|private repo|customer name|from IAM users|four-developer/i,
      );
    }
  });

  it('keeps the composed catalog globally unique', () => {
    const catalogIds = devOpsCapabilityEvidenceItems.map((item) => item.id);

    expect(catalogIds.length).toBe(new Set(catalogIds).size);
  });

  it('composes every capability-owned catalog into one canonical aggregate', () => {
    const globalEvidenceIds = devOpsCapabilityEvidenceItems.map(
      (item) => item.id,
    );

    expect(
      deploymentAutomationEvidenceItems.slice(0, 5).map((item) => item.id),
    ).toEqual(deploymentAutomationExperienceIds);
    expect(
      flexibleInfrastructureEvidenceItems.slice(0, 5).map((item) => item.id),
    ).toEqual(flexibleInfrastructureExperienceIds);

    for (const capabilityCatalog of [
      deploymentAutomationEvidenceItems,
      deploymentAutomationSkillEvidenceItems,
      flexibleInfrastructureEvidenceItems,
      flexibleInfrastructureSkillEvidenceItems,
      kubernetesCertificationEvidenceItems,
      testAutomationEvidenceItems,
      testAutomationSkillEvidenceItems,
      monitoringObservabilityEvidenceItems,
      monitoringObservabilitySkillEvidenceItems,
      pervasiveSecurityEvidenceItems,
      pervasiveSecuritySkillEvidenceItems,
      documentationQualityEvidenceItems,
      documentationQualitySkillEvidenceItems,
    ]) {
      expect(globalEvidenceIds).toEqual(
        expect.arrayContaining(capabilityCatalog.map((item) => item.id)),
      );

      for (const item of capabilityCatalog) {
        expect(
          devOpsCapabilityEvidenceItems.filter(({ id }) => id === item.id),
        ).toEqual([item]);
        expect(
          devOpsCapabilityEvidenceItems.find(({ id }) => id === item.id),
        ).toBe(item);
      }
    }
  });

  it('includes three Kubernetes certifications in the approved compact projections', () => {
    expect(kubernetesCertificationEvidenceItems).toHaveLength(3);
    expect(
      devOpsCapabilityEvidenceItems.filter(
        (item) => item.type === 'certification',
      ),
    ).toEqual(kubernetesCertificationEvidenceItems);
    expect(
      [
        'continuous-delivery',
        'deployment-automation',
        'monitoring-observability',
        'flexible-infrastructure',
      ].map((capabilityKey) => ({
        capabilityKey,
        certificationCount: curatedDevOpsCapabilityRadarScores.find(
          (score) => score.capabilityKey === capabilityKey,
        )?.evidenceCounts.certification,
      })),
    ).toEqual([
      { capabilityKey: 'continuous-delivery', certificationCount: 1 },
      { capabilityKey: 'deployment-automation', certificationCount: 1 },
      { capabilityKey: 'monitoring-observability', certificationCount: 2 },
      { capabilityKey: 'flexible-infrastructure', certificationCount: 2 },
    ]);
  });

  it('preserves known shared evidence by canonical object identity', () => {
    const catalogById = new Map(
      devOpsCapabilityEvidenceItems.map((item) => [item.id, item]),
    );
    const continuousIntegrationById = new Map(
      continuousIntegrationEvidenceItems.map((item) => [item.id, item]),
    );
    const continuousDeliveryById = new Map(
      continuousDeliveryEvidenceItems.map((item) => [item.id, item]),
    );
    const deploymentAutomationById = new Map(
      deploymentAutomationEvidenceItems.map((item) => [item.id, item]),
    );
    const testAutomationById = new Map(
      testAutomationEvidenceItems.map((item) => [item.id, item]),
    );
    const monitoringObservabilityById = new Map(
      monitoringObservabilityEvidenceItems.map((item) => [item.id, item]),
    );
    const pervasiveSecurityById = new Map(
      pervasiveSecurityEvidenceItems.map((item) => [item.id, item]),
    );

    expect(catalogById.get('terraform-codepipeline-platform')).toBe(
      continuousIntegrationById.get('terraform-codepipeline-platform'),
    );
    expect(
      catalogById.get('argocd-environment-state-from-version-control'),
    ).toBe(
      continuousDeliveryById.get(
        'argocd-environment-state-from-version-control',
      ),
    );
    expect(catalogById.get('deterministic-kubernetes-overlays')).toBe(
      deploymentAutomationById.get('deterministic-kubernetes-overlays'),
    );
    expect(catalogById.get('nx-affected-quality-gates')).toBe(
      testAutomationById.get('nx-affected-quality-gates'),
    );
    expect(catalogById.get('iam-security-alerting')).toBe(
      monitoringObservabilityById.get('iam-security-alerting'),
    );
    expect(catalogById.get('iam-security-alerting')).toBe(
      pervasiveSecurityById.get('iam-security-alerting'),
    );
  });

  it('curates the four remaining capability cards with exact literal projections', () => {
    for (const [capabilityKey, expected] of Object.entries(
      remainingCapabilityScoreContracts,
    )) {
      const score = curatedDevOpsCapabilityRadarScores.find(
        (item) => item.capabilityKey === capabilityKey,
      );

      expect(score).toEqual(expect.objectContaining(expected));
      expect(score?.strongestEvidenceId).toBe(expected.evidenceIds[0]);
    }

    expectPublicSafeText(
      curatedDevOpsCapabilityRadarScores
        .filter(({ capabilityKey }) =>
          Object.hasOwn(remainingCapabilityScoreContracts, capabilityKey),
        )
        .map(({ evidenceSummary }) => evidenceSummary ?? ''),
      reviewedRemainingCapabilityScoreSummaries,
    );
  });

  it('composes repeated canonical objects once and rejects conflicting IDs', () => {
    const canonicalItem = devOpsCapabilityEvidenceItems[0];
    const conflictingItem = { ...canonicalItem };

    expect(
      composeCanonicalCapabilityEvidenceItems([canonicalItem, canonicalItem]),
    ).toEqual([canonicalItem]);
    expect(() =>
      composeCanonicalCapabilityEvidenceItems([canonicalItem, conflictingItem]),
    ).toThrow(
      `Conflicting duplicate capability evidence ID: ${canonicalItem.id}`,
    );
  });

  it('stores recovered carved evidence on the curated capability scores', () => {
    expect(
      curatedDevOpsCapabilityRadarScores.map((score) => ({
        capabilityKey: score.capabilityKey,
        evidenceIds: score.evidenceIds,
        strongestEvidenceId: score.strongestEvidenceId,
        evidenceCounts: score.evidenceCounts,
      })),
    ).toEqual([
      {
        capabilityKey: 'version-control',
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
      },
      {
        capabilityKey: 'trunk-based-development',
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
      },
      {
        capabilityKey: 'continuous-integration',
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
      },
      {
        capabilityKey: 'test-automation',
        evidenceIds:
          remainingCapabilityScoreContracts['test-automation'].evidenceIds,
        strongestEvidenceId: 'jest-testcontainers-postgres',
        evidenceCounts: { experience: 5, skill: 11 },
      },
      {
        capabilityKey: 'pervasive-security',
        evidenceIds:
          remainingCapabilityScoreContracts['pervasive-security'].evidenceIds,
        strongestEvidenceId: 'terraform-scoped-iam',
        evidenceCounts: { experience: 5, skill: 12 },
      },
      {
        capabilityKey: 'continuous-delivery',
        evidenceIds: [
          'codepipeline-approval-gated-deployment',
          'github-actions-gitops-handoff',
          'argocd-environment-state-from-version-control',
          'gitops-same-package-environments',
          'argocd-automated-database-migrations',
          'cncf-ckad-certification',
          ...continuousDeliverySkillEvidenceItems.map((item) => item.id),
        ],
        strongestEvidenceId: 'codepipeline-approval-gated-deployment',
        evidenceCounts: { experience: 5, certification: 1, skill: 14 },
      },
      {
        capabilityKey: 'deployment-automation',
        evidenceIds: deploymentAutomationScoreEvidenceIds,
        strongestEvidenceId: 'merge-triggered-deployment-path',
        evidenceCounts: { experience: 5, certification: 1, skill: 13 },
      },
      {
        capabilityKey: 'flexible-infrastructure',
        evidenceIds: flexibleInfrastructureScoreEvidenceIds,
        strongestEvidenceId: 'terraform-managed-cloud-foundations',
        evidenceCounts: { experience: 5, certification: 2, skill: 12 },
      },
      {
        capabilityKey: 'monitoring-observability',
        evidenceIds:
          remainingCapabilityScoreContracts['monitoring-observability']
            .evidenceIds,
        strongestEvidenceId: 'version-controlled-observability-stack',
        evidenceCounts: { experience: 5, certification: 2, skill: 13 },
      },
      {
        capabilityKey: 'documentation-quality',
        evidenceIds:
          remainingCapabilityScoreContracts['documentation-quality']
            .evidenceIds,
        strongestEvidenceId: 'structured-documentation-corpus',
        evidenceCounts: { experience: 5, skill: 3 },
      },
    ]);
  });

  it('carves user-provided interview evidence into compact tokens', () => {
    const carvedEvidenceIds = [
      'nx-affected-quality-gates',
      'jest-testcontainers-postgres',
      'regression-gates',
      'image-digest-deployments',
      'irsa-service-accounts',
      'terraform-scoped-iam',
    ];

    expect(
      devOpsCapabilityEvidenceItems
        .filter((item) => carvedEvidenceIds.includes(item.id))
        .map((item) => ({
          id: item.id,
          label: item.label,
          capabilityKeys: item.capabilityKeys,
        })),
    ).toEqual([
      {
        id: 'nx-affected-quality-gates',
        label: 'Affected-change quality gates',
        capabilityKeys: [
          'test-automation',
          'continuous-integration',
          'trunk-based-development',
        ],
      },
      {
        id: 'image-digest-deployments',
        label: 'Image digests',
        capabilityKeys: ['pervasive-security', 'deployment-automation'],
      },
      {
        id: 'irsa-service-accounts',
        label: 'Shared IRSA modules',
        capabilityKeys: ['flexible-infrastructure', 'pervasive-security'],
      },
      {
        id: 'terraform-scoped-iam',
        label: 'Terraform scoped IAM',
        capabilityKeys: ['flexible-infrastructure', 'pervasive-security'],
      },
      {
        id: 'jest-testcontainers-postgres',
        label: 'PostgreSQL test environments',
        capabilityKeys: ['test-automation'],
      },
      {
        id: 'regression-gates',
        label: 'Regression gates',
        capabilityKeys: ['test-automation'],
      },
    ]);
  });

  it('tokenizes previously captured broad evidence into compact tokens', () => {
    const tokenizedEvidenceIds = [
      'kubernetes-workloads',
      'kubectl-troubleshooting',
      'cluster-operations',
      'portfolio-radar',
      'roadmap-repository',
    ];

    expect(
      devOpsCapabilityEvidenceItems
        .filter((item) => tokenizedEvidenceIds.includes(item.id))
        .map((item) => ({
          id: item.id,
          label: item.label,
          capabilityKeys: item.capabilityKeys,
        })),
    ).toEqual([
      {
        id: 'kubernetes-workloads',
        label: 'Workloads',
        capabilityKeys: ['flexible-infrastructure'],
      },
      {
        id: 'kubectl-troubleshooting',
        label: 'kubectl',
        capabilityKeys: ['flexible-infrastructure', 'monitoring-observability'],
      },
      {
        id: 'cluster-operations',
        label: 'Cluster ops',
        capabilityKeys: ['flexible-infrastructure', 'monitoring-observability'],
      },
      {
        id: 'portfolio-radar',
        label: 'Portfolio radar',
        capabilityKeys: ['documentation-quality'],
      },
      {
        id: 'roadmap-repository',
        label: 'Roadmap repo',
        capabilityKeys: ['documentation-quality', 'version-control'],
      },
    ]);
  });

  it('keeps curated capability score evidence linked to catalog items', () => {
    const evidenceById = new Map(
      devOpsCapabilityEvidenceItems.map((item) => [item.id, item]),
    );

    for (const score of curatedDevOpsCapabilityRadarScores) {
      const referencedItems = score.evidenceIds.map((id) => {
        const item = evidenceById.get(id);
        expect(item, `${score.capabilityKey} references ${id}`).toBeDefined();
        return item;
      });

      if (score.strongestEvidenceId) {
        expect(score.evidenceIds).toContain(score.strongestEvidenceId);
      }

      expect(
        Object.fromEntries(
          referencedItems.reduce((counts, item) => {
            if (!item) {
              return counts;
            }

            expect(item.capabilityKeys).toContain(score.capabilityKey);
            counts.set(item.type, (counts.get(item.type) ?? 0) + 1);
            return counts;
          }, new Map<string, number>()),
        ),
      ).toEqual(score.evidenceCounts);
    }
  });

  it('keeps Version Control and Trunk-Based Development cards explicitly curated', () => {
    const versionControlScore = curatedDevOpsCapabilityRadarScores.find(
      (score) => score.capabilityKey === 'version-control',
    );
    const trunkBasedScore = curatedDevOpsCapabilityRadarScores.find(
      (score) => score.capabilityKey === 'trunk-based-development',
    );

    expect(versionControlScore).toMatchObject({
      score: 4,
      maxScore: 5,
      strongestEvidenceId: 'terraform-codepipeline-platform',
      evidenceCounts: { experience: 5, skill: 13 },
      evidenceSummary:
        'Built and maintained version-controlled delivery platforms spanning reusable Terraform pipelines and GitOps-managed Kubernetes environments, with traceable infrastructure, configuration, automation, and database changes.',
    });
    expect(versionControlScore?.evidenceIds).toEqual([
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
    ]);

    expect(trunkBasedScore).toMatchObject({
      score: 4,
      maxScore: 5,
      strongestEvidenceId: 'single-trunk-repository-flow',
      evidenceCounts: { experience: 5, skill: 6 },
      evidenceSummary:
        'Created and maintained single-trunk delivery repositories, integrating short-lived branches and small change batches with merge-preserved history and affected quality gates.',
    });
    expect(trunkBasedScore?.evidenceIds).toEqual([
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
    ]);

    const evidenceById = new Map(
      devOpsCapabilityEvidenceItems.map((item) => [item.id, item]),
    );

    for (const score of [versionControlScore, trunkBasedScore]) {
      expect(score).toBeDefined();
      expect(score?.strongestEvidenceId).toBe(score?.evidenceIds[0]);

      const selectedItems = score?.evidenceIds.map((id) =>
        evidenceById.get(id),
      );
      expect(selectedItems?.every(Boolean)).toBe(true);
      expect(
        selectedItems?.every((item) =>
          item?.capabilityKeys.includes(score?.capabilityKey ?? ''),
        ),
      ).toBe(true);
      expect(
        Object.fromEntries(
          (selectedItems ?? []).reduce((counts, item) => {
            if (item) {
              counts.set(item.type, (counts.get(item.type) ?? 0) + 1);
            }
            return counts;
          }, new Map<string, number>()),
        ),
      ).toEqual(score?.evidenceCounts);

      const supportItems = (selectedItems ?? []).flatMap((item) =>
        (item?.supportingEvidenceIds ?? []).map((id) => evidenceById.get(id)),
      );
      expect(supportItems.every(Boolean)).toBe(true);
      expect(
        supportItems.every((item) =>
          item?.capabilityKeys.includes(score?.capabilityKey ?? ''),
        ),
      ).toBe(true);
    }

    expect(devOpsCapabilityEvidenceItems.map(({ id }) => id)).not.toContain(
      'protected-review-gates',
    );
    expect(
      devOpsCapabilityEvidenceItems.filter(
        ({ id }) =>
          id === 'short-lived-branch-flow' || id === 'merge-commit-history',
      ),
    ).toHaveLength(2);
    expect(versionControlEvidenceItems).toContain(
      evidenceById.get('merge-commit-history'),
    );
    expect(trunkBasedDevelopmentEvidenceItems).toContain(
      evidenceById.get('short-lived-branch-flow'),
    );
  });

  it('keeps remaining compact projections independent of a sixth catalog experience', () => {
    const augmentedCatalog = composeCanonicalCapabilityEvidenceItems([
      ...devOpsCapabilityEvidenceItems,
      {
        id: 'synthetic-unselected-capability-record',
        title: 'Synthetic unselected record',
        type: 'experience' as const,
        capabilityKeys: [
          'test-automation',
          'monitoring-observability',
          'pervasive-security',
          'documentation-quality',
        ] as const,
        summary: 'Synthetic public evidence that must not alter curated cards.',
        isPublic: true,
        strength: 'primary' as const,
      },
    ]);
    const dataFile = existsSync(
      'apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts',
    )
      ? 'apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts'
      : 'src/app/devops-capability-evidence/devops-capability-evidence.data.ts';
    const source = readFileSync(dataFile, 'utf8');
    const literalEvidenceIds = getLiteralScoreEvidenceIds(
      source,
      remainingCapabilityKeys,
    );

    for (const [capabilityKey, expected] of Object.entries(
      remainingCapabilityScoreContracts,
    )) {
      const key = capabilityKey as RemainingCapabilityKey;
      const originalExperienceCount = devOpsCapabilityEvidenceItems.filter(
        (item) =>
          item.type === 'experience' && item.capabilityKeys.includes(key),
      ).length;
      const augmentedExperienceCount = augmentedCatalog.filter(
        (item) =>
          item.type === 'experience' && item.capabilityKeys.includes(key),
      ).length;
      const originalProjectionIds = getDoraCapabilityCardEvidenceRows(
        key,
        devOpsCapabilityEvidenceItems,
        curatedDevOpsCapabilityRadarScores,
      ).flatMap((row) => row.evidence.map((item) => item.id));
      const augmentedProjectionIds = getDoraCapabilityCardEvidenceRows(
        key,
        augmentedCatalog,
        curatedDevOpsCapabilityRadarScores,
      ).flatMap((row) => row.evidence.map((item) => item.id));

      expect(augmentedExperienceCount).toBe(originalExperienceCount + 1);
      expect(literalEvidenceIds[key]).toEqual(expected.evidenceIds);
      expect(originalProjectionIds).toEqual(expected.evidenceIds);
      expect(augmentedProjectionIds).toEqual(originalProjectionIds);
      expect(augmentedProjectionIds).not.toContain(
        'synthetic-unselected-capability-record',
      );
    }

    expect(
      Object.keys(
        getLiteralScoreEvidenceIds(
          source,
          existingLiteralProjectionCapabilityKeys,
        ),
      ),
    ).toEqual(existingLiteralProjectionCapabilityKeys);
  });

  it('rejects non-literal remaining compact projection syntax', () => {
    const literalFixture = `
      const curatedDevOpsCapabilityRadarScores = [
        { evidenceIds: ['test-id'], capabilityKey: 'test-automation' },
        { capabilityKey: 'monitoring-observability', evidenceIds: ['monitoring-id'] },
        { capabilityKey: 'pervasive-security', evidenceIds: ['security-id'] },
        { capabilityKey: 'documentation-quality', evidenceIds: ['documentation-id'] },
      ] as const;
    `;
    const prohibitedInitializers = [
      '[...skillIds]',
      '[skillIds[0]]',
      "skillIds.filter((id) => id !== 'unused')",
      'skillIds.reduce((ids, id) => [...ids, id], [])',
      'skillIds.toSorted()',
    ];
    const testScoreFixture =
      "{ evidenceIds: ['test-id'], capabilityKey: 'test-automation' }";
    const prohibitedObjectFixtures = [
      literalFixture.replace(
        testScoreFixture,
        "{ evidenceIds: ['test-id'], capabilityKey: 'test-automation', ...overrides }",
      ),
      literalFixture.replace(
        testScoreFixture,
        "{ evidenceIds: ['test-id'], capabilityKey: 'test-automation', evidenceIds: derivedIds }",
      ),
      literalFixture.replace(
        testScoreFixture,
        "{ evidenceIds: ['test-id'], capabilityKey: 'test-automation', ['evidenceIds']: derivedIds }",
      ),
    ];

    expect(
      getLiteralScoreEvidenceIds(literalFixture, remainingCapabilityKeys),
    ).toEqual({
      'test-automation': ['test-id'],
      'monitoring-observability': ['monitoring-id'],
      'pervasive-security': ['security-id'],
      'documentation-quality': ['documentation-id'],
    });

    for (const prohibitedInitializer of prohibitedInitializers) {
      expect(() =>
        getLiteralScoreEvidenceIds(
          literalFixture.replace("['test-id']", prohibitedInitializer),
          remainingCapabilityKeys,
        ),
      ).toThrow(/evidenceIds must/);
    }

    for (const prohibitedObjectFixture of prohibitedObjectFixtures) {
      expect(() =>
        getLiteralScoreEvidenceIds(
          prohibitedObjectFixture,
          remainingCapabilityKeys,
        ),
      ).toThrow(/evidenceIds must|score object/);
    }
  });

  it('curates two AWS and three GitHub monorepo records for the CI card', () => {
    const score = curatedDevOpsCapabilityRadarScores.find(
      (entry) => entry.capabilityKey === 'continuous-integration',
    );
    const selected = (score?.evidenceIds ?? []).map((id) =>
      devOpsCapabilityEvidenceItems.find((item) => item.id === id),
    );

    expect(score).toMatchObject({
      score: 4,
      maxScore: 5,
      strongestEvidenceId: 'terraform-codepipeline-platform',
      evidenceCounts: { experience: 5, skill: 13 },
      evidenceSummary:
        'Built and evolved CI from reusable AWS CodePipeline and CodeBuild pipelines to monorepo GitHub Actions, with affected quality gates and immutable artifacts.',
    });
    expect(score?.strongestEvidenceId).toBe(score?.evidenceIds[0]);
    expect(score?.evidenceIds.slice(0, 5)).toEqual([
      'terraform-codepipeline-platform',
      'codebuild-pr-gates',
      'nx-affected-quality-gates',
      'github-actions-gitops-handoff',
      'kustomize-tag-update-reliability',
    ]);
    expect(score?.evidenceIds.slice(5)).toEqual(
      continuousIntegrationSkillEvidenceItems.map((item) => item.id),
    );
    expect(selected.every(Boolean)).toBe(true);
    expect(
      selected.slice(0, 5).map((item) => item?.details?.initiative.id),
    ).toEqual([
      'aws-codepipeline-platform',
      'aws-codepipeline-platform',
      'github-actions-monorepo',
      'github-actions-monorepo',
      'github-actions-monorepo',
    ]);
  });

  it('composes exactly seventeen Continuous Delivery experiences', () => {
    const deliveryExperiences = devOpsCapabilityEvidenceItems.filter(
      (item) =>
        item.type === 'experience' &&
        item.capabilityKeys.includes('continuous-delivery'),
    );

    expect(deliveryExperiences).toHaveLength(17);
    expect(new Set(deliveryExperiences.map((item) => item.id)).size).toBe(17);
    expect(deliveryExperiences.map((item) => item.id)).toEqual(
      expect.arrayContaining([
        ...continuousDeliveryEvidenceItems.map((item) => item.id),
        'terraform-codepipeline-platform',
        'ecr-immutable-promotion',
        'github-actions-gitops-handoff',
        'kustomize-tag-update-reliability',
        'reusable-helm-deployment-image',
      ]),
    );
  });

  it('removes the superseded generic Continuous Delivery placeholders', () => {
    expect(devOpsCapabilityEvidenceItems.map((item) => item.id)).not.toEqual(
      expect.arrayContaining([
        'github-actions-ci',
        'docker-delivery',
        'team-delivery-workflow',
      ]),
    );
  });

  it('curates the approved Continuous Delivery experiences, certification, and skills', () => {
    const score = curatedDevOpsCapabilityRadarScores.find(
      (entry) => entry.capabilityKey === 'continuous-delivery',
    );

    expect(score).toMatchObject({
      score: 4,
      maxScore: 5,
      strongestEvidenceId: 'codepipeline-approval-gated-deployment',
      evidenceCounts: { experience: 5, certification: 1, skill: 14 },
      evidenceSummary:
        'Built approval-gated and GitOps delivery across AWS CodePipeline and GitHub Actions, with immutable artifacts, automated migrations, and reliable Kubernetes reconciliation.',
    });
    expect(score?.evidenceIds.slice(0, 5)).toEqual([
      'codepipeline-approval-gated-deployment',
      'github-actions-gitops-handoff',
      'argocd-environment-state-from-version-control',
      'gitops-same-package-environments',
      'argocd-automated-database-migrations',
    ]);
    expect(score?.evidenceIds.slice(5, 6)).toEqual(['cncf-ckad-certification']);
    expect(score?.evidenceIds.slice(6)).toEqual(
      continuousDeliverySkillEvidenceItems.map((item) => item.id),
    );
  });

  it('curates the Deployment Automation score with exact selected evidence', () => {
    const deploymentAutomationScore = curatedDevOpsCapabilityRadarScores.find(
      (entry) => entry.capabilityKey === 'deployment-automation',
    );

    expect(deploymentAutomationScore).toMatchObject({
      score: 4,
      maxScore: 5,
      strongestEvidenceId: 'merge-triggered-deployment-path',
      evidenceCounts: { experience: 5, certification: 1, skill: 13 },
      evidenceSummary:
        'Built merge-triggered deployment automation across environments, with generator-based onboarding, automated secret delivery, and deterministic Kubernetes rendering.',
    });
    expect(deploymentAutomationScore?.evidenceIds).toEqual(
      deploymentAutomationScoreEvidenceIds,
    );
    expect(deploymentAutomationScore?.strongestEvidenceId).toBe(
      deploymentAutomationScore?.evidenceIds[0],
    );

    const flexibleInfrastructureScore = curatedDevOpsCapabilityRadarScores.find(
      (entry) => entry.capabilityKey === 'flexible-infrastructure',
    );

    expect(flexibleInfrastructureScore).toMatchObject({
      score: 4,
      maxScore: 5,
      strongestEvidenceId: 'terraform-managed-cloud-foundations',
      evidenceCounts: { experience: 5, certification: 2, skill: 12 },
      evidenceSummary:
        'Built reusable Terraform and Kubernetes foundations with workload identity, scoped IAM, delivery-platform provisioning, and GitOps-managed environments.',
    });
    expect(flexibleInfrastructureScore?.evidenceIds).toEqual(
      flexibleInfrastructureScoreEvidenceIds,
    );
    expect(flexibleInfrastructureScore?.strongestEvidenceId).toBe(
      flexibleInfrastructureScore?.evidenceIds[0],
    );

    expectPublicSafeText(
      [
        deploymentAutomationScore?.evidenceSummary ?? '',
        flexibleInfrastructureScore?.evidenceSummary ?? '',
      ],
      [
        'Built merge-triggered deployment automation across environments, with generator-based onboarding, automated secret delivery, and deterministic Kubernetes rendering.',
        'Built reusable Terraform and Kubernetes foundations with workload identity, scoped IAM, delivery-platform provisioning, and GitOps-managed environments.',
      ],
    );
  });
});

describe('devOpsCapabilityEvidence scoring', () => {
  it('filters private and unsupported skill evidence out of public scoring', () => {
    const evidence = getPublicCapabilityEvidence([
      ...devOpsCapabilityEvidenceItems,
      {
        id: 'unsupported-skill',
        title: 'Unsupported Tool',
        type: 'skill',
        capabilityKeys: ['test-automation'],
        summary: 'This skill lacks supporting evidence and should not score.',
        isPublic: true,
        strength: 'supporting',
      },
      {
        id: 'private-detail',
        title: 'Private Deployment Record',
        type: 'experience',
        capabilityKeys: ['deployment-automation'],
        summary: 'Private operational detail.',
        isPublic: false,
        strength: 'primary',
      },
      {
        id: 'sensitive-detail',
        title: 'Sensitive Public Deployment Record',
        type: 'experience',
        capabilityKeys: ['deployment-automation'],
        summary: 'Publicly marked but sensitive operational detail.',
        isPublic: true,
        isSensitive: true,
        strength: 'primary',
      },
      {
        id: 'sensitive-skill-support',
        title: 'Sensitive Skill Support',
        type: 'experience',
        capabilityKeys: ['test-automation'],
        summary: 'Sensitive evidence that must not validate a public skill.',
        isPublic: true,
        isSensitive: true,
        strength: 'primary',
      },
      {
        id: 'sensitive-only-skill',
        title: 'Sensitive-Only Tool Skill',
        type: 'skill',
        capabilityKeys: ['test-automation'],
        summary: 'A public skill backed only by sensitive evidence.',
        isPublic: true,
        strength: 'supporting',
        supportingEvidenceIds: ['sensitive-skill-support'],
      },
    ]);

    expect(evidence.map((item) => item.id)).not.toContain('unsupported-skill');
    expect(evidence.map((item) => item.id)).not.toContain('private-detail');
    expect(evidence.map((item) => item.id)).not.toContain('sensitive-detail');
    expect(evidence.map((item) => item.id)).not.toContain(
      'sensitive-only-skill',
    );
  });

  it('requires a public non-skill support item with a shared capability for skills', () => {
    const evidence = getPublicCapabilityEvidence([
      {
        id: 'delivery-summary',
        title: 'Delivery workflow summary',
        type: 'experience',
        capabilityKeys: ['continuous-delivery'],
        summary: 'Public-safe summary of delivery workflow ownership.',
        isPublic: true,
        strength: 'primary',
      },
      {
        id: 'self-supported-skill',
        title: 'Self-supported skill',
        type: 'skill',
        capabilityKeys: ['continuous-delivery'],
        summary:
          'A skill that incorrectly identifies itself as supporting evidence.',
        isPublic: true,
        strength: 'supporting',
        supportingEvidenceIds: ['self-supported-skill'],
      },
      {
        id: 'circular-skill-one',
        title: 'Circular skill one',
        type: 'skill',
        capabilityKeys: ['continuous-delivery'],
        summary:
          'A skill that incorrectly relies on another skill for evidence.',
        isPublic: true,
        strength: 'supporting',
        supportingEvidenceIds: ['circular-skill-two'],
      },
      {
        id: 'circular-skill-two',
        title: 'Circular skill two',
        type: 'skill',
        capabilityKeys: ['continuous-delivery'],
        summary:
          'A second skill that completes an invalid evidence-only cycle.',
        isPublic: true,
        strength: 'supporting',
        supportingEvidenceIds: ['circular-skill-one'],
      },
      {
        id: 'wrong-capability-skill',
        title: 'Wrong capability skill',
        type: 'skill',
        capabilityKeys: ['test-automation'],
        summary:
          'A skill supported by public evidence for an unrelated capability.',
        isPublic: true,
        strength: 'supporting',
        supportingEvidenceIds: ['delivery-summary'],
      },
    ]);

    expect(evidence.map((item) => item.id)).toEqual(['delivery-summary']);
  });

  it('derives non-zero capability scores from evidence', () => {
    const scores = getCapabilityEvidenceScores(
      devOpsCapabilityEvidenceItems,
      doraCapabilityDefinitions,
    );

    expect(
      scores.find((score) => score.capabilityKey === 'continuous-delivery'),
    ).toMatchObject({
      label: 'Continuous Delivery',
      score: 5,
      maxScore: 5,
      strongestEvidenceId: 'terraform-codepipeline-platform',
    });
    expect(scores.some((score) => score.score === 0)).toBe(false);
  });

  it('omits definitions without evidence from scores and the matrix', () => {
    const definitionsWithoutEvidence = [
      { key: 'test-automation', label: 'Test Automation', shortLabel: 'Tests' },
    ] as const;
    const evidenceWithoutTestAutomation = devOpsCapabilityEvidenceItems.filter(
      (item) => !item.capabilityKeys.includes('test-automation'),
    );

    expect(
      getCapabilityEvidenceScores(
        evidenceWithoutTestAutomation,
        definitionsWithoutEvidence,
      ),
    ).toEqual([]);
    expect(
      getCapabilityEvidenceMatrix(
        evidenceWithoutTestAutomation,
        definitionsWithoutEvidence,
      ),
    ).toEqual([]);
  });

  it('groups evidence counts by type and capability', () => {
    expect(getEvidenceTypeCounts(devOpsCapabilityEvidenceItems)).toMatchObject({
      experience: 67,
      learning: 3,
      certification: 3,
      project: 2,
      skill: 111,
    });

    expect(
      getCapabilityEvidenceMatrix(
        devOpsCapabilityEvidenceItems,
        doraCapabilityDefinitions,
      ).find((row) => row.capabilityKey === 'flexible-infrastructure'),
    ).toMatchObject({
      label: 'Flexible Infrastructure',
      counts: { certification: 2, experience: 7, learning: 3, skill: 13 },
    });
  });

  it('builds accessible summaries', () => {
    const scores = getCapabilityEvidenceScores(
      devOpsCapabilityEvidenceItems,
      doraCapabilityDefinitions,
    );

    expect(getCapabilityScoreSummary(scores)).toContain(
      'Continuous Delivery 5 of 5',
    );
    expect(
      getEvidenceTypeSummary(
        getEvidenceTypeCounts(devOpsCapabilityEvidenceItems),
      ),
    ).toBe(
      'Evidence includes 111 skills, 3 learning items, 67 experience items, 3 certifications, and 2 projects.',
    );
  });
});
