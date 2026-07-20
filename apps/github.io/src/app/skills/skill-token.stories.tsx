import type { Meta, StoryObj } from '@storybook/react-vite';

import { SkillToken } from './skill-token';

const meta: Meta<typeof SkillToken> = {
  component: SkillToken,
  title: 'GitHub.io/Skills/Skill Token',
};

export default meta;
type Story = StoryObj<typeof SkillToken>;

export const BrandColored: Story = {
  args: {
    label: 'Docker',
  },
};

export const TextOnly: Story = {
  args: {
    label: 'Forward Proxy',
  },
};
