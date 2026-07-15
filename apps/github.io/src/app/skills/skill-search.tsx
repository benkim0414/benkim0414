import { PowerSearch } from '@astryxdesign/core/PowerSearch';
import type {
  PowerSearchConfig,
  PowerSearchFilter,
} from '@astryxdesign/core/PowerSearch';

import {
  skillCategories,
  type Skill,
} from './skill-list.types';

interface SkillSearchProps {
  filters: ReadonlyArray<PowerSearchFilter>;
  onFiltersChange: (filters: ReadonlyArray<PowerSearchFilter>) => void;
}

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

export function SkillSearch({ filters, onFiltersChange }: SkillSearchProps) {
  return (
    <PowerSearch
      config={skillSearchConfig}
      filters={filters}
      isLabelHidden
      label="Search skills"
      placeholder="Search skills"
      onChange={(nextFilters, changeType, changedIndex) => {
        const changedFilter = nextFilters[changedIndex];

        if (changeType === 'add' && changedFilter?.field === 'query') {
          onFiltersChange(
            nextFilters.filter(
              (filter, index) =>
                filter.field !== 'query' || index === changedIndex
            )
          );
          return;
        }

        onFiltersChange(nextFilters);
      }}
    />
  );
}
