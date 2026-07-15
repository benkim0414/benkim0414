import { useMemo, useState } from 'react';
import type { PowerSearchFilter } from '@astryxdesign/core/PowerSearch';

import { SkillList } from './skill-list';
import { SkillSearch, skillMatchesFilters } from './skill-search';
import type { SkillListProps } from './skill-list.types';

export function SkillSection({
  skills,
  heading = 'Skills',
  emptyMessage = 'No skills have been supplied.',
}: SkillListProps) {
  const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>([]);
  const filteredSkills = useMemo(
    () => skills.filter((skill) => skillMatchesFilters(skill, filters)),
    [filters, skills]
  );

  return (
    <div className="skill-section">
      <div className="skill-section__search">
        <SkillSearch filters={filters} onFiltersChange={setFilters} />
      </div>

      <SkillList
        emptyMessage={
          skills.length === 0 ? emptyMessage : 'No skills match your search.'
        }
        heading={heading}
        skills={filteredSkills}
      />
    </div>
  );
}
