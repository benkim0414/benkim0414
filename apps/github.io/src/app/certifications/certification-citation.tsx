import { Citation } from '@astryxdesign/core/Citation';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import type { CSSProperties } from 'react';

import { getSkillBrand, type SkillBrand } from '../skills/skill-brand';

const ASTRYX_CITATION_LABEL_TEXT = '#737373';

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

function citationSourceStyle(
  brand: SkillBrand | undefined,
  hasSkillLogo: boolean,
): CSSProperties {
  const style: CSSProperties = {
    color: ASTRYX_CITATION_LABEL_TEXT,
  };

  if (brand && !hasSkillLogo) {
    style.borderColor = brand.color;
  }

  return style;
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
  const isBranded = Boolean(primary && !hasSkillLogo);
  const iconColor =
    status === 'active' ? primary?.brand.color : ASTRYX_CITATION_LABEL_TEXT;

  return (
    <span
      className={`certification-citation certification-citation--${status}${isBranded ? ' certification-citation--branded' : ''}`}
      data-certification-primary-skill={primary?.skill}
      data-certification-status={status}
    >
      <Citation
        className="certification-citation__source"
        number={number}
        source={{
          title,
          url,
          icon:
            iconPath && iconColor
              ? iconDataUrl(iconPath, iconColor)
              : undefined,
        }}
        style={citationSourceStyle(primary?.brand, hasSkillLogo)}
        variant="label"
      />
      <VisuallyHidden>
        {status === 'active' ? 'Active certification' : 'Expired certification'}
      </VisuallyHidden>
    </span>
  );
}
