import { VStack } from '@astryxdesign/core/Layout';
import { TopNav, TopNavHeading } from '@astryxdesign/core/TopNav';
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
    <div className="mx-auto flex h-dvh min-h-screen w-full max-w-md flex-col overflow-hidden">
      <TopNav
        className="shrink-0 bg-[var(--color-background-surface)]"
        heading={<TopNavHeading heading="Skills" />}
        label="Skills navigation"
      />
      <VisuallyHidden as="h1" id="skills-page-title">
        Skills
      </VisuallyHidden>
      <VStack
        aria-labelledby="skills-page-title"
        as="main"
        className="min-h-0 flex-1"
        gap={3}
        isScrollable
        paddingBlock={4}
        paddingInline={4}
      >
        <SkillList
          getSkillHref={getSkillHref}
          heading="All skills"
          skills={sortedSkills}
        />
      </VStack>
    </div>
  );
}
