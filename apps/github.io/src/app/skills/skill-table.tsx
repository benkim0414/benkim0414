import { HStack } from '@astryxdesign/core/Layout';
import {
  pixel,
  Table,
  type TableColumn,
  useTableSortable,
  useTableSortableState,
} from '@astryxdesign/core/Table';
import { Text } from '@astryxdesign/core/Text';
import type { ReactElement } from 'react';

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
  const columns = createColumns(skills);
  const rows: SkillTableRow[] = skills.map((skill) => ({
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

  return (
    <Table
      columns={columns}
      data={sortedData}
      hasHover
      idKey="id"
      plugins={{ sortable }}
      verticalAlign="middle"
    />
  );
}
