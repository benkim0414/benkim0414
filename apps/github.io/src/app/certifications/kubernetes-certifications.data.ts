import { cncfCertificationBadges } from './cncf-certification-badges';
import type { CertificationRecord } from './certification.types';

export type KubernetesCertificationId = 'kcna' | 'cka' | 'ckad';

export const kubernetesCertifications = {
  kcna: {
    id: 'kcna',
    title: 'KCNA',
    citationIcon: cncfCertificationBadges.KCNA,
    skills: ['Kubernetes'],
    expiresAt: '2028-02-26T10:59:00+11:00',
    url: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-8a295e12-57c5-4008-b8ba-171b09419221-certificate.pdf',
    metadata: {
      id: 'LF-bau2ptq4ve',
      name: 'Kubernetes and Cloud Native Associate',
      completedAt: '2025-03-21',
    },
  },
  cka: {
    id: 'cka',
    title: 'CKA',
    citationIcon: cncfCertificationBadges.CKA,
    skills: ['Kubernetes'],
    expiresAt: '2027-04-20T10:00:00+10:00',
    url: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-02c68021-40fe-473f-8087-6309221395ca-certificate.pdf',
    metadata: {
      id: 'LF-assbyzy17c',
      name: 'Certified Kubernetes Administrator',
      completedAt: '2025-04-20',
    },
  },
  ckad: {
    id: 'ckad',
    title: 'CKAD',
    citationIcon: cncfCertificationBadges.CKAD,
    skills: ['Kubernetes'],
    expiresAt: '2028-02-25T11:00:00+11:00',
    url: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-83c53ec1-bf5d-4b01-ae0a-c79be21d7cf2-certificate.pdf',
    metadata: {
      id: 'LF-kyh6ajhr7y',
      name: 'Certified Kubernetes Application Developer',
      completedAt: '2026-02-25',
    },
  },
} as const satisfies Record<KubernetesCertificationId, CertificationRecord>;
