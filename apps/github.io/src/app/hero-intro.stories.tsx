import type { Meta, StoryObj } from '@storybook/react-vite';

import { HeroIntro } from './hero-intro';

const meta: Meta<typeof HeroIntro> = {
  component: HeroIntro,
  title: 'GitHub.io/App Shell/Hero Intro',
};

export default meta;
type Story = StoryObj<typeof HeroIntro>;

export const Default: Story = {
  args: {
    eyebrow: 'Page Shell',
    title: 'Generic Layout Skeleton',
    body: 'A constrained single-page structure for future portfolio content.',
  },
};
