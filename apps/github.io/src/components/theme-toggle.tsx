import { Monitor, Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { nextThemeMode } from '@/lib/theme';

import { useTheme } from './theme-provider';

const themeIcon = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const Icon = themeIcon[theme];

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={`Theme: ${theme}. Resolved ${resolvedTheme}. Cycle theme`}
      title={`Theme: ${theme}`}
      onClick={() => setTheme(nextThemeMode(theme))}
    >
      <Icon aria-hidden="true" />
    </Button>
  );
}
