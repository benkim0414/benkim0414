import { kubernetesCertifications } from '../certifications/kubernetes-certifications.data';
import type { KubernetesCertificationId } from '../certifications/kubernetes-certifications.data';
import type {
  CapabilityEvidenceItem,
  DoraCapabilityKey,
} from './devops-capability-evidence.types';

const doraDetails = {
  kcna: {
    capabilityKeys: ['flexible-infrastructure'],
    summary:
      'Validated foundational Kubernetes, container orchestration, and cloud-native architecture knowledge.',
  },
  cka: {
    capabilityKeys: [
      'flexible-infrastructure',
      'monitoring-observability',
    ],
    summary:
      'Validated hands-on Kubernetes cluster administration, networking, storage, and troubleshooting skills.',
  },
  ckad: {
    capabilityKeys: [
      'continuous-delivery',
      'deployment-automation',
      'monitoring-observability',
    ],
    summary:
      'Validated hands-on Kubernetes application design, deployment, configuration, observability, and maintenance skills.',
  },
} as const satisfies Record<
  KubernetesCertificationId,
  {
    readonly capabilityKeys: readonly DoraCapabilityKey[];
    readonly summary: string;
  }
>;

export const kubernetesCertificationEvidenceItems = (
  ['kcna', 'cka', 'ckad'] as const
).map((id): CapabilityEvidenceItem => {
  const certification = kubernetesCertifications[id];
  const details = doraDetails[id];

  return {
    id: `cncf-${id}-certification`,
    title: certification.metadata.name,
    label: certification.title,
    type: 'certification',
    issuer: 'Cloud Native Computing Foundation',
    capabilityKeys: details.capabilityKeys,
    date: certification.metadata.completedAt,
    endDate: certification.expiresAt,
    citationIcon: certification.citationIcon,
    summary: details.summary,
    technologies: certification.skills,
    proofUrl: certification.url,
    certificationMetadata: certification.metadata,
    isPublic: true,
    strength: 'primary',
  };
});
