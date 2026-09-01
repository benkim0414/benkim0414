import { fireEvent, render } from '@testing-library/react';
import { vi } from 'vitest';

import { ThemeModeProvider, useThemeMode } from './theme-mode';

function ThemeModeControl() {
  const { mode, setMode } = useThemeMode();

  return (
    <button onClick={() => setMode('light')} type="button">
      {mode}
    </button>
  );
}

describe('ThemeModeProvider', () => {
  it('falls back to dark mode when saved preference storage is unavailable', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage is unavailable', 'SecurityError');
    });

    try {
      const { getByRole } = render(
        <ThemeModeProvider>
          <ThemeModeControl />
        </ThemeModeProvider>,
      );

      expect(getByRole('button').textContent).toBe('dark');
    } finally {
      getItem.mockRestore();
    }
  });

  it('changes the mode when saving the selection is unavailable', () => {
    const { getByRole } = render(
      <ThemeModeProvider>
        <ThemeModeControl />
      </ThemeModeProvider>,
    );
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage is unavailable', 'SecurityError');
    });

    try {
      fireEvent.click(getByRole('button'));

      expect(getByRole('button').textContent).toBe('light');
    } finally {
      setItem.mockRestore();
    }
  });
});
