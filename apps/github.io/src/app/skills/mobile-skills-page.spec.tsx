import { render, within } from '@testing-library/react';
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
  it('renders fixed highlighted carousel above the full skills list', () => {
    const { getAllByTestId, getByLabelText, getByRole, getByText } = render(
      <MobileSkillsPage />,
    );
    const carousel = getByLabelText('Highlighted skills');
    const list = getByRole('region', { name: 'Skills' });

    expect(list.compareDocumentPosition(carousel)).toBe(
      Node.DOCUMENT_POSITION_PRECEDING,
    );
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
