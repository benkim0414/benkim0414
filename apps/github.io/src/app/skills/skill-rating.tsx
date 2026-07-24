import * as stylex from '@stylexjs/stylex';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';

import type { Skill } from './skill-list.types';

interface SkillRatingProps {
  level: Skill['level'];
}

const styles = stylex.create({
  root: {
    display: 'inline-flex',
    flex: '0 0 auto',
    color: 'var(--color-text-primary)',
    letterSpacing: 0,
    whiteSpace: 'nowrap',
  },
  stars: {
    display: {
      default: 'inline-flex',
      '@media (max-width: 640px)': 'none',
    },
    alignItems: 'center',
    gap: 1,
  },
  compact: {
    display: {
      default: 'none',
      '@media (max-width: 640px)': 'inline-flex',
    },
    alignItems: 'center',
    gap: 'var(--spacing-1)',
  },
});

export function SkillRating({ level }: SkillRatingProps) {
  return (
    <span {...stylex.props(styles.root)}>
      <VisuallyHidden>{level} out of 5</VisuallyHidden>
      <span {...stylex.props(styles.stars)} aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) =>
          index < level ? '★' : '☆',
        ).join('')}
      </span>
      <span {...stylex.props(styles.compact)} aria-hidden="true">
        <span>★</span>
        <span>
          {level}
          /5
        </span>
      </span>
    </span>
  );
}
