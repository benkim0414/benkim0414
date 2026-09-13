import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { skills } from './skill-list.data';
import type { Skill, SkillCategory } from './skill-list.types';
import { SkillTable } from './skill-table';

function InteractiveSkillTable({ skills }: { readonly skills: readonly Skill[] }) {
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<SkillCategory[]>(
    [],
  );
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);

  return (
    <SkillTable
      activeSkillId={activeSkillId}
      query={query}
      selectedCategories={selectedCategories}
      skills={skills}
      onQueryChange={setQuery}
      onSelectedCategoriesChange={setSelectedCategories}
      onSkillActivate={({ skillId }) => setActiveSkillId(skillId)}
    />
  );
}

const meta: Meta<typeof SkillTable> = {
  component: SkillTable,
  title: 'Components/Skills/Skill Table',
};

export default meta;
type Story = StoryObj<typeof SkillTable>;

export const AllSkills: Story = {
  args: {
    skills,
  },
  render: (args) => <InteractiveSkillTable skills={args.skills ?? []} />,
};

export const FilterControlsOpen: Story = {
  args: {
    skills,
  },
  render: (args) => <InteractiveSkillTable skills={args.skills ?? []} />,
  play: async ({ canvasElement }) => {
    const categorySelector = canvasElement.querySelector<HTMLButtonElement>(
      'button[role="combobox"]',
    );

    if (!categorySelector) {
      throw new Error('Expected the category selector to render.');
    }

    categorySelector.click();
  },
};
