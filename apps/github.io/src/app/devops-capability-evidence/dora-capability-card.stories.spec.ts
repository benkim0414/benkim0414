import meta, {
  ContinuousDelivery,
  ContinuousIntegration,
  DeploymentAutomation,
  DocumentationQuality,
  FlexibleInfrastructure,
  MobileCompact,
  MonitoringAndObservability,
  PervasiveSecurity,
  TestAutomation,
  TrunkBasedDevelopment,
  VersionControl,
} from './dora-capability-card.stories';
import {
  curatedDevOpsCapabilityRadarScores,
  devOpsCapabilityEvidenceItems,
  doraCapabilityDefinitions,
} from './devops-capability-evidence.data';
import { doraCapabilityDescriptions } from './dora-capability-card.evidence';

describe('DoraCapabilityCard stories', () => {
  it('sets a mobile viewport for compact disclosure review', () => {
    expect(MobileCompact.globals?.viewport).toEqual({
      value: 'mobile1',
      isRotated: false,
    });
  });

  it.each([
    ['test-automation', TestAutomation, []],
    ['monitoring-observability', MonitoringAndObservability, ['CKA', 'CKAD']],
    ['pervasive-security', PervasiveSecurity, []],
    ['documentation-quality', DocumentationQuality, []],
  ] as const)(
    'uses the production catalog and score collection for %s',
    (key, story, certificationLabels) => {
      const args = { ...meta.args, ...story.args };
      const definition = doraCapabilityDefinitions.find(
        (capability) => capability.key === key,
      );
      const selected = curatedDevOpsCapabilityRadarScores
        .find((entry) => entry.capabilityKey === key)
        ?.evidenceIds.map((id) =>
          devOpsCapabilityEvidenceItems.find((item) => item.id === id),
        );

      expect(meta.args?.evidence).toBe(devOpsCapabilityEvidenceItems);
      expect(meta.args?.scores).toBe(curatedDevOpsCapabilityRadarScores);
      expect(story.args?.evidence).toBeUndefined();
      expect(story.args?.scores).toBeUndefined();
      expect(args.capability).toBe(definition);
      expect(args.description).toBe(doraCapabilityDescriptions[key]);
      expect(
        selected
          ?.filter((item) => item?.type === 'certification')
          .map((item) => item?.label),
      ).toEqual(certificationLabels);
    },
  );

  it('uses shared production data for Continuous Integration', () => {
    expect(meta.args?.evidence).toBe(devOpsCapabilityEvidenceItems);
    expect(meta.args?.scores).toBe(curatedDevOpsCapabilityRadarScores);
    expect(ContinuousIntegration.args?.evidence).toBeUndefined();
    expect(ContinuousIntegration.args?.scores).toBeUndefined();
    expect(
      curatedDevOpsCapabilityRadarScores
        .find((entry) => entry.capabilityKey === 'continuous-integration')
        ?.evidenceIds.map((id) =>
          devOpsCapabilityEvidenceItems.find((item) => item.id === id),
        )
        .filter((item) => item?.type === 'certification')
        .map((item) => item?.label),
    ).toEqual([]);
  });

  it('resolves the approved Continuous Integration evidence and skills', () => {
    const score = curatedDevOpsCapabilityRadarScores.find(
      (entry) => entry.capabilityKey === 'continuous-integration',
    );
    const selected = score?.evidenceIds.map((id) =>
      devOpsCapabilityEvidenceItems.find((item) => item.id === id),
    );

    expect(selected?.slice(0, 5).map((item) => item?.label)).toEqual([
      'Reusable Terraform CI pipelines',
      'Automated pull-request test gates',
      'Affected-change quality gates',
      'Automated deployment process',
      'Reliable Kustomize tag updates',
    ]);
    expect(selected?.slice(5).map((item) => item?.title)).toEqual([
      'AWS CodePipeline',
      'GitHub',
      'AWS CodeBuild',
      'AWS Systems Manager Parameter Store',
      'Terraform',
      'Docker',
      'Amazon ECR',
      'Helm',
      'Nx',
      'GitHub Actions',
      'OpenID Connect',
      'Kustomize',
      'Argo CD',
    ]);
  });

  it('uses shared production data for Continuous Delivery', () => {
    expect(meta.args?.evidence).toBe(devOpsCapabilityEvidenceItems);
    expect(meta.args?.scores).toBe(curatedDevOpsCapabilityRadarScores);
    expect(ContinuousDelivery.args?.evidence).toBeUndefined();
    expect(ContinuousDelivery.args?.scores).toBeUndefined();
  });

  it('resolves the approved Continuous Delivery evidence, certifications, and skills', () => {
    const score = curatedDevOpsCapabilityRadarScores.find(
      (entry) => entry.capabilityKey === 'continuous-delivery',
    );
    const selected = score?.evidenceIds.map((id) =>
      devOpsCapabilityEvidenceItems.find((item) => item.id === id),
    );

    expect(selected?.slice(0, 5).map((item) => item?.label)).toEqual([
      'Approval-gated deployment automation',
      'Automated deployment process',
      'Version-controlled environment state',
      'Same package across environments',
      'Automated database migrations',
    ]);
    expect(
      selected
        ?.filter((item) => item?.type === 'certification')
        .map((item) => item?.label),
    ).toEqual(['CKAD']);
    expect(
      selected
        ?.filter((item) => item?.type === 'skill')
        .map((item) => item?.title),
    ).toEqual([
      'AWS CodePipeline',
      'GitHub',
      'Docker',
      'Amazon ECR',
      'Helm',
      'Amazon EKS',
      'Terraform',
      'Kubernetes',
      'GitHub Actions',
      'OpenID Connect',
      'Nx',
      'Kustomize',
      'Argo CD',
      'Sealed Secrets',
    ]);
  });

  it('inherits shared production data for Version Control', () => {
    expect(meta.args?.evidence).toBe(devOpsCapabilityEvidenceItems);
    expect(meta.args?.scores).toBe(curatedDevOpsCapabilityRadarScores);
    expect(VersionControl.args?.evidence).toBeUndefined();
    expect(VersionControl.args?.scores).toBeUndefined();
  });

  it('inherits shared production data for Trunk-Based Development', () => {
    expect(meta.args?.evidence).toBe(devOpsCapabilityEvidenceItems);
    expect(meta.args?.scores).toBe(curatedDevOpsCapabilityRadarScores);
    expect(TrunkBasedDevelopment.args?.evidence).toBeUndefined();
    expect(TrunkBasedDevelopment.args?.scores).toBeUndefined();
  });

  it.each([
    ['Deployment Automation', DeploymentAutomation, 'deployment-automation'],
    [
      'Flexible Infrastructure',
      FlexibleInfrastructure,
      'flexible-infrastructure',
    ],
  ] as const)('inherits shared production data for %s', (_name, story, key) => {
    const args = { ...meta.args, ...story.args };

    expect(meta.args?.evidence).toBe(devOpsCapabilityEvidenceItems);
    expect(meta.args?.scores).toBe(curatedDevOpsCapabilityRadarScores);
    expect(story.args?.evidence).toBeUndefined();
    expect(story.args?.scores).toBeUndefined();
    expect(args.capability?.key).toBe(key);
    expect(args.description).toBe(doraCapabilityDescriptions[key]);
  });

  it.each([
    [
      'continuous-delivery',
      [
        'Approval-gated deployment automation',
        'Automated deployment process',
        'Version-controlled environment state',
        'Same package across environments',
        'Automated database migrations',
      ],
      ['CKAD'],
      [
        'AWS CodePipeline',
        'GitHub',
        'Docker',
        'Amazon ECR',
        'Helm',
        'Amazon EKS',
        'Terraform',
        'Kubernetes',
        'GitHub Actions',
        'OpenID Connect',
        'Nx',
        'Kustomize',
        'Argo CD',
        'Sealed Secrets',
      ],
    ],
    [
      'deployment-automation',
      [
        'Merge-triggered deployments',
        'Environment-neutral deploys',
        'Generator-based onboarding',
        'Automated secret delivery',
        'Deterministic overlays',
      ],
      ['CKAD'],
      [
        'AWS CodePipeline',
        'Terraform',
        'GitHub Actions',
        'Argo CD',
        'GitOps',
        'Docker',
        'Amazon ECR',
        'Kubernetes',
        'OpenID Connect',
        'Nx',
        'GitHub API',
        'Kustomize',
        'Sealed Secrets',
      ],
    ],
    [
      'flexible-infrastructure',
      [
        'Terraform cloud foundations',
        'Shared IRSA modules',
        'Terraform scoped IAM',
        'Reusable Terraform CI pipelines',
        'Version-controlled environment state',
      ],
      ['KCNA', 'CKA'],
      [
        'Terraform',
        'AWS',
        'Kubernetes',
        'kubectl',
        'Helm',
        'Docker',
        'Amazon ECR',
        'AWS IAM',
        'IRSA',
        'Kustomize',
        'Argo CD',
        'GitOps',
      ],
    ],
    [
      'monitoring-observability',
      [
        'Observability stack',
        'Workload alerts',
        'Notification routing',
        'Alert suppression',
        'Encrypted destinations',
      ],
      ['CKA', 'CKAD'],
      [
        'Prometheus',
        'promtool',
        'Alertmanager',
        'Loki',
        'Grafana',
        'Alloy',
        'Kubernetes',
        'Helm',
        'Argo CD',
        'Kustomize',
        'Sealed Secrets',
        'AWS EventBridge',
        'AWS Lambda',
      ],
    ],
    [
      'version-control',
      [
        'Reusable Terraform CI pipelines',
        'Automated deployment process',
        'Version-controlled environment state',
        'Automated database migrations',
        'Merge-preserved history',
      ],
      [],
      [
        'Git',
        'GitHub',
        'AWS CodePipeline',
        'Terraform',
        'Docker',
        'Helm',
        'Conventional Commits',
        'Husky',
        'Nx',
        'GitHub Actions',
        'Kustomize',
        'Argo CD',
        'Kubernetes',
      ],
    ],
    [
      'trunk-based-development',
      [
        'Single trunk repositories',
        'Short-lived branch flow',
        'Small change landings',
        'Affected-change quality gates',
        'Merge-preserved history',
      ],
      [],
      [
        'Git',
        'GitHub',
        'Nx',
        'GitHub Actions',
        'Conventional Commits',
        'Husky',
      ],
    ],
  ] as const)(
    'resolves the approved %s evidence, certifications, and skills',
    (capabilityKey, experienceLabels, certificationTitles, skillTitles) => {
      const score = curatedDevOpsCapabilityRadarScores.find(
        (entry) => entry.capabilityKey === capabilityKey,
      );
      const selected = score?.evidenceIds.map((id) =>
        devOpsCapabilityEvidenceItems.find((item) => item.id === id),
      );

      expect(selected?.slice(0, 5).map((item) => item?.label)).toEqual(
        experienceLabels,
      );
      expect(
        selected
          ?.filter((item) => item?.type === 'certification')
          .map((item) => item?.label),
      ).toEqual(certificationTitles);
      expect(
        selected
          ?.filter((item) => item?.type === 'skill')
          .map((item) => item?.title),
      ).toEqual(skillTitles);
    },
  );
});
