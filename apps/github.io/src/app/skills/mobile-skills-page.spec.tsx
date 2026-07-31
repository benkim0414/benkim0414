import { fireEvent, render, waitFor, within } from '@testing-library/react';
import { vi } from 'vitest';

import { MobileSkillsPage } from './mobile-skills-page';
import { highlightedSkills, skills } from './skill-list.data';

vi.stubGlobal(
  'ResizeObserver',
  class ResizeObserverMock {
    observe(): void {
      // Astryx only needs the observer API to exist in jsdom.
    }

    unobserve(): void {
      // Astryx only needs the observer API to exist in jsdom.
    }

    disconnect(): void {
      // Astryx only needs the observer API to exist in jsdom.
    }
  },
);

describe('MobileSkillsPage', () => {
  it('renders fixed highlighted carousel above search and full skills list', () => {
    const { getAllByTestId, getByLabelText, getByRole, getByText } = render(
      <MobileSkillsPage />,
    );
    const carousel = getByLabelText('Highlighted skills');
    const search = getByRole('search', { name: 'Skill search' });
    const list = getByRole('region', { name: 'Skills' });

    expect(search.compareDocumentPosition(carousel)).toBe(
      Node.DOCUMENT_POSITION_PRECEDING,
    );
    expect(list.compareDocumentPosition(search)).toBe(
      Node.DOCUMENT_POSITION_PRECEDING,
    );
    expect(search).toBeTruthy();
    expect(getByRole('combobox', { name: 'Search skills' })).toBeTruthy();
    expect(carousel).toBeTruthy();
    expect(getAllByTestId('skill-card')).toHaveLength(5);

    expect(list).toBeTruthy();
    [
      'TypeScript',
      'React',
      'Nx',
      'Terraform',
      'Docker',
      'Kubernetes',
      'GitHub Actions',
      'Storybook',
      'Claude Code',
      'Neovim',
      'zsh',
      'tmux',
      'Grafana',
      'Go',
      'Argo',
      'Swift',
      'Expo',
    ].forEach((skillName) => {
      expect(within(list).getByText(skillName)).toBeTruthy();
    });
  });

  it('filters only the full skills list from the top search', async () => {
    const { getAllByTestId, getByLabelText, getByRole, queryByText } = render(
      <MobileSkillsPage />,
    );

    fireEvent.change(getByRole('combobox', { name: 'Search skills' }), {
      target: { value: 'terraform' },
    });
    fireEvent.click(
      await waitFor(() => getByRole('option', { name: '"terraform"' })),
    );

    const carousel = getByLabelText('Highlighted skills');
    const list = getByRole('region', { name: 'Skills' });

    expect(getAllByTestId('skill-card')).toHaveLength(5);
    expect(
      within(carousel).getByRole('heading', { name: 'Kubernetes' }),
    ).toBeTruthy();
    expect(
      within(carousel).getByRole('heading', { name: 'GitHub Actions' }),
    ).toBeTruthy();
    expect(within(list).getByText('Terraform')).toBeTruthy();
    expect(queryByText('React')).toBeNull();
  });

  it('keeps the highlighted carousel fixed when the list has no search match', async () => {
    const { getAllByTestId, getByRole, getByText } = render(
      <MobileSkillsPage />,
    );

    fireEvent.change(getByRole('combobox', { name: 'Search skills' }), {
      target: { value: 'zzzz-no-match' },
    });
    fireEvent.click(
      await waitFor(() => getByRole('option', { name: '"zzzz-no-match"' })),
    );

    expect(getAllByTestId('skill-card')).toHaveLength(5);
    expect(getByText('No skills match your search.')).toBeTruthy();
    expect(getByText('Kubernetes')).toBeTruthy();
  });

  it('uses the full empty message only when no local skills are supplied', () => {
    const { getByText } = render(
      <MobileSkillsPage highlightedSkills={[]} skills={[]} />,
    );

    expect(getByText('No skills have been supplied.')).toBeTruthy();
    expect(getByText('No highlighted skills have been supplied.')).toBeTruthy();
  });

  it('accepts supplied skills while preserving supplied highlighted skills', () => {
    const suppliedSkills = skills.filter((skill) => skill.id === 'react');

    const { getAllByTestId, getByText, queryByText } = render(
      <MobileSkillsPage
        highlightedSkills={highlightedSkills}
        skills={suppliedSkills}
      />,
    );

    expect(getAllByTestId('skill-card')).toHaveLength(5);
    expect(getByText('React')).toBeTruthy();
    expect(getByText('Kubernetes')).toBeTruthy();
    expect(queryByText('TypeScript')).toBeNull();
  });
});
