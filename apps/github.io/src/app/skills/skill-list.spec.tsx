import { render } from '@testing-library/react';

import { sampleSkills } from './skill-list.data';
import { SkillList } from './skill-list';

describe('SkillList', () => {
  it('renders skill rows with category and rating content', () => {
    const { getAllByText, getByRole, getByText } = render(
      <SkillList skills={sampleSkills} />,
    );

    expect(getByRole('region', { name: 'Skills' })).toBeTruthy();
    expect(getByRole('list')).toBeTruthy();
    expect(getByText('TypeScript')).toBeTruthy();
    expect(getAllByText('Language')).not.toHaveLength(0);
    expect(getAllByText('4 out of 5')).not.toHaveLength(0);
  });

  it('does not render search controls', () => {
    const { queryByRole } = render(<SkillList skills={sampleSkills} />);

    expect(queryByRole('combobox', { name: 'Search skills' })).toBeNull();
  });

  it('shows a distinct empty state when no skills are supplied', () => {
    const { getByRole, getByText, queryByText } = render(
      <SkillList skills={[]} />,
    );

    expect(getByRole('status')).toBeTruthy();
    expect(getByText('No skills have been supplied.')).toBeTruthy();
    expect(queryByText('No skills match your search.')).toBeNull();
  });

  it('uses distinct accessible headings for each instance', () => {
    const { getAllByRole } = render(
      <>
        <SkillList heading="Frontend skills" skills={sampleSkills} />
        <SkillList heading="Platform skills" skills={sampleSkills} />
      </>,
    );

    const sections = getAllByRole('region');

    expect(sections[0].getAttribute('aria-label')).toBe('Frontend skills');
    expect(sections[1].getAttribute('aria-label')).toBe('Platform skills');
  });

  it('does not render a visible heading inside the list region', () => {
    const { getByRole, queryByRole } = render(
      <SkillList heading="Skills" skills={sampleSkills} />,
    );

    const region = getByRole('region', { name: 'Skills' });
    const list = getByRole('list');

    expect(region).toBeTruthy();
    expect(list.getAttribute('aria-labelledby')).toBeNull();
    expect(queryByRole('heading', { level: 2, name: 'Skills' })).toBeNull();
  });
});
