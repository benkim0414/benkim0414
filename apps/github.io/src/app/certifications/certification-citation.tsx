import { Citation } from '@astryxdesign/core/Citation';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import type { CSSProperties } from 'react';

import { getSkillBrand, type SkillBrand } from '../skills/skill-brand';

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

function citationStyle(
  brand: SkillBrand | undefined,
  status: 'active' | 'expired',
): CSSProperties | undefined {
  if (!brand || status === 'expired') {
    return undefined;
  }

  return {
    '--certification-citation-text': brand.color,
  } as CSSProperties;
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
  const isBranded = Boolean(primary && status === 'active');
  const iconColor = isBranded ? primary?.brand.color : undefined;

  return (
    <span
      className={`certification-citation certification-citation--${status}${isBranded ? ' certification-citation--branded' : ''}`}
      data-certification-primary-skill={primary?.skill}
      data-certification-status={status}
      style={citationStyle(primary?.brand, status)}
    >
      <Citation
        className="certification-citation__source"
        number={number}
        source={{
          title,
          url,
          icon:
            primary && iconColor
              ? iconDataUrl(primary.brand.iconPath, iconColor)
              : undefined,
        }}
        variant="label"
      />
      <VisuallyHidden>
        {status === 'active' ? 'Active certification' : 'Expired certification'}
      </VisuallyHidden>
    </span>
  );
}
