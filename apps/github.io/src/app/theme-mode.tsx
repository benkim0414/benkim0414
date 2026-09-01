import {
  createContext,
  useContext,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

export type ThemeMode = 'light' | 'dark';

const THEME_MODE_STORAGE_KEY = 'theme-mode';
const ThemeModeContext = createContext<{
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
} | null>(null);

function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  try {
    return window.localStorage.getItem(THEME_MODE_STORAGE_KEY) === 'light'
      ? 'light'
      : 'dark';
  } catch {
    return 'dark';
  }
}

export function ThemeModeProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const [mode, setModeState] = useState<ThemeMode>(getInitialThemeMode);

  const setMode = (nextMode: ThemeMode) => {
    setModeState(nextMode);

    try {
      window.localStorage.setItem(THEME_MODE_STORAGE_KEY, nextMode);
    } catch {
      // Persisting the preference is optional when browser storage is blocked.
    }
  };

  return (
    <ThemeModeContext value={{ mode, setMode }}>{children}</ThemeModeContext>
  );
}

export function useThemeMode(): {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
} {
  const context = useContext(ThemeModeContext);

  if (context === null) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider.');
  }

  return context;
}
