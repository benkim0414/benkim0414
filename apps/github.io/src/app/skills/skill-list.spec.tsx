import { fireEvent, render, waitFor } from '@testing-library/react';

import { sampleSkills } from './skill-list.data';
import { skillCategories } from './skill-list.types';
import {
  SkillList,
  skillMatchesFilters,
  skillMatchesQuery,
  skillSearchConfig,
} from './skill-list';

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

describe('SkillList', () => {
  it('renders skill rows with category and rating content', () => {
    const { getAllByText, getByText } = render(<SkillList skills={sampleSkills} />);

    expect(getByText('TypeScript')).toBeTruthy();
    expect(getByText('Language')).toBeTruthy();
    expect(getAllByText('5 out of 5')).not.toHaveLength(0);
  });

  it('filters by search query', async () => {
    const { getByRole, getByText, queryByText } = render(
      <SkillList skills={sampleSkills} />
    );

    fireEvent.change(getByRole('combobox', { name: 'Search skills' }), {
      target: { value: 'terraform' },
    });
    fireEvent.click(
      await waitFor(() => getByRole('option', { name: '"terraform"' }))
    );

    expect(getByText('Terraform')).toBeTruthy();
    expect(queryByText('React')).toBeNull();
  });

  it('replaces an earlier free-text query with the next committed query', async () => {
    const { getByRole, getByText, queryByText } = render(
      <SkillList skills={sampleSkills} />
    );
    const search = getByRole('combobox', { name: 'Search skills' });

    fireEvent.change(search, { target: { value: 'terraform' } });
    fireEvent.click(
      await waitFor(() => getByRole('option', { name: '"terraform"' }))
    );
    fireEvent.change(search, { target: { value: 'react' } });
    fireEvent.click(
      await waitFor(() => getByRole('option', { name: '"react"' }))
    );

    expect(getByText('React')).toBeTruthy();
    expect(queryByText('Terraform')).toBeNull();
  });

  it('shows an empty state when no skills match', async () => {
    const { getByRole, getByText } = render(
      <SkillList skills={sampleSkills} />
    );

    fireEvent.change(getByRole('combobox', { name: 'Search skills' }), {
      target: { value: 'does-not-exist' },
    });
    fireEvent.click(
      await waitFor(() =>
        getByRole('option', { name: '"does-not-exist"' })
      )
    );

    expect(getByText('No skills match your search.')).toBeTruthy();
  });

  it('shows a distinct empty state when no skills are supplied', () => {
    const { getByText, queryByText } = render(<SkillList skills={[]} />);

    expect(getByText('No skills have been supplied.')).toBeTruthy();
    expect(queryByText('No skills match your search.')).toBeNull();
  });

  it('uses distinct accessible headings for each instance', () => {
    const { getAllByRole } = render(
      <>
        <SkillList heading="Frontend skills" skills={sampleSkills} />
        <SkillList heading="Platform skills" skills={sampleSkills} />
      </>
    );

    const sections = getAllByRole('region');
    const headings = getAllByRole('heading');

    expect(sections[0].getAttribute('aria-labelledby')).toBe(headings[0].id);
    expect(sections[1].getAttribute('aria-labelledby')).toBe(headings[1].id);
    expect(headings[0].id).not.toBe(headings[1].id);
  });
});

describe('structured category filtering', () => {
  it('declares categories as an Astryx enum field', () => {
    const categoryField = skillSearchConfig.fields.find(
      (field) => field.key === 'category'
    );

    expect(categoryField?.operators[0].value).toEqual({
      type: 'enum',
      values: skillCategories.map((category) => ({
        label: category,
        value: category,
      })),
    });
  });

  it('filters skills with a structured PowerSearch category filter', async () => {
    const { getByRole, getByText, queryByText } = render(
      <SkillList skills={sampleSkills} />
    );

    fireEvent.change(getByRole('combobox', { name: 'Search skills' }), {
      target: { value: 'category framework' },
    });
    fireEvent.click(
      await waitFor(() =>
        getByRole('option', { name: 'Category is Framework' })
      )
    );

    expect(getByText('React')).toBeTruthy();
    expect(queryByText('TypeScript')).toBeNull();
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
