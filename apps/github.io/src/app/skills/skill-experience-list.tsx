import { HStack, VStack } from '@astryxdesign/core/Layout';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import type { CapabilityEvidenceItem } from '../devops-capability-evidence/devops-capability-evidence.types';
import { SkillExperienceCardShell } from './skill-experience-card-shell';
import { getSkillDetailPath } from './skill-route';
import { SkillKeyOutcomes } from './skill-key-outcomes';
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
              <SkillExperienceCardShell
                outcomeCount={facts.length}
                skillCount={relevantSkills.length}
                summary={item.summary}
                title={item.title}
              >
                <SkillKeyOutcomes outcomes={facts} />

                {relevantSkills.length > 0 ? (
                  <HStack
                    aria-label="Relevant skills"
                    as="ul"
                    wrap="wrap"
                    xstyle={styles.tokenList}
                    data-wrap="true"
                  >
                    {relevantSkills.map((skill) => (
                      <li key={skill.id} {...stylex.props(styles.tokenItem)}>
                        <SkillToken
                          href={getSkillDetailPath(skill.id)}
                          label={skill.name}
                          variant="neutral"
                        />
                      </li>
                    ))}
                  </HStack>
                ) : null}
              </SkillExperienceCardShell>
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
