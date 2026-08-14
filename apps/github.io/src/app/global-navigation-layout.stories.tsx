import type { Meta, StoryObj } from '@storybook/react-vite';

import { AppRoutes } from './app';

const meta = {
  component: AppRoutes,
  parameters: { layout: 'fullscreen' },
  title: 'GitHub.io/Navigation/Global Navigation',
} satisfies Meta<typeof AppRoutes>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = { parameters: { appRoute: '/' } };
export const Roadmap: Story = { parameters: { appRoute: '/roadmap' } };
export const Skills: Story = { parameters: { appRoute: '/skills' } };
export const SkillDetail: Story = {
  parameters: { appRoute: '/skills/kubernetes' },
};
