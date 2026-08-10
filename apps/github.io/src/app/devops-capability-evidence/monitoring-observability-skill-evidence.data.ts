import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

const monitoringObservabilitySkillDefinitions = [
  {
    id: 'monitoring-observability-skill-prometheus',
    name: 'Prometheus',
    supports: [
      'version-controlled-observability-stack',
      'prometheus-alert-and-recording-rules',
      'tested-kubernetes-workload-alerts',
    ],
  },
  {
    id: 'monitoring-observability-skill-promtool',
    name: 'promtool',
    supports: [
      'alert-suppression-controls',
      'tested-kubernetes-workload-alerts',
    ],
  },
  {
    id: 'monitoring-observability-skill-alertmanager',
    name: 'Alertmanager',
    supports: ['version-controlled-observability-stack'],
  },
  {
    id: 'monitoring-observability-skill-loki',
    name: 'Loki',
    supports: ['version-controlled-observability-stack'],
  },
  {
    id: 'monitoring-observability-skill-grafana',
    name: 'Grafana',
    supports: ['version-controlled-observability-stack'],
  },
  {
    id: 'monitoring-observability-skill-grafana-alloy',
    name: 'Grafana Alloy',
    supports: ['version-controlled-observability-stack'],
  },
  {
    id: 'monitoring-observability-skill-kubernetes',
    name: 'Kubernetes',
    supports: ['version-controlled-observability-stack'],
  },
  {
    id: 'monitoring-observability-skill-helm',
    name: 'Helm',
    supports: ['version-controlled-observability-stack'],
  },
  {
    id: 'monitoring-observability-skill-argo-cd',
    name: 'Argo CD',
    supports: ['version-controlled-observability-stack'],
  },
  {
    id: 'monitoring-observability-skill-kustomize',
    name: 'Kustomize',
    supports: ['version-controlled-observability-stack'],
  },
  {
    id: 'monitoring-observability-skill-sealed-secrets',
    name: 'Sealed Secrets',
    supports: ['encrypted-alert-destinations'],
  },
  {
    id: 'monitoring-observability-skill-aws-eventbridge',
    name: 'AWS EventBridge',
    supports: ['iam-security-alerting'],
  },
  {
    id: 'monitoring-observability-skill-aws-lambda',
    name: 'AWS Lambda',
    supports: ['iam-security-alerting'],
  },
] as const;

export const monitoringObservabilitySkillEvidenceItems: readonly CapabilityEvidenceItem[] =
  monitoringObservabilitySkillDefinitions.map(({ id, name, supports }) => ({
    id,
    title: name,
    label: name,
    type: 'skill',
    capabilityKeys: ['monitoring-observability'],
    summary: `Evidence-backed Monitoring and Observability capability with ${name}.`,
    technologies: [name],
    isPublic: true,
    strength: 'supporting',
    supportingEvidenceIds: supports,
  }));
