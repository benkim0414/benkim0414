import { fireEvent, render, within } from '@testing-library/react';
import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { vi } from 'vitest';

import type { Skill } from './skill-list.types';
import { SkillTable } from './skill-table';

vi.stubGlobal('matchMedia', (query: string) => ({
  addEventListener: vi.fn(),
  addListener: vi.fn(),
  dispatchEvent: vi.fn(),
  matches: false,
  media: query,
  onchange: null,
  removeEventListener: vi.fn(),
  removeListener: vi.fn(),
}));

const suppliedSkills: readonly Skill[] = [
  {
    id: 'zeta',
    name: 'Zeta',
    description: 'Zeta description',
    categories: ['Tooling'],
    primaryUse: 'Automation',
    confidence: 3,
    iconSlug: 'zeta',
    keywords: [],
  },
  {
    id: 'alpha',
    name: 'Alpha',
    description: 'Alpha description',
    categories: ['Cloud', 'CI/CD'],
    primaryUse: 'Delivery',
    confidence: 5,
    iconSlug: 'alpha',
    keywords: [],
  },
  {
    id: 'beta',
    name: 'Beta',
    description: 'Beta description',
    categories: ['Language'],
    primaryUse: 'Development',
    confidence: 5,
    iconSlug: 'beta',
    keywords: [],
  },
];

function renderSkillTable() {
  return render(
    <Theme theme={neutralTheme}>
      <SkillTable skills={suppliedSkills} />
    </Theme>,
  );
}

function renderedNames(table: HTMLElement) {
  return within(table)
    .getAllByRole('row')
    .slice(1)
    .map(
      (row) =>
        within(row).getAllByRole('cell')[0].querySelector('.astryx-text')
          ?.textContent,
    );
}

describe('SkillTable', () => {
  it('renders the four requested columns with rich skill metadata', () => {
    const { container, getByRole, getByText } = renderSkillTable();
    const table = getByRole('table');

    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((header) => header.textContent),
    ).toEqual(['Name', 'Primary use', 'Categories', 'Confidence']);
    expect(getByText('Cloud').closest('.astryx-badge')).toBeTruthy();
    expect(getByText('CI/CD').closest('.astryx-badge')).toBeTruthy();
    const confidenceLabels = within(table).getAllByText('Proven');
    const avatars = container.querySelectorAll('.astryx-avatar');

    expect(confidenceLabels).toHaveLength(2);
    expect(confidenceLabels[0].getAttribute('data-type')).toBe('body');
    expect(confidenceLabels[0].getAttribute('data-color')).toBe('primary');
    expect(avatars).toHaveLength(3);
    for (const avatar of avatars) {
      expect(avatar.getAttribute('data-size')).toBe('xsm');
    }
    expect(within(table).queryByRole('link')).toBeNull();
  });

  it('defaults to confidence descending with name as the tiebreaker', () => {
    const { getByRole } = renderSkillTable();

    expect(renderedNames(getByRole('table'))).toEqual([
      'Alpha',
      'Beta',
      'Zeta',
    ]);
  });

  it.each([
    ['Name', ['Zeta', 'Beta', 'Alpha']],
    ['Primary use', ['Zeta', 'Alpha', 'Beta']],
    ['Categories', ['Alpha', 'Beta', 'Zeta']],
    ['Confidence', ['Zeta', 'Alpha', 'Beta']],
  ])('sorts by %s when its header is selected', (header, expected) => {
    const { getByRole } = renderSkillTable();

    fireEvent.click(
      getByRole('button', { name: new RegExp(`^Sort by ${header}`) }),
    );

    expect(renderedNames(getByRole('table'))).toEqual(expected);
  });
});
