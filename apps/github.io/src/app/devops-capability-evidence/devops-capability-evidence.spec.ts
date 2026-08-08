import {
  curatedDevOpsCapabilityRadarScores,
  doraCapabilityDefinitions,
  evidenceTypeLabels,
  devOpsCapabilityEvidenceItems,
} from './devops-capability-evidence.data';
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
          'roadmap-repository',
          'short-lived-branch-flow',
          'protected-review-gates',
          'merge-commit-history',
        ],
        strongestEvidenceId: 'short-lived-branch-flow',
        evidenceCounts: { experience: 3, project: 1 },
      },
      {
        capabilityKey: 'trunk-based-development',
        evidenceIds: [
          'short-lived-branch-flow',
          'protected-review-gates',
          'merge-commit-history',
          'nx-affected-quality-gates',
        ],
        strongestEvidenceId: 'short-lived-branch-flow',
        evidenceCounts: { experience: 4 },
      },
      {
        capabilityKey: 'continuous-integration',
        evidenceIds: [
          'terraform-codepipeline-platform',
          'codebuild-pr-gates',
          'nx-affected-quality-gates',
          'github-actions-gitops-handoff',
          'kustomize-tag-update-reliability',
          'continuous-integration-skill-terraform',
          'continuous-integration-skill-codepipeline',
          'continuous-integration-skill-codebuild',
          'continuous-integration-skill-ecr',
          'continuous-integration-skill-github',
          'continuous-integration-skill-parameter-store',
          'continuous-integration-skill-docker',
          'continuous-integration-skill-nx',
          'continuous-integration-skill-github-actions',
          'continuous-integration-skill-openid-connect',
          'continuous-integration-skill-kustomize',
          'continuous-integration-skill-helm',
          'continuous-integration-skill-argo-cd',
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
          'github-actions-ci',
          'docker-delivery',
          'team-delivery-workflow',
        ],
        strongestEvidenceId: 'github-actions-ci',
        evidenceCounts: { experience: 3 },
      },
      {
        capabilityKey: 'deployment-automation',
        evidenceIds: [
          'github-actions-ci',
          'docker-delivery',
          'image-digest-deployments',
        ],
        strongestEvidenceId: 'github-actions-ci',
        evidenceCounts: { experience: 3 },
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
      'short-lived-branch-flow',
      'protected-review-gates',
      'merge-commit-history',
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
        id: 'short-lived-branch-flow',
        label: 'Short-lived branches',
        capabilityKeys: ['trunk-based-development', 'version-control'],
      },
      {
        id: 'protected-review-gates',
        label: 'Protected reviews',
        capabilityKeys: [
          'trunk-based-development',
          'continuous-integration',
          'version-control',
        ],
      },
      {
        id: 'merge-commit-history',
        label: 'Merge commits',
        capabilityKeys: ['trunk-based-development', 'version-control'],
      },
      {
        id: 'nx-affected-quality-gates',
        label: 'Nx affected',
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
      'github-actions-ci',
      'docker-delivery',
      'team-delivery-workflow',
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
        id: 'github-actions-ci',
        label: 'GitHub Actions',
        capabilityKeys: ['continuous-delivery', 'deployment-automation'],
      },
      {
        id: 'docker-delivery',
        label: 'Docker',
        capabilityKeys: ['continuous-delivery', 'deployment-automation'],
      },
      {
        id: 'team-delivery-workflow',
        label: 'Team delivery',
        capabilityKeys: ['continuous-delivery'],
      },
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

  it('curates two AWS and three GitHub monorepo records for the CI card', () => {
    const score = curatedDevOpsCapabilityRadarScores.find(
      (entry) => entry.capabilityKey === 'continuous-integration',
    );
    const selected = (score?.evidenceIds ?? []).map((id) =>
      devOpsCapabilityEvidenceItems.find((item) => item.id === id),
    );

    expect(score?.score).toBe(4);
    expect(score?.maxScore).toBe(5);
    expect(score?.strongestEvidenceId).toBe(score?.evidenceIds[0]);
    expect(score?.evidenceIds.slice(0, 5)).toEqual([
      'terraform-codepipeline-platform',
      'codebuild-pr-gates',
      'nx-affected-quality-gates',
      'github-actions-gitops-handoff',
      'kustomize-tag-update-reliability',
    ]);
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

  it('keeps the CI/CD experience as a public-safe portfolio projection', () => {
    const deliveryExperience = devOpsCapabilityEvidenceItems.find(
      (item) => item.id === 'github-actions-ci',
    );

    expect(deliveryExperience).toMatchObject({
      isPublic: true,
      type: 'experience',
    });
    expect(deliveryExperience?.isSensitive).toBeUndefined();
    expect(deliveryExperience?.summary).not.toMatch(
      /deployment count|incident record|pull request|private repository|customer/i,
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
      strongestEvidenceId: 'github-actions-ci',
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
      experience: 29,
      learning: 3,
      certification: 1,
      project: 2,
      skill: 14,
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
      'Evidence includes 14 skills, 3 learning items, 29 experience items, 1 certification, and 2 projects.',
    );
  });
});
