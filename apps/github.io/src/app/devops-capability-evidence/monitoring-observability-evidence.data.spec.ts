import { pervasiveSecurityEvidenceItems } from './pervasive-security-evidence.data';
import { expectPublicSafeEvidence } from './public-evidence-safety.test-helpers';
import { monitoringObservabilityEvidenceItems } from './monitoring-observability-evidence.data';

const expectedIds = [
  'version-controlled-observability-stack',
  'observability-dashboards-and-scrape-coverage',
  'prometheus-alert-and-recording-rules',
  'alertmanager-notification-routing',
  'alert-suppression-controls',
  'encrypted-alert-destinations',
  'tested-kubernetes-workload-alerts',
  'iam-security-alerting',
] as const;

const approvedPublicCatalogText = [
  'Version-controlled cloud native observability stack',
  'Observability stack',
  'Monitoring components are delivered declaratively from version control.',
  'Prometheus',
  'Alertmanager',
  'Loki',
  'Grafana',
  'Alloy',
  'Argo CD',
  'Observability platform',
  'Maintained dashboards and scrape coverage',
  'Dashboards and targets',
  'Public-safe aggregate dashboard and active-target measurements show maintained collection coverage.',
  'Published dashboard count',
  'Published active scrape target count',
  'Version-controlled Prometheus alert and recording rules',
  'Alert and recording rules',
  'Alert and recording rules are managed declaratively.',
  'Managed Alertmanager notification routing',
  'Notification routing',
  'Alert routing is configured and delivered as part of the monitoring stack.',
  'Tested alert suppression controls',
  'Alert suppression',
  'Route and inhibition behavior is tested before delivery.',
  'promtool',
  'Encrypted alert destination delivery',
  'Encrypted destinations',
  'Alert destination material is delivered as encrypted declarative configuration.',
  'Sealed Secrets',
  'Kubernetes',
  'Tested Kubernetes workload failure alerts',
  'Workload alerts',
  'Workload failure alerts include declarative test cases and documented operating limits.',
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
  monitoringObservabilityEvidenceItems.map((item) => [item.id, item]),
);
const pervasiveSecurityById = new Map(
  pervasiveSecurityEvidenceItems.map((item) => [item.id, item]),
);

const expectPublicStructuredMonitoringObservabilityEvidence = (
  items: typeof monitoringObservabilityEvidenceItems,
): void => {
  for (const item of items) {
    expect(item.type).toBe('experience');
    expect(item.capabilityKeys).toContain('monitoring-observability');
    expect(item.isPublic).toBe(true);
    expect(item.isSensitive).not.toBe(true);
    expect(item.organization).toBeUndefined();
    expect(item.proofUrl).toBeUndefined();
    expect(item.details).toBeDefined();
    expect(item.details?.period.startedAt).toSatisfy(isIsoCalendarDate);
    if (item.details?.period.endedAt !== undefined) {
      expect(item.details.period.endedAt).toSatisfy(isIsoCalendarDate);
    }
    expect(item.details?.facts.length).toBeGreaterThan(0);
    expect(item.technologies?.length).toBeGreaterThan(0);
    expect(item.details?.metrics).toBeDefined();

    for (const metric of item.details?.metrics ?? []) {
      expect(metric.label.trim().length).toBeGreaterThan(0);
      expect(Number.isFinite(metric.value)).toBe(true);
      expect(metric.value).toBeGreaterThanOrEqual(0);
      expect(metric.measuredAt).toSatisfy(isIsoCalendarDate);

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
};

describe('monitoringObservabilityEvidenceItems', () => {
  it('rejects impossible calendar dates in the catalog contract', () => {
    expect(isIsoCalendarDate('2024-02-29')).toBe(true);
    expect(isIsoCalendarDate('2024-02-30')).toBe(false);
  });

  it('stores the complete approved catalog in display order and reuses the canonical security alerting record', () => {
    expect(monitoringObservabilityEvidenceItems.map((item) => item.id)).toEqual(
      expectedIds,
    );
    expect(
      new Set(monitoringObservabilityEvidenceItems.map((item) => item.id)).size,
    ).toBe(8);
    expect(byId.get('iam-security-alerting')).toBe(
      pervasiveSecurityById.get('iam-security-alerting'),
    );
  });

  it('keeps every record public, structured, and compatible with Monitoring and Observability', () => {
    expectPublicStructuredMonitoringObservabilityEvidence(
      monitoringObservabilityEvidenceItems,
    );
  });

  it('rejects an empty endedAt value in a synthetic catalog record', () => {
    const source = byId.get('version-controlled-observability-stack');
    if (!source?.details) {
      throw new Error('Expected observability stack evidence details');
    }

    const emptyEndedAtRecord = {
      ...source,
      details: {
        ...source.details,
        period: { ...source.details.period, endedAt: '' },
      },
    };

    expect(() =>
      expectPublicStructuredMonitoringObservabilityEvidence([
        emptyEndedAtRecord,
      ]),
    ).toThrow();
  });

  it('keeps the seven owned experiences at their reviewed public values', () => {
    expect(
      expectedIds.slice(0, 7).map((id) => {
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
          item?.details?.metrics,
          item?.details?.facts,
          item?.capabilityKeys,
        ];
      }),
    ).toEqual([
      [
        'version-controlled-observability-stack',
        'Version-controlled cloud native observability stack',
        'Observability stack',
        'Monitoring components are delivered declaratively from version control.',
        ['Prometheus', 'Alertmanager', 'Loki', 'Grafana', 'Alloy', 'Argo CD'],
        'primary',
        { id: 'observability-platform', label: 'Observability platform' },
        { startedAt: '2024-06-03' },
        [],
        [
          'Monitoring components are delivered declaratively from version control.',
        ],
        ['monitoring-observability'],
      ],
      [
        'observability-dashboards-and-scrape-coverage',
        'Maintained dashboards and scrape coverage',
        'Dashboards and targets',
        'Public-safe aggregate dashboard and active-target measurements show maintained collection coverage.',
        ['Grafana', 'Prometheus'],
        'strong',
        { id: 'observability-platform', label: 'Observability platform' },
        { startedAt: '2024-06-03' },
        [
          {
            label: 'Published dashboard count',
            value: 1,
            unit: 'count',
            measuredAt: '2026-08-09',
          },
          {
            label: 'Published active scrape target count',
            value: 1,
            unit: 'count',
            measuredAt: '2026-08-09',
          },
        ],
        [
          'Public-safe aggregate dashboard and active-target measurements show maintained collection coverage.',
        ],
        ['monitoring-observability'],
      ],
      [
        'prometheus-alert-and-recording-rules',
        'Version-controlled Prometheus alert and recording rules',
        'Alert and recording rules',
        'Alert and recording rules are managed declaratively.',
        ['Prometheus'],
        'strong',
        { id: 'observability-platform', label: 'Observability platform' },
        { startedAt: '2024-06-03' },
        [],
        ['Alert and recording rules are managed declaratively.'],
        ['monitoring-observability'],
      ],
      [
        'alertmanager-notification-routing',
        'Managed Alertmanager notification routing',
        'Notification routing',
        'Alert routing is configured and delivered as part of the monitoring stack.',
        ['Alertmanager'],
        'strong',
        { id: 'observability-platform', label: 'Observability platform' },
        { startedAt: '2024-06-03' },
        [],
        [
          'Alert routing is configured and delivered as part of the monitoring stack.',
        ],
        ['monitoring-observability'],
      ],
      [
        'alert-suppression-controls',
        'Tested alert suppression controls',
        'Alert suppression',
        'Route and inhibition behavior is tested before delivery.',
        ['Alertmanager', 'promtool'],
        'strong',
        { id: 'observability-platform', label: 'Observability platform' },
        { startedAt: '2024-06-03' },
        [],
        ['Route and inhibition behavior is tested before delivery.'],
        ['monitoring-observability'],
      ],
      [
        'encrypted-alert-destinations',
        'Encrypted alert destination delivery',
        'Encrypted destinations',
        'Alert destination material is delivered as encrypted declarative configuration.',
        ['Sealed Secrets', 'Argo CD', 'Kubernetes'],
        'strong',
        { id: 'observability-platform', label: 'Observability platform' },
        { startedAt: '2024-06-03' },
        [],
        [
          'Alert destination material is delivered as encrypted declarative configuration.',
        ],
        ['monitoring-observability'],
      ],
      [
        'tested-kubernetes-workload-alerts',
        'Tested Kubernetes workload failure alerts',
        'Workload alerts',
        'Workload failure alerts include declarative test cases and documented operating limits.',
        ['Prometheus', 'promtool', 'Kubernetes'],
        'strong',
        { id: 'observability-platform', label: 'Observability platform' },
        { startedAt: '2024-06-03' },
        [],
        [
          'Workload failure alerts include declarative test cases and documented operating limits.',
        ],
        ['monitoring-observability'],
      ],
    ]);
  });

  it('keeps publication text reviewed, affirmative, and public-safe', () => {
    expectPublicSafeEvidence(
      monitoringObservabilityEvidenceItems.slice(0, 7),
      approvedPublicCatalogText,
    );
  });
});
