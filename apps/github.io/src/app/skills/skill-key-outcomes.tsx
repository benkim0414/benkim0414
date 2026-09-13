import { List, ListItem } from '@astryxdesign/core/List';
import { Text } from '@astryxdesign/core/Text';
import type { ReactElement } from 'react';

export interface SkillKeyOutcomesProps {
  readonly outcomes: readonly string[];
}

export function SkillKeyOutcomes({
  outcomes,
}: SkillKeyOutcomesProps): ReactElement | null {
  if (outcomes.length === 0) {
    return null;
  }

  return (
    <List density="compact" listStyle="disc">
      {outcomes.map((outcome) => (
        <ListItem
          key={outcome}
          label={
            <Text type="body" color="primary">
              {outcome}
            </Text>
          }
        />
      ))}
    </List>
  );
}
