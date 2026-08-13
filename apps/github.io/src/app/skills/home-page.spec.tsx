import type { ComponentProps } from 'react';
import { render, within } from '@testing-library/react';
import { Theme } from '@astryxdesign/core';
import { HStack, LayoutContent, VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { vi } from 'vitest';

import { HomePage } from './home-page';
import { doraCapabilityDescriptions } from '../devops-capability-evidence/dora-capability-card.evidence';
import { doraCapabilityDefinitions } from '../devops-capability-evidence/devops-capability-evidence.data';

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
  it('renders content without page-local navigation or palette ownership', () => {
    const { container, getByRole, queryByRole } = renderHomePage();
    const main = getByRole('main', { name: 'Home' });
    const { getByTestId } = render(
      <Theme theme={neutralTheme}>
        <LayoutContent
          className="flex flex-col"
          data-testid="non-scrollable-content-control"
          isScrollable={false}
          label="Control"
          padding={0}
          role="main"
        />
        <VStack
          as="main"
          className="min-h-0 flex-1"
          data-testid="scrollable-main-control"
          gap={3}
          isScrollable
          paddingBlock={4}
          paddingInline={4}
        />
      </Theme>,
    );
    const scrollableMainControl = getByTestId('scrollable-main-control');
    const nonScrollableContentControl = getByTestId(
      'non-scrollable-content-control',
    );
    const doraContent = getByRole('heading', {
      level: 2,
      name: 'DORA capabilities',
    }).parentElement;

    expect(queryByRole('navigation')).toBeNull();
    expect(queryByRole('button', { name: 'Search skills' })).toBeNull();
    expect(queryByRole('combobox', { name: 'Search skills' })).toBeNull();
    expect(container.querySelectorAll('.astryx-layout-content')).toHaveLength(
      1,
    );
    expect(main.className).toBe(nonScrollableContentControl.className);
    expect(doraContent?.className).toBe(scrollableMainControl.className);
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
    const doraContent = doraHeading.parentElement;

    expect(topSkillsHeading.parentElement?.className).toBe(
      getByTestId('top-skills-padding-control').className,
    );
    expect(carousel.parentElement?.nextElementSibling).toBe(doraContent);
    expect(main.contains(carousel)).toBe(true);
    expect(doraContent?.className).toContain('flex-1');
    expect(doraContent?.className).toContain('astryx-stack');
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
      cards.map(
        (card) => within(card).getByRole('heading', { level: 3 }).textContent,
      ),
    ).toEqual(doraCapabilityDefinitions.map((capability) => capability.label));
    const firstCard = cards.at(0);
    const firstCapability = doraCapabilityDefinitions.at(0);

    if (!firstCard || !firstCapability) {
      throw new Error(
        'Expected the canonical DORA capability list to be non-empty.',
      );
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
    const doraContent = getByRole('heading', {
      level: 2,
      name: 'DORA capabilities',
    }).parentElement;
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
    expect(actionRow?.parentElement?.nextElementSibling).toBe(doraContent);
    expect(main.contains(actionRow)).toBe(true);
    expect(carousel.contains(showAll)).toBe(false);
  });

  it('keeps the empty carousel state without adding page-level search', () => {
    const { getByRole, getByText, queryByRole } = renderHomePage({
      highlightedSkills: [],
    });

    expect(getByText('No highlighted skills have been supplied.')).toBeTruthy();
    expect(getByRole('link', { name: 'Show all' }).getAttribute('href')).toBe(
      '/skills',
    );
    expect(queryByRole('button', { name: 'Search skills' })).toBeNull();
  });
});
