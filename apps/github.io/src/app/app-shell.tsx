import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

import { MobileSkillsPage } from './skills/mobile-skills-page';

export function AppShell() {
  return (
    <Theme theme={neutralTheme}>
      <MobileSkillsPage />
    </Theme>
  );
}
