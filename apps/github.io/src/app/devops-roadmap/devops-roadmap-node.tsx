import * as stylex from '@stylexjs/stylex';
import { Handle, Position } from '@xyflow/react';
import { Heading } from '@astryxdesign/core/Heading';
import { Token } from '@astryxdesign/core/Token';
import {
  borderVars,
  colorVars,
  radiusVars,
  shadowVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';

import { CertificationCitation } from '../certifications/certification-citation';
import { skills } from '../skills/skill-list.data';
import { getSkillDetailPathForSkillName } from '../skills/skill-route';
import { SkillToken } from '../skills/skill-token';
import type { DevOpsRoadmapItem } from './devops-roadmap.types';

interface DevOpsRoadmapNodeProps {
  item: DevOpsRoadmapItem;
}

export const DEVOPS_ROADMAP_NODE_WIDTH = '100%';

const styles = stylex.create({
  root: {
    display: 'grid',
    alignContent: 'start',
    gap: spacingVars['--spacing-3'],
    width: DEVOPS_ROADMAP_NODE_WIDTH,
    minHeight: `calc(${spacingVars['--spacing-12']} * 3 + ${spacingVars['--spacing-1']})`,
    padding: {
      default: spacingVars['--spacing-4'],
      '@media (max-width: 640px)': spacingVars['--spacing-3'],
    },
    color: colorVars['--color-text-primary'],
    backgroundColor: colorVars['--color-background-surface'],
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-element'],
    boxShadow: shadowVars['--shadow-low'],
  },
  disabled: {
    color: colorVars['--color-text-tertiary'],
    backgroundColor: colorVars['--color-background-muted'],
    borderColor: colorVars['--color-border-muted'],
    boxShadow: 'none',
    opacity: 0.72,
  },
  list: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-2'],
    padding: 0,
    margin: 0,
    listStyle: 'none',
  },
  listItem: {
    display: 'inline-flex',
    maxWidth: '100%',
  },
});

export function DevOpsRoadmapNode({ item }: DevOpsRoadmapNodeProps) {
  const evidenceSkillTokens = item.evidenceSkillTokens ?? item.skills ?? [];
  const coveredRoadmapConcepts = item.coveredRoadmapConcepts ?? [];
  const isDisabled =
    !item.certifications?.length &&
    evidenceSkillTokens.length === 0 &&
    coveredRoadmapConcepts.length === 0;

  return (
    <article
      {...stylex.props(styles.root, isDisabled && styles.disabled)}
      aria-disabled={isDisabled ? 'true' : undefined}
      aria-label={item.title}
      data-roadmap-node-disabled={isDisabled ? 'true' : undefined}
    >
      <Handle
        aria-hidden="true"
        className="devops-roadmap-node__handle"
        id="target"
        position={Position.Top}
        type="target"
      />
      <Heading level={3}>{item.title}</Heading>
      {item.certifications?.length ? (
        <ul
          {...stylex.props(styles.list)}
          aria-label={`${item.title} certifications`}
          data-roadmap-node-certifications
        >
          {item.certifications.map((certification, index) => (
            <li {...stylex.props(styles.listItem)} key={certification.title}>
              <CertificationCitation {...certification} number={index + 1} />
            </li>
          ))}
        </ul>
      ) : null}
      {evidenceSkillTokens.length > 0 ? (
        <ul
          {...stylex.props(styles.list)}
          aria-label={`${item.title} evidence skills`}
          data-roadmap-node-skills
        >
          {evidenceSkillTokens.map((skill) => (
            <li {...stylex.props(styles.listItem)} key={skill}>
              <SkillToken
                href={getSkillDetailPathForSkillName(skill, skills)}
                label={skill}
              />
            </li>
          ))}
        </ul>
      ) : null}
      {coveredRoadmapConcepts.length > 0 ? (
        <ul
          {...stylex.props(styles.list)}
          aria-label={`${item.title} covered concepts`}
          data-roadmap-node-concepts
        >
          {coveredRoadmapConcepts.map((concept) => (
            <li {...stylex.props(styles.listItem)} key={concept}>
              <Token color="gray" label={concept} size="sm" />
            </li>
          ))}
        </ul>
      ) : null}
      <Handle
        aria-hidden="true"
        className="devops-roadmap-node__handle"
        id="source"
        position={Position.Bottom}
        type="source"
      />
    </article>
  );
}
