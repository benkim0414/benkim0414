import { monitoringObservabilityEvidenceItems } from './monitoring-observability-evidence.data';
import { monitoringObservabilitySkillEvidenceItems } from './monitoring-observability-skill-evidence.data';
import { expectPublicSafeEvidence } from './public-evidence-safety.test-helpers';

const expectedSkillSet = [
  ['monitoring-observability-skill-prometheus', 'Prometheus'],
  ['monitoring-observability-skill-promtool', 'promtool'],
  ['monitoring-observability-skill-alertmanager', 'Alertmanager'],
  ['monitoring-observability-skill-loki', 'Loki'],
  ['monitoring-observability-skill-grafana', 'Grafana'],
  ['monitoring-observability-skill-grafana-alloy', 'Alloy'],
  ['monitoring-observability-skill-kubernetes', 'Kubernetes'],
  ['monitoring-observability-skill-helm', 'Helm'],
  ['monitoring-observability-skill-argo-cd', 'Argo CD'],
  ['monitoring-observability-skill-kustomize', 'Kustomize'],
  ['monitoring-observability-skill-sealed-secrets', 'Sealed Secrets'],
  ['monitoring-observability-skill-aws-eventbridge', 'AWS EventBridge'],
  ['monitoring-observability-skill-aws-lambda', 'AWS Lambda'],
] as const;

const expectedSupport = {
  'monitoring-observability-skill-prometheus': [
    'version-controlled-observability-stack',
    'prometheus-alert-and-recording-rules',
    'tested-kubernetes-workload-alerts',
  ],
  'monitoring-observability-skill-promtool': [
    'alert-suppression-controls',
    'tested-kubernetes-workload-alerts',
  ],
  'monitoring-observability-skill-alertmanager': [
    'version-controlled-observability-stack',
  ],
  'monitoring-observability-skill-loki': [
    'version-controlled-observability-stack',
  ],
  'monitoring-observability-skill-grafana': [
    'version-controlled-observability-stack',
  ],
  'monitoring-observability-skill-grafana-alloy': [
    'version-controlled-observability-stack',
  ],
  'monitoring-observability-skill-kubernetes': [
    'version-controlled-observability-stack',
  ],
  'monitoring-observability-skill-helm': [
    'version-controlled-observability-stack',
  ],
  'monitoring-observability-skill-argo-cd': [
    'version-controlled-observability-stack',
  ],
  'monitoring-observability-skill-kustomize': [
    'version-controlled-observability-stack',
  ],
  'monitoring-observability-skill-sealed-secrets': [
    'encrypted-alert-destinations',
  ],
  'monitoring-observability-skill-aws-eventbridge': ['iam-security-alerting'],
  'monitoring-observability-skill-aws-lambda': ['iam-security-alerting'],
} as const;

const expectedChronology = [
  ['Prometheus', '2024-06-03'],
  ['promtool', '2024-06-03'],
  ['Alertmanager', '2024-06-03'],
  ['Loki', '2024-06-03'],
  ['Grafana', '2024-06-03'],
  ['Alloy', '2024-06-03'],
  ['Kubernetes', '2024-06-03'],
  ['Helm', '2024-06-03'],
  ['Argo CD', '2024-06-03'],
  ['Kustomize', '2024-06-03'],
  ['Sealed Secrets', '2024-06-03'],
  ['AWS EventBridge', '2024-06-03'],
  ['AWS Lambda', '2024-06-03'],
] as const;

const approvedPublicSkillText = [
  'Prometheus',
  'Evidence-backed Monitoring and Observability capability with Prometheus.',
  'promtool',
  'Evidence-backed Monitoring and Observability capability with promtool.',
  'Alertmanager',
  'Evidence-backed Monitoring and Observability capability with Alertmanager.',
  'Loki',
  'Evidence-backed Monitoring and Observability capability with Loki.',
  'Grafana',
  'Evidence-backed Monitoring and Observability capability with Grafana.',
  'Alloy',
  'Evidence-backed Monitoring and Observability capability with Alloy.',
  'Kubernetes',
  'Evidence-backed Monitoring and Observability capability with Kubernetes.',
  'Helm',
  'Evidence-backed Monitoring and Observability capability with Helm.',
  'Argo CD',
  'Evidence-backed Monitoring and Observability capability with Argo CD.',
  'Kustomize',
  'Evidence-backed Monitoring and Observability capability with Kustomize.',
  'Sealed Secrets',
  'Evidence-backed Monitoring and Observability capability with Sealed Secrets.',
  'AWS EventBridge',
  'Evidence-backed Monitoring and Observability capability with AWS EventBridge.',
  'AWS Lambda',
  'Evidence-backed Monitoring and Observability capability with AWS Lambda.',
] as const;

describe('monitoringObservabilitySkillEvidenceItems', () => {
  it('stores exactly the approved skill IDs and titles in workflow order', () => {
    expect(
      monitoringObservabilitySkillEvidenceItems.map(({ id, title }) => [
        id,
        title,
      ]),
    ).toEqual(expectedSkillSet);
  });

  it('orders skills by earliest support date while keeping workflow ties stable', () => {
    const experienceById = new Map(
      monitoringObservabilityEvidenceItems.map((item) => [item.id, item]),
    );
    const chronology = monitoringObservabilitySkillEvidenceItems.map(
      (skill) => {
        const supportDates = (skill.supportingEvidenceIds ?? []).map(
          (supportId) =>
            experienceById.get(supportId)?.details?.period.startedAt,
        );
        const earliestSupportDate = supportDates.reduce<string | undefined>(
          (earliest, date) =>
            date && (!earliest || date < earliest) ? date : earliest,
          undefined,
        );

        return [skill.title, earliestSupportDate];
      },
    );

    expect(chronology).toEqual(expectedChronology);
  });

  it('links each public skill to its approved public Monitoring and Observability experience', () => {
    const experienceById = new Map(
      monitoringObservabilityEvidenceItems.map((item) => [item.id, item]),
    );

    for (const skill of monitoringObservabilitySkillEvidenceItems) {
      expect(skill).toMatchObject({
        label: skill.title,
        type: 'skill',
        capabilityKeys: ['monitoring-observability'],
        technologies: [skill.title],
        isPublic: true,
        strength: 'supporting',
      });
      expect(skill.isSensitive).not.toBe(true);
      expect(skill.date).toBeUndefined();
      expect(skill.endDate).toBeUndefined();
      expect(skill.details).toBeUndefined();
      expect(skill.organization).toBeUndefined();
      expect(skill.proofUrl).toBeUndefined();
      expect(skill.supportingEvidenceIds).toEqual(
        expectedSupport[skill.id as keyof typeof expectedSupport],
      );
      expect(skill.supportingEvidenceIds?.length).toBeGreaterThan(0);

      for (const supportId of skill.supportingEvidenceIds ?? []) {
        const support = experienceById.get(supportId);
        expect(support, `${skill.id} support ${supportId}`).toBeDefined();
        expect(support?.type).toBe('experience');
        expect(support?.type).not.toBe('skill');
        expect(support?.isPublic).toBe(true);
        expect(support?.capabilityKeys).toContain('monitoring-observability');
      }
    }
  });

  it('keeps the published skill catalog public-safe and reviewable', () => {
    expectPublicSafeEvidence(
      monitoringObservabilitySkillEvidenceItems,
      approvedPublicSkillText,
    );
  });
});
