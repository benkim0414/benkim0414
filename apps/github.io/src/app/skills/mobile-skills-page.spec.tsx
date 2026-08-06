import type { ComponentProps, ReactNode } from 'react';
import { fireEvent, render, waitFor, within } from '@testing-library/react';
import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { vi } from 'vitest';

import { MobileSkillsPage } from './mobile-skills-page';
import { highlightedSkills, skills } from './skill-list.data';

vi.mock('@astryxdesign/core/CommandPalette', () => ({
  CommandPalette: ({
    isOpen,
    input,
    label,
    renderItem,
    searchSource,
  }: {
    isOpen: boolean;
    input: ReactNode;
    label: string;
    renderItem: (item: {
      id: string;
      auxiliaryData: { group: string };
    }) => ReactNode;
    searchSource: {
      bootstrap: () => Array<{
        id: string;
        auxiliaryData: { group: string };
      }>;
    };
  }) => {
    if (!isOpen) {
      return null;
    }

    const items = searchSource.bootstrap();
    const groups = [...new Set(items.map((item) => item.auxiliaryData.group))];

    return (
      <div aria-label={label} role="dialog">
        {input}
        <div role="listbox">
          {groups.map((group) => (
            <div key={group}>
              <div>{group}</div>
              {items
                .filter((item) => item.auxiliaryData.group === group)
                .map((item) => (
                  <div key={item.id}>{renderItem(item)}</div>
                ))}
            </div>
          ))}
        </div>
      </div>
    );
  },
  CommandPaletteInput: (props: ComponentProps<'input'>) => (
    <input aria-controls="command-results" aria-expanded role="combobox" {...props} />
  ),
}));

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
    expect(main.className).toContain('astryx-stack');
    expect(getByRole('button', { name: 'Search skills' })).toBeTruthy();
    expect(queryByRole('combobox', { name: 'Search skills' })).toBeNull();
  });

  it('keeps highlighted carousel above the scrollable full skills list', () => {
    const { getAllByTestId, getByLabelText, getByRole, getByText } =
      renderMobileSkillsPage();
    const carousel = getByLabelText('Highlighted skills');
    const carouselContainer = carousel.parentElement;
    const listHeading = getByRole('heading', {
      level: 2,
      name: 'All skills',
    });
    const list = getByRole('region', { name: 'All skills' });

    expect(listHeading.compareDocumentPosition(carousel)).toBe(
      Node.DOCUMENT_POSITION_PRECEDING,
    );
    expect(listHeading.compareDocumentPosition(list)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(listHeading.parentElement).toBe(list.parentElement);
    expect(listHeading.className).toContain('astryx-text');
    expect(carouselContainer?.className).toContain('shrink-0');
    expect(carouselContainer?.className).toContain('pt-4');
    expect(carouselContainer?.className).not.toContain('px-4');
    expect(carouselContainer?.className).not.toContain('pb-4');
    const main = getByRole('main', { name: 'Skills' });
    expect(main.className).toContain('astryx-stack');
    expect(main.className).toContain('flex-1');
    expect(main.className).not.toContain('px-4');
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
    const list = getByRole('region', { name: 'All skills' });

    expect(within(carousel).queryByText('Container')).toBeNull();
    expect(
      within(carousel).getByText(
        'Cloud-native workload operations, troubleshooting, and infrastructure practice backed by Kubernetes certification evidence.',
      ),
    ).toBeTruthy();
    expect(within(list).queryByText('Language')).toBeNull();
    expect(queryByText('TypeScript')).toBeTruthy();
  });

  it('renders a 20px avatar before each skill command result', async () => {
    const { getByRole } = renderMobileSkillsPage();

    fireEvent.click(getByRole('button', { name: 'Search skills' }));

    const dialog = getByRole('dialog', { name: 'Search skills' });

    await waitFor(() => {
      expect(within(dialog).getByText('Skills')).toBeTruthy();
      expect(
        within(dialog).getByRole('img', { name: 'Kubernetes' }),
      ).toBeTruthy();
    });

    const avatar = within(dialog).getByRole('img', { name: 'Kubernetes' });
    const content = avatar.firstElementChild as HTMLElement;

    expect(avatar.getAttribute('data-size')).toBe('tiny');
    expect(content.style.getPropertyValue('--x-width')).toBe('20px');
    expect(content.style.getPropertyValue('--x-height')).toBe('20px');
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
