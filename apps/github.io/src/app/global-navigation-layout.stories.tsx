import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

import { AppRoutes } from './app';

function RoutedGlobalNavigation({ path }: { path: string }) {
  return (
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

const meta = {
  component: RoutedGlobalNavigation,
  parameters: { layout: 'fullscreen' },
  title: 'GitHub.io/Navigation/Global Navigation',
} satisfies Meta<typeof RoutedGlobalNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = { args: { path: '/' } };
export const Skills: Story = { args: { path: '/skills' } };
export const SkillDetail: Story = {
  args: { path: '/skills/kubernetes' },
};
