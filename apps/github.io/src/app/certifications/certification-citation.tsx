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

function citationStyle(brand: SkillBrand | undefined): CSSProperties | undefined {
  if (!brand) {
    return undefined;
  }

  return {
    '--certification-citation-color': brand.color,
    '--certification-citation-foreground': brand.foreground,
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

  return (
    <span
      className={`certification-citation certification-citation--${status}${primary ? ' certification-citation--branded' : ''}`}
      data-certification-primary-skill={primary?.skill}
      data-certification-status={status}
      style={citationStyle(primary?.brand)}
    >
      <Citation
        className="certification-citation__source"
        number={number}
        source={{
          title,
          url,
          icon: primary?.brand.iconDataUrl,
        }}
        variant="label"
      />
      <VisuallyHidden>
        {status === 'active' ? 'Active certification' : 'Expired certification'}
      </VisuallyHidden>
    </span>
  );
}
