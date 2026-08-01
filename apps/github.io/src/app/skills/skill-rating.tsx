import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { Text } from '@astryxdesign/core/Text';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { colorVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';

import type { Skill } from './skill-list.types';

interface SkillRatingProps {
  level: Skill['level'];
}

const styles = stylex.create({
  root: {
    display: 'inline-flex',
    flex: '0 0 auto',
    alignItems: 'center',
    letterSpacing: 0,
    whiteSpace: 'nowrap',
  },
  stars: {
    display: {
      default: 'inline-flex',
      '@media (max-width: 640px)': 'none',
    },
    alignItems: 'center',
    gap: spacingVars['--spacing-0-5'],
  },
  compact: {
    display: {
      default: 'none',
      '@media (max-width: 640px)': 'inline-flex',
    },
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
  },
  star: {
    display: 'block',
    width: spacingVars['--spacing-3'],
    height: spacingVars['--spacing-3'],
    flex: '0 0 auto',
    color: colorVars['--color-icon-yellow'],
  },
});

export function SkillRating({ level }: SkillRatingProps) {
  return (
    <span {...stylex.props(styles.root)}>
      <VisuallyHidden>{level} out of 5</VisuallyHidden>
      <span {...stylex.props(styles.stars)} aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => {
          const isFilled = index < level;
          const StarIcon = isFilled ? StarSolidIcon : StarOutlineIcon;

          return (
            <StarIcon
              {...stylex.props(styles.star)}
              aria-hidden="true"
              data-filled={isFilled}
              data-testid="skill-rating-star"
              key={index}
            />
          );
        })}
      </span>
      <span
        {...stylex.props(styles.compact)}
        aria-hidden="true"
        data-testid="skill-rating-compact"
      >
        <StarSolidIcon
          {...stylex.props(styles.star)}
          aria-hidden="true"
          data-testid="skill-rating-compact-star"
        />
        <Text type="supporting">{level}/5</Text>
      </span>
    </span>
  );
}
