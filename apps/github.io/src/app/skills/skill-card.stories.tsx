import type { Meta, StoryObj } from '@storybook/react-vite';

import { sampleSkills } from './skill-list.data';
import { SkillCard } from './skill-card';

const kubernetes =
  sampleSkills.find((skill) => skill.id === 'kubernetes') ?? sampleSkills[0];
const typeScript =
  sampleSkills.find((skill) => skill.id === 'typescript') ?? sampleSkills[0];

const meta: Meta<typeof SkillCard> = {
  component: SkillCard,
  title: 'GitHub.io/Skills/Skill Card',
};

export default meta;
type Story = StoryObj<typeof SkillCard>;

export const WithoutCertifications: Story = {
  args: {
    skill: typeScript,
  },
};

export const WithMultipleCertifications: Story = {
  args: {
    skill: kubernetes,
  },
};

export const CompactFullWidth: Story = {
  args: {
    isFullWidth: true,
    skill: typeScript,
    variant: 'compact',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
