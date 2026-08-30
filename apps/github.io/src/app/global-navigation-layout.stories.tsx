import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactElement } from 'react';
import { Route, Routes } from 'react-router-dom';

import { GlobalNavigationLayout } from './global-navigation-layout';

const meta = {
  component: GlobalNavigationLayout,
  parameters: { layout: 'fullscreen' },
  title: 'Navigation/Global Navigation',
} satisfies Meta<typeof GlobalNavigationLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

function NavigationPreviewContent(): ReactElement {
  return <main aria-label="Navigation preview" />;
}

export const Default: Story = {
  render: () => (
    <Routes>
      <Route element={<GlobalNavigationLayout />}>
        <Route index element={<NavigationPreviewContent />} />
      </Route>
    </Routes>
  ),
};
