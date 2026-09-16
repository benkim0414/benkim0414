import { Card } from '@astryxdesign/core/Card';
import { Collapsible } from '@astryxdesign/core/Collapsible';
import { Heading } from '@astryxdesign/core/Heading';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { Text } from '@astryxdesign/core/Text';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import * as stylex from '@stylexjs/stylex';
import { useId, useState, type ReactElement } from 'react';

import { CapabilityEvidence } from './capability-evidence';
import { CountBadge } from '../count-badge';
import { shouldStartCollapsibleExpanded } from '../responsive-collapsible';
import {
  getDoraCapabilityCardEvidenceRows,
  getDoraCapabilityCardEvidenceSummary,
} from './dora-capability-card.evidence';
import type {
  DoraCapabilityCardEvidenceGroup,
  DoraCapabilityCardEvidenceRow,
  DoraCapabilityCardProps,
} from './dora-capability-card.types';

const evidenceGroupLabels = {
  applied: 'applied evidence',
  certifications: 'certification evidence',
  skills: 'skill evidence',
  learning: 'learning evidence',
} as const satisfies Record<DoraCapabilityCardEvidenceGroup, string>;

const visibleEvidenceGroupLabels: Partial<
  Record<DoraCapabilityCardEvidenceGroup, string>
> = {
  applied: 'Relevant experience',
  certifications: 'Certifications',
  skills: 'Technical skills',
  learning: 'Learning',
};

const styles = stylex.create({
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
  showVisibleLabel,
}: {
  capabilityLabel: string;
  row: DoraCapabilityCardEvidenceRow;
  showVisibleLabel: boolean;
}): ReactElement {
  const labelId = useId();
  const visibleLabel = visibleEvidenceGroupLabels[row.group];
  const accessibleLabel = visibleLabel ?? rowLabel(capabilityLabel, row.group);

  return (
    <VStack gap={1}>
      {showVisibleLabel && visibleLabel ? (
        <HStack gap={2} vAlign="center">
          <Text
            data-testid="dora-capability-evidence-group-label"
            id={labelId}
            type="supporting"
            color="secondary"
          >
            {visibleLabel}
          </Text>
          <CountBadge count={row.evidence.length} />
        </HStack>
      ) : (
        <VisuallyHidden id={labelId}>{accessibleLabel}</VisuallyHidden>
      )}
      <ul
        {...stylex.props(styles.evidenceRow)}
        aria-labelledby={labelId}
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
    </VStack>
  );
}

function DoraCapabilityEvidenceTrigger({
  isOpen,
  rows,
}: {
  isOpen: boolean;
  rows: readonly DoraCapabilityCardEvidenceRow[];
}): ReactElement {
  if (isOpen) {
    const primaryRow = rows[0];
    const primaryLabel = primaryRow
      ? visibleEvidenceGroupLabels[primaryRow.group]
      : undefined;

    return primaryRow && primaryLabel ? (
      <HStack gap={2} vAlign="center">
        <Text type="supporting" color="secondary">
          {primaryLabel}
        </Text>
        <CountBadge count={primaryRow.evidence.length} />
      </HStack>
    ) : (
      <VisuallyHidden>Collapse evidence</VisuallyHidden>
    );
  }

  return (
    <HStack gap={2} wrap="wrap" vAlign="center">
      {rows.map((row) => {
        const label = visibleEvidenceGroupLabels[row.group];

        return label ? (
          <HStack gap={2} key={row.group} vAlign="center">
            <Text type="supporting" color="secondary">
              {label}
            </Text>
            <CountBadge count={row.evidence.length} />
          </HStack>
        ) : null;
      })}
    </HStack>
  );
}

export function DoraCapabilityCard({
  capability,
  description,
  evidence,
  scores,
}: DoraCapabilityCardProps): ReactElement {
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(shouldStartCollapsibleExpanded);
  const rows = getDoraCapabilityCardEvidenceRows(
    capability.key,
    evidence,
    scores,
  );
  const evidenceSummary = getDoraCapabilityCardEvidenceSummary(
    capability.key,
    scores,
  );

  return (
    <Card padding={4} width="100%">
      <article aria-labelledby={titleId} data-testid="dora-capability-card">
        <VStack gap={3}>
          <VStack gap={1}>
            <Heading id={titleId} level={3}>
              {capability.label}
            </Heading>
            <Text type="body" color="secondary" as="p">
              {description}
            </Text>
            {evidenceSummary ? (
              <Text type="body" color="secondary" as="p">
                {evidenceSummary}
              </Text>
            ) : null}
          </VStack>

          {rows.length > 0 ? (
            <Collapsible
              isOpen={isOpen}
              onOpenChange={setIsOpen}
              trigger={
                <DoraCapabilityEvidenceTrigger isOpen={isOpen} rows={rows} />
              }
            >
              <VStack gap={2}>
                {rows.map((row) => (
                  <DoraCapabilityEvidenceRow
                    capabilityLabel={capability.label}
                    key={row.group}
                    row={row}
                    showVisibleLabel={!isOpen || row !== rows[0]}
                  />
                ))}
              </VStack>
            </Collapsible>
          ) : null}
        </VStack>
      </article>
    </Card>
  );
}
