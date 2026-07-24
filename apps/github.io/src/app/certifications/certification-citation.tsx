import * as stylex from '@stylexjs/stylex';
import { Citation } from '@astryxdesign/core/Citation';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import type { CSSProperties } from 'react';

import { getSkillBrand } from '../skills/skill-brand';

const ASTRYX_CITATION_LABEL_TEXT = '#737373';

const styles = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
    maxWidth: '100%',
  },
  source: {
    maxWidth: '100%',
  },
});

export interface CertificationCitationProps {
  title: string;
  url: string;
  skills: readonly string[];
  expiresAt: string;
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

function isActive(expiresAt: string, currentDate: Date) {
  return new Date(expiresAt).getTime() > currentDate.getTime();
}

function iconDataUrl(iconPath: string, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${color}" d="${iconPath}"/></svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function citationSourceStyle(): CSSProperties {
  return {
    color: ASTRYX_CITATION_LABEL_TEXT,
  };
}

export function CertificationCitation({
  title,
  url,
  skills,
  expiresAt,
  number = 1,
  currentDate = new Date(),
}: CertificationCitationProps): JSX.Element {
  const primary = findPrimaryBrand(skills);
  const status = isActive(expiresAt, currentDate) ? 'active' : 'expired';
  const iconPath = primary?.brand.iconPath;
  const hasSkillLogo = Boolean(iconPath);
  const iconColor =
    status === 'active' ? primary?.brand.color : ASTRYX_CITATION_LABEL_TEXT;

  return (
    <span
      {...stylex.props(styles.root)}
      data-certification-primary-skill={primary?.skill}
      data-certification-status={status}
      data-testid="certification-citation"
    >
      <Citation
        number={number}
        source={{
          title,
          url,
          icon:
            iconPath && iconColor
              ? iconDataUrl(iconPath, iconColor)
              : undefined,
        }}
        style={citationSourceStyle()}
        variant="label"
        xstyle={styles.source}
      />
      <VisuallyHidden>
        {status === 'active' ? 'Active certification' : 'Expired certification'}
      </VisuallyHidden>
    </span>
  );
}
