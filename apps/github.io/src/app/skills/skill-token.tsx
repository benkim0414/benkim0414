import * as stylex from '@stylexjs/stylex';
import { Token } from '@astryxdesign/core/Token';
import type { CSSProperties } from 'react';

import { getSkillBrand, type SkillBrand } from './skill-brand';

export interface SkillTokenProps {
  label: string;
  variant?: 'purple';
}

const styles = stylex.create({
  brandToken: {
    color: 'var(--skill-token-foreground, var(--color-purple-700, #5b2bd6))',
    backgroundColor:
      'var(--skill-token-background, var(--color-purple-100, #eee7ff))',
  },
  icon: {
    flex: '0 0 auto',
    width: '0.875rem',
    height: '0.875rem',
  },
});

function tokenStyle(brand: SkillBrand | undefined): CSSProperties | undefined {
  if (!brand?.iconPath) {
    return undefined;
  }

  return {
    '--skill-token-background': brand.color,
    '--skill-token-foreground': brand.foreground,
  } as CSSProperties;
}

export function SkillToken({ label }: SkillTokenProps): JSX.Element {
  const brand = getSkillBrand(label);
  const hasIcon = Boolean(brand?.iconPath);

  return (
    <Token
      color="purple"
      data-testid="skill-token"
      icon={
        brand?.iconPath ? (
          <svg
            aria-hidden="true"
            {...stylex.props(styles.icon)}
            focusable="false"
            viewBox="0 0 24 24"
          >
            <path d={brand.iconPath} fill="currentColor" />
          </svg>
        ) : undefined
      }
      label={label}
      size="sm"
      style={tokenStyle(brand)}
      xstyle={hasIcon ? styles.brandToken : undefined}
    />
  );
}
