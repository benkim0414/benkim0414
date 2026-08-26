import { EmptyState } from '@astryxdesign/core/EmptyState';
import { VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import type { ReactElement } from 'react';

import { SkillCard } from './skill-card';
import { skills as defaultSkills } from './skill-list.data';
import type { Skill } from './skill-list.types';

export interface SkillsPageProps {
  skills?: readonly Skill[];
}

export function SkillsPage({
  skills = defaultSkills,
}: SkillsPageProps): ReactElement {
  const sortedSkills = [...skills].sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  return (
    <VStack aria-labelledby="skills-page-title" as="main" gap={3} padding={4}>
      <VisuallyHidden as="h1" id="skills-page-title">
        Skills
      </VisuallyHidden>
      <Text as="h2" type="body" weight="bold">
        Skills
      </Text>
      <section aria-label="All skills">
        {sortedSkills.length === 0 ? (
          <EmptyState
            headingLevel={3}
            isCompact
            title="No skills have been supplied."
          />
        ) : (
          <VStack gap={3}>
            {sortedSkills.map((skill) => (
              <SkillCard isFullWidth key={skill.id} skill={skill} />
            ))}
          </VStack>
        )}
      </section>
    </VStack>
  );
}
