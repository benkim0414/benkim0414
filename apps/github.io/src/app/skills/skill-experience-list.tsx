import { Blockquote } from '@astryxdesign/core/Blockquote';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/Layout';
import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import type { CapabilityEvidenceItem } from '../devops-capability-evidence/devops-capability-evidence.types';

export interface SkillExperienceListProps {
  evidence: readonly CapabilityEvidenceItem[];
}

const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  item: {
    listStyle: 'none',
  },
});

export function SkillExperienceList({
  evidence,
}: SkillExperienceListProps): ReactElement {
  return (
    <ul aria-label="Supporting experience" {...stylex.props(styles.list)}>
      {evidence.map((item) => (
        <li key={item.id} {...stylex.props(styles.item)}>
          <VStack gap={1} paddingBlock={3}>
            <Heading level={3}>{item.title}</Heading>
            <Blockquote>{item.summary}</Blockquote>
          </VStack>
        </li>
      ))}
    </ul>
  );
}
