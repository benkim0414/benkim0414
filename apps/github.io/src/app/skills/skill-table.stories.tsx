import type { Meta, StoryObj } from '@storybook/react-vite';
import { VStack } from '@astryxdesign/core/Layout';
import { useRef, useState } from 'react';
import { userEvent } from 'storybook/test';

import { resolveSkillDetail } from './skill-detail-resolver';
import { skillDetailSources } from './skill-detail-sources';
import { skills } from './skill-list.data';
import type { Skill, SkillCategory } from './skill-list.types';
import { SkillTableDetailLayout } from './skill-table-detail-layout';
import { SkillTable, type SkillRowActivation } from './skill-table';

export function InteractiveSkillTable({
  skills,
}: {
  readonly skills: readonly Skill[];
}) {
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<SkillCategory[]>(
    [],
  );
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);
  const activeRowRef = useRef<HTMLTableRowElement | null>(null);
  const activeResolution =
    activeSkillId == null
      ? null
      : resolveSkillDetail(activeSkillId, skillDetailSources);
  const activeDetail =
    activeResolution?.status === 'found' ? activeResolution.value : null;

  const handleSkillActivate = ({ skillId, row }: SkillRowActivation) => {
    activeRowRef.current = row;
    setActiveSkillId(skillId);
  };

  return (
    <VStack height="100vh">
      <SkillTableDetailLayout
        activeDetail={activeDetail}
        activeSkillId={activeSkillId}
        finalFocusRef={activeRowRef}
        query={query}
        selectedCategories={selectedCategories}
        skills={skills}
        onClose={() => setActiveSkillId(null)}
        onQueryChange={setQuery}
        onSelectedCategoriesChange={setSelectedCategories}
        onSkillActivate={handleSkillActivate}
      />
    </VStack>
  );
}

const meta: Meta<typeof SkillTable> = {
  component: SkillTable,
  excludeStories: ['InteractiveSkillTable'],
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

export const DesktopTableDetail: Story = {
  args: {
    skills,
  },
  globals: {
    viewport: { value: 'desktop', isRotated: false },
  },
  render: (args) => <InteractiveSkillTable skills={args.skills ?? []} />,
  play: async ({ canvas }) => {
    await userEvent.click(
      canvas.getAllByRole('row', { name: /Kubernetes/ })[0],
    );
  },
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
