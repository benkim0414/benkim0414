import { versionControlEvidenceItems } from './version-control-evidence.data';

const expectedIds = [
  'codepipeline-webhook-trunk',
  'terraform-codepipeline-platform',
  'reusable-helm-deployment-image',
  'github-actions-gitops-handoff',
  'argocd-environment-state-from-version-control',
  'gitops-same-package-environments',
  'argocd-automated-database-migrations',
  'merge-commit-history',
  'conventional-commit-governance',
] as const;

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const byId = new Map(
  versionControlEvidenceItems.map((item) => [item.id, item]),
);

describe('versionControlEvidenceItems', () => {
  it('stores the approved Version Control experiences in display order', () => {
    expect(versionControlEvidenceItems.map(({ id }) => id)).toEqual(
      expectedIds,
    );
  });

  it('keeps every experience public, structured, and capability-compatible', () => {
    for (const item of versionControlEvidenceItems) {
      expect(item.type).toBe('experience');
      expect(item.capabilityKeys).toContain('version-control');
      expect(item.isPublic).toBe(true);
      expect(item.isSensitive).not.toBe(true);
      expect(item.organization).toBeUndefined();
      expect(item.proofUrl).toBeUndefined();
      expect(item.details?.period.startedAt).toMatch(isoDate);
      expect(item.details?.facts.length).toBeGreaterThan(0);
      expect(item.technologies?.length).toBeGreaterThan(0);

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

  it('keeps the new and upgraded compact labels to four words or fewer', () => {
    for (const id of [
      'merge-commit-history',
      'conventional-commit-governance',
    ]) {
      const label = byId.get(id)?.label;

      expect(label).toBeDefined();
      expect(label?.trim().split(/\s+/).length).toBeLessThanOrEqual(4);
    }
  });

  it('attaches the approved merge-history metric', () => {
    expect(byId.get('merge-commit-history')?.details?.metrics).toEqual([
      {
        label: 'Resolvable integrations preserving merge history',
        value: 575,
        unit: 'count',
        denominator: 575,
        measuredAt: '2026-08-09',
      },
    ]);
  });

  it('attaches the approved commit-governance conformance metrics', () => {
    expect(
      byId.get('conventional-commit-governance')?.details?.metrics,
    ).toEqual([
      {
        label: 'Authored commit conformance in one repository',
        value: 91.4,
        unit: 'percent',
        denominator: 1021,
        measuredAt: '2026-08-09',
      },
      {
        label: 'Authored commit conformance in another repository',
        value: 99,
        unit: 'percent',
        denominator: 1367,
        measuredAt: '2026-08-09',
      },
    ]);
  });

  it('keeps public evidence free of private identifiers and negative claims', () => {
    const publicText = JSON.stringify(versionControlEvidenceItems);

    expect(publicText).not.toMatch(/https?:\/\//);
    expect(publicText).not.toMatch(/\b\d{12}\b/);
    expect(publicText).not.toMatch(/employer|customer|client|organization/i);
    expect(publicText).not.toMatch(/private source|private repository/i);
    expect(publicText).not.toMatch(
      /fully automated production|rollback.*absent/i,
    );
  });
});
