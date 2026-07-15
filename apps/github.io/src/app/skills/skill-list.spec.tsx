import { render } from '@testing-library/react';

import { sampleSkills } from './skill-list.data';
import { SkillList } from './skill-list';

describe('SkillList', () => {
  it('renders skill rows with category and rating content', () => {
    const { getAllByText, getByRole, getByText } = render(
      <SkillList skills={sampleSkills} />
    );

    expect(getByRole('list', { name: 'Skills' })).toBeTruthy();
    expect(getByText('TypeScript')).toBeTruthy();
    expect(getByText('Language')).toBeTruthy();
    expect(getAllByText('5 out of 5')).not.toHaveLength(0);
  });

  it('does not render search controls', () => {
    const { queryByRole } = render(<SkillList skills={sampleSkills} />);

    expect(queryByRole('combobox', { name: 'Search skills' })).toBeNull();
  });

  it('shows a distinct empty state when no skills are supplied', () => {
    const { getByRole, getByText, queryByText } = render(<SkillList skills={[]} />);

    expect(getByRole('status')).toBeTruthy();
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

  it('can hide its visible heading while keeping the region accessible', () => {
    const { getByRole } = render(
      <SkillList heading="Skills" isHeadingHidden skills={sampleSkills} />
    );

    const region = getByRole('region', { name: 'Skills' });
    const list = getByRole('list', { name: 'Skills' });
    const heading = getByRole('heading', { level: 2, name: 'Skills' });

    expect(region.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(list.getAttribute('aria-labelledby')).toBeTruthy();
    expect(heading.closest('span')).toBeNull();
  });
});
