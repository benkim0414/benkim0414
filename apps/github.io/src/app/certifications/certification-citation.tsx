import * as stylex from '@stylexjs/stylex';
import { Badge } from '@astryxdesign/core/Badge';
import { Citation } from '@astryxdesign/core/Citation';
import { HoverCard } from '@astryxdesign/core/HoverCard';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import {
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import type { ReactElement, ReactNode } from 'react';

import { getSkillBrand } from '../skills/skill-brand';
import type { CertificationMetadata } from './certification.types';

export type { CertificationMetadata } from './certification.types';

const ASTRYX_CITATION_LABEL_TEXT = '#737373';

const styles = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    maxWidth: '100%',
  },
  sourceWithIcon: {
    borderRadius: radiusVars['--radius-element'],
    paddingInlineStart: spacingVars['--spacing-0-5'],
  },
  expiredCitationIcon: {
    filter: 'grayscale(1)',
  },
});

export interface CertificationCitationProps {
  title: string;
  url?: string;
  skills?: readonly string[];
  expiresAt?: string;
  citationIcon?: string;
  fallbackIcon?: ReactNode;
  metadata?: CertificationMetadata;
  number?: number;
  currentDate?: Date;
}

function findPrimaryBrand(skills: readonly string[]) {
  for (const skill of skills) {
    const brand = getSkillBrand(skill);

    if (brand) {
      return { skill, brand };
    }
  }

  return undefined;
}

type CertificationStatus = 'active' | 'expired';

const completedDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
  year: 'numeric',
});

function hasValidCalendarDate(dateTime: string): boolean {
  const match = /^(\d{4}-\d{2}-\d{2})T/.exec(dateTime);

  if (!match) {
    return false;
  }

  const date = new Date(`${match[1]}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === match[1]
  );
}

function getCertificationStatus(
  expiresAt: string | undefined,
  currentDate: Date,
): CertificationStatus | undefined {
  if (!expiresAt || !hasValidCalendarDate(expiresAt)) {
    return undefined;
  }

  const expiresAtTime = new Date(expiresAt).getTime();
  const currentTime = currentDate.getTime();

  if (Number.isNaN(expiresAtTime) || Number.isNaN(currentTime)) {
    return undefined;
  }

  return expiresAtTime > currentTime ? 'active' : 'expired';
}

function formatCompletedAt(completedAt: string): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(completedAt)) {
    return undefined;
  }

  const date = new Date(`${completedAt}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== completedAt
  ) {
    return undefined;
  }

  return completedDateFormatter.format(date);
}

function iconDataUrl(iconPath: string, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${color}" d="${iconPath}"/></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function CertificationCitation({
  title,
  url,
  skills = [],
  expiresAt,
  citationIcon,
  fallbackIcon,
  metadata,
  number = 1,
  currentDate = new Date(),
}: CertificationCitationProps): ReactElement {
  const primary = findPrimaryBrand(skills);
  const status = getCertificationStatus(expiresAt, currentDate);
  const completedAt = metadata
    ? formatCompletedAt(metadata.completedAt)
    : undefined;
  const hasCompleteMetadata = Boolean(
    url &&
      status &&
      completedAt &&
      metadata?.id.trim() &&
      metadata.name.trim(),
  );
  const statusLabel = status === 'active' ? 'Active' : 'Expired';
  const iconPath = primary?.brand.iconPath;
  const hasSkillLogo = Boolean(iconPath);
  const skillIcon = primary?.brand.iconPath
    ? iconDataUrl(
        primary.brand.iconPath,
        status === 'expired' ? ASTRYX_CITATION_LABEL_TEXT : primary.brand.color,
      )
    : undefined;
  const icon = citationIcon ?? skillIcon;
  const hasExpiredCitationIcon = Boolean(
    citationIcon && status === 'expired',
  );
  const citationXstyle = hasSkillLogo
    ? [
        styles.sourceWithIcon,
        hasExpiredCitationIcon && styles.expiredCitationIcon,
      ]
    : hasExpiredCitationIcon && styles.expiredCitationIcon;
  const citation = (
    <Citation
      number={number}
      source={{
        title,
        url,
        icon,
      }}
      variant="label"
      xstyle={citationXstyle}
    />
  );

  return (
    <span
      {...stylex.props(styles.root)}
      data-certification-primary-skill={primary?.skill}
      data-certification-status={status}
      data-testid="certification-citation"
    >
      {fallbackIcon}
      {hasCompleteMetadata && metadata && completedAt ? (
        <HoverCard
          content={
            <MetadataList columns="single" title="Certification">
              <MetadataListItem label="Name">
                {metadata.name}
              </MetadataListItem>
              <MetadataListItem label="ID">{metadata.id}</MetadataListItem>
              <MetadataListItem label="Status">
                <Badge
                  label={statusLabel}
                  variant={status === 'active' ? 'green' : 'neutral'}
                />
              </MetadataListItem>
              <MetadataListItem label="Completed">
                {completedAt}
              </MetadataListItem>
            </MetadataList>
          }
          hasHoverIndication={false}
        >
          {citation}
        </HoverCard>
      ) : (
        citation
      )}
      {status ? (
        <VisuallyHidden>
          {status === 'active'
            ? 'Active certification'
            : 'Expired certification'}
        </VisuallyHidden>
      ) : null}
    </span>
  );
}
