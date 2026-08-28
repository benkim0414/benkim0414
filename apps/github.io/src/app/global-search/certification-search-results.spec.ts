import { kubernetesCertifications } from '../certifications/kubernetes-certifications.data';
import { createCertificationSearchResults } from './certification-search-results';

describe('createCertificationSearchResults', () => {
  it('creates external certification destinations in the Certifications group', () => {
    const [result] = createCertificationSearchResults([
      kubernetesCertifications.cka,
    ]);

    expect(result).toMatchObject({
      id: 'certification:cka',
      label: 'CKA',
      href: kubernetesCertifications.cka.url,
      group: 'Certifications',
    });
    expect(result).not.toHaveProperty('certification');
  });

  it('preserves certification metadata and skill matching data', () => {
    const [result] = createCertificationSearchResults([
      kubernetesCertifications.cka,
    ]);

    expect(result.keywords).toEqual([
      'Certified Kubernetes Administrator',
      'LF-assbyzy17c',
      '2025-04-20',
      'Kubernetes',
    ]);
  });
});
