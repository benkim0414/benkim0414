import { LayoutContent, VStack } from '@astryxdesign/core/Layout';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import type { ReactElement } from 'react';

import { SkillList } from './skill-list';
import { skills as defaultSkills } from './skill-list.data';
import type { Skill } from './skill-list.types';

export interface SkillsPageProps {
  skills?: readonly Skill[];
}

const getSkillHref = (skill: Skill) => `/skills/${skill.id}`;

export function SkillsPage({
  skills = defaultSkills,
}: SkillsPageProps): ReactElement {
  const sortedSkills = [...skills].sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  return (
    <LayoutContent label="Skills" padding={4} role="main">
      <VisuallyHidden as="h1" id="skills-page-title">
        Skills
      </VisuallyHidden>
      <VStack gap={3}>
        <SkillList
          getSkillHref={getSkillHref}
          heading="All skills"
          skills={sortedSkills}
        />
      </VStack>
    </LayoutContent>
  );
}
