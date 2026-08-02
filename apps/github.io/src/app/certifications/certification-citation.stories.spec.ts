import { cncfCertificationBadges } from './cncf-certification-badges';
import { Active, Expired, MultipleSkills } from './certification-citation.stories';

describe('CertificationCitation stories', () => {
  it('shows real CNCF badge images instead of the Kubernetes fallback', () => {
    expect(Active.args?.citationIcon).toBe(cncfCertificationBadges.CKA);
    expect(Expired.args?.citationIcon).toBe(cncfCertificationBadges.CKA);
    expect(MultipleSkills.args?.citationIcon).toBe(
      cncfCertificationBadges.CKAD,
    );
  });
});
