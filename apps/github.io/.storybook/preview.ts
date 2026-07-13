import { createElement } from 'react';
import type { Preview } from '@storybook/react-vite';
import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-neutral/theme.css';
import '../src/styles.css';

const preview: Preview = {
  decorators: [
    (Story) => createElement(Theme, { theme: neutralTheme }, createElement(Story)),
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
