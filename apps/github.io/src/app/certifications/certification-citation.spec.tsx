import { render } from '@testing-library/react';

import { CertificationCitation } from './certification-citation';

const certificateUrl = 'https://example.com/certificate.pdf';

describe('CertificationCitation', () => {
  it('renders an Astryx label citation link for a certification', () => {
    const { getByRole } = render(
      <CertificationCitation
        currentDate={new Date('2026-07-23T00:00:00+10:00')}
        expiresAt="2027-04-20T10:00:00+10:00"
        number={2}
        skills={['Kubernetes']}
        title="CKA"
        url={certificateUrl}
      />,
    );

    const citation = getByRole('doc-noteref', { name: 'Citation 2: CKA' });

    expect(citation).toBeTruthy();
    expect(citation.getAttribute('href')).toBe(certificateUrl);
    expect(citation.getAttribute('target')).toBe('_blank');
  });

  it('uses the first known linked skill as the primary brand', () => {
    const { container } = render(
      <CertificationCitation
        currentDate={new Date('2026-07-23T00:00:00+10:00')}
        expiresAt="2028-02-25T11:00:00+11:00"
        skills={['Unknown Skill', 'Kubernetes']}
        title="CKAD"
        url={certificateUrl}
      />,
    );

    const wrapper = container.querySelector('.certification-citation');

    expect(wrapper?.getAttribute('data-certification-primary-skill')).toBe('Kubernetes');
    expect(wrapper?.getAttribute('style')).toBeNull();
    expect(container.querySelector('img')?.getAttribute('src')).toContain('data:image/svg+xml;utf8,');
  });

  it('uses secondary text color and brand color logo for active certifications', () => {
    const { container, getByRole } = render(
      <CertificationCitation
        currentDate={new Date('2026-07-23T00:00:00+10:00')}
        expiresAt="2027-04-20T10:00:00+10:00"
        skills={['Kubernetes']}
        title="CKA"
        url={certificateUrl}
      />,
    );

    const wrapper = container.querySelector('.certification-citation');
    const citation = getByRole('doc-noteref', { name: 'Citation 1: CKA' });
    const icon = container.querySelector('img');

    expect(wrapper?.getAttribute('style')).toBeNull();
    expect(wrapper?.classList.contains('certification-citation--branded')).toBe(false);
    expect(citation.getAttribute('style')).toContain('color: rgb(115, 115, 115)');
    expect(icon?.getAttribute('src')).toContain('fill%3D%22%23326CE5%22');
  });

  it('uses secondary text color and secondary color logo for expired certifications', () => {
    const { container, getByRole } = render(
      <CertificationCitation
        currentDate={new Date('2029-01-01T00:00:00+11:00')}
        expiresAt="2028-02-26T10:59:00+11:00"
        skills={['Kubernetes']}
        title="KCNA"
        url={certificateUrl}
      />,
    );

    const wrapper = container.querySelector('.certification-citation');
    const citation = getByRole('doc-noteref', { name: 'Citation 1: KCNA' });
    const icon = container.querySelector('img');

    expect(wrapper?.getAttribute('style')).toBeNull();
    expect(wrapper?.classList.contains('certification-citation--branded')).toBe(false);
    expect(citation.getAttribute('style')).toContain('color: rgb(115, 115, 115)');
    expect(icon?.getAttribute('src')).toContain('data:image/svg+xml;utf8,');
    expect(icon?.getAttribute('src')).toContain('fill%3D%22%23737373%22');
  });

  it('uses brand color as a Citation border accent when no skill logo is available', () => {
    const { container, getByRole } = render(
      <CertificationCitation
        currentDate={new Date('2026-07-23T00:00:00+10:00')}
        expiresAt="2028-02-26T10:59:00+11:00"
        skills={['AWS']}
        title="AWS Cert"
        url={certificateUrl}
      />,
    );

    const wrapper = container.querySelector('.certification-citation');
    const citation = getByRole('doc-noteref', { name: 'Citation 1: AWS Cert' });

    expect(wrapper?.getAttribute('data-certification-primary-skill')).toBe('AWS');
    expect(wrapper?.classList.contains('certification-citation--branded')).toBe(true);
    expect(citation.getAttribute('style')).toContain('color: rgb(115, 115, 115)');
    expect(citation.getAttribute('style')).toContain('border-color: #ff9900');
    expect(container.querySelector('img')).toBeNull();
  });

  it('marks future expiry dates as active', () => {
    const { container, getByText } = render(
      <CertificationCitation
        currentDate={new Date('2026-07-23T00:00:00+10:00')}
        expiresAt="2028-02-26T10:59:00+11:00"
        skills={['Kubernetes']}
        title="KCNA"
        url={certificateUrl}
      />,
    );

    expect(container.querySelector('.certification-citation')?.getAttribute('data-certification-status')).toBe('active');
    expect(getByText('Active certification')).toBeTruthy();
  });

  it('marks past expiry dates as expired', () => {
    const { container, getByText } = render(
      <CertificationCitation
        currentDate={new Date('2029-01-01T00:00:00+11:00')}
        expiresAt="2028-02-26T10:59:00+11:00"
        skills={['Kubernetes']}
        title="KCNA"
        url={certificateUrl}
      />,
    );

    expect(container.querySelector('.certification-citation')?.getAttribute('data-certification-status')).toBe('expired');
    expect(getByText('Expired certification')).toBeTruthy();
  });

  it('falls back gracefully when no linked skill has brand metadata', () => {
    const { container } = render(
      <CertificationCitation
        currentDate={new Date('2026-07-23T00:00:00+10:00')}
        expiresAt="2028-02-26T10:59:00+11:00"
        skills={['Unknown Skill']}
        title="Custom Cert"
        url={certificateUrl}
      />,
    );

    const wrapper = container.querySelector('.certification-citation');

    expect(wrapper?.getAttribute('data-certification-primary-skill')).toBeNull();
    expect(wrapper?.getAttribute('style')).toBeNull();
    expect(wrapper?.classList.contains('certification-citation--branded')).toBe(false);
    expect(container.querySelector('img')).toBeNull();
  });
});
