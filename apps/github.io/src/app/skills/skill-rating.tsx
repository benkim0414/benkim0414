import type { Skill } from './skill-list.types';

interface SkillRatingProps {
  level: Skill['level'];
}

export function SkillRating({ level }: SkillRatingProps) {
  return (
    <span className="skill-rating" aria-label={`${level} out of 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} aria-hidden="true">
          {index < level ? '★' : '☆'}
        </span>
      ))}
    </span>
  );
}
