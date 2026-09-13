import { fireEvent, render, within } from '@testing-library/react';
import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { vi } from 'vitest';

import { skills as catalogSkills } from './skill-list.data';
import type { Skill } from './skill-list.types';
import { SkillTable, type SkillTableProps } from './skill-table';

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

function renderSkillTable({
  skills = suppliedSkills,
  query = '',
  selectedCategories = [],
  activeSkillId = null,
  onQueryChange = vi.fn(),
  onSelectedCategoriesChange = vi.fn(),
  onSkillActivate = vi.fn(),
}: Partial<SkillTableProps> = {}) {
  return render(
    <Theme theme={neutralTheme}>
      <SkillTable
        activeSkillId={activeSkillId}
        query={query}
        selectedCategories={selectedCategories}
        skills={skills}
        onQueryChange={onQueryChange}
        onSelectedCategoriesChange={onSelectedCategoriesChange}
        onSkillActivate={onSkillActivate}
      />
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
  ])('sorts by %s when its header is selected', (header, expected) => {
    const { getByRole } = renderSkillTable();

    fireEvent.click(
      getByRole('button', { name: new RegExp(`^Sort by ${header}`) }),
    );

    expect(renderedNames(getByRole('table'))).toEqual(expected);
  });

  it('sorts shuffled confidence values in ascending and descending order', () => {
    const shuffledSkills: readonly Skill[] = [
      suppliedSkills[2]!,
      suppliedSkills[0]!,
      suppliedSkills[1]!,
    ];
    const { getByRole } = renderSkillTable({ skills: shuffledSkills });
    const sortButton = getByRole('button', { name: /^Sort by Confidence/ });
    const confidenceHeader = getByRole('columnheader', {
      name: 'Confidence',
    });

    fireEvent.click(sortButton);

    expect(confidenceHeader.getAttribute('aria-sort')).toBeNull();
    expect(renderedNames(getByRole('table'))).toEqual([
      'Beta',
      'Zeta',
      'Alpha',
    ]);

    fireEvent.click(sortButton);

    expect(confidenceHeader.getAttribute('aria-sort')).toBe('ascending');
    expect(renderedNames(getByRole('table'))).toEqual([
      'Zeta',
      'Beta',
      'Alpha',
    ]);

    fireEvent.click(sortButton);

    expect(confidenceHeader.getAttribute('aria-sort')).toBe('descending');
    expect(renderedNames(getByRole('table'))).toEqual([
      'Beta',
      'Alpha',
      'Zeta',
    ]);
  });

  it('reports controlled filter changes and renders parent-provided results', () => {
    const onQueryChange = vi.fn();
    const onSelectedCategoriesChange = vi.fn();
    const { getByRole, getByText, queryByText, rerender } = renderSkillTable({
      onQueryChange,
      onSelectedCategoriesChange,
    });

    fireEvent.change(getByRole('textbox', { name: 'Skill name' }), {
      target: { value: 'beTA description' },
    });
    fireEvent.click(getByRole('combobox', { name: 'Categories' }));
    fireEvent.click(getByRole('option', { name: 'Language' }));

    expect(onQueryChange).toHaveBeenCalledWith('beTA description');
    expect(onSelectedCategoriesChange).toHaveBeenCalledWith(['Language']);

    rerender(
      <Theme theme={neutralTheme}>
        <SkillTable
          activeSkillId={null}
          query="beTA description"
          selectedCategories={['Language']}
          skills={suppliedSkills}
          onQueryChange={onQueryChange}
          onSelectedCategoriesChange={onSelectedCategoriesChange}
          onSkillActivate={vi.fn()}
        />
      </Theme>,
    );

    expect(renderedNames(getByRole('table'))).toEqual(['Beta']);
    expect(queryByText('Alpha')).toBeNull();
    expect(getByText('1 skill')).toBeTruthy();
  });

  it('filters skills by any parent-selected category', () => {
    const { getByRole, getByText, queryByText } = renderSkillTable({
      selectedCategories: ['Cloud', 'Language'],
    });

    expect(renderedNames(getByRole('table'))).toEqual(['Alpha', 'Beta']);
    expect(queryByText('Zeta')).toBeNull();
    expect(getByText('2 skills')).toBeTruthy();
  });

  it('combines the name query with category selection and sorts matching rows', () => {
    const suppliedSkillsWithAdditionalToolingMatch: readonly Skill[] = [
      ...suppliedSkills,
      {
        id: 'albatross',
        name: 'Albatross',
        description: 'Albatross description',
        categories: ['Tooling'],
        primaryUse: 'Automation',
        confidence: 5,
        iconSlug: 'albatross',
        keywords: [],
      },
    ];
    const { getByRole, queryByText } = renderSkillTable({
      query: 'al',
      selectedCategories: ['Cloud', 'Tooling'],
      skills: suppliedSkillsWithAdditionalToolingMatch,
    });

    fireEvent.click(getByRole('button', { name: /^Sort by Name/ }));

    expect(renderedNames(getByRole('table'))).toEqual(['Alpha', 'Albatross']);
    expect(queryByText('Beta')).toBeNull();
    expect(queryByText('Zeta')).toBeNull();
  });

  it('reports clearing both active filters to the parent', () => {
    const onQueryChange = vi.fn();
    const onSelectedCategoriesChange = vi.fn();
    const { getByRole } = renderSkillTable({
      onQueryChange,
      onSelectedCategoriesChange,
      query: 'alpha',
      selectedCategories: ['Cloud'],
    });

    fireEvent.click(getByRole('button', { name: 'Clear all' }));

    expect(onQueryChange).toHaveBeenCalledWith('');
    expect(onSelectedCategoriesChange).toHaveBeenCalledWith([]);
  });

  it('shows a no-results state when active filters match no skills', () => {
    const { getByRole } = renderSkillTable({
      query: 'no matching skill',
    });

    expect(
      getByRole('heading', {
        level: 3,
        name: 'No skills match your search or filters.',
      }),
    ).toBeTruthy();
  });

  it('keeps the empty-catalog state distinct from a no-results filter state', () => {
    const { getByRole } = renderSkillTable({ skills: [] });

    expect(
      getByRole('heading', {
        level: 3,
        name: 'No skills have been supplied.',
      }),
    ).toBeTruthy();
  });

  it('activates a row by click, Enter, and Space while marking the active row', () => {
    const onSkillActivate = vi.fn();
    const activationSkills = ['kubernetes', 'terraform'].map((id) => {
      const skill = catalogSkills.find((candidate) => candidate.id === id);

      if (!skill) {
        throw new Error(`Expected ${id} in the canonical skill catalog.`);
      }

      return skill;
    });
    const { getByRole } = renderSkillTable({
      activeSkillId: 'terraform',
      onSkillActivate,
      skills: activationSkills,
    });
    const kubernetesRow = getByRole('row', { name: /Kubernetes/ });

    fireEvent.click(kubernetesRow);
    expect(onSkillActivate).toHaveBeenCalledWith({
      skillId: 'kubernetes',
      row: kubernetesRow,
    });

    kubernetesRow.focus();
    fireEvent.keyDown(kubernetesRow, { key: 'Enter' });
    fireEvent.keyDown(kubernetesRow, { key: ' ' });

    expect(onSkillActivate).toHaveBeenCalledTimes(3);
    expect(
      getByRole('row', { name: /Terraform/ }).getAttribute('aria-current'),
    ).toBe('true');
  });

  it.each(['input', 'button', 'a', 'select', 'textarea'] as const)(
    'does not activate a row when a click starts from a %s descendant',
    (tagName) => {
      const onSkillActivate = vi.fn();
      const { getByRole } = renderSkillTable({ onSkillActivate });
      const row = getByRole('row', { name: /Alpha/ });
      const interactiveElement = document.createElement(tagName);

      row.append(interactiveElement);
      fireEvent.click(interactiveElement);

      expect(onSkillActivate).not.toHaveBeenCalled();
    },
  );
});
