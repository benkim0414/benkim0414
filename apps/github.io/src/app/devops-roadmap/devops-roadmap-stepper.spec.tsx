import { Theme } from '@astryxdesign/core';
import { LinkProvider } from '@astryxdesign/core/Link';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { render, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { RouterLink } from '../router-link';
import { DevOpsRoadmapStepper } from './devops-roadmap-stepper';
import type { DevOpsRoadmapItem } from './devops-roadmap.types';

const items: readonly DevOpsRoadmapItem[] = [
  {
    id: 'containers',
    title: 'Containers',
    description:
      'Package applications with dependencies for repeatable runtime environments.',
    evidenceSkillTokens: ['Docker'],
  },
  {
    id: 'artifact-management',
    title: 'Artifact Management',
    description:
      'Store and distribute versioned build outputs through controlled repositories.',
    evidenceSkillTokens: [],
    coveredRoadmapConcepts: [],
  },
  {
    id: 'cloud-design-patterns',
    title: 'Cloud Design Patterns',
    description:
      'Apply reusable patterns to improve cloud resilience and operability.',
    evidenceSkillTokens: [],
    coveredRoadmapConcepts: ['Retry'],
  },
];

const certificationItems: readonly DevOpsRoadmapItem[] = [
  {
    id: 'container-orchestration',
    title: 'Container Orchestration',
    description:
      'Deploy and operate containerized workloads across clustered infrastructure.',
    certifications: [
      {
        title: 'CKA',
        url: 'https://example.com/certifications/cka',
      },
      {
        title: 'CKAD',
        url: 'https://example.com/certifications/ckad',
      },
    ],
    evidenceSkillTokens: [],
    coveredRoadmapConcepts: [],
  },
];

function renderStepper(renderItems?: readonly DevOpsRoadmapItem[]) {
  return render(
    <MemoryRouter>
      <LinkProvider component={RouterLink}>
        <Theme theme={neutralTheme}>
          <DevOpsRoadmapStepper items={renderItems} />
        </Theme>
      </LinkProvider>
    </MemoryRouter>,
  );
}

function getDirectSteps(stepper: HTMLElement) {
  return within(stepper)
    .getAllByRole('listitem')
    .filter((step) => step.parentElement === stepper);
}

describe('DevOpsRoadmapStepper', () => {
  it('renders all 22 default roadmap topics in source order', () => {
    const { getByRole } = renderStepper();
    const stepper = getByRole('list', { name: 'DevOps Roadmap' });
    const steps = getDirectSteps(stepper);

    expect(steps).toHaveLength(22);
    expect(steps[0].textContent).toContain('Learn a Programming Language');
    expect(steps[21].textContent).toContain('Cloud Design Patterns');
  });

  it('renders ordered numbered topics with descriptions', () => {
    const { getByRole, getAllByRole, getByText } = renderStepper(items);
    const stepper = getByRole('list', { name: 'DevOps Roadmap' });
    const steps = getDirectSteps(stepper);

    expect(steps).toHaveLength(3);
    expect(steps[0].textContent).toContain('1');
    expect(steps[0].textContent).toContain('Containers');
    expect(getByText(items[0].description)).toBeTruthy();
    expect(getAllByRole('listitem')[0]).toBe(steps[0]);
  });

  it('uses semantic success for evidence without a current step', () => {
    const { container, getByRole } = renderStepper(items);
    const stepper = getByRole('list', { name: 'DevOps Roadmap' });
    const steps = getDirectSteps(stepper);

    expect(stepper.getAttribute('data-roadmap-stepper')).toBe('');
    expect(container.querySelector('[aria-current="step"]')).toBeNull();
    expect(within(steps[0]).getByText('completed')).toBeTruthy();
    expect(within(steps[2]).getByText('completed')).toBeTruthy();
  });

  it('keeps unsupported topics readable and disabled', () => {
    const { getByText } = renderStepper(items);
    const upcoming = getByText('Artifact Management').closest('li');

    expect(upcoming?.getAttribute('aria-disabled')).toBe('true');
    expect(upcoming?.textContent).toContain(items[1].description);
  });

  it('renders linked neutral skill tokens and concept tokens', () => {
    const { getByRole, getByText } = renderStepper(items);

    expect(getByRole('link', { name: /Docker/i }).getAttribute('href')).toBe(
      '/skills/docker',
    );
    expect(getByText('Retry')).toBeTruthy();
  });

  it('renders certification citations with per-step numbering', () => {
    const { getByRole } = renderStepper(certificationItems);
    const cka = getByRole('doc-noteref', { name: 'Citation 1: CKA' });
    const ckad = getByRole('doc-noteref', { name: 'Citation 2: CKAD' });

    expect(cka.getAttribute('href')).toBe(
      'https://example.com/certifications/cka',
    );
    expect(ckad.getAttribute('href')).toBe(
      'https://example.com/certifications/ckad',
    );
  });
});
