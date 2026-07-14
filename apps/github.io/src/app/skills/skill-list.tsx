import { useId, useMemo, useState } from 'react';
import { Badge } from '@astryxdesign/core/Badge';
import { List, ListItem } from '@astryxdesign/core/List';
import { PowerSearch } from '@astryxdesign/core/PowerSearch';
import type {
  PowerSearchConfig,
  PowerSearchFilter,
} from '@astryxdesign/core/PowerSearch';

import { SkillLogo } from './skill-logo';
import { SkillRating } from './skill-rating';
import {
  skillCategories,
  type Skill,
  type SkillListProps,
} from './skill-list.types';

export const skillSearchConfig: PowerSearchConfig = {
  name: 'SkillSearch',
  contentSearchFieldKey: 'query',
  fields: [
    {
      key: 'query',
      label: 'Skills',
      defaultOperator: 'contains',
      operators: [
        {
          key: 'contains',
          label: 'contains',
          value: { type: 'string' },
        },
      ],
    },
    {
      key: 'category',
      label: 'Category',
      defaultOperator: 'is',
      operators: [
        {
          key: 'is',
          label: 'is',
          value: {
            type: 'enum',
            values: skillCategories.map((category) => ({
              label: category,
              value: category,
            })),
          },
        },
      ],
    },
  ],
};

export function skillMatchesQuery(skill: Skill, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length === 0) {
    return true;
  }

  return [skill.name, skill.category, ...skill.keywords].some((value) =>
    value.toLowerCase().includes(normalizedQuery)
  );
}

export function skillMatchesFilters(
  skill: Skill,
  filters: ReadonlyArray<PowerSearchFilter>
) {
  const queryFilters = filters.filter(
    (filter) => filter.field === 'query' && filter.value.type === 'string'
  );
  const categoryFilters = filters.filter(
    (filter) => filter.field === 'category' && filter.value.type === 'enum'
  );

  return (
    queryFilters.every((filter) => skillMatchesQuery(skill, filter.value.value)) &&
    (categoryFilters.length === 0 ||
      categoryFilters.some((filter) => skill.category === filter.value.value))
  );
}

export function SkillList({ skills, heading = 'Skills' }: SkillListProps) {
  const headingId = useId();
  const [filters, setFilters] = useState<ReadonlyArray<PowerSearchFilter>>([]);
  const filteredSkills = useMemo(
    () => skills.filter((skill) => skillMatchesFilters(skill, filters)),
    [filters, skills]
  );

  return (
    <section className="skill-list" aria-labelledby={headingId}>
      <div className="skill-list__header">
        <h2 id={headingId}>{heading}</h2>
        <PowerSearch
          config={skillSearchConfig}
          filters={filters}
          isLabelHidden
          label="Search skills"
          placeholder="Search skills"
          onChange={(nextFilters, changeType, changedIndex) => {
            const changedFilter = nextFilters[changedIndex];

            if (changeType === 'add' && changedFilter?.field === 'query') {
              setFilters(
                nextFilters.filter(
                  (filter, index) =>
                    filter.field !== 'query' || index === changedIndex
                )
              );
              return;
            }

            setFilters(nextFilters);
          }}
        />
      </div>

      {skills.length === 0 ? (
        <p className="skill-list__empty">No skills have been supplied.</p>
      ) : filteredSkills.length > 0 ? (
        <List className="skill-list__items" density="compact" hasDividers>
          {filteredSkills.map((skill) => (
            <ListItem
              key={skill.id}
              endContent={<SkillRating level={skill.level} />}
              label={
                <div className="skill-list__item-copy">
                  <span className="skill-list__name">{skill.name}</span>
                  <Badge label={skill.category} />
                </div>
              }
              startContent={<SkillLogo skill={skill} />}
            />
          ))}
        </List>
      ) : (
        <p className="skill-list__empty">No skills match your search.</p>
      )}
    </section>
  );
}
