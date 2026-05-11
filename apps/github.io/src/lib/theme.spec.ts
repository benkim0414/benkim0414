import { describe, expect, it } from 'vitest';

import { isThemeMode, nextThemeMode, resolveTheme } from './theme';

describe('theme utilities', () => {
  it('validates supported theme modes', () => {
    expect(isThemeMode('light')).toBe(true);
    expect(isThemeMode('dark')).toBe(true);
    expect(isThemeMode('system')).toBe(true);
    expect(isThemeMode('sepia')).toBe(false);
  });

  it('resolves system mode from browser preference', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('cycles through all visible theme modes', () => {
    expect(nextThemeMode('system')).toBe('light');
    expect(nextThemeMode('light')).toBe('dark');
    expect(nextThemeMode('dark')).toBe('system');
  });
});
