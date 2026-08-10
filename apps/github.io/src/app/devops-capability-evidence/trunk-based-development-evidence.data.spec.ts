import { trunkBasedDevelopmentEvidenceItems } from './trunk-based-development-evidence.data';

const expectedIds = [
  'single-trunk-repository-flow',
  'short-lived-branch-flow',
  'small-change-landings',
  'merge-commit-history',
  'nx-affected-quality-gates',
  'conventional-commit-governance',
] as const;

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const byId = new Map(
  trunkBasedDevelopmentEvidenceItems.map((item) => [item.id, item]),
);

describe('trunkBasedDevelopmentEvidenceItems', () => {
  it('stores the approved Trunk-Based Development experiences in display order', () => {
    expect(trunkBasedDevelopmentEvidenceItems.map(({ id }) => id)).toEqual(
      expectedIds,
    );
  });

  it('keeps every experience public, structured, positive-only, and capability-compatible', () => {
    for (const item of trunkBasedDevelopmentEvidenceItems) {
      expect(item.type).toBe('experience');
      expect(item.capabilityKeys).toContain('trunk-based-development');
      expect(item.isPublic).toBe(true);
      expect(item.isSensitive).not.toBe(true);
      expect(item.organization).toBeUndefined();
      expect(item.proofUrl).toBeUndefined();
      expect(item.details?.period.startedAt).toMatch(isoDate);
      expect(item.details?.facts.length).toBeGreaterThan(0);
      expect(item.technologies?.length).toBeGreaterThan(0);
      expect(item.label?.trim().split(/\s+/).length).toBeLessThanOrEqual(4);

      for (const metric of item.details?.metrics ?? []) {
        expect(Number.isFinite(metric.value)).toBe(true);
        expect(metric.value).toBeGreaterThanOrEqual(0);
        expect(metric.measuredAt).toMatch(isoDate);
        if (metric.unit === 'percent') {
          expect(metric.value).toBeLessThanOrEqual(100);
        }
        if (metric.denominator !== undefined) {
          expect(metric.denominator).toBeGreaterThan(0);
          expect(metric.value).toBeLessThanOrEqual(metric.denominator);
        }
      }
    }
  });

  it('reports the approved single-trunk, branch-flow, and small-batch measurements', () => {
    expect(byId.get('single-trunk-repository-flow')?.details?.metrics).toEqual([
      {
        label: 'Delivery repositories using one primary integration branch',
        value: 2,
        unit: 'count',
        measuredAt: '2026-08-09',
      },
    ]);
    expect(byId.get('short-lived-branch-flow')?.details?.metrics).toEqual([
      {
        label: 'Median integration time in one repository',
        value: 972,
        unit: 'seconds',
        measuredAt: '2026-08-09',
      },
      {
        label: 'Integrations within one day in one repository',
        value: 85,
        unit: 'percent',
        denominator: 214,
        measuredAt: '2026-08-09',
      },
      {
        label: 'Median integration time in another repository',
        value: 6006,
        unit: 'seconds',
        measuredAt: '2026-08-09',
      },
      {
        label: 'Integrations within one day in another repository',
        value: 71.2,
        unit: 'percent',
        denominator: 378,
        measuredAt: '2026-08-09',
      },
    ]);
    expect(byId.get('small-change-landings')?.details?.metrics).toEqual([
      {
        label: 'Median files per landing in one repository',
        value: 3,
        unit: 'count',
        denominator: 211,
        measuredAt: '2026-08-09',
      },
      {
        label: 'Median lines per landing in one repository',
        value: 60,
        unit: 'count',
        denominator: 211,
        measuredAt: '2026-08-09',
      },
      {
        label: 'Median commits per landing in one repository',
        value: 2,
        unit: 'count',
        denominator: 211,
        measuredAt: '2026-08-09',
      },
      {
        label: 'Median files per landing in another repository',
        value: 4,
        unit: 'count',
        denominator: 304,
        measuredAt: '2026-08-09',
      },
      {
        label: 'Median lines per landing in another repository',
        value: 146,
        unit: 'count',
        denominator: 304,
        measuredAt: '2026-08-09',
      },
      {
        label: 'Median commits per landing in another repository',
        value: 2,
        unit: 'count',
        denominator: 304,
        measuredAt: '2026-08-09',
      },
    ]);
  });

  it('keeps public evidence free of private identifiers and negative claims', () => {
    const publicText = JSON.stringify(trunkBasedDevelopmentEvidenceItems);

    expect(publicText).not.toMatch(/https?:\/\//);
    expect(publicText).not.toMatch(/\b\d{12}\b/);
    expect(publicText).not.toMatch(/employer|customer|client|organization/i);
    expect(publicText).not.toMatch(/private source|private repository/i);
    expect(publicText).not.toMatch(
      /fully automated production|rollback.*absent/i,
    );
  });
});
