import type { ReactElement } from 'react';
import { VStack } from '@astryxdesign/core/Layout';

import {
  highlightedSkills as defaultHighlightedSkills,
  skills as defaultSkills,
} from './skill-list.data';
import { SkillCarousel } from './skill-carousel';
import { SkillList } from './skill-list';
import type { Skill } from './skill-list.types';

export interface MobileSkillsPageProps {
  skills?: readonly Skill[];
  highlightedSkills?: readonly Skill[];
}

export function MobileSkillsPage({
  skills = defaultSkills,
  highlightedSkills = defaultHighlightedSkills,
}: MobileSkillsPageProps): ReactElement {
  const listEmptyMessage =
    skills.length === 0
      ? 'No skills have been supplied.'
      : 'No skills match your search.';

  return (
    <VStack gap={4}>
      <SkillCarousel
        ariaLabel="Highlighted skills"
        emptyMessage="No highlighted skills have been supplied."
        skills={highlightedSkills}
      />

      <SkillList
        emptyMessage={listEmptyMessage}
        heading="Skills"
        skills={skills}
      />
    </VStack>
  );
}
