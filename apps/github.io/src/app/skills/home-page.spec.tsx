import type { ComponentProps, ReactNode } from 'react';
import { fireEvent, render, waitFor, within } from '@testing-library/react';
import { Theme } from '@astryxdesign/core';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { vi } from 'vitest';

import { HomePage } from './home-page';
import { doraCapabilityDescriptions } from '../devops-capability-evidence/dora-capability-card.evidence';
import { doraCapabilityDefinitions } from '../devops-capability-evidence/devops-capability-evidence.data';
import { highlightedSkills, skills } from './skill-list.data';

vi.mock('@astryxdesign/core/CommandPalette', () => ({
  CommandPalette: ({
    emptyBootstrapText,
    isOpen,
    input,
    label,
    onValueChange,
    renderItem,
    searchSource,
  }: {
    emptyBootstrapText: ReactNode;
    isOpen: boolean;
    input: ReactNode;
    label: string;
    onValueChange?: (value: string) => void;
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
                  <div
                    aria-label={item.label}
                    aria-selected={false}
                    key={item.id}
                    onClick={() => onValueChange?.(item.id)}
                    role="option"
                  >
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

  it('keeps top skills fixed above the scrollable DORA section', () => {
    const { getByLabelText, getByRole } = renderHomePage();
    const { getByTestId } = render(
      <Theme theme={neutralTheme}>
        <VStack data-testid="top-skills-padding-control" paddingInline={4}>
          <Text as="h2" type="body" weight="bold">
            Top skills control
          </Text>
        </VStack>
      </Theme>,
    );
    const carousel = getByLabelText('Highlighted skills');
    const main = getByRole('main', { name: 'Home' });
    const topSkillsHeading = getByRole('heading', {
      level: 2,
      name: 'Top skills',
    });
    const doraHeading = getByRole('heading', {
      level: 2,
      name: 'DORA capabilities',
    });

    expect(topSkillsHeading.parentElement?.className).toBe(
      getByTestId('top-skills-padding-control').className,
    );
    expect(carousel.parentElement?.nextElementSibling).toBe(main);
    expect(main.contains(carousel)).toBe(false);
    expect(main.className).toContain('flex-1');
    expect(main.className).toContain('astryx-stack');
    expect(main.contains(doraHeading)).toBe(true);
  });

  it('explains DORA and uses a secondary button for the official capability catalog', () => {
    const { getByRole, getByText } = renderHomePage();

    expect(getByText('About DORA capabilities')).toBeTruthy();
    expect(
      getByText(
        'DORA capabilities are technical, process, and cultural practices associated with stronger software delivery and organizational performance. Each card connects a capability to supporting experience, certifications, and technical skills.',
      ),
    ).toBeTruthy();
    const cta = getByRole('link', { name: 'Learn more' });
    expect(cta.className).toContain('astryx-button');
    expect(cta.getAttribute('data-variant')).toBe('secondary');
    expect(cta.getAttribute('href')).toBe('https://dora.dev/capabilities/');
    expect(cta.getAttribute('target')).toBe('_blank');
    expect(cta.getAttribute('rel')).toContain('noopener');
    expect(cta.getAttribute('rel')).toContain('noreferrer');
  });

  it('renders all evidence-backed DORA cards in canonical order', () => {
    const { getAllByTestId } = renderHomePage();
    const cards = getAllByTestId('dora-capability-card');

    expect(cards).toHaveLength(doraCapabilityDefinitions.length);
    expect(
      cards.map((card) =>
        within(card).getByRole('heading', { level: 3 }).textContent,
      ),
    ).toEqual(doraCapabilityDefinitions.map((capability) => capability.label));
    const firstCard = cards.at(0);
    const firstCapability = doraCapabilityDefinitions.at(0);

    if (!firstCard || !firstCapability) {
      throw new Error('Expected the canonical DORA capability list to be non-empty.');
    }
    expect(
      within(firstCard).getByText(
        doraCapabilityDescriptions[firstCapability.key],
      ),
    ).toBeTruthy();
    expect(within(firstCard).getByText('Relevant experience')).toBeTruthy();
  });

  it('uses compact skill surfaces for the fixed carousel', () => {
    const { getByLabelText } = renderHomePage();
    const carousel = getByLabelText('Highlighted skills');

    expect(within(carousel).queryByText('Container')).toBeNull();
    expect(
      within(carousel).getByText(
        'Cloud-native workload operations, troubleshooting, and infrastructure practice backed by Kubernetes certification evidence.',
      ),
    ).toBeTruthy();
  });

  it('places an Astryx Show all link below and right-aligned to the carousel', () => {
    const { getByLabelText, getByRole } = renderHomePage();
    const carousel = getByLabelText('Highlighted skills');
    const main = getByRole('main', { name: 'Home' });
    const showAll = getByRole('link', { name: 'Show all' });
    const actionRow = showAll.parentElement;
    const { getByTestId } = render(
      <Theme theme={neutralTheme}>
        <HStack
          data-testid="show-all-row-control"
          hAlign="end"
          paddingInline={4}
        >
          <span>Control</span>
        </HStack>
      </Theme>,
    );

    expect(showAll.className).toContain('astryx-button');
    expect(showAll.getAttribute('href')).toBe('/skills');
    expect(showAll.getAttribute('data-size')).toBe('sm');
    expect(showAll.getAttribute('data-variant')).toBe('ghost');
    expect(carousel.nextElementSibling).toBe(actionRow);
    expect(actionRow?.className).toBe(
      getByTestId('show-all-row-control').className,
    );
    expect(actionRow?.parentElement?.nextElementSibling).toBe(main);
    expect(carousel.contains(showAll)).toBe(false);
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

  it('calls onSkillSelect with the selected skill while keeping results text-only', async () => {
    const onSkillSelect = vi.fn();
    const { getByRole } = renderHomePage({ onSkillSelect });

    fireEvent.click(getByRole('button', { name: 'Search skills' }));
    const terraformOption = await waitFor(() =>
      getByRole('option', { name: 'Terraform' }),
    );

    expect(within(terraformOption).queryByRole('img')).toBeNull();
    fireEvent.click(terraformOption);

    expect(onSkillSelect).toHaveBeenCalledWith(
      skills.find((skill) => skill.id === 'terraform'),
    );
  });

  it('shows no skills in the palette while keeping the empty carousel state', () => {
    const { getByRole, getByText } = renderHomePage({
      highlightedSkills: [],
      skills: [],
    });

    fireEvent.click(getByRole('button', { name: 'Search skills' }));

    expect(getByRole('dialog', { name: 'Search skills' })).toBeTruthy();
    expect(getByText('No skills')).toBeTruthy();
    expect(getByText('No highlighted skills have been supplied.')).toBeTruthy();
  });

  it('uses supplied skills only for text search while preserving highlighted skills', async () => {
    const suppliedSkills = skills.filter((skill) => skill.id === 'react');

    const { getAllByTestId, getByRole } = renderHomePage({
      highlightedSkills,
      skills: suppliedSkills,
    });

    expect(getAllByTestId('skill-card')).toHaveLength(5);
    fireEvent.click(getByRole('button', { name: 'Search skills' }));
    const dialog = getByRole('dialog', { name: 'Search skills' });

    await waitFor(() => {
      expect(within(dialog).getByText('React')).toBeTruthy();
    });
    expect(within(dialog).queryByText('TypeScript')).toBeNull();
  });
});
