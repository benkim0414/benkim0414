import { ListItem } from '@astryxdesign/core/List';

import { SkillAvatar } from './skill-avatar';
import { SkillCategory } from './skill-category';
import { SkillRating } from './skill-rating';
import type { Skill } from './skill-list.types';

interface SkillListItemProps {
  skill: Skill;
}

export function SkillListItem({ skill }: SkillListItemProps) {
  return (
    <ListItem
      endContent={<SkillRating level={skill.level} />}
      label={
        <div className="flex min-w-0 max-w-full flex-1 items-center gap-2 max-[640px]:flex-col max-[640px]:items-start">
          <span className="block min-w-0 max-w-full flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-bold max-[640px]:w-full">
            {skill.name}
          </span>
          <SkillCategory name={skill.category} />
        </div>
      }
      startContent={<SkillAvatar skill={skill} />}
    />
  );
}
