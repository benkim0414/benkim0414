import { useMemo, useState } from 'react';
import { VStack } from '@astryxdesign/core/Layout';
import type { PowerSearchFilter } from '@astryxdesign/core/PowerSearch';

import { SkillList } from './skill-list';
import { SkillSearch, skillMatchesFilters } from './skill-search';
import type { SkillListProps } from './skill-list.types';

export function SkillSection({
  skills,
  heading = 'Skills',
  emptyMessage = 'No skills have been supplied.',
  isHeadingHidden = false,
}: SkillListProps) {
  const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>([]);
  const filteredSkills = useMemo(
    () => skills.filter((skill) => skillMatchesFilters(skill, filters)),
    [filters, skills],
  );

  return (
    <VStack gap={2}>
      <SkillSearch
        filters={filters}
        onFiltersChange={setFilters}
        resultCount={filteredSkills.length}
      />

      <SkillList
        emptyMessage={
          skills.length === 0 ? emptyMessage : 'No skills match your search.'
        }
        heading={heading}
        isHeadingHidden={isHeadingHidden}
        skills={filteredSkills}
      />
    </VStack>
  );
}
