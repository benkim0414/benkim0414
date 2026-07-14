import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';

import type { Skill } from './skill-list.types';

interface SkillRatingProps {
  level: Skill['level'];
}

export function SkillRating({ level }: SkillRatingProps) {
  return (
    <span className="skill-rating">
      <VisuallyHidden>{level} out of 5</VisuallyHidden>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} aria-hidden="true">
          {index < level ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}
