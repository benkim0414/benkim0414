import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/Layout';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useId, type ReactElement } from 'react';

import { CapabilityEvidence } from './capability-evidence';
import { getDoraCapabilityCardEvidenceRows } from './dora-capability-card.evidence';
import type {
  DoraCapabilityCardEvidenceGroup,
  DoraCapabilityCardEvidenceRow,
  DoraCapabilityCardProps,
} from './dora-capability-card.types';

const evidenceGroupLabels = {
  skills: 'skill evidence',
  certifications: 'certification evidence',
  other: 'other evidence',
} as const satisfies Record<DoraCapabilityCardEvidenceGroup, string>;

const styles = stylex.create({
  root: {
    display: 'block',
    maxWidth: `calc(${spacingVars['--spacing-12']} * 9)`,
    width: '100%',
  },
  title: {
    margin: 0,
    color: colorVars['--color-text-primary'],
    fontSize: typeScaleVars['--text-heading-3-size'],
    lineHeight: typeScaleVars['--text-heading-3-leading'],
  },
  description: {
    margin: 0,
    color: colorVars['--color-text-secondary'],
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
  },
  evidenceRows: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-2'],
  },
  evidenceRow: {
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
  },
});

function rowLabel(
  capabilityLabel: string,
  group: DoraCapabilityCardEvidenceGroup,
) {
  return `${capabilityLabel} ${evidenceGroupLabels[group]}`;
}

function DoraCapabilityEvidenceRow({
  capabilityLabel,
  row,
}: {
  capabilityLabel: string;
  row: DoraCapabilityCardEvidenceRow;
}): ReactElement {
  return (
    <ul
      {...stylex.props(styles.evidenceRow)}
      aria-label={rowLabel(capabilityLabel, row.group)}
      data-group={row.group}
      data-testid="dora-capability-evidence-row"
      data-wrap="true"
    >
      {row.evidence.map((item, index) => (
        <li {...stylex.props(styles.evidenceItem)} key={item.id}>
          <CapabilityEvidence evidence={item} citationNumber={index + 1} />
        </li>
      ))}
    </ul>
  );
}

export function DoraCapabilityCard({
  capability,
  description,
  evidence,
  scores,
}: DoraCapabilityCardProps): ReactElement {
  const titleId = useId();
  const rows = getDoraCapabilityCardEvidenceRows(
    capability.key,
    evidence,
    scores,
  );

  return (
    <Card padding={4} xstyle={styles.root}>
      <article aria-labelledby={titleId} data-testid="dora-capability-card">
        <VStack gap={3}>
          <VStack gap={1}>
            <h3 id={titleId} {...stylex.props(styles.title)}>
              {capability.label}
            </h3>
            <p {...stylex.props(styles.description)}>{description}</p>
          </VStack>

          {rows.length > 0 ? (
            <div {...stylex.props(styles.evidenceRows)}>
              {rows.map((row) => (
                <DoraCapabilityEvidenceRow
                  capabilityLabel={capability.label}
                  key={row.group}
                  row={row}
                />
              ))}
            </div>
          ) : null}
        </VStack>
      </article>
    </Card>
  );
}
