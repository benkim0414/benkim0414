import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { PowerSearchFilter } from '@astryxdesign/core/PowerSearch';

import { SkillSearch } from './skill-search';

const meta: Meta<typeof SkillSearch> = {
  component: SkillSearch,
  title: 'Components/Skills/Skill Search',
};

export default meta;
type Story = StoryObj<typeof SkillSearch>;

function SkillSearchStory() {
  const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>([]);

  return <SkillSearch filters={filters} onFiltersChange={setFilters} />;
}

export const Default: Story = {
  render: () => <SkillSearchStory />,
};
