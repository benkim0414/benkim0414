import type { Decorator, StoryContext } from '@storybook/react-vite';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import {
  type ComponentType,
  createElement,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
} from 'react';
import { afterEach, vi } from 'vitest';

import { GlobalNavigationLayout } from '../src/app/global-navigation-layout';
import footerMeta, {
  Default as FooterStory,
} from '../src/app/global-navigation-footer.stories';
import globalNavigationMeta, {
  Roadmap as RoadmapStory,
} from '../src/app/global-navigation-layout.stories';
import homeGreetingMeta, {
  Default as HomeGreetingStory,
} from '../src/app/skills/home-greeting.stories';
import pageMeta, {
  NotFound as NotFoundStory,
} from '../src/app/app-routes.stories';
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

afterEach(() => {
  sessionStorage.clear();
  vi.useRealTimers();
});

function decorateStory(
  Story: () => ReactElement,
  id: string,
  context: Partial<StoryContext> = {},
): ReactNode {
  const decorators = preview.decorators as Decorator[] | undefined;
  const decorator = decorators?.[0];

  if (!decorator) {
    throw new Error('Expected the Storybook preview decorator to exist.');
  }

  return decorator(Story, { id, ...context } as StoryContext);
}

describe('Storybook preview routing', () => {
  it('renders the dedicated footer story inside the preview router', () => {
    const StoryComponent = footerMeta.component as ComponentType<
      Record<string, unknown>
    >;
    const args = (FooterStory.args ?? {}) as Record<string, unknown>;

    render(
      decorateStory(
        () => createElement(StoryComponent, args),
        'github-io-navigation-footer--default',
        {
          args,
          parameters: {
            ...footerMeta.parameters,
            ...FooterStory.parameters,
          },
        },
      ),
    );

    expect(screen.getByRole('separator').className).toContain(
      'astryx-divider',
    );
    expect(screen.getByRole('contentinfo')).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: /@benkim0414/i })
        .getAttribute('href'),
    ).toBe('https://github.com/benkim0414');
  });

  it('renders the routed global-navigation story inside the preview router', async () => {
    const StoryComponent = globalNavigationMeta.component as ComponentType<
      Record<string, unknown>
    >;
    const args = (RoadmapStory.args ?? {}) as Record<string, unknown>;

    render(
      decorateStory(
        () => createElement(StoryComponent, args),
        'github-io-navigation-global-navigation--roadmap',
        {
          args,
          parameters: {
            ...globalNavigationMeta.parameters,
            ...RoadmapStory.parameters,
          },
        },
      ),
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Navigation' }));

    const drawer = screen.getByRole('dialog', { name: 'Navigation' });
    expect(
      within(drawer).getByRole('link', { name: 'Roadmap' }).getAttribute(
        'aria-current',
      ),
    ).toBe('page');
  });

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

  it('renders only the greeting story and replays its message sequence', () => {
    vi.useFakeTimers();
    sessionStorage.setItem('home-greeting-seen', 'true');
    const StoryComponent = homeGreetingMeta.component as ComponentType<
      Record<string, unknown>
    >;
    const args = (HomeGreetingStory.args ?? {}) as Record<string, unknown>;
    const renderStory =
      HomeGreetingStory.render ??
      (() => createElement(StoryComponent, args));

    render(
      decorateStory(
        () => renderStory(args, {} as StoryContext) as ReactElement,
        'github-io-home-home-greeting--default',
        {
          args,
          parameters: {
            ...homeGreetingMeta.parameters,
            ...HomeGreetingStory.parameters,
          },
        },
      ),
    );

    expect(screen.queryByRole('main')).toBeNull();
    expect(screen.queryByText("G'day, mate 👋")).toBeNull();

    act(() => vi.advanceTimersByTime(1_050));

    expect(screen.getByRole('link', { name: 'Explore skills' })).toBeTruthy();
    vi.useRealTimers();
  });

  it('renders a skill detail page after command-palette selection', async () => {
    render(
      decorateStory(
        () => createElement(GlobalNavigationLayout),
        'github-io-navigation-global-navigation--home',
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    fireEvent.click(screen.getByRole('button', { name: 'Terraform' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Terraform' }),
    ).toBeTruthy();
  });

  it('renders the route-story fallback page through AppRoutes', () => {
    const StoryComponent = pageMeta.component as ComponentType<
      Record<string, unknown>
    >;
    const args = (NotFoundStory.args ?? {}) as Record<string, unknown>;

    render(
      decorateStory(
        () => createElement(StoryComponent, args),
        'github-io-pages--not-found',
        {
          args,
          parameters: {
            ...pageMeta.parameters,
            ...NotFoundStory.parameters,
          },
        },
      ),
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'Skill not found' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Back home' }).getAttribute('href'),
    ).toBe('/');
  });

  it('opens external command-palette project results outside the preview frame', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);

    render(
      decorateStory(
        () => createElement(GlobalNavigationLayout),
        'github-io-navigation-global-navigation--home',
      ),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    fireEvent.click(screen.getByRole('button', { name: 'benkim0414/dotfiles' }));

    expect(open).toHaveBeenCalledWith(
      'https://github.com/benkim0414/dotfiles',
      '_blank',
      'noopener,noreferrer',
    );

    open.mockRestore();
  });
});
