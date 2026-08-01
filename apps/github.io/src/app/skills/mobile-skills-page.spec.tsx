import type { ComponentProps } from 'react';
import { render, within } from '@testing-library/react';
import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
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

HTMLDialogElement.prototype.showModal = vi.fn(function showModal(
  this: HTMLDialogElement,
) {
  this.open = true;
});
HTMLDialogElement.prototype.close = vi.fn(function close(
  this: HTMLDialogElement,
) {
  this.open = false;
});

const renderMobileSkillsPage = (
  props: ComponentProps<typeof MobileSkillsPage> = {},
) =>
  render(
    <Theme theme={neutralTheme}>
      <MobileSkillsPage {...props} />
    </Theme>,
  );

describe('MobileSkillsPage', () => {
  it('owns the mobile scroll shell and persistent top nav', () => {
    const { getByRole, queryByRole } = renderMobileSkillsPage();
    const main = getByRole('main', { name: 'Skills' });
    const navigation = getByRole('navigation', { name: 'Mobile navigation' });
    const mobileShell = main.parentElement;

    expect(mobileShell).toBe(navigation.parentElement);
    expect(mobileShell?.className).toContain('max-w-md');
    expect(mobileShell?.className).toContain('h-dvh');
    expect(mobileShell?.className).toContain('flex');
    expect(mobileShell?.className).toContain('overflow-hidden');
    expect(navigation.className).toContain('shrink-0');
    expect(main.className).toContain('flex-1');
    expect(main.className).toContain('overflow-y-auto');
    expect(getByRole('button', { name: 'Search skills' })).toBeTruthy();
    expect(queryByRole('combobox', { name: 'Search skills' })).toBeNull();
  });

  it('keeps highlighted carousel above the scrollable full skills list', () => {
    const { getAllByTestId, getByLabelText, getByRole, getByText } =
      renderMobileSkillsPage();
    const carousel = getByLabelText('Highlighted skills');
    const list = getByRole('region', { name: 'Skills' });

    expect(list.compareDocumentPosition(carousel)).toBe(
      Node.DOCUMENT_POSITION_PRECEDING,
    );
    expect(carousel.parentElement?.className).toContain('shrink-0');
    expect(carousel).toBeTruthy();
    expect(within(carousel).getAllByTestId('skill-card')).toHaveLength(5);
    expect(within(list).getAllByTestId('skill-card')).toHaveLength(
      skills.length,
    );

    expect(list).toBeTruthy();
    [
      'Argo',
      'Claude Code',
      'Docker',
      'Expo',
      'GitHub Actions',
      'Go',
      'Grafana',
      'Kubernetes',
      'Neovim',
      'Nx',
      'React',
      'Storybook',
      'Swift',
      'Terraform',
      'Tmux',
      'TypeScript',
      'Zsh',
    ].forEach((skillName) => {
      expect(within(list).getByText(skillName)).toBeTruthy();
    });
  });

  it('uses compact skill surfaces for mobile', () => {
    const { getByLabelText, getByRole, queryByText } =
      renderMobileSkillsPage();
    const carousel = getByLabelText('Highlighted skills');
    const list = getByRole('region', { name: 'Skills' });

    expect(within(carousel).queryByText('Container')).toBeNull();
    expect(
      within(carousel).getByText(
        'Cloud-native workload operations, troubleshooting, and infrastructure practice backed by Kubernetes certification evidence.',
      ),
    ).toBeTruthy();
    expect(within(list).queryByText('Language')).toBeNull();
    expect(queryByText('TypeScript')).toBeTruthy();
  });

  it('uses the full empty message only when no local skills are supplied', () => {
    const { getByText } = renderMobileSkillsPage({
      highlightedSkills: [],
      skills: [],
    });

    expect(getByText('No skills have been supplied.')).toBeTruthy();
    expect(getByText('No highlighted skills have been supplied.')).toBeTruthy();
  });

  it('accepts supplied skills while preserving supplied highlighted skills', () => {
    const suppliedSkills = skills.filter((skill) => skill.id === 'react');

    const { getAllByTestId, getByText, queryByText } =
      renderMobileSkillsPage({
        highlightedSkills,
        skills: suppliedSkills,
      });

    expect(getAllByTestId('skill-card')).toHaveLength(6);
    expect(getByText('React')).toBeTruthy();
    expect(getByText('Kubernetes')).toBeTruthy();
    expect(queryByText('TypeScript')).toBeNull();
  });
});
