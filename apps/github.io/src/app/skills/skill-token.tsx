import type { CSSProperties } from 'react';

import { getSkillBrand, type SkillBrand } from './skill-brand';

export interface SkillTokenProps {
  label: string;
  variant?: 'purple';
}

function tokenStyle(brand: SkillBrand | undefined): CSSProperties | undefined {
  if (!brand?.iconPath) {
    return undefined;
  }

  return {
    '--skill-token-background': brand.color,
    '--skill-token-foreground': brand.foreground,
  } as CSSProperties;
}

export function SkillToken({
  label,
  variant = 'purple',
}: SkillTokenProps): JSX.Element {
  const brand = getSkillBrand(label);
  const hasIcon = Boolean(brand?.iconPath);

  return (
    <span
      className={`skill-token skill-token--${variant}`}
      data-has-icon={String(hasIcon)}
      data-token-color={hasIcon ? brand?.color : undefined}
      style={tokenStyle(brand)}
    >
      {brand?.iconPath ? (
        <svg
          aria-hidden="true"
          className="skill-token__icon"
          focusable="false"
          viewBox="0 0 24 24"
        >
          <path d={brand.iconPath} fill="currentColor" />
        </svg>
      ) : null}
      <span className="skill-token__label">{label}</span>
    </span>
  );
}
