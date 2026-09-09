import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Step, Stepper } from '@astryxdesign/core/Stepper';
import { Token } from '@astryxdesign/core/Token';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import type { ReactElement } from 'react';

import { CertificationCitation } from '../certifications/certification-citation';
import { skills } from '../skills/skill-list.data';
import { getSkillDetailPathForSkillName } from '../skills/skill-route';
import { SkillToken } from '../skills/skill-token';
import { devOpsRoadmapSkillInventoryNodes } from './devops-roadmap-skill-inventory.data';
import type { DevOpsRoadmapItem } from './devops-roadmap.types';

export interface DevOpsRoadmapStepperProps {
  readonly label?: string;
  readonly items?: readonly DevOpsRoadmapItem[];
}

const NO_ACTIVE_STEP = -1;

const styles = stylex.create({
  evidenceGroup: {
    marginBlockStart: `calc(-1 * ${spacingVars['--spacing-2']})`,
  },
  evidenceList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-2'],
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  evidenceItem: {
    display: 'inline-flex',
    maxWidth: '100%',
    listStyle: 'none',
  },
});

function hasVisibleEvidence(item: DevOpsRoadmapItem): boolean {
  const evidenceSkillTokens = item.evidenceSkillTokens ?? item.skills ?? [];

  return Boolean(
    item.certifications?.length ||
      evidenceSkillTokens.length ||
      item.coveredRoadmapConcepts?.length,
  );
}

function StepEvidence({ item }: { readonly item: DevOpsRoadmapItem }) {
  const evidenceSkillTokens = item.evidenceSkillTokens ?? item.skills ?? [];

  return (
    <VStack data-roadmap-evidence="" gap={2} xstyle={styles.evidenceGroup}>
      {item.certifications?.length ? (
        <HStack
          as="ul"
          aria-label={`${item.title} certifications`}
          wrap="wrap"
          xstyle={styles.evidenceList}
        >
          {item.certifications.map((certification, index) => (
            <li
              key={certification.title}
              {...stylex.props(styles.evidenceItem)}
            >
              <CertificationCitation {...certification} number={index + 1} />
            </li>
          ))}
        </HStack>
      ) : null}
      {evidenceSkillTokens.length ? (
        <HStack
          as="ul"
          aria-label={`${item.title} evidence skills`}
          wrap="wrap"
          xstyle={styles.evidenceList}
        >
          {evidenceSkillTokens.map((skill) => (
            <li key={skill} {...stylex.props(styles.evidenceItem)}>
              <SkillToken
                href={getSkillDetailPathForSkillName(skill, skills)}
                label={skill}
                variant="neutral"
              />
            </li>
          ))}
        </HStack>
      ) : null}
      {item.coveredRoadmapConcepts?.length ? (
        <HStack
          as="ul"
          aria-label={`${item.title} covered concepts`}
          wrap="wrap"
          xstyle={styles.evidenceList}
        >
          {item.coveredRoadmapConcepts.map((concept) => (
            <li key={concept} {...stylex.props(styles.evidenceItem)}>
              <Token color="gray" label={concept} size="sm" />
            </li>
          ))}
        </HStack>
      ) : null}
    </VStack>
  );
}

export function DevOpsRoadmapStepper({
  label = 'DevOps Roadmap',
  items = devOpsRoadmapSkillInventoryNodes,
}: DevOpsRoadmapStepperProps): ReactElement {
  return (
    <Stepper
      activeStep={NO_ACTIVE_STEP}
      data-roadmap-stepper=""
      density="spacious"
      label={label}
      orientation="vertical"
    >
      {items.map((item, index) => {
        const hasEvidence = hasVisibleEvidence(item);

        return (
          <Step
            aria-disabled={!hasEvidence || undefined}
            description={item.description}
            indicator="number"
            isDisabled={!hasEvidence}
            key={item.id}
            label={item.title}
            status={hasEvidence ? 'success' : undefined}
            step={index}
          >
            {hasEvidence ? <StepEvidence item={item} /> : null}
          </Step>
        );
      })}
    </Stepper>
  );
}
