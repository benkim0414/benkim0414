import { createElement } from 'react';
import type { Preview } from '@storybook/react-vite';
import { Theme } from '@astryxdesign/core';
import { LinkProvider } from '@astryxdesign/core/Link';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { MemoryRouter } from 'react-router-dom';

import { RouterLink } from '../src/app/router-link';
import { StoryRoutes } from './story-routes';
import '@xyflow/react/dist/style.css';
import '../src/styles.css';

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
          LinkProvider,
          { component: RouterLink },
          createElement(
            Theme,
            { theme: neutralTheme },
            rendersAppRoutes
              ? story
              : createElement(StoryRoutes, undefined, story),
          ),
        ),
      );
    },
  ],
  parameters: {
    options: {
      storySort: {
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
