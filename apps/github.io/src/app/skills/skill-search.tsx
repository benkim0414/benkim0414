import { PowerSearch } from '@astryxdesign/core/PowerSearch';
import type {
  FilterValueEnum,
  FilterValueString,
  PowerSearchConfig,
  PowerSearchChangeType,
  PowerSearchFilter,
} from '@astryxdesign/core/PowerSearch';

import {
  skillCategories,
  type Skill,
  type SkillCategory,
} from './skill-list.types';

interface SkillSearchProps {
  filters: ReadonlyArray<PowerSearchFilter>;
  onFiltersChange: (filters: ReadonlyArray<PowerSearchFilter>) => void;
  resultCount: number;
}

type SkillSearchStringFilter = PowerSearchFilter & {
  field: 'query';
  value: FilterValueString;
};

type SkillSearchEnumFilter = PowerSearchFilter & {
  field: 'category';
  value: FilterValueEnum;
};

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

  return [
    skill.name,
    skill.description,
    ...skill.categories,
    ...skill.keywords,
  ].some((value) => value.toLowerCase().includes(normalizedQuery));
}

function isQueryFilter(filter: PowerSearchFilter): filter is SkillSearchStringFilter {
  return filter.field === 'query' && filter.value.type === 'string';
}

function isCategoryFilter(
  filter: PowerSearchFilter,
): filter is SkillSearchEnumFilter {
  return filter.field === 'category' && filter.value.type === 'enum';
}

export function skillMatchesFilters(
  skill: Skill,
  filters: ReadonlyArray<PowerSearchFilter>,
) {
  const queryFilters = filters.filter(isQueryFilter);
  const categoryFilters = filters.filter(isCategoryFilter);

  return (
    queryFilters.every((filter) =>
      skillMatchesQuery(skill, filter.value.value),
    ) &&
    (categoryFilters.length === 0 ||
      categoryFilters.some((filter) =>
        skill.categories.includes(filter.value.value as SkillCategory),
      ))
  );
}

export function SkillSearch({
  filters,
  onFiltersChange,
  resultCount,
}: SkillSearchProps) {
  return (
    <PowerSearch
      config={skillSearchConfig}
      filters={filters}
      isLabelHidden
      label="Search skills"
      placeholder="Search skills"
      resultCount={resultCount}
      onChange={(
        nextFilters: ReadonlyArray<PowerSearchFilter>,
        changeType: PowerSearchChangeType,
        changedIndex: number,
      ) => {
        const changedFilter = nextFilters[changedIndex];

        if (changeType === 'add' && changedFilter?.field === 'query') {
          onFiltersChange(
            nextFilters.filter(
              (filter, index) =>
                filter.field !== 'query' || index === changedIndex,
            ),
          );
          return;
        }

        onFiltersChange(nextFilters);
      }}
    />
  );
}
