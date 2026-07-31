import { Theme } from '@astryxdesign/core';
import { TopNav, TopNavHeading } from '@astryxdesign/core/TopNav';
import { VisuallyHidden } from '@astryxdesign/core/VisuallyHidden';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

import { MobileSkillsPage } from './skills/mobile-skills-page';

export function AppShell() {
  return (
    <Theme theme={neutralTheme}>
      <div className="mx-auto min-h-screen w-full max-w-md">
        <TopNav
          label="Mobile navigation"
          heading={<TopNavHeading heading="Ben Kim" subheading="Skills" />}
        />
        <main
          aria-labelledby="skills-page-title"
          className="w-full px-4 py-4"
        >
          <VisuallyHidden as="h1" id="skills-page-title">
            Skills
          </VisuallyHidden>

          <MobileSkillsPage />
        </main>
      </div>
    </Theme>
  );
}
