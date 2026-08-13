import { createElement } from 'react';
import type { Preview } from '@storybook/react-vite';
import { Theme } from '@astryxdesign/core';
import { LinkProvider } from '@astryxdesign/core/Link';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import { MemoryRouter } from 'react-router-dom';

import { RouterLink } from '../src/app/router-link';
import '@xyflow/react/dist/style.css';
import '../src/styles.css';

const preview: Preview = {
  decorators: [
    (Story) =>
      createElement(
        MemoryRouter,
        undefined,
        createElement(
          LinkProvider,
          { component: RouterLink },
          createElement(Theme, { theme: neutralTheme }, createElement(Story)),
        ),
      ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
