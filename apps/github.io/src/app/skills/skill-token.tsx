import * as stylex from '@stylexjs/stylex';
import { Token } from '@astryxdesign/core/Token';
import { colorVars, spacingVars } from '@astryxdesign/core/theme/tokens.stylex';
import type { CSSProperties, ReactElement } from 'react';

import {
  getSkillBrand,
  hasSkillBrandIcon,
  type SkillBrand,
} from './skill-brand';

export interface SkillTokenProps {
  label: string;
  brandLabel?: string;
  variant?: 'purple';
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

function tokenStyle(brand: SkillBrand | undefined): CSSProperties | undefined {
  if (!hasSkillBrandIcon(brand)) {
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
}: SkillTokenProps): ReactElement {
  const brand = getSkillBrand(brandLabel ?? label);
  const hasIcon = hasSkillBrandIcon(brand);
  const icon = brand?.iconPath ? (
    <svg
      aria-hidden="true"
      {...stylex.props(styles.icon)}
      focusable="false"
      viewBox="0 0 24 24"
    >
      <path d={brand.iconPath} fill="currentColor" />
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
      color="purple"
      data-testid="skill-token"
      icon={icon}
      label={label}
      size="sm"
      style={tokenStyle(brand)}
      xstyle={hasIcon ? styles.brandToken : undefined}
    />
  );
}
