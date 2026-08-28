import * as stylex from '@stylexjs/stylex';
import { Text } from '@astryxdesign/core/Text';
import { Token } from '@astryxdesign/core/Token';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';

import type { Skill } from './skill-list.types';

type SkillConfidenceVariant = 'text' | 'token';

interface SkillConfidenceProps {
  confidence: Skill['confidence'];
  variant?: SkillConfidenceVariant;
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

export function SkillConfidence({
  confidence,
  variant = 'text',
}: SkillConfidenceProps) {
  const label = confidenceLabels[confidence];

  return (
    <span {...stylex.props(styles.root)} data-testid="skill-confidence">
      <VisuallyHidden>{`Self-rated confidence: ${label}`}</VisuallyHidden>
      {variant === 'token' ? (
        <span aria-hidden="true">
          <Token color="gray" label={`Confidence: ${label}`} size="sm" />
        </span>
      ) : (
        <Text aria-hidden="true" type="supporting">
          {label}
        </Text>
      )}
    </span>
  );
}
