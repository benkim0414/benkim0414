import { continuousIntegrationEvidenceItems } from './continuous-integration-evidence.data';
import { testAutomationEvidenceItems } from './test-automation-evidence.data';
import { expectPublicSafeEvidence } from './public-evidence-safety.test-helpers';

const expectedIds = [
  'codebuild-postgresql-tests',
  'tested-ci-automation',
  'jest-testcontainers-postgres',
  'regression-gates',
  'nx-affected-quality-gates',
  'container-health-smoke-tests',
  'service-generator-unit-tests',
  'prometheus-alert-rule-tests',
] as const;

const approvedPublicCatalogText = [
  'Database-backed CodeBuild test gates',
  'PostgreSQL gates',
  'Ran application test suites against PostgreSQL while resolving test credentials at build time from AWS Systems Manager Parameter Store.',
  'AWS CodeBuild',
  'PostgreSQL',
  'AWS Systems Manager Parameter Store',
  'AWS CodePipeline platform',
  'Tests for CI support code and reconciled configuration',
  'Tested CI code',
  'Added unit tests for cross-repository dispatch support and containerized rule tests for monitoring configuration that is automatically reconciled.',
  'GitHub Actions',
  'JavaScript',
  'Prometheus',
  'Docker',
  'GitHub Actions monorepo migration',
  'Nx affected quality gates',
  'Affected-change quality gates',
  'Configured pull-request and main-branch CI to run affected lint, unit, integration, and build targets from the last successful main-branch baseline.',
  'Nx',
  'TypeScript',
  'Workflow runs',
  'Median affected CI feedback',
  'Affected CI feedback p90',
  'Jest and Testcontainers PostgreSQL coverage',
  'PostgreSQL test environments',
  'Isolated database-backed suites provision and migrate PostgreSQL for each run.',
  'Jest',
  'Testcontainers',
  'Automated testing practices',
  'Automated regression gates before merge',
  'Regression gates',
  'Required regression checks gate merge decisions.',
  'CI',
  'Automated container health smoke tests',
  'Container smoke tests',
  'Images are built, started, and polled through a health endpoint.',
  'Unit-tested service onboarding generators',
  'Generator tests',
  'Service-generator behavior is protected by focused assertions.',
  'Automated Prometheus alert-rule tests',
  'Alert-rule tests',
  'Alert rules run against declarative test cases using a pinned Prometheus image.',
  'promtool',
] as const;

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const isIsoCalendarDate = (value: string): boolean => {
  if (!isoDate.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const daysInMonth = [
    31,
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return (
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= (daysInMonth[month - 1] ?? 0)
  );
};
const byId = new Map(
  testAutomationEvidenceItems.map((item) => [item.id, item]),
);
const continuousIntegrationById = new Map(
  continuousIntegrationEvidenceItems.map((item) => [item.id, item]),
);

describe('testAutomationEvidenceItems', () => {
  it('fails if the catalog contract accepts an impossible calendar date', () => {
    expect(isIsoCalendarDate('2024-02-29')).toBe(true);
    expect(isIsoCalendarDate('2024-02-30')).toBe(false);
  });

  it('fails if the approved catalog order, completeness, or canonical shared identities change', () => {
    expect(testAutomationEvidenceItems.map((item) => item.id)).toEqual(
      expectedIds,
    );
    expect(
      new Set(testAutomationEvidenceItems.map((item) => item.id)).size,
    ).toBe(8);

    expect(byId.get('codebuild-postgresql-tests')).toBe(
      continuousIntegrationById.get('codebuild-postgresql-tests'),
    );
    expect(byId.get('tested-ci-automation')).toBe(
      continuousIntegrationById.get('tested-ci-automation'),
    );
    expect(byId.get('nx-affected-quality-gates')).toBe(
      continuousIntegrationById.get('nx-affected-quality-gates'),
    );
  });

  it('fails if a Test Automation record loses its required public structured evidence', () => {
    for (const item of testAutomationEvidenceItems) {
      expect(item.type).toBe('experience');
      expect(item.capabilityKeys).toContain('test-automation');
      expect(item.isPublic).toBe(true);
      expect(item.isSensitive).not.toBe(true);
      expect(item.organization).toBeUndefined();
      expect(item.proofUrl).toBeUndefined();
      expect(item.details?.period.startedAt).toSatisfy(isIsoCalendarDate);
      if (item.details?.period.endedAt) {
        expect(item.details.period.endedAt).toSatisfy(isIsoCalendarDate);
      }
      expect(item.details?.facts.length).toBeGreaterThan(0);

      for (const metric of item.details?.metrics ?? []) {
        expect(Number.isFinite(metric.value)).toBe(true);
        expect(metric.value).toBeGreaterThanOrEqual(0);
        expect(metric.measuredAt).toMatch(isoDate);

        if (metric.unit === 'percent') {
          expect(metric.value).toBeLessThanOrEqual(100);
        }

        if (metric.denominator !== undefined) {
          expect(Number.isFinite(metric.denominator)).toBe(true);
          expect(metric.denominator).toBeGreaterThan(0);
          expect(metric.value).toBeLessThanOrEqual(metric.denominator);
        }
      }
    }
  });

  it('fails if approved Test Automation experiences no longer carry their reviewed public values', () => {
    expect(
      expectedIds.slice(2).map((id) => {
        const item = byId.get(id);
        return [
          item?.id,
          item?.title,
          item?.label,
          item?.summary,
          item?.technologies,
          item?.strength,
          item?.details?.initiative,
          item?.details?.period,
          item?.details?.facts,
        ];
      }),
    ).toEqual([
      [
        'jest-testcontainers-postgres',
        'Jest and Testcontainers PostgreSQL coverage',
        'PostgreSQL test environments',
        'Isolated database-backed suites provision and migrate PostgreSQL for each run.',
        ['Jest', 'Testcontainers', 'PostgreSQL'],
        'primary',
        {
          id: 'automated-testing-practices',
          label: 'Automated testing practices',
        },
        { startedAt: '2024-02-28' },
        [
          'Isolated database-backed suites provision and migrate PostgreSQL for each run.',
        ],
      ],
      [
        'regression-gates',
        'Automated regression gates before merge',
        'Regression gates',
        'Required regression checks gate merge decisions.',
        ['CI', 'Jest'],
        'primary',
        {
          id: 'automated-testing-practices',
          label: 'Automated testing practices',
        },
        { startedAt: '2024-02-28' },
        ['Required regression checks gate merge decisions.'],
      ],
      [
        'nx-affected-quality-gates',
        'Nx affected quality gates',
        'Affected-change quality gates',
        'Configured pull-request and main-branch CI to run affected lint, unit, integration, and build targets from the last successful main-branch baseline.',
        ['Nx', 'GitHub Actions', 'TypeScript'],
        'primary',
        {
          id: 'github-actions-monorepo',
          label: 'GitHub Actions monorepo migration',
        },
        { startedAt: '2024-02-28' },
        [
          'Configured pull-request and main-branch CI to run affected lint, unit, integration, and build targets from the last successful main-branch baseline.',
        ],
      ],
      [
        'container-health-smoke-tests',
        'Automated container health smoke tests',
        'Container smoke tests',
        'Images are built, started, and polled through a health endpoint.',
        ['Docker', 'GitHub Actions'],
        'strong',
        {
          id: 'automated-testing-practices',
          label: 'Automated testing practices',
        },
        { startedAt: '2024-02-28' },
        ['Images are built, started, and polled through a health endpoint.'],
      ],
      [
        'service-generator-unit-tests',
        'Unit-tested service onboarding generators',
        'Generator tests',
        'Service-generator behavior is protected by focused assertions.',
        ['TypeScript', 'Jest'],
        'strong',
        {
          id: 'automated-testing-practices',
          label: 'Automated testing practices',
        },
        { startedAt: '2024-02-28' },
        ['Service-generator behavior is protected by focused assertions.'],
      ],
      [
        'prometheus-alert-rule-tests',
        'Automated Prometheus alert-rule tests',
        'Alert-rule tests',
        'Alert rules run against declarative test cases using a pinned Prometheus image.',
        ['Prometheus', 'promtool'],
        'strong',
        {
          id: 'automated-testing-practices',
          label: 'Automated testing practices',
        },
        { startedAt: '2024-02-28' },
        [
          'Alert rules run against declarative test cases using a pinned Prometheus image.',
        ],
      ],
    ]);
  });

  it('fails if public catalog text adds an unreviewed or unsafe value', () => {
    expectPublicSafeEvidence(
      testAutomationEvidenceItems,
      approvedPublicCatalogText,
    );
  });
});
