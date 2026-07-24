import * as stylex from '@stylexjs/stylex';
import { Handle, Position } from '@xyflow/react';

import { CertificationCitation } from '../certifications/certification-citation';
import { SkillToken } from '../skills/skill-token';
import type { DevOpsRoadmapItem } from './devops-roadmap.types';

interface DevOpsRoadmapNodeProps {
  item: DevOpsRoadmapItem;
}

const styles = stylex.create({
  root: {
    display: 'grid',
    alignContent: 'start',
    gap: 'var(--spacing-3)',
    width: {
      default: 'min(100%, 320px)',
      '@media (max-width: 640px)': 'min(100%, 280px)',
    },
    minHeight: 148,
    padding: {
      default: 'var(--spacing-4)',
      '@media (max-width: 640px)': 'var(--spacing-3)',
    },
    color: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-background-surface, var(--color-background-body))',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border-subtle, rgba(15, 23, 42, 0.16))',
    borderRadius: 'var(--radius-2, 8px)',
    boxShadow: 'var(--shadow-xs, 0 1px 2px rgba(15, 23, 42, 0.08))',
  },
  title: {
    margin: 0,
    fontSize: 'var(--font-size-lg)',
    lineHeight: 'var(--line-height-tight)',
  },
  list: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
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
        <ul {...stylex.props(styles.list)} aria-label={`${item.title} skills`} data-roadmap-node-skills>
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
