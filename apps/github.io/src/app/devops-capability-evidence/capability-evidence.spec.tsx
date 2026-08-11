import { render, screen, within } from '@testing-library/react';
import { Token } from '@astryxdesign/core/Token';

import { cncfCertificationBadges } from '../certifications/cncf-certification-badges';
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
    const { container } = render(
      <>
        <CapabilityEvidence
          evidence={evidence({
            label: undefined,
            title: 'Kubernetes',
            type: 'skill',
          })}
        />
        <Token
          color="gray"
          data-testid="gray-reference"
          label="Reference"
          size="sm"
        />
      </>,
    );

    const skillToken = screen.getByTestId('skill-token');

    expect(skillToken.className).toBe(
      screen.getByTestId('gray-reference').className,
    );
    expect(skillToken.getAttribute('style')).toBeNull();
    expect(
      container
        .querySelector('[data-testid="skill-token"] path')
        ?.getAttribute('fill'),
    ).toBe('#326CE5');
    expect(screen.getByText('Kubernetes')).toBeTruthy();
    expect(
      screen.getByRole('group', { name: 'Skill evidence: Kubernetes' }),
    ).toBeTruthy();
  });

  it('renders AWS skill evidence with its decorative local asset', () => {
    const { container } = render(
      <CapabilityEvidence
        evidence={evidence({
          label: undefined,
          title: 'AWS CodePipeline',
          type: 'skill',
        })}
      />,
    );

    expect(screen.getByTestId('skill-token')).toBeTruthy();
    expect(
      container
        .querySelector('[data-testid="skill-token"] img')
        ?.getAttribute('aria-hidden'),
    ).toBe('true');
    expect(
      container.querySelector(
        '[data-testid="capability-evidence-fallback-icon"]',
      ),
    ).toBeNull();
  });

  it('renders Kustomize skill evidence with the Kubernetes inline icon', () => {
    const { container } = render(
      <CapabilityEvidence
        evidence={evidence({
          label: undefined,
          title: 'Kustomize',
          type: 'skill',
        })}
      />,
    );

    expect(screen.getByTestId('skill-token')).toBeTruthy();
    expect(
      container
        .querySelector('[data-testid="skill-token"] svg')
        ?.getAttribute('aria-hidden'),
    ).toBe('true');
    expect(
      container.querySelector(
        '[data-testid="capability-evidence-fallback-icon"]',
      ),
    ).toBeNull();
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
    ).toBeNull();
    expect(
      container
        .querySelector('[data-testid="skill-token"] path')
        ?.getAttribute('fill'),
    ).toBe('#326CE5');
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

    expect(screen.getByRole('group', { name: label })).toBeTruthy();
    expect(link.getAttribute('href')).toBe('https://example.com/proof');
    expect(link.className).toContain('astryx-token');
  });

  it('renders Udemy learning evidence with the provider brand color', () => {
    const { container } = render(
      <CapabilityEvidence
        evidence={evidence({
          label: 'CKAD prep',
          learningKind: 'course',
          proofUrl:
            'https://www.udemy.com/course/certified-kubernetes-application-developer/',
          type: 'learning',
        })}
      />,
    );

    expect(container.querySelector('svg path')?.getAttribute('fill')).toBe(
      '#A435F0',
    );
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

  it('passes certification badge images through to certification citations', () => {
    const { container } = render(
      <CapabilityEvidence
        citationNumber={3}
        evidence={evidence({
          citationIcon: cncfCertificationBadges.CKA,
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
    expect(container.querySelector('img')?.getAttribute('src')).toBe(
      cncfCertificationBadges.CKA,
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

  it('forwards complete certification metadata to the hover card', () => {
    render(
      <CapabilityEvidence
        evidence={evidence({
          certificationMetadata: {
            id: 'LF-assbyzy17c',
            name: 'Certified Kubernetes Administrator',
            completedAt: '2025-04-20',
          },
          endDate: '2099-01-01T00:00:00+00:00',
          label: 'CKA',
          proofUrl: 'https://example.com/cka',
          technologies: ['Kubernetes'],
          type: 'certification',
        })}
      />,
    );

    const hoverCard = screen.getByRole('dialog', { hidden: true });
    expect(
      within(hoverCard).getByText('Certified Kubernetes Administrator'),
    ).toBeTruthy();
    expect(within(hoverCard).getByText('LF-assbyzy17c')).toBeTruthy();
    expect(within(hoverCard).getByText('Active')).toBeTruthy();
  });

  it('renders GitHub project evidence as a named citation with the GitHub icon', () => {
    const { container } = render(
      <CapabilityEvidence
        citationNumber={4}
        evidence={evidence({
          label: undefined,
          proofUrl: 'https://github.com/benkim0414/devops-roadmap',
          title: 'Long public repository project evidence title',
          technologies: ['Kubernetes'],
          type: 'project',
        })}
      />,
    );

    const project = screen.getByRole('group', {
      name: 'Project evidence: devops-roadmap',
    });

    expect(project).toBeTruthy();
    expect(
      screen.getByRole('doc-noteref', { name: 'Citation 4: devops-roadmap' }),
    ).toBeTruthy();
    expect(container.querySelector('img')?.getAttribute('src')).toContain(
      'fill%3D%22%23181717%22',
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
