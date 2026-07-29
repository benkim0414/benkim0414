import { render, screen } from '@testing-library/react';

import { CapabilityEvidence } from './capability-evidence';
import type { CapabilityEvidenceItem } from './devops-capability-evidence.types';

function evidence(
  overrides: Partial<CapabilityEvidenceItem>,
): CapabilityEvidenceItem {
  return {
    id: 'evidence',
    title: 'Long evidence title that should not render when label exists',
    label: 'Evidence',
    type: 'learning',
    capabilityKeys: ['flexible-infrastructure'],
    summary: 'Public-safe evidence summary.',
    isPublic: true,
    strength: 'strong',
    ...overrides,
  };
}

describe('CapabilityEvidence', () => {
  it('renders skill evidence with the existing skill token', () => {
    render(
      <CapabilityEvidence
        evidence={evidence({
          label: undefined,
          title: 'Kubernetes',
          type: 'skill',
        })}
      />,
    );

    expect(screen.getByTestId('skill-token')).toBeTruthy();
    expect(screen.getByText('Kubernetes')).toBeTruthy();
    expect(
      screen.getByRole('group', { name: 'Skill evidence: Kubernetes' }),
    ).toBeTruthy();
  });

  it('keeps technology branding when a skill uses an alias label', () => {
    const { container } = render(
      <CapabilityEvidence
        evidence={evidence({
          label: 'CKA',
          technologies: ['Kubernetes'],
          type: 'skill',
        })}
      />,
    );

    expect(
      container
        .querySelector('[data-testid="skill-token"]')
        ?.getAttribute('style'),
    ).toContain('--skill-token-background: #326CE5');
    expect(
      container.querySelector('[data-testid="skill-token"] svg'),
    ).toBeTruthy();
  });

  it.each([
    ['learning', 'Learning evidence: Kubernetes'],
    ['experience', 'Experience evidence: CI/CD workflow'],
    ['education', 'Education evidence: Computer Science'],
  ] as const)('renders %s evidence as a compact token', (type, label) => {
    render(
      <CapabilityEvidence
        evidence={evidence({
          label: label.split(': ')[1],
          type,
          proofUrl: 'https://example.com/proof',
        })}
      />,
    );

    const link = screen.getByRole('link', { name: label.split(': ')[1] });

    expect(link.getAttribute('href')).toBe('https://example.com/proof');
    expect(link.className).toContain('astryx-token');
  });

  it('renders certification evidence through CertificationCitation', () => {
    const { container } = render(
      <CapabilityEvidence
        citationNumber={3}
        evidence={evidence({
          label: 'CKA',
          proofUrl: 'https://example.com/cka',
          technologies: ['Kubernetes'],
          type: 'certification',
        })}
      />,
    );

    expect(
      screen.getByRole('doc-noteref', { name: 'Citation 3: CKA' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('group', { name: 'Certification evidence: CKA' }),
    ).toBeTruthy();
    expect(container.querySelector('img')?.getAttribute('src')).toContain(
      'fill%3D%22%23326CE5%22',
    );
  });

  it('renders a certification fallback icon through Astryx Icon', () => {
    render(
      <CapabilityEvidence
        evidence={evidence({
          label: 'Custom certificate',
          technologies: ['Unknown'],
          type: 'certification',
        })}
      />,
    );

    expect(
      screen.getByTestId('capability-evidence-fallback-icon'),
    ).toBeTruthy();
  });

  it('passes certification end dates through to CertificationCitation status', () => {
    render(
      <CapabilityEvidence
        evidence={evidence({
          endDate: '2099-01-01T00:00:00+00:00',
          label: 'CKA',
          technologies: ['Kubernetes'],
          type: 'certification',
        })}
      />,
    );

    expect(screen.getByText('Active certification')).toBeTruthy();
  });

  it('renders project evidence as a named citation with a technology icon', () => {
    const { container } = render(
      <CapabilityEvidence
        citationNumber={4}
        evidence={evidence({
          label: 'DevOps roadmap',
          proofUrl: 'https://github.com/benkim0414/devops-roadmap',
          title: 'Long public repository project evidence title',
          technologies: ['Kubernetes'],
          type: 'project',
        })}
      />,
    );

    const project = screen.getByRole('group', {
      name: 'Project evidence: DevOps roadmap',
    });

    expect(project).toBeTruthy();
    expect(
      screen.getByRole('doc-noteref', { name: 'Citation 4: DevOps roadmap' }),
    ).toBeTruthy();
    expect(container.querySelector('img')?.getAttribute('src')).toContain(
      'fill%3D%22%23326CE5%22',
    );
  });

  it('renders the GitHub source icon for a project without technology branding', () => {
    const { container } = render(
      <CapabilityEvidence
        evidence={evidence({
          label: 'Roadmap',
          proofUrl: 'https://github.com/benkim0414/devops-roadmap',
          type: 'project',
        })}
      />,
    );

    expect(container.querySelector('img')?.getAttribute('src')).toContain(
      'fill%3D%22%23181717%22',
    );
  });

  it('renders a project fallback icon through Astryx Icon', () => {
    render(
      <CapabilityEvidence
        evidence={evidence({
          label: 'Roadmap',
          proofUrl: 'https://example.com/roadmap',
          type: 'project',
        })}
      />,
    );

    expect(
      screen.getByTestId('capability-evidence-fallback-icon'),
    ).toBeTruthy();
  });

  it('does not filter evidence marked non-public', () => {
    render(
      <CapabilityEvidence
        evidence={evidence({
          isPublic: false,
          label: 'Renderer only',
          type: 'experience',
        })}
      />,
    );

    expect(
      screen.getByRole('group', {
        name: 'Experience evidence: Renderer only',
      }),
    ).toBeTruthy();
  });
});
