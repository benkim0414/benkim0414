import type { Decorator, StoryContext } from '@storybook/react-vite';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  createElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';
import { vi } from 'vitest';

import { HomePage } from '../src/app/skills/home-page';
import { SkillCard } from '../src/app/skills/skill-card';
import { skills } from '../src/app/skills/skill-list.data';
import preview from './preview';

vi.mock('@astryxdesign/core/CommandPalette', () => ({
  CommandPalette: ({
    isOpen,
    label,
    onValueChange,
    searchSource,
  }: {
    isOpen: boolean;
    label: string;
    onValueChange?: (value: string) => void;
    searchSource: {
      bootstrap: () => Array<{ id: string; label: string }>;
    };
  }) =>
    isOpen
      ? createElement(
          'div',
          { 'aria-label': label, role: 'dialog' },
          searchSource.bootstrap().map((item) =>
            createElement(
              'button',
              {
                key: item.id,
                onClick: () => onValueChange?.(item.id),
                type: 'button',
              },
              item.label,
            ),
          ),
        )
      : null,
  CommandPaletteInput: (props: ComponentProps<'input'>) =>
    createElement('input', props),
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

function decorateStory(Story: () => ReactElement, id: string): ReactNode {
  const decorators = preview.decorators as Decorator[] | undefined;
  const decorator = decorators?.[0];

  if (!decorator) {
    throw new Error('Expected the Storybook preview decorator to exist.');
  }

  return decorator(Story, { id } as StoryContext);
}

describe('Storybook preview routing', () => {
  it('renders a skill detail page after a card navigates, then resets for another story', async () => {
    const skill = skills.find(({ id }) => id === 'kubernetes');

    if (!skill) {
      throw new Error('Expected the Kubernetes fixture to exist.');
    }

    const view = render(
      decorateStory(
        () => createElement(SkillCard, { skill }),
        'github-io-skills-skill-card--default',
      ),
    );

    fireEvent.click(screen.getByRole('link', { name: 'Kubernetes' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Kubernetes' }),
    ).toBeTruthy();

    view.rerender(
      decorateStory(
        () => createElement('p', undefined, 'Another story'),
        'github-io-example--another-story',
      ),
    );

    expect(await screen.findByText('Another story')).toBeTruthy();
  });

  it('renders a skill detail page after command-palette selection', async () => {
    render(
      decorateStory(
        () => createElement(HomePage),
        'github-io-home-home-page--default',
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Search skills' }));
    fireEvent.click(screen.getByRole('button', { name: 'Terraform' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Terraform' }),
    ).toBeTruthy();
  });
});
