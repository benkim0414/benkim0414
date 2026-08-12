import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

import { HomePage } from './skills/home-page';

export function AppShell() {
  return (
    <Theme theme={neutralTheme}>
      <HomePage />
    </Theme>
  );
}
