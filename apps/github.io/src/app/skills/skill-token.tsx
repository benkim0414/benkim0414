import * as stylex from '@stylexjs/stylex';
import { Token } from '@astryxdesign/core/Token';
import { colorVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import type { CSSProperties, ReactElement } from 'react';

import {
  getSkillBrand,
  hasSkillBrandIcon,
  type SkillBrand,
} from './skill-brand';
import { skills } from './skill-list.data';
import { getSkillDetailPathForSkillName } from './skill-route';

export type SkillTokenVariant = 'brand' | 'neutral';

export interface SkillTokenProps {
  label: string;
  brandLabel?: string;
  href?: string;
  variant?: SkillTokenVariant;
}

const styles = stylex.create({
  brandToken: {
    color: `var(--skill-token-foreground, ${colorVars['--color-text-purple']})`,
    backgroundColor: `var(--skill-token-background, ${colorVars['--color-background-purple']})`,
  },
  icon: {
    flex: '0 0 auto',
    width: spacingVars['--spacing-3'],
    height: spacingVars['--spacing-3'],
  },
});

function tokenStyle(
  brand: SkillBrand | undefined,
  variant: SkillTokenVariant,
): CSSProperties | undefined {
  if (variant === 'neutral' || !hasSkillBrandIcon(brand)) {
    return undefined;
  }

  return {
    '--skill-token-background': brand.color,
    '--skill-token-foreground': brand.foreground,
  } as CSSProperties;
}

export function SkillToken({
  label,
  brandLabel,
  href,
  variant,
}: SkillTokenProps): ReactElement {
  const brand = getSkillBrand(brandLabel ?? label);
  const effectiveVariant = variant ?? brand?.surface ?? 'neutral';
  const hasIcon = hasSkillBrandIcon(brand);
  const usesBrandSurface = effectiveVariant === 'brand' && hasIcon;
  const tokenHref =
    href ??
    [brandLabel, label]
      .filter((candidate): candidate is string => Boolean(candidate))
      .map((candidate) => getSkillDetailPathForSkillName(candidate, skills))
      .find((candidate): candidate is string => Boolean(candidate));
  const icon = brand?.iconPath ? (
    <svg
      aria-hidden="true"
      {...stylex.props(styles.icon)}
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path
        d={brand.iconPath}
        fill={effectiveVariant === 'neutral' ? brand.color : 'currentColor'}
      />
    </svg>
  ) : brand?.iconDataUrl ? (
    <img
      alt=""
      aria-hidden="true"
      {...stylex.props(styles.icon)}
      src={brand.iconDataUrl}
    />
  ) : undefined;

  return (
    <Token
      color={effectiveVariant === 'neutral' ? 'gray' : 'purple'}
      data-testid="skill-token"
      href={tokenHref}
      icon={icon}
      label={label}
      size="sm"
      style={tokenStyle(brand, effectiveVariant)}
      xstyle={usesBrandSurface ? styles.brandToken : undefined}
    />
  );
}
