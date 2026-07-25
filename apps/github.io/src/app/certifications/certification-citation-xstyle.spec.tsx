import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { beforeEach, expect, vi } from 'vitest';

const citationMock = vi.hoisted(() => ({
  calls: [] as Array<Record<string, unknown>>,
}));

vi.mock('@astryxdesign/core/Citation', () => ({
  Citation: (props: Record<string, unknown>): ReactElement => {
    citationMock.calls.push(props);

    const source = props.source as { title: string; url: string };

    return (
      <a
        aria-label={`Citation ${String(props.number)}: ${source.title}`}
        href={source.url}
        role="doc-noteref"
      >
        {source.title}
      </a>
    );
  },
}));

// eslint-disable-next-line import/first -- keep the mocked Citation in place before loading the component.
import { CertificationCitation } from './certification-citation';

const certificateUrl = 'https://example.com/certificate.pdf';

describe('CertificationCitation xstyle overrides', () => {
  beforeEach(() => {
    citationMock.calls = [];
  });

  it('passes an Astryx xstyle override only for icon-backed citations', () => {
    render(
      <CertificationCitation
        currentDate={new Date('2026-07-23T00:00:00+10:00')}
        expiresAt="2027-04-20T10:00:00+10:00"
        skills={['Kubernetes']}
        title="CKA"
        url={certificateUrl}
      />,
    );

    render(
      <CertificationCitation
        currentDate={new Date('2026-07-23T00:00:00+10:00')}
        expiresAt="2028-02-26T10:59:00+11:00"
        skills={['AWS']}
        title="AWS Cert"
        url={certificateUrl}
      />,
    );

    expect(citationMock.calls[0]?.xstyle).toBeTruthy();
    expect(citationMock.calls[1]?.xstyle).toBe(false);
  });
});
