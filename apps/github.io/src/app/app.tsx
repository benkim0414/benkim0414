import { Theme } from '@astryxdesign/core';
import { LinkProvider } from '@astryxdesign/core/Link';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import type { ReactElement, ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { GlobalNavigationLayout } from './global-navigation-layout';
import { RoadmapPage } from './devops-roadmap/roadmap-page';
import { NotFoundPage } from './not-found-page';
import { RouterLink } from './router-link';
import { HomePage } from './home/home-page';
import { SkillDetailRoute } from './skills/skill-detail-route';
import { SkillsPage } from './skills/skills-page';
import { ThemeModeProvider, useThemeMode } from './theme-mode';

function AppTheme({ children }: { children: ReactNode }): ReactElement {
  const { mode } = useThemeMode();

  return <Theme mode={mode} theme={neutralTheme}>{children}</Theme>;
}

export function AppProviders({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <ThemeModeProvider>
      <AppTheme>
        <LinkProvider component={RouterLink}>{children}</LinkProvider>
      </AppTheme>
    </ThemeModeProvider>
  );
}

export function AppRoutes(): ReactElement {
  return (
    <Routes>
      <Route element={<GlobalNavigationLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/skills/:skillId" element={<SkillDetailRoute />} />
      </Route>
      <Route path="*" element={<NotFoundPage recoveryDestination="home" />} />
    </Routes>
  );
}

export function App(): ReactElement {
  return (
    <BrowserRouter>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
