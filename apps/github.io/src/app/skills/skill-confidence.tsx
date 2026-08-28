import * as stylex from '@stylexjs/stylex';
import { Text } from '@astryxdesign/core/Text';
import { Tooltip } from '@astryxdesign/core/Tooltip';
import { Token } from '@astryxdesign/core/Token';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { colorVars } from '@astryxdesign/core/theme/tokens.stylex';

import type { Skill } from './skill-list.types';

type SkillConfidenceVariant = 'text' | 'token';

interface SkillConfidenceProps {
  confidence: Skill['confidence'];
  hasTooltip?: boolean;
  isTooltipOpen?: boolean;
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
  textTooltipTrigger: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dashed',
    textDecorationColor: colorVars['--color-border-emphasized'],
    textUnderlineOffset: '2px',
  },
  tooltipContent: {
    display: 'block',
    whiteSpace: 'normal',
  },
});

const confidenceLabels = {
  1: 'Exploring',
  2: 'Familiar',
  3: 'Working',
  4: 'Confident',
  5: 'Proven',
} as const satisfies Record<Skill['confidence'], string>;

const confidenceTooltip =
  'Self-rated comfort; evidence appears in experience, projects, and certifications.';

export function SkillConfidence({
  confidence,
  hasTooltip = true,
  isTooltipOpen,
  variant = 'text',
}: SkillConfidenceProps) {
  const label = confidenceLabels[confidence];
  const tooltipContent = (
    <span
      data-testid="skill-confidence-tooltip-copy"
      {...stylex.props(styles.tooltipContent)}
    >
      {confidenceTooltip}
    </span>
  );
  const tooltip = (children: React.ReactNode) => (
    <Tooltip content={tooltipContent} isOpen={isTooltipOpen}>
      {children}
    </Tooltip>
  );

  const content = (
    <span
      aria-label={
        hasTooltip && variant === 'token'
          ? `Self-rated confidence: ${label}`
          : undefined
      }
      data-testid="skill-confidence"
      tabIndex={hasTooltip && variant === 'token' ? 0 : undefined}
      {...stylex.props(styles.root)}
    >
      <VisuallyHidden>{`Self-rated confidence: ${label}`}</VisuallyHidden>
      {variant === 'token' ? (
        <span aria-hidden="true">
          <Token color="gray" label={`Confidence: ${label}`} size="sm" />
        </span>
      ) : hasTooltip ? (
        tooltip(
          <Text
            aria-label={`Self-rated confidence: ${label}`}
            data-testid="skill-confidence-tooltip-trigger"
            tabIndex={0}
            type="supporting"
            xstyle={styles.textTooltipTrigger}
          >
            {label}
          </Text>,
        )
      ) : (
        <Text aria-hidden="true" type="supporting">
          {label}
        </Text>
      )}
    </span>
  );

  if (hasTooltip && variant === 'token') {
    return tooltip(content);
  }

  return content;
}
