import * as stylex from '@stylexjs/stylex';
import { Handle, Position } from '@xyflow/react';
import {
  borderVars,
  colorVars,
  radiusVars,
  shadowVars,
  spacingVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';

import { CertificationCitation } from '../certifications/certification-citation';
import { SkillToken } from '../skills/skill-token';
import type { DevOpsRoadmapItem } from './devops-roadmap.types';

interface DevOpsRoadmapNodeProps {
  item: DevOpsRoadmapItem;
}

export const DEVOPS_ROADMAP_NODE_WIDTH = 'min(100%, 320px)';
export const DEVOPS_ROADMAP_NODE_MOBILE_WIDTH = 'min(100%, 280px)';

const styles = stylex.create({
  root: {
    display: 'grid',
    alignContent: 'start',
    gap: spacingVars['--spacing-3'],
    width: {
      default: DEVOPS_ROADMAP_NODE_WIDTH,
      '@media (max-width: 640px)': DEVOPS_ROADMAP_NODE_MOBILE_WIDTH,
    },
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
  title: {
    margin: 0,
    fontSize: typeScaleVars['--text-heading-3-size'],
    lineHeight: typeScaleVars['--text-heading-3-leading'],
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
  return (
    <article {...stylex.props(styles.root)} aria-label={item.title}>
      <Handle
        aria-hidden="true"
        className="devops-roadmap-node__handle"
        id="target"
        position={Position.Top}
        type="target"
      />
      <h3 {...stylex.props(styles.title)}>{item.title}</h3>
      {item.skills.length > 0 ? (
        <ul
          {...stylex.props(styles.list)}
          aria-label={`${item.title} skills`}
          data-roadmap-node-skills
        >
          {item.skills.map((skill) => (
            <li {...stylex.props(styles.listItem)} key={skill}>
              <SkillToken label={skill} />
            </li>
          ))}
        </ul>
      ) : null}
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
