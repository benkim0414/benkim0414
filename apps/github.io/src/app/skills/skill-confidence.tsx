import * as stylex from '@stylexjs/stylex';
import { Text } from '@astryxdesign/core/Text';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';

import type { Skill } from './skill-list.types';

interface SkillConfidenceProps {
  confidence: Skill['confidence'];
}

const styles = stylex.create({
  root: {
    display: 'inline-flex',
    flex: '0 0 auto',
    alignItems: 'center',
    letterSpacing: 0,
    whiteSpace: 'nowrap',
  },
});

const confidenceLabels = {
  1: 'Exploring',
  2: 'Familiar',
  3: 'Working',
  4: 'Confident',
  5: 'Proven',
} as const satisfies Record<Skill['confidence'], string>;

export function SkillConfidence({ confidence }: SkillConfidenceProps) {
  const label = confidenceLabels[confidence];

  return (
    <span {...stylex.props(styles.root)} data-testid="skill-confidence">
      <VisuallyHidden>{`Self-rated confidence: ${label}`}</VisuallyHidden>
      <Text aria-hidden="true" type="supporting">
        {label}
      </Text>
    </span>
  );
}
