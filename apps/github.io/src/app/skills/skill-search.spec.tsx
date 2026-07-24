import { fireEvent, render, waitFor } from '@testing-library/react';
import type { PowerSearchFilter } from '@astryxdesign/core/PowerSearch';

import { sampleSkills } from './skill-list.data';
import { skillCategories } from './skill-list.types';
import {
  SkillSearch,
  skillMatchesFilters,
  skillMatchesQuery,
  skillSearchConfig,
} from './skill-search';

describe('skillMatchesQuery', () => {
  it('matches by name, category, and keyword', () => {
    const react = sampleSkills.find((skill) => skill.id === 'react');
    const terraform = sampleSkills.find((skill) => skill.id === 'terraform');

    expect(react).toBeTruthy();
    expect(terraform).toBeTruthy();
    expect(skillMatchesQuery(react!, 'react')).toBe(true);
    expect(skillMatchesQuery(terraform!, 'IaC')).toBe(true);
    expect(skillMatchesQuery(terraform!, 'provisioning')).toBe(true);
    expect(skillMatchesQuery(terraform!, 'storybook')).toBe(false);
  });
});

describe('SkillSearch', () => {
  it('renders the Astryx PowerSearch input', () => {
    const { getByRole } = render(
      <SkillSearch
        filters={[]}
        onFiltersChange={() => undefined}
        resultCount={sampleSkills.length}
      />,
    );

    expect(getByRole('combobox', { name: 'Search skills' })).toBeTruthy();
  });

  it('passes the result count to Astryx PowerSearch', () => {
    const { getByText } = render(
      <SkillSearch
        filters={[]}
        onFiltersChange={() => undefined}
        resultCount={8}
      />,
    );

    expect(getByText('8 results')).toBeTruthy();
  });

  it('replaces an earlier free-text query with the next committed query', async () => {
    let filters: ReadonlyArray<PowerSearchFilter> = [];
    const onFiltersChange = vi.fn((nextFilters) => {
      filters = nextFilters;
    });
    const { getByRole, rerender } = render(
      <SkillSearch
        filters={filters}
        onFiltersChange={onFiltersChange}
        resultCount={sampleSkills.length}
      />,
    );
    const search = getByRole('combobox', { name: 'Search skills' });

    fireEvent.change(search, { target: { value: 'terraform' } });
    fireEvent.click(
      await waitFor(() => getByRole('option', { name: '"terraform"' })),
    );
    rerender(
      <SkillSearch
        filters={filters}
        onFiltersChange={onFiltersChange}
        resultCount={1}
      />,
    );
    fireEvent.change(search, { target: { value: 'react' } });
    fireEvent.click(
      await waitFor(() => getByRole('option', { name: '"react"' })),
    );

    expect(filters).toEqual([
      {
        field: 'query',
        operator: 'contains',
        value: { type: 'string', value: 'react' },
      },
    ]);
  });
});

describe('structured category filtering', () => {
  it('declares categories as an Astryx enum field', () => {
    const categoryField = skillSearchConfig.fields.find(
      (field) => field.key === 'category',
    );

    expect(categoryField?.operators[0].value).toEqual({
      type: 'enum',
      values: skillCategories.map((category) => ({
        label: category,
        value: category,
      })),
    });
  });

  it('applies category filters together with text search', () => {
    const react = sampleSkills.find((skill) => skill.id === 'react');
    const terraform = sampleSkills.find((skill) => skill.id === 'terraform');
    const filters = [
      {
        field: 'query',
        operator: 'contains',
        value: { type: 'string' as const, value: 'frontend' },
      },
      {
        field: 'category',
        operator: 'is',
        value: { type: 'enum' as const, value: 'Framework' },
      },
    ];

    expect(react).toBeTruthy();
    expect(terraform).toBeTruthy();
    expect(skillMatchesFilters(react!, filters)).toBe(true);
    expect(skillMatchesFilters(terraform!, filters)).toBe(false);
  });
});
