export const THEME_STORAGE_KEY = 'github.io.theme';

export const themeModes = ['light', 'dark', 'system'] as const;

export type ThemeMode = (typeof themeModes)[number];

export type ResolvedTheme = 'light' | 'dark';

export function isThemeMode(value: unknown): value is ThemeMode {
  return typeof value === 'string' && themeModes.includes(value as ThemeMode);
}

export function resolveTheme(mode: ThemeMode, prefersDark: boolean): ResolvedTheme {
  if (mode === 'system') {
    return prefersDark ? 'dark' : 'light';
  }

  return mode;
}

export function nextThemeMode(mode: ThemeMode): ThemeMode {
  const index = themeModes.indexOf(mode);
  return themeModes[(index + 1) % themeModes.length];
}
