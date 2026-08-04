import { cncfCertificationBadges } from './cncf-certification-badges';
import {
  Active,
  Expired,
  MultipleSkills,
  Unbranded,
} from './certification-citation.stories';

describe('CertificationCitation stories', () => {
  it('shows real CNCF badge images instead of the Kubernetes fallback', () => {
    expect(Active.args?.citationIcon).toBe(cncfCertificationBadges.CKA);
    expect(Expired.args?.citationIcon).toBe(cncfCertificationBadges.CKA);
    expect(MultipleSkills.args?.citationIcon).toBe(
      cncfCertificationBadges.CKAD,
    );
  });

  it('provides complete metadata only for concrete credential stories', () => {
    expect(Active.args?.metadata).toEqual({
      id: 'LF-assbyzy17c',
      name: 'Certified Kubernetes Administrator',
      completedAt: '2025-04-20',
    });
    expect(Expired.args?.metadata).toEqual({
      id: 'LF-assbyzy17c',
      name: 'Certified Kubernetes Administrator',
      completedAt: '2025-04-20',
    });
    expect(MultipleSkills.args?.metadata).toEqual({
      id: 'LF-kyh6ajhr7y',
      name: 'Certified Kubernetes Application Developer',
      completedAt: '2026-02-25',
    });
    expect(Unbranded.args?.metadata).toBeUndefined();
  });
});
