import type { ReactElement } from 'react';
import { Heading } from '@astryxdesign/core/Heading';
import { VStack } from '@astryxdesign/core/Layout';

import type { Skill } from './skill-list.types';

export interface SkillDetailPageProps {
  skill: Skill;
}

export function SkillDetailPage({ skill }: SkillDetailPageProps): ReactElement {
  return (
    <VStack
      as="main"
      className="mx-auto h-dvh min-h-screen w-full max-w-md"
      padding={4}
    >
      <Heading level={1}>{skill.name}</Heading>
    </VStack>
  );
}
