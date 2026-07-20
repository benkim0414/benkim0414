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

export const ContrastExamples: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--spacing-2)',
      }}
    >
      <SkillToken label="Docker" />
      <SkillToken label="GitLab CI" />
      <SkillToken label="GitHub" />
      <SkillToken label="Forward Proxy" />
    </div>
  ),
};
