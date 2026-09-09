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

function renderStepper(renderItems = items) {
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

describe('DevOpsRoadmapStepper', () => {
  it('renders ordered numbered topics with descriptions', () => {
    const { getByRole, getAllByRole, getByText } = renderStepper();
    const stepper = getByRole('list', { name: 'DevOps roadmap' });
    const steps = within(stepper)
      .getAllByRole('listitem')
      .filter((step) => step.parentElement === stepper);

    expect(steps).toHaveLength(3);
    expect(steps[0].textContent).toContain('1');
    expect(steps[0].textContent).toContain('Containers');
    expect(getByText(items[0].description)).toBeTruthy();
    expect(getAllByRole('listitem')[0]).toBe(steps[0]);
  });

  it('uses semantic success for evidence without a current step', () => {
    const { container, getByRole } = renderStepper();
    const stepper = getByRole('list', { name: 'DevOps roadmap' });
    const steps = within(stepper)
      .getAllByRole('listitem')
      .filter((step) => step.parentElement === stepper);

    expect(container.querySelector('[aria-current="step"]')).toBeNull();
    expect(within(steps[0]).getByText('completed')).toBeTruthy();
    expect(within(steps[2]).getByText('completed')).toBeTruthy();
  });

  it('keeps unsupported topics readable and disabled', () => {
    const { getByText } = renderStepper();
    const upcoming = getByText('Artifact Management').closest('li');

    expect(upcoming?.getAttribute('aria-disabled')).toBe('true');
    expect(upcoming?.textContent).toContain(items[1].description);
  });

  it('renders linked neutral skill tokens and concept tokens', () => {
    const { getByRole, getByText } = renderStepper();

    expect(getByRole('link', { name: /Docker/i }).getAttribute('href')).toBe(
      '/skills/docker',
    );
    expect(getByText('Retry')).toBeTruthy();
  });
});
