import { fireEvent, render } from '@testing-library/react';

import { sampleSkills } from './skill-list.data';
import { SkillList, skillMatchesQuery } from './skill-list';

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
    const { getAllByLabelText, getByText } = render(
      <SkillList skills={sampleSkills} />
    );

    expect(getByText('TypeScript')).toBeTruthy();
    expect(getByText('Language')).toBeTruthy();
    expect(getAllByLabelText('5 out of 5')).not.toHaveLength(0);
  });

  it('filters by search query', () => {
    const { getByLabelText, getByText, queryByText } = render(
      <SkillList skills={sampleSkills} />
    );

    fireEvent.change(getByLabelText('Search skills'), {
      target: { value: 'terraform' },
    });

    expect(getByText('Terraform')).toBeTruthy();
    expect(queryByText('React')).toBeNull();
  });

  it('shows an empty state when no skills match', () => {
    const { getByLabelText, getByText } = render(
      <SkillList skills={sampleSkills} />
    );

    fireEvent.change(getByLabelText('Search skills'), {
      target: { value: 'does-not-exist' },
    });

    expect(getByText('No skills match your search.')).toBeTruthy();
  });
});
