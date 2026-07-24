import type { Meta, StoryObj } from '@storybook/react-vite';
import { HStack } from '@astryxdesign/core/Layout';

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

export const ContrastExamples: Story = {
  render: () => (
    <HStack gap={2} wrap="wrap">
      <SkillToken label="Docker" />
      <SkillToken label="GitLab CI" />
      <SkillToken label="GitHub" />
      <SkillToken label="Forward Proxy" />
    </HStack>
  ),
};
