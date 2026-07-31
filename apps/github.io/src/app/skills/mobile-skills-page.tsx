import { useState, type ReactElement } from 'react';
import { VStack } from '@astryxdesign/core/Layout';
import type { PowerSearchFilter } from '@astryxdesign/core/PowerSearch';

import {
  highlightedSkills as defaultHighlightedSkills,
  skills as defaultSkills,
} from './skill-list.data';
import { SkillCarousel } from './skill-carousel';
import { SkillList } from './skill-list';
import type { Skill } from './skill-list.types';
import { SkillSearch, skillMatchesFilters } from './skill-search';

export interface MobileSkillsPageProps {
  skills?: readonly Skill[];
  highlightedSkills?: readonly Skill[];
}

export function MobileSkillsPage({
  skills = defaultSkills,
  highlightedSkills = defaultHighlightedSkills,
}: MobileSkillsPageProps): ReactElement {
  const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>([]);
  const filteredSkills = skills.filter((skill) =>
    skillMatchesFilters(skill, filters),
  );
  const listEmptyMessage =
    skills.length === 0
      ? 'No skills have been supplied.'
      : 'No skills match your search.';

  return (
    <VStack gap={4}>
      <SkillCarousel
        ariaLabel="Highlighted skills"
        emptyMessage="No highlighted skills have been supplied."
        skills={highlightedSkills}
      />

      <search aria-label="Skill search" role="search">
        <SkillSearch
          filters={filters}
          onFiltersChange={setFilters}
          resultCount={filteredSkills.length}
        />
      </search>

      <SkillList
        emptyMessage={listEmptyMessage}
        heading="Skills"
        skills={filteredSkills}
      />
    </VStack>
  );
}
