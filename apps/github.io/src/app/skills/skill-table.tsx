import { HStack } from '@astryxdesign/core/Layout';
import { Button } from '@astryxdesign/core/Button';
import { EmptyState } from '@astryxdesign/core/EmptyState';
import { MultiSelector } from '@astryxdesign/core/MultiSelector';
import {
  pixel,
  Table,
  type TableColumn,
  useTableSortable,
  useTableSortableState,
} from '@astryxdesign/core/Table';
import { Text } from '@astryxdesign/core/Text';
import { TextInput } from '@astryxdesign/core/TextInput';
import { useState, type ReactElement } from 'react';

import { SkillAvatar } from './skill-avatar';
import { SkillCategory } from './skill-category';
import { getSkillConfidenceLabel, SkillConfidence } from './skill-confidence';
import type { Skill } from './skill-list.types';

interface SkillTableRow extends Record<string, unknown> {
  id: string;
  name: string;
  primaryUse: string;
  categories: string;
  confidence: number;
  skill: Skill;
}

export interface SkillTableProps {
  skills: readonly Skill[];
}

const CHARACTER_WIDTH = 8;
const CELL_INLINE_PADDING = 32;
const NAME_MEDIA_WIDTH = 28;
const CATEGORY_CHROME_WIDTH = 24;
const CATEGORY_GAP_WIDTH = 4;

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
            <SkillCategory key={category} name={category} />
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

export function SkillTable({ skills }: SkillTableProps): ReactElement {
  const [nameQuery, setNameQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const columns = createColumns(skills);
  const categoryOptions = [
    ...new Set(skills.flatMap((skill) => skill.categories)),
  ].sort();
  const normalizedNameQuery = nameQuery.trim().toLocaleLowerCase();
  const filteredSkills = skills.filter(
    (skill) =>
      skill.name.toLocaleLowerCase().includes(normalizedNameQuery) &&
      (selectedCategories.length === 0 ||
        selectedCategories.some((category) =>
          skill.categories.includes(category),
        )),
  );
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
  const hasActiveFilters =
    nameQuery.length > 0 || selectedCategories.length > 0;
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
          value={nameQuery}
          onChange={setNameQuery}
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
          onChange={setSelectedCategories}
        />
        <Text>{resultLabel}</Text>
        {hasActiveFilters ? (
          <Button
            label="Clear all"
            variant="ghost"
            onClick={() => {
              setNameQuery('');
              setSelectedCategories([]);
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
          plugins={{ sortable }}
          verticalAlign="middle"
        />
      )}
    </>
  );
}
