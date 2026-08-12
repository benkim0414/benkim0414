import type { ComponentProps, ReactNode } from 'react';
import { fireEvent, render, waitFor, within } from '@testing-library/react';
import { Theme } from '@astryxdesign/core';
import { VStack } from '@astryxdesign/core/Layout';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { vi } from 'vitest';

import { HomePage } from './home-page';
import { highlightedSkills, skills } from './skill-list.data';

vi.mock('@astryxdesign/core/CommandPalette', () => ({
  CommandPalette: ({
    emptyBootstrapText,
    isOpen,
    input,
    label,
    renderItem,
    searchSource,
  }: {
    emptyBootstrapText: ReactNode;
    isOpen: boolean;
    input: ReactNode;
    label: string;
    renderItem?: (item: {
      id: string;
      label: string;
      auxiliaryData: { group: string };
    }) => ReactNode;
    searchSource: {
      bootstrap: () => Array<{
        id: string;
        label: string;
        auxiliaryData: { group: string };
      }>;
    };
  }) => {
    if (!isOpen) {
      return null;
    }

    const items = searchSource.bootstrap();
    if (items.length === 0) {
      return (
        <div aria-label={label} role="dialog">
          {input}
          {emptyBootstrapText}
        </div>
      );
    }
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
                  <div key={item.id}>
                    {renderItem ? renderItem(item) : item.label}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    );
  },
  CommandPaletteInput: (props: ComponentProps<'input'>) => (
    <input
      aria-controls="command-results"
      aria-expanded
      role="combobox"
      {...props}
    />
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

const renderHomePage = (props: ComponentProps<typeof HomePage> = {}) =>
  render(
    <Theme theme={neutralTheme}>
      <HomePage {...props} />
    </Theme>,
  );

describe('HomePage', () => {
  it('owns the mobile scroll shell and persistent top nav', () => {
    const { getByRole, queryByRole } = renderHomePage();
    const main = getByRole('main', { name: 'Home' });
    const navigation = getByRole('navigation', { name: 'Mobile navigation' });
    const mobileShell = main.parentElement;
    const { getByTestId } = render(
      <Theme theme={neutralTheme}>
        <VStack
          as="main"
          className="min-h-0 flex-1"
          data-testid="scrollable-main-control"
          gap={3}
          isScrollable
          paddingBlock={4}
          paddingInline={4}
        />
        <VStack
          as="main"
          className="min-h-0 flex-1"
          data-testid="non-scrollable-main-control"
          gap={3}
          paddingBlock={4}
          paddingInline={4}
        />
      </Theme>,
    );
    const scrollableMainControl = getByTestId('scrollable-main-control');
    const nonScrollableMainControl = getByTestId('non-scrollable-main-control');

    expect(mobileShell).toBe(navigation.parentElement);
    expect(mobileShell?.className).toContain('max-w-md');
    expect(mobileShell?.className).toContain('h-dvh');
    expect(mobileShell?.className).toContain('flex');
    expect(mobileShell?.className).toContain('overflow-hidden');
    expect(navigation.className).toContain('shrink-0');
    expect(main.className).toContain('flex-1');
    expect(main.className).toContain('astryx-stack');
    expect(main.className).toBe(scrollableMainControl.className);
    expect(main.className).not.toBe(nonScrollableMainControl.className);
    expect(getByRole('button', { name: 'Search skills' })).toBeTruthy();
    expect(queryByRole('combobox', { name: 'Search skills' })).toBeNull();
  });

  it('keeps highlighted carousel above the scrollable full skills list', () => {
    const { getByLabelText, getByRole } = renderHomePage();
    const carousel = getByLabelText('Highlighted skills');
    const carouselContainer = carousel.parentElement;
    const main = getByRole('main', { name: 'Home' });
    const pageHeading = getByRole('heading', { level: 1, name: 'Home' });
    const carouselHeading = getByRole('heading', {
      level: 2,
      name: 'Top skills',
    });
    const listHeading = getByRole('heading', {
      level: 2,
      name: 'All skills',
    });
    const list = getByRole('region', { name: 'All skills' });

    expect(listHeading.compareDocumentPosition(carousel)).toBe(
      Node.DOCUMENT_POSITION_PRECEDING,
    );
    expect(pageHeading).toBeTruthy();
    expect(carouselHeading.compareDocumentPosition(carousel)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(listHeading.compareDocumentPosition(list)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(listHeading.parentElement).toBe(list.parentElement);
    expect(listHeading.className).toContain('astryx-text');
    expect(carouselContainer?.className).toContain('shrink-0');
    expect(carouselContainer?.className).toContain('astryx-stack');
    expect(carouselContainer?.parentElement).toBe(main.parentElement);
    expect(carouselContainer?.nextElementSibling).toBe(main);
    expect(main.contains(carousel)).toBe(false);
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
    const { getByLabelText, getByRole, queryByText } = renderHomePage();
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

  it('renders skill command results as names without avatars', async () => {
    const { getByRole } = renderHomePage();

    fireEvent.click(getByRole('button', { name: 'Search skills' }));
    const dialog = getByRole('dialog', { name: 'Search skills' });

    await waitFor(() => {
      expect(within(dialog).getByText('Skills')).toBeTruthy();
      expect(within(dialog).getByText('Kubernetes')).toBeTruthy();
    });
    expect(
      within(dialog).queryByRole('img', { name: 'Kubernetes' }),
    ).toBeNull();
  });

  it('uses the full empty message only when no local skills are supplied', () => {
    const { getByText } = renderHomePage({
      highlightedSkills: [],
      skills: [],
    });

    expect(getByText('No skills have been supplied.')).toBeTruthy();
    expect(getByText('No highlighted skills have been supplied.')).toBeTruthy();
  });

  it('accepts supplied skills while preserving supplied highlighted skills', () => {
    const suppliedSkills = skills.filter((skill) => skill.id === 'react');

    const { getAllByTestId, getByText, queryByText } = renderHomePage({
      highlightedSkills,
      skills: suppliedSkills,
    });

    expect(getAllByTestId('skill-card')).toHaveLength(6);
    expect(getByText('React')).toBeTruthy();
    expect(getByText('Kubernetes')).toBeTruthy();
    expect(queryByText('TypeScript')).toBeNull();
  });
});
