import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { List } from '@astryxdesign/core/List';

import { sampleSkills } from './skill-list.data';
import { SkillListItem } from './skill-list-item';

const terraform = sampleSkills.find((skill) => skill.id === 'terraform');
const typeScript = sampleSkills.find((skill) => skill.id === 'typescript');

const meta: Meta<typeof SkillListItem> = {
  component: SkillListItem,
  title: 'GitHub.io/Skills/Skill List Item',
};

export default meta;
type Story = StoryObj<typeof SkillListItem>;

function SkillListItemStory(args: ComponentProps<typeof SkillListItem>) {
  return (
    <List density="compact" hasDividers>
      <SkillListItem {...args} />
    </List>
  );
}

export const Default: Story = {
  args: {
    skill: sampleSkills[0],
  },
  render: (args) => <SkillListItemStory {...args} />,
};

export const Infrastructure: Story = {
  args: {
    skill: terraform ?? sampleSkills[0],
  },
  render: (args) => <SkillListItemStory {...args} />,
};

export const LongName: Story = {
  args: {
    skill: {
      ...(typeScript ?? sampleSkills[0]),
      id: 'long-name',
      name: 'TypeScript and React Component Architecture Governance',
    },
  },
  render: (args) => <SkillListItemStory {...args} />,
};
