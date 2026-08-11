import { cncfCertificationBadges } from './cncf-certification-badges';
import { kubernetesCertifications } from './kubernetes-certifications.data';

describe('kubernetes certifications', () => {
  it('owns the three concrete credentials by stable ID', () => {
    expect(Object.keys(kubernetesCertifications)).toEqual([
      'kcna',
      'cka',
      'ckad',
    ]);
    expect(Object.values(kubernetesCertifications).map(({ id, title }) => ({
      id,
      title,
    }))).toEqual([
      { id: 'kcna', title: 'KCNA' },
      { id: 'cka', title: 'CKA' },
      { id: 'ckad', title: 'CKAD' },
    ]);
  });

  it('keeps every credential complete and visually distinct', () => {
    expect(kubernetesCertifications.kcna).toMatchObject({
      citationIcon: cncfCertificationBadges.KCNA,
      expiresAt: '2028-02-26T10:59:00+11:00',
      skills: ['Kubernetes'],
      url: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-8a295e12-57c5-4008-b8ba-171b09419221-certificate.pdf',
      metadata: {
        id: 'LF-bau2ptq4ve',
        name: 'Kubernetes and Cloud Native Associate',
        completedAt: '2025-03-21',
      },
    });
    expect(kubernetesCertifications.cka).toMatchObject({
      citationIcon: cncfCertificationBadges.CKA,
      expiresAt: '2027-04-20T10:00:00+10:00',
      skills: ['Kubernetes'],
      url: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-02c68021-40fe-473f-8087-6309221395ca-certificate.pdf',
      metadata: {
        id: 'LF-assbyzy17c',
        name: 'Certified Kubernetes Administrator',
        completedAt: '2025-04-20',
      },
    });
    expect(kubernetesCertifications.ckad).toMatchObject({
      citationIcon: cncfCertificationBadges.CKAD,
      expiresAt: '2028-02-25T11:00:00+11:00',
      skills: ['Kubernetes'],
      url: 'https://ti-user-certificates.s3.amazonaws.com/e0df7fbf-a057-42af-8a1f-590912be5460/10cf307b-dcb8-5917-a301-c854a583ed97-gunwoo-kim-83c53ec1-bf5d-4b01-ae0a-c79be21d7cf2-certificate.pdf',
      metadata: {
        id: 'LF-kyh6ajhr7y',
        name: 'Certified Kubernetes Application Developer',
        completedAt: '2026-02-25',
      },
    });
    expect(new Set(Object.values(kubernetesCertifications).map(
      ({ citationIcon }) => citationIcon,
    )).size).toBe(3);
    expect(Object.values(kubernetesCertifications).every(
      ({ url }) => url.startsWith('https://ti-user-certificates.s3.amazonaws.com/'),
    )).toBe(true);
  });
});
