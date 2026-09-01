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

export function AppProviders({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <LinkProvider component={RouterLink}>
      <Theme theme={neutralTheme}>{children}</Theme>
    </LinkProvider>
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
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </BrowserRouter>
  );
}

export default App;
