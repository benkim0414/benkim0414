import { capabilityEvidenceInitiatives } from './capability-evidence-initiatives';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';
import { pervasiveSecurityEvidenceItems } from './pervasive-security-evidence.data';

const observabilityPlatform =
  capabilityEvidenceInitiatives.observabilityPlatform;
const snapshotDate = '2026-08-09';
const sharedById = new Map(
  pervasiveSecurityEvidenceItems.map((item) => [item.id, item]),
);

const requiredSharedExperience = (id: string): CapabilityEvidenceItem => {
  const item = sharedById.get(id);
  if (
    !item ||
    item.type !== 'experience' ||
    !item.capabilityKeys.includes('monitoring-observability')
  ) {
    throw new Error(
      `Monitoring and Observability evidence requires shared experience: ${id}`,
    );
  }
  return item;
};

const monitoringObservabilityOwnedExperienceItems = [
  {
    id: 'version-controlled-observability-stack',
    title: 'Version-controlled cloud native observability stack',
    label: 'Observability stack',
    type: 'experience',
    capabilityKeys: ['monitoring-observability'],
    summary:
      'Monitoring components are delivered declaratively from version control.',
    technologies: [
      'Prometheus',
      'Alertmanager',
      'Loki',
      'Grafana',
      'Alloy',
      'Argo CD',
    ],
    details: {
      initiative: observabilityPlatform,
      period: { startedAt: '2024-06-03' },
      metrics: [],
      facts: [
        'Monitoring components are delivered declaratively from version control.',
      ],
    },
    isPublic: true,
    strength: 'primary',
  },
  {
    id: 'observability-dashboards-and-scrape-coverage',
    title: 'Maintained dashboards and scrape coverage',
    label: 'Dashboards and targets',
    type: 'experience',
    capabilityKeys: ['monitoring-observability'],
    summary:
      'Public-safe aggregate dashboard and active-target measurements show maintained collection coverage.',
    technologies: ['Grafana', 'Prometheus'],
    details: {
      initiative: observabilityPlatform,
      period: { startedAt: '2024-06-03' },
      metrics: [
        {
          label: 'Published dashboard count',
          value: 1,
          unit: 'count',
          measuredAt: snapshotDate,
        },
        {
          label: 'Published active scrape target count',
          value: 1,
          unit: 'count',
          measuredAt: snapshotDate,
        },
      ],
      facts: [
        'Public-safe aggregate dashboard and active-target measurements show maintained collection coverage.',
      ],
    },
    isPublic: true,
    strength: 'strong',
  },
  {
    id: 'prometheus-alert-and-recording-rules',
    title: 'Version-controlled Prometheus alert and recording rules',
    label: 'Alert and recording rules',
    type: 'experience',
    capabilityKeys: ['monitoring-observability'],
    summary: 'Alert and recording rules are managed declaratively.',
    technologies: ['Prometheus'],
    details: {
      initiative: observabilityPlatform,
      period: { startedAt: '2024-06-03' },
      metrics: [],
      facts: ['Alert and recording rules are managed declaratively.'],
    },
    isPublic: true,
    strength: 'strong',
  },
  {
    id: 'alertmanager-notification-routing',
    title: 'Managed Alertmanager notification routing',
    label: 'Notification routing',
    type: 'experience',
    capabilityKeys: ['monitoring-observability'],
    summary:
      'Alert routing is configured and delivered as part of the monitoring stack.',
    technologies: ['Alertmanager'],
    details: {
      initiative: observabilityPlatform,
      period: { startedAt: '2024-06-03' },
      metrics: [],
      facts: [
        'Alert routing is configured and delivered as part of the monitoring stack.',
      ],
    },
    isPublic: true,
    strength: 'strong',
  },
  {
    id: 'alert-suppression-controls',
    title: 'Tested alert suppression controls',
    label: 'Alert suppression',
    type: 'experience',
    capabilityKeys: ['monitoring-observability'],
    summary: 'Route and inhibition behavior is tested before delivery.',
    technologies: ['Alertmanager', 'promtool'],
    details: {
      initiative: observabilityPlatform,
      period: { startedAt: '2024-06-03' },
      metrics: [],
      facts: ['Route and inhibition behavior is tested before delivery.'],
    },
    isPublic: true,
    strength: 'strong',
  },
  {
    id: 'encrypted-alert-destinations',
    title: 'Encrypted alert destination delivery',
    label: 'Encrypted destinations',
    type: 'experience',
    capabilityKeys: ['monitoring-observability'],
    summary:
      'Alert destination material is delivered as encrypted declarative configuration.',
    technologies: ['Sealed Secrets', 'Argo CD', 'Kubernetes'],
    details: {
      initiative: observabilityPlatform,
      period: { startedAt: '2024-06-03' },
      metrics: [],
      facts: [
        'Alert destination material is delivered as encrypted declarative configuration.',
      ],
    },
    isPublic: true,
    strength: 'strong',
  },
  {
    id: 'tested-kubernetes-workload-alerts',
    title: 'Tested Kubernetes workload failure alerts',
    label: 'Workload alerts',
    type: 'experience',
    capabilityKeys: ['monitoring-observability'],
    summary:
      'Workload failure alerts include declarative test cases and documented operating limits.',
    technologies: ['Prometheus', 'promtool', 'Kubernetes'],
    details: {
      initiative: observabilityPlatform,
      period: { startedAt: '2024-06-03' },
      metrics: [],
      facts: [
        'Workload failure alerts include declarative test cases and documented operating limits.',
      ],
    },
    isPublic: true,
    strength: 'strong',
  },
] as const satisfies readonly CapabilityEvidenceItem[];

export const monitoringObservabilityEvidenceItems: readonly CapabilityEvidenceItem[] =
  [
    ...monitoringObservabilityOwnedExperienceItems,
    requiredSharedExperience('iam-security-alerting'),
  ];
