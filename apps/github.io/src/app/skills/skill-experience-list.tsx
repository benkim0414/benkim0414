import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import type { CapabilityEvidenceItem } from '../devops-capability-evidence/devops-capability-evidence.types';
import { getSkillDetailPath } from './skill-route';
import type { Skill } from './skill-list.types';
import { SkillToken } from './skill-token';

export interface SkillExperienceListProps {
  evidence: readonly CapabilityEvidenceItem[];
  skills?: readonly Skill[];
}

const styles = stylex.create({
  list: {
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  item: {
    listStyle: 'none',
  },
  tokenList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-2'],
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  tokenItem: {
    display: 'inline-flex',
    maxWidth: '100%',
    listStyle: 'none',
  },
});

export function SkillExperienceList({
  evidence,
  skills = [],
}: SkillExperienceListProps): ReactElement {
  return (
    <ul aria-label="Supporting experience" {...stylex.props(styles.list)}>
      {evidence.map((item) => {
        const relevantSkills = getRelevantSkills(item, skills);
        const facts = [...new Set(item.details?.facts ?? [])].filter(
          (fact) => fact !== item.summary,
        );

        return (
          <li key={item.id} {...stylex.props(styles.item)}>
            <VStack paddingBlock={3}>
              <Card padding={4} width="100%">
                <VStack gap={3}>
                  <VStack gap={1}>
                    <Heading level={3}>{item.title}</Heading>
                    <Text as="p" type="body">
                      {item.summary}
                    </Text>
                  </VStack>

                  {facts.length > 0 ? (
                    <VStack gap={2}>
                      {facts.map((fact) => (
                        <Text key={fact} as="p" type="body" color="secondary">
                          {fact}
                        </Text>
                      ))}
                    </VStack>
                  ) : null}

                  {relevantSkills.length > 0 ? (
                    <VStack gap={1}>
                      <Text type="supporting" color="secondary">
                        Relevant skills
                      </Text>
                      <HStack
                        aria-label="Relevant skills"
                        as="ul"
                        wrap="wrap"
                        xstyle={styles.tokenList}
                        data-wrap="true"
                      >
                        {relevantSkills.map((skill) => (
                          <li
                            key={skill.id}
                            {...stylex.props(styles.tokenItem)}
                          >
                            <SkillToken
                              href={getSkillDetailPath(skill.id)}
                              label={skill.name}
                              variant="neutral"
                            />
                          </li>
                        ))}
                      </HStack>
                    </VStack>
                  ) : null}
                </VStack>
              </Card>
            </VStack>
          </li>
        );
      })}
    </ul>
  );
}

function getRelevantSkills(
  evidence: CapabilityEvidenceItem,
  skills: readonly Skill[],
): readonly Skill[] {
  const skillByName = new Map(skills.map((skill) => [skill.name, skill]));
  const seen = new Set<string>();

  return (evidence.technologies ?? []).flatMap((technology) => {
    const skill = skillByName.get(technology);

    if (!skill || seen.has(skill.id)) {
      return [];
    }

    seen.add(skill.id);
    return [skill];
  });
}
