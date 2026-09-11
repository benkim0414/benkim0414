import { HStack } from '@astryxdesign/core/Layout';
import {
  proportional,
  Table,
  type TableColumn,
  useTableSortable,
  useTableSortableState,
} from '@astryxdesign/core/Table';
import { Text } from '@astryxdesign/core/Text';
import type { ReactElement } from 'react';

import { SkillAvatar } from './skill-avatar';
import { SkillCategory } from './skill-category';
import { SkillConfidence } from './skill-confidence';
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

const columns: TableColumn<SkillTableRow>[] = [
  {
    key: 'name',
    header: 'Name',
    width: proportional(1),
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
    width: proportional(2),
    sortable: true,
  },
  {
    key: 'categories',
    header: 'Categories',
    width: proportional(2),
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
    width: proportional(1),
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

export function SkillTable({ skills }: SkillTableProps): ReactElement {
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
