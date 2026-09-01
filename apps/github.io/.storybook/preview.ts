import { createElement, type ReactNode } from 'react';
import type { Preview } from '@storybook/react-vite';
import { Theme } from '@astryxdesign/core';
import { LinkProvider } from '@astryxdesign/core/Link';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { MemoryRouter } from 'react-router-dom';

import { RouterLink } from '../src/app/router-link';
import { ThemeModeProvider, useThemeMode } from '../src/app/theme-mode';
import { StoryRoutes } from './story-routes';
import '@xyflow/react/dist/style.css';
import '../src/styles.css';

function PreviewTheme({ children }: { children: ReactNode }) {
  const { mode } = useThemeMode();

  return createElement(Theme, { mode, theme: neutralTheme }, children);
}

const preview: Preview = {
  decorators: [
    (Story, context) => {
      const appRoute = context.parameters?.['appRoute'];
      const rendersAppRoutes = typeof appRoute === 'string';
      const story = createElement(Story);

      return createElement(
        MemoryRouter,
        {
          initialEntries: rendersAppRoutes ? [appRoute] : undefined,
          key: context.id,
        },
        createElement(
          ThemeModeProvider,
          undefined,
          createElement(
            PreviewTheme,
            undefined,
            createElement(
              LinkProvider,
              { component: RouterLink },
              rendersAppRoutes
                ? story
                : createElement(StoryRoutes, undefined, story),
            ),
          ),
        ),
      );
    },
  ],
  parameters: {
    options: {
      storySort: {
        includeNames: true,
        method: 'alphabetical',
        order: ['Pages', 'Navigation', 'Components'],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
