import { render } from '@testing-library/react';

import { CertificationCitation } from './certification-citation';

const certificateUrl = 'https://example.com/certificate.pdf';
const ckaMetadata = {
  id: 'LF-assbyzy17c',
  name: 'Certified Kubernetes Administrator',
  completedAt: '2025-04-20',
} as const;

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

  it('describes a concrete certification with semantic metadata', () => {
    const { getByRole } = render(
      <CertificationCitation
        currentDate={new Date('2026-07-23T00:00:00+10:00')}
        expiresAt="2027-04-20T10:00:00+10:00"
        metadata={ckaMetadata}
        skills={['Kubernetes']}
        title="CKA"
        url={certificateUrl}
      />,
    );

    const citation = getByRole('doc-noteref', { name: 'Citation 1: CKA' });
    const hoverCard = getByRole('dialog', { hidden: true });

    expect(citation.getAttribute('href')).toBe(certificateUrl);
    expect(citation.getAttribute('aria-describedby')?.split(' ')).toContain(
      hoverCard.id,
    );
    const certificationName = Array.from(
      hoverCard.querySelectorAll('*'),
    ).find(
      (item) => item.textContent === 'Certified Kubernetes Administrator',
    );

    expect(certificationName?.closest('dl')).toBeNull();
    expect(
      Array.from(hoverCard.querySelectorAll('dt'), (item) => item.textContent),
    ).toEqual(['ID', 'Status', 'Completed']);
    expect(
      Array.from(hoverCard.querySelectorAll('dd'), (item) => item.textContent),
    ).toEqual([
      'LF-assbyzy17c',
      'Active',
      'Apr 20, 2025',
    ]);
  });

  it('shows expired metadata without changing the citation link', () => {
    const { getByRole } = render(
      <CertificationCitation
        currentDate={new Date('2029-01-01T00:00:00+11:00')}
        expiresAt="2027-04-20T10:00:00+10:00"
        metadata={ckaMetadata}
        skills={['Kubernetes']}
        title="CKA"
        url={certificateUrl}
      />,
    );

    const citation = getByRole('doc-noteref', { name: 'Citation 1: CKA' });
    const hoverCard = getByRole('dialog', { hidden: true });

    expect(citation.getAttribute('href')).toBe(certificateUrl);
    expect(
      Array.from(hoverCard.querySelectorAll('dd'), (item) => item.textContent),
    ).toContain('Expired');
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

    const wrapper = container.querySelector(
      '[data-testid="certification-citation"]',
    );

    expect(wrapper?.getAttribute('data-certification-primary-skill')).toBe(
      'Kubernetes',
    );
    expect(wrapper?.getAttribute('style')).toBeNull();
    expect(container.querySelector('img')?.getAttribute('src')).toContain(
      'data:image/svg+xml;utf8,',
    );
  });

  it('prefers a certification-specific image over the linked skill logo', () => {
    const badgeImage = '/assets/certifications/cncf/cka.png';
    const { container } = render(
      <CertificationCitation
        citationIcon={badgeImage}
        currentDate={new Date('2026-07-23T00:00:00+10:00')}
        expiresAt="2027-04-20T10:00:00+10:00"
        skills={['Kubernetes']}
        title="CKA"
        url={certificateUrl}
      />,
    );

    const icon = container.querySelector('img');

    expect(icon?.getAttribute('src')).toBe(badgeImage);
    expect(icon?.getAttribute('src')).not.toContain('data:image/svg+xml');
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

    const wrapper = container.querySelector(
      '[data-testid="certification-citation"]',
    );
    const citation = getByRole('doc-noteref', { name: 'Citation 1: CKA' });
    const icon = container.querySelector('img');

    expect(wrapper?.getAttribute('style')).toBeNull();
    expect(citation.getAttribute('style')).toBeNull();
    expect(icon?.getAttribute('src')).toContain('fill%3D%22%23326CE5%22');
  });

  it('uses neutral citation text color for expired certification logos', () => {
    const { container, getByRole } = render(
      <CertificationCitation
        currentDate={new Date('2029-01-01T00:00:00+11:00')}
        expiresAt="2028-02-26T10:59:00+11:00"
        skills={['Kubernetes']}
        title="KCNA"
        url={certificateUrl}
      />,
    );

    const wrapper = container.querySelector(
      '[data-testid="certification-citation"]',
    );
    const citation = getByRole('doc-noteref', { name: 'Citation 1: KCNA' });
    const icon = container.querySelector('img');

    expect(wrapper?.getAttribute('style')).toBeNull();
    expect(citation.getAttribute('style')).toBeNull();
    const iconSrc = icon?.getAttribute('src') ?? '';

    expect(iconSrc).toContain('data:image/svg+xml;utf8,');
    expect(iconSrc).toContain('fill%3D%22%23737373%22');
    expect(iconSrc).not.toContain('fill%3D%22%23326CE5%22');
  });

  it('keeps Citation border styling with Astryx instead of brand color', () => {
    const { container, getByRole } = render(
      <CertificationCitation
        currentDate={new Date('2026-07-23T00:00:00+10:00')}
        expiresAt="2028-02-26T10:59:00+11:00"
        skills={['AWS']}
        title="AWS Cert"
        url={certificateUrl}
      />,
    );

    const wrapper = container.querySelector(
      '[data-testid="certification-citation"]',
    );
    const citation = getByRole('doc-noteref', { name: 'Citation 1: AWS Cert' });

    expect(wrapper?.getAttribute('data-certification-primary-skill')).toBe(
      'AWS',
    );
    expect(citation.getAttribute('style')).toBeNull();
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

    expect(
      container
        .querySelector('[data-testid="certification-citation"]')
        ?.getAttribute('data-certification-status'),
    ).toBe('active');
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

    expect(
      container
        .querySelector('[data-testid="certification-citation"]')
        ?.getAttribute('data-certification-status'),
    ).toBe('expired');
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

    const wrapper = container.querySelector(
      '[data-testid="certification-citation"]',
    );

    expect(
      wrapper?.getAttribute('data-certification-primary-skill'),
    ).toBeNull();
    expect(wrapper?.getAttribute('style')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });

  it('renders an unlinked label citation when url is omitted', () => {
    const { getByLabelText, queryByRole } = render(
      <CertificationCitation
        currentDate={new Date('2026-07-23T00:00:00+10:00')}
        expiresAt="2027-04-20T10:00:00+10:00"
        metadata={ckaMetadata}
        skills={['Kubernetes']}
        title="CKA"
      />,
    );

    expect(getByLabelText('Citation 1: CKA').tagName.toLowerCase()).toBe('span');
    expect(queryByRole('doc-noteref')).toBeNull();
    expect(queryByRole('dialog', { hidden: true })).toBeNull();
  });

  it('keeps generic certifications free of an incomplete hover card', () => {
    const { queryByRole } = render(
      <CertificationCitation
        currentDate={new Date('2026-07-23T00:00:00+10:00')}
        expiresAt="2027-04-20T10:00:00+10:00"
        skills={['Kubernetes']}
        title="Generic certification"
        url={certificateUrl}
      />,
    );

    expect(queryByRole('dialog', { hidden: true })).toBeNull();
  });

  it.each([
    [
      'an empty credential ID',
      { ...ckaMetadata, id: '' },
      '2027-04-20T10:00:00+10:00',
    ],
    [
      'an empty credential name',
      { ...ckaMetadata, name: '' },
      '2027-04-20T10:00:00+10:00',
    ],
    [
      'an invalid completion date',
      { ...ckaMetadata, completedAt: '2025-02-30' },
      '2027-04-20T10:00:00+10:00',
    ],
    ['an invalid expiry date', ckaMetadata, 'not-a-date'],
    [
      'an impossible expiry date',
      ckaMetadata,
      '2027-02-30T10:00:00+10:00',
    ],
  ])('omits the hover card for %s', (_label, metadata, expiresAt) => {
    const { getByRole, queryByRole } = render(
      <CertificationCitation
        currentDate={new Date('2026-07-23T00:00:00+10:00')}
        expiresAt={expiresAt}
        metadata={metadata}
        title="CKA"
        url={certificateUrl}
      />,
    );

    expect(getByRole('doc-noteref', { name: 'Citation 1: CKA' })).toBeTruthy();
    expect(queryByRole('dialog', { hidden: true })).toBeNull();
  });

  it('omits certification status when expiresAt is omitted', () => {
    const { container, queryByText } = render(
      <CertificationCitation
        skills={['Kubernetes']}
        title="CKA"
        url={certificateUrl}
      />,
    );

    expect(
      container
        .querySelector('[data-testid="certification-citation"]')
        ?.getAttribute('data-certification-status'),
    ).toBeNull();
    expect(queryByText('Active certification')).toBeNull();
    expect(queryByText('Expired certification')).toBeNull();
  });

  it('supports omitted skills without brand lookup', () => {
    const { container, getByRole } = render(
      <CertificationCitation title="Custom Cert" url={certificateUrl} />,
    );

    expect(getByRole('doc-noteref', { name: 'Citation 1: Custom Cert' })).toBeTruthy();
    expect(
      container
        .querySelector('[data-testid="certification-citation"]')
        ?.getAttribute('data-certification-primary-skill'),
    ).toBeNull();
    expect(container.querySelector('img')).toBeNull();
  });
});
