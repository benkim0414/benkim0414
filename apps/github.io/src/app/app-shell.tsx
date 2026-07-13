import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';

import { navItems, placeholderSections } from './app-shell.data';
import { HeroIntro } from './hero-intro';
import { PlaceholderSection } from './placeholder-section';
import { SiteFooter } from './site-footer';
import { TopBar } from './top-bar';

export function AppShell() {
  return (
    <Theme theme={neutralTheme}>
      <div className="app-shell">
        <TopBar brandLabel="App Shell" navItems={navItems} />

        <main className="page">
          <HeroIntro
            eyebrow="Page Shell"
            title="Generic Layout Skeleton"
            body="A constrained single-page structure for future portfolio content."
          />

          <div className="section-list" aria-label="Placeholder sections">
            {placeholderSections.map((section) => (
              <PlaceholderSection key={section.id} {...section} />
            ))}
          </div>
        </main>

        <SiteFooter label="Footer Region" />
      </div>
    </Theme>
  );
}
