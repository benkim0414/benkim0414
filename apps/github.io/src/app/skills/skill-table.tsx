import { HStack } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { MultiSelector } from '@astryxdesign/core/MultiSelector';
import {
  pixel,
  Table,
  type TableColumn,
  type TablePlugin,
  useTableSortable,
  useTableSortableState,
} from '@astryxdesign/core/Table';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { colorVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useMemo, type ReactElement } from 'react';

import { SkillAvatar } from './skill-avatar';
import { SkillCategory as SkillCategoryBadge } from './skill-category';
import { getSkillConfidenceLabel, SkillConfidence } from './skill-confidence';
import { filterSkills } from './skill-filter';
import type { Skill, SkillCategory } from './skill-list.types';

interface SkillTableRow extends Record<string, unknown> {
  id: string;
  name: string;
  primaryUse: string;
  categories: string;
  confidence: number;
  skill: Skill;
}

export interface SkillTableProps {
  readonly skills: readonly Skill[];
  readonly query: string;
  readonly selectedCategories: readonly SkillCategory[];
  readonly activeSkillId: string | null;
  readonly onQueryChange: (query: string) => void;
  readonly onSelectedCategoriesChange: (
    categories: SkillCategory[],
  ) => void;
  readonly onSkillActivate: (activation: SkillRowActivation) => void;
}

export interface SkillRowActivation {
  readonly skillId: string;
  readonly row: HTMLTableRowElement;
}

const CHARACTER_WIDTH = 8;
const CELL_INLINE_PADDING = 32;
const NAME_MEDIA_WIDTH = 28;
const CATEGORY_CHROME_WIDTH = 24;
const CATEGORY_GAP_WIDTH = 4;

const styles = stylex.create({
  clickableRow: {
    cursor: 'pointer',
  },
  activeRow: {
    backgroundColor: colorVars['--color-overlay-pressed'],
    '--table-row-overlay': colorVars['--color-overlay-pressed'],
  },
});

function textWidth(value: string) {
  return value.length * CHARACTER_WIDTH;
}

function columnWidth(header: string, values: readonly number[]) {
  return pixel(Math.max(textWidth(header), ...values) + CELL_INLINE_PADDING);
}

function createColumns(skills: readonly Skill[]): TableColumn<SkillTableRow>[] {
  return [
    {
      key: 'name',
      header: 'Name',
      width: columnWidth(
        'Name',
        skills.map((skill) => textWidth(skill.name) + NAME_MEDIA_WIDTH),
      ),
      sortable: true,
      renderCell: ({ skill }) => (
        <HStack align="center" gap={2}>
          <SkillAvatar isDecorative size="xsm" skill={skill} />
          <Text>{skill.name}</Text>
        </HStack>
      ),
    },
    {
      key: 'primaryUse',
      header: 'Primary use',
      width: columnWidth(
        'Primary use',
        skills.map((skill) => textWidth(skill.primaryUse)),
      ),
      sortable: true,
    },
    {
      key: 'categories',
      header: 'Categories',
      width: columnWidth(
        'Categories',
        skills.map(
          (skill) =>
            skill.categories.reduce(
              (width, category) =>
                width + textWidth(category) + CATEGORY_CHROME_WIDTH,
              0,
            ) +
            Math.max(0, skill.categories.length - 1) * CATEGORY_GAP_WIDTH,
        ),
      ),
      sortable: true,
      renderCell: ({ skill }) => (
        <HStack align="center" gap={1}>
          {skill.categories.map((category) => (
            <SkillCategoryBadge key={category} name={category} />
          ))}
        </HStack>
      ),
    },
    {
      key: 'confidence',
      header: 'Confidence',
      width: columnWidth(
        'Confidence',
        skills.map((skill) =>
          textWidth(getSkillConfidenceLabel(skill.confidence)),
        ),
      ),
      sortable: true,
      renderCell: ({ skill }) => (
        <SkillConfidence
          confidence={skill.confidence}
          hasTooltip={false}
          textStyle="body"
        />
      ),
    },
  ];
}

export function SkillTable({
  skills,
  query,
  selectedCategories,
  activeSkillId,
  onQueryChange,
  onSelectedCategoriesChange,
  onSkillActivate,
}: SkillTableProps): ReactElement {
  const columns = createColumns(skills);
  const categoryOptions = [
    ...new Set(skills.flatMap((skill) => skill.categories)),
  ].sort();
  const filteredSkills = filterSkills(skills, query, selectedCategories);
  const rows: SkillTableRow[] = filteredSkills.map((skill) => ({
    id: skill.id,
    name: skill.name,
    primaryUse: skill.primaryUse,
    categories: [...skill.categories].sort().join(', '),
    confidence: skill.confidence,
    skill,
  }));
  const { sortedData, sortConfig } = useTableSortableState<SkillTableRow>({
    data: rows,
    defaultSort: [
      { sortKey: 'confidence', direction: 'descending' },
      { sortKey: 'name', direction: 'ascending' },
    ],
  });
  const sortable = useTableSortable<SkillTableRow>(sortConfig);
  const rowActivation = useMemo<TablePlugin<SkillTableRow>>(
    () => ({
      transformBodyRow: (props, item) => {
        const isActive = item.id === activeSkillId;

        return {
          ...props,
          htmlProps: {
            ...props.htmlProps,
            tabIndex: 0,
            'aria-current': isActive ? true : undefined,
            onClick: (event) => {
              if (
                (event.target as HTMLElement).closest(
                  'input, button, a, select, textarea',
                )
              ) {
                return;
              }

              onSkillActivate({ skillId: item.id, row: event.currentTarget });
            },
            onKeyDown: (event) => {
              if (event.target !== event.currentTarget) {
                return;
              }

              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSkillActivate({
                  skillId: item.id,
                  row: event.currentTarget,
                });
              }
            },
          },
          xstyle: isActive
            ? [...props.xstyle, styles.clickableRow, styles.activeRow]
            : [...props.xstyle, styles.clickableRow],
        };
      },
    }),
    [activeSkillId, onSkillActivate],
  );
  const hasActiveFilters =
    query.length > 0 || selectedCategories.length > 0;
  const resultLabel = `${filteredSkills.length} ${
    filteredSkills.length === 1 ? 'skill' : 'skills'
  }`;

  return (
    <>
      <HStack align="center" gap={2}>
        <TextInput
          isLabelHidden
          label="Skill name"
          placeholder="Skill name"
          size="sm"
          startIcon="search"
          value={query}
          onChange={(nextQuery) => onQueryChange(nextQuery)}
        />
        <MultiSelector
          hasClear
          isLabelHidden
          label="Categories"
          options={categoryOptions}
          placeholder="Categories"
          size="sm"
          triggerDisplay="labels"
          value={selectedCategories}
          onChange={(categories) =>
            onSelectedCategoriesChange(categories as SkillCategory[])
          }
        />
        <Text>{resultLabel}</Text>
        {hasActiveFilters ? (
          <Button
            label="Clear all"
            variant="ghost"
            onClick={() => {
              onQueryChange('');
              onSelectedCategoriesChange([]);
            }}
          />
        ) : null}
      </HStack>
      {filteredSkills.length === 0 ? (
        <EmptyState
          headingLevel={3}
          isCompact
          title={
            skills.length === 0
              ? 'No skills have been supplied.'
              : 'No skills match your search or filters.'
          }
        />
      ) : (
        <Table
          columns={columns}
          data={sortedData}
          hasHover
          idKey="id"
          plugins={{ sortable, rowActivation }}
          verticalAlign="middle"
        />
      )}
    </>
  );
}
