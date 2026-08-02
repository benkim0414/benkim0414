import { cncfCertificationBadges } from '../certifications/cncf-certification-badges';
import {
  ActiveCertification,
  Certification,
  ExpiredCertification,
} from './capability-evidence.stories';

describe('CapabilityEvidence stories', () => {
  it('shows real CNCF badge images for certification evidence stories', () => {
    expect(Certification.args?.evidence?.citationIcon).toBe(
      cncfCertificationBadges.CKA,
    );
    expect(ActiveCertification.args?.evidence?.citationIcon).toBe(
      cncfCertificationBadges.CKA,
    );
    expect(ExpiredCertification.args?.evidence?.citationIcon).toBe(
      cncfCertificationBadges.KCNA,
    );
  });
});
