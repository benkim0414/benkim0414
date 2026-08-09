import { existsSync, readFileSync } from 'node:fs';
import {
  curatedDevOpsCapabilityRadarScores,
  doraCapabilityDefinitions,
  evidenceTypeLabels,
  devOpsCapabilityEvidenceItems,
} from './devops-capability-evidence.data';
import { continuousDeliveryEvidenceItems } from './continuous-delivery-evidence.data';
import { continuousDeliverySkillEvidenceItems } from './continuous-delivery-skill-evidence.data';
import { continuousIntegrationSkillEvidenceItems } from './continuous-integration-skill-evidence.data';
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

  it('assigns every catalog evidence item a globally unique ID', () => {
    expect(new Set(devOpsCapabilityEvidenceItems.map((item) => item.id)).size).toBe(
      devOpsCapabilityEvidenceItems.length,
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
        evidenceIds: [
          'nx-affected-quality-gates',
          'jest-testcontainers-postgres',
          'regression-gates',
        ],
        strongestEvidenceId: 'jest-testcontainers-postgres',
        evidenceCounts: { experience: 3 },
      },
      {
        capabilityKey: 'pervasive-security',
        evidenceIds: [
          'image-digest-deployments',
          'irsa-service-accounts',
          'terraform-scoped-iam',
        ],
        strongestEvidenceId: 'irsa-service-accounts',
        evidenceCounts: { experience: 3 },
      },
      {
        capabilityKey: 'continuous-delivery',
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
      },
      {
        capabilityKey: 'deployment-automation',
        evidenceIds: ['image-digest-deployments'],
        strongestEvidenceId: 'image-digest-deployments',
        evidenceCounts: { experience: 1 },
      },
      {
        capabilityKey: 'flexible-infrastructure',
        evidenceIds: [
          'kubernetes-workloads',
          'kubectl-troubleshooting',
          'cluster-operations',
          'cncf-kubernetes-certification',
          'kubernetes-skill',
          'irsa-service-accounts',
          'terraform-scoped-iam',
        ],
        strongestEvidenceId: 'cncf-kubernetes-certification',
        evidenceCounts: {
          certification: 1,
          experience: 2,
          learning: 3,
          skill: 1,
        },
      },
      {
        capabilityKey: 'monitoring-observability',
        evidenceIds: [
          'kubectl-troubleshooting',
          'cluster-operations',
          'cncf-kubernetes-certification',
          'kubernetes-skill',
        ],
        strongestEvidenceId: 'cncf-kubernetes-certification',
        evidenceCounts: { certification: 1, learning: 2, skill: 1 },
      },
      {
        capabilityKey: 'documentation-quality',
        evidenceIds: ['portfolio-radar', 'roadmap-repository'],
        strongestEvidenceId: 'portfolio-radar',
        evidenceCounts: { project: 2 },
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
        id: 'jest-testcontainers-postgres',
        label: 'Postgres tests',
        capabilityKeys: ['test-automation'],
      },
      {
        id: 'regression-gates',
        label: 'Regression gates',
        capabilityKeys: ['test-automation', 'continuous-integration'],
      },
      {
        id: 'image-digest-deployments',
        label: 'Image digests',
        capabilityKeys: ['pervasive-security', 'deployment-automation'],
      },
      {
        id: 'irsa-service-accounts',
        label: 'IRSA',
        capabilityKeys: ['pervasive-security', 'flexible-infrastructure'],
      },
      {
        id: 'terraform-scoped-iam',
        label: 'Terraform IAM',
        capabilityKeys: ['pervasive-security', 'flexible-infrastructure'],
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
        capabilityKeys: [
          'flexible-infrastructure',
          'monitoring-observability',
        ],
      },
      {
        id: 'cluster-operations',
        label: 'Cluster ops',
        capabilityKeys: [
          'flexible-infrastructure',
          'monitoring-observability',
        ],
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

      const selectedItems = score?.evidenceIds.map((id) => evidenceById.get(id));
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
        ({ id }) => id === 'short-lived-branch-flow' || id === 'merge-commit-history',
      ),
    ).toHaveLength(2);
    expect(versionControlEvidenceItems).toContain(
      evidenceById.get('merge-commit-history'),
    );
    expect(trunkBasedDevelopmentEvidenceItems).toContain(
      evidenceById.get('short-lived-branch-flow'),
    );
  });

  it('does not change explicit compact cards when an unselected record exists', () => {
    const syntheticUnselectedCatalog = [
      ...devOpsCapabilityEvidenceItems,
      {
        id: 'synthetic-unselected-versioning-record',
        title: 'Synthetic unselected record',
        type: 'experience' as const,
        capabilityKeys: ['version-control', 'trunk-based-development'] as const,
        summary: 'Synthetic public evidence that must not alter curated cards.',
        isPublic: true,
        strength: 'primary' as const,
      },
    ];

    expect(syntheticUnselectedCatalog).toHaveLength(
      devOpsCapabilityEvidenceItems.length + 1,
    );
    expect(
      curatedDevOpsCapabilityRadarScores.find(
        (score) => score.capabilityKey === 'version-control',
      )?.evidenceIds,
    ).toEqual([
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
    expect(
      curatedDevOpsCapabilityRadarScores.find(
        (score) => score.capabilityKey === 'trunk-based-development',
      )?.evidenceIds,
    ).toEqual([
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
  });

  it('uses literal score projections instead of catalog ranking or slicing', () => {
    const dataFile = existsSync(
      'apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts',
    )
      ? 'apps/github.io/src/app/devops-capability-evidence/devops-capability-evidence.data.ts'
      : 'src/app/devops-capability-evidence/devops-capability-evidence.data.ts';
    const source = readFileSync(dataFile, 'utf8');
    const projections = [...source.matchAll(
      /capabilityKey: '(?:version-control|trunk-based-development)',[\s\S]*?evidenceSummary:/g,
    )];

    expect(projections).toHaveLength(2);

    for (const projection of projections) {
      expect(projection[0]).not.toContain('.slice(');
      expect(projection[0]).not.toContain('.sort(');
      expect(projection[0]).not.toContain('.map(');
      expect(projection[0]).not.toMatch(/strength|rank/i);
      expect(projection[0]).not.toMatch(
        /\.\.\.(?:versionControlEvidenceItems|trunkBasedDevelopmentEvidenceItems)/,
      );
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

  it('curates the approved Continuous Delivery experiences and skills', () => {
    const score = curatedDevOpsCapabilityRadarScores.find(
      (entry) => entry.capabilityKey === 'continuous-delivery',
    );

    expect(score).toMatchObject({
      score: 4,
      maxScore: 5,
      strongestEvidenceId: 'codepipeline-approval-gated-deployment',
      evidenceCounts: { experience: 5, skill: 14 },
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
    expect(score?.evidenceIds.slice(5)).toEqual(
      continuousDeliverySkillEvidenceItems.map((item) => item.id),
    );
  });

  it('preserves the deployment automation score with valid evidence', () => {
    const score = curatedDevOpsCapabilityRadarScores.find(
      (entry) => entry.capabilityKey === 'deployment-automation',
    );

    expect(score).toMatchObject({
      score: 4,
      maxScore: 5,
      evidenceIds: ['image-digest-deployments'],
      strongestEvidenceId: 'image-digest-deployments',
      evidenceCounts: { experience: 1 },
    });
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
      experience: 40,
      learning: 3,
      certification: 1,
      project: 2,
      skill: 47,
    });

    expect(
      getCapabilityEvidenceMatrix(
        devOpsCapabilityEvidenceItems,
        doraCapabilityDefinitions,
      ).find((row) => row.capabilityKey === 'flexible-infrastructure'),
    ).toMatchObject({
      label: 'Flexible Infrastructure',
      counts: { certification: 1, experience: 2, learning: 3, skill: 1 },
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
      'Evidence includes 47 skills, 3 learning items, 40 experience items, 1 certification, and 2 projects.',
    );
  });
});
