import { Card } from '@astryxdesign/core/Card';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { Token } from '@astryxdesign/core/Token';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import type { CapabilityEvidenceItem } from '../devops-capability-evidence/devops-capability-evidence.types';
import type { Skill } from './skill-list.types';

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
        const relevantSkillLabels = getRelevantSkillLabels(item, skills);
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

                  {relevantSkillLabels.length > 0 ? (
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
                        {relevantSkillLabels.map((skillLabel) => (
                          <li
                            key={skillLabel}
                            {...stylex.props(styles.tokenItem)}
                          >
                            <Token label={skillLabel} size="sm" />
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

function getRelevantSkillLabels(
  evidence: CapabilityEvidenceItem,
  skills: readonly Skill[],
): readonly string[] {
  const skillByName = new Map(skills.map((skill) => [skill.name, skill.name]));
  const seen = new Set<string>();

  return (evidence.technologies ?? []).flatMap((technology) => {
    const skillLabel = skillByName.get(technology);

    if (!skillLabel || seen.has(skillLabel)) {
      return [];
    }

    seen.add(skillLabel);
    return [skillLabel];
  });
}
