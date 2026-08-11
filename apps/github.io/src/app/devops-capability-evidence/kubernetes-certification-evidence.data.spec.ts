import { kubernetesCertifications } from '../certifications/kubernetes-certifications.data';
import { kubernetesCertificationEvidenceItems } from './kubernetes-certification-evidence.data';

describe('Kubernetes certification capability evidence', () => {
  it('maps each canonical credential to its approved DORA capabilities', () => {
    expect(
      kubernetesCertificationEvidenceItems.map((item) => ({
        id: item.id,
        capabilityKeys: item.capabilityKeys,
      })),
    ).toEqual([
      {
        id: 'cncf-kcna-certification',
        capabilityKeys: ['flexible-infrastructure'],
      },
      {
        id: 'cncf-cka-certification',
        capabilityKeys: ['flexible-infrastructure', 'monitoring-observability'],
      },
      {
        id: 'cncf-ckad-certification',
        capabilityKeys: [
          'continuous-delivery',
          'deployment-automation',
          'monitoring-observability',
        ],
      },
    ]);
  });

  it('reuses every canonical citation field', () => {
    const cka = kubernetesCertificationEvidenceItems.find(
      ({ id }) => id === 'cncf-cka-certification',
    );

    expect(cka).toMatchObject({
      title: kubernetesCertifications.cka.metadata.name,
      label: kubernetesCertifications.cka.title,
      proofUrl: kubernetesCertifications.cka.url,
      endDate: kubernetesCertifications.cka.expiresAt,
      citationIcon: kubernetesCertifications.cka.citationIcon,
      technologies: kubernetesCertifications.cka.skills,
      certificationMetadata: kubernetesCertifications.cka.metadata,
      issuer: 'Cloud Native Computing Foundation',
      isPublic: true,
      strength: 'primary',
      type: 'certification',
    });
  });
});
