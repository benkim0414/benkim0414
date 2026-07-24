import { fireEvent, render, waitFor } from '@testing-library/react';

import { SkillSection } from './skill-section';
import { sampleSkills } from './skill-list.data';

describe('SkillSection', () => {
  it('wires search filters to the presentational skill list', async () => {
    const { getAllByText, getByRole, getByText, queryByText } = render(
      <SkillSection heading="Skills" skills={sampleSkills} />,
    );

    expect(getByText('8 results')).toBeTruthy();

    fireEvent.change(getByRole('combobox', { name: 'Search skills' }), {
      target: { value: 'terraform' },
    });
    fireEvent.click(
      await waitFor(() => getByRole('option', { name: '"terraform"' })),
    );

    expect(getByText('Terraform')).toBeTruthy();
    expect(getAllByText('1 result')).not.toHaveLength(0);
    expect(queryByText('React')).toBeNull();
  });

  it('shows a filtered empty state when no skills match', async () => {
    const { getByRole, getByText } = render(
      <SkillSection heading="Skills" skills={sampleSkills} />,
    );

    fireEvent.change(getByRole('combobox', { name: 'Search skills' }), {
      target: { value: 'does-not-exist' },
    });
    fireEvent.click(
      await waitFor(() => getByRole('option', { name: '"does-not-exist"' })),
    );

    expect(getByText('No skills match your search.')).toBeTruthy();
  });

  it('passes through custom empty copy when no skills are supplied', () => {
    const { getByText } = render(
      <SkillSection
        emptyMessage="No profile skills yet."
        heading="Skills"
        skills={[]}
      />,
    );

    expect(getByText('No profile skills yet.')).toBeTruthy();
  });
});
