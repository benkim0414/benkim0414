import type { ComponentProps } from 'react';
import { render, within } from '@testing-library/react';
import { Theme } from '@astryxdesign/core';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { vi } from 'vitest';

import { HomePage } from './home-page';
import { doraCapabilityDescriptions } from '../devops-capability-evidence/dora-capability-card.evidence';
import { doraCapabilityDefinitions } from '../devops-capability-evidence/devops-capability-evidence.data';

vi.stubGlobal('matchMedia', (query: string) => ({
  addEventListener: vi.fn(),
  addListener: vi.fn(),
  dispatchEvent: vi.fn(),
  matches: false,
  media: query,
  onchange: null,
  removeEventListener: vi.fn(),
  removeListener: vi.fn(),
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
  it('shows the DevOps engineering practice heading before the greeting', () => {
    const { getByRole } = renderHomePage();
    const heading = getByRole('heading', {
      level: 1,
      name: 'DevOps engineering practice',
    });
    const greeting = getByRole('region', { name: 'Welcome message' });

    expect(heading.className).toContain('astryx-heading');
    expect(heading.parentElement?.nextElementSibling).toBe(greeting);
  });

  it('places the welcome conversation before the top skills section', () => {
    const { getByRole } = renderHomePage();
    const { getByTestId } = render(
      <Theme theme={neutralTheme}>
        <VStack
          data-testid="home-section-spacing-control"
          paddingBlock={4}
          paddingInline={4}
        />
      </Theme>,
    );
    const main = getByRole('main', { name: 'Home' });
    const greeting = getByRole('region', { name: 'Welcome message' });
    const topSkillsHeading = getByRole('heading', {
      level: 2,
      name: 'Top skills',
    });

    expect(
      greeting.compareDocumentPosition(topSkillsHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(main.contains(greeting)).toBe(true);
    expect(greeting.className).toBe(
      getByTestId('home-section-spacing-control').className,
    );
  });

  it('renders content without page-local navigation or palette ownership', () => {
    const { container, getByRole, queryByRole } = renderHomePage();
    const main = getByRole('main', { name: 'Home' });
    const doraContent = getByRole('heading', {
      level: 2,
      name: 'DORA capabilities',
    }).parentElement;

    if (!(doraContent instanceof HTMLElement)) {
      throw new Error('Expected the DORA content allocation.');
    }

    expect(queryByRole('navigation')).toBeNull();
    expect(queryByRole('button', { name: 'Search skills' })).toBeNull();
    expect(queryByRole('combobox', { name: 'Search skills' })).toBeNull();
    expect(container.querySelectorAll('.astryx-layout-content')).toHaveLength(
      0,
    );
    expect(main.className).toContain('astryx-stack');
    expect(doraContent.className).not.toMatch(/\b(?:min-h-0|flex-1)\b/);
  });

  it('keeps top skills and DORA capabilities in the same page flow', () => {
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

    if (!(doraContent instanceof HTMLElement)) {
      throw new Error('Expected the DORA content allocation.');
    }

    const topSkills = carousel.parentElement;

    if (!(topSkills instanceof HTMLElement)) {
      throw new Error('Expected the Top skills section.');
    }

    expect(topSkillsHeading.parentElement?.className).toBe(
      getByTestId('top-skills-padding-control').className,
    );
    expect(carousel.parentElement?.nextElementSibling).toBe(doraContent);
    expect(main.contains(carousel)).toBe(true);
    expect(doraContent?.className).toContain('astryx-stack');
    expect(topSkills.className).not.toMatch(
      /\b(?:shrink-0|bg-\[var\(--color-background-surface\)\])\b/,
    );
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

  it('uses compact skill surfaces for the carousel', () => {
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
