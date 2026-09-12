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

function renderSkillTable(skills = suppliedSkills) {
  return render(
    <Theme theme={neutralTheme}>
      <SkillTable skills={skills} />
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
    expect(
      within(table).getByText('Cloud').closest('.astryx-badge'),
    ).toBeTruthy();
    expect(
      within(table).getByText('CI/CD').closest('.astryx-badge'),
    ).toBeTruthy();
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

  it('sizes columns from the longest value in the supplied skills', () => {
    const { getByRole } = renderSkillTable();
    const headers = within(getByRole('table')).getAllByRole('columnheader');
    const widths = headers.map((header) =>
      Number.parseFloat(header.style.width),
    );

    expect(headers.every((header) => header.style.width.endsWith('px'))).toBe(
      true,
    );
    expect(widths[1]).toBeGreaterThan(widths[0]);
    expect(widths[2]).toBeGreaterThan(widths[3]);
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

  it('filters skills by a case-insensitive name query', () => {
    const { getByRole, getByText, queryByText } = renderSkillTable();

    fireEvent.change(getByRole('textbox', { name: 'Skill name' }), {
      target: { value: 'beTA' },
    });

    expect(renderedNames(getByRole('table'))).toEqual(['Beta']);
    expect(queryByText('Alpha')).toBeNull();
    expect(getByText('1 skill')).toBeTruthy();
  });

  it('filters skills by any selected category', () => {
    const { getByRole, getByText, queryByText } = renderSkillTable();

    fireEvent.click(getByRole('combobox', { name: 'Categories' }));
    fireEvent.click(getByRole('option', { name: 'Cloud' }));
    fireEvent.click(getByRole('option', { name: 'Language' }));

    expect(renderedNames(getByRole('table'))).toEqual(['Alpha', 'Beta']);
    expect(queryByText('Zeta')).toBeNull();
    expect(getByText('2 skills')).toBeTruthy();
  });

  it('combines the name query with category selection and sorts matching rows', () => {
    const { getByRole, queryByText } = renderSkillTable();

    fireEvent.change(getByRole('textbox', { name: 'Skill name' }), {
      target: { value: 'a' },
    });
    fireEvent.click(getByRole('combobox', { name: 'Categories' }));
    fireEvent.click(getByRole('option', { name: 'Cloud' }));
    fireEvent.click(getByRole('option', { name: 'Tooling' }));
    fireEvent.click(getByRole('button', { name: /^Sort by Name/ }));

    expect(renderedNames(getByRole('table'))).toEqual(['Zeta', 'Alpha']);
    expect(queryByText('Beta')).toBeNull();
  });

  it('clears both active filters', () => {
    const { getByRole, getByText } = renderSkillTable();

    fireEvent.change(getByRole('textbox', { name: 'Skill name' }), {
      target: { value: 'alpha' },
    });
    fireEvent.click(getByRole('combobox', { name: 'Categories' }));
    fireEvent.click(getByRole('option', { name: 'Cloud' }));
    fireEvent.click(getByRole('button', { name: 'Clear all' }));

    expect(renderedNames(getByRole('table'))).toEqual([
      'Alpha',
      'Beta',
      'Zeta',
    ]);
    expect(
      (getByRole('textbox', { name: 'Skill name' }) as HTMLInputElement).value,
    ).toBe('');
    expect(getByText('3 skills')).toBeTruthy();
  });

  it('shows a no-results state when active filters match no skills', () => {
    const { getByRole } = renderSkillTable();

    fireEvent.change(getByRole('textbox', { name: 'Skill name' }), {
      target: { value: 'no matching skill' },
    });

    expect(
      getByRole('heading', {
        level: 3,
        name: 'No skills match your search or filters.',
      }),
    ).toBeTruthy();
  });

  it('keeps the empty-catalog state distinct from a no-results filter state', () => {
    const { getByRole } = renderSkillTable([]);

    expect(
      getByRole('heading', {
        level: 3,
        name: 'No skills have been supplied.',
      }),
    ).toBeTruthy();
  });
});
