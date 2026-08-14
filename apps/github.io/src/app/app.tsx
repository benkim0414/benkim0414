import { Theme } from '@astryxdesign/core';
import { LinkProvider } from '@astryxdesign/core/Link';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import type { ReactElement, ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { RoadmapPage } from './devops-roadmap/roadmap-page';
import { NotFoundPage } from './not-found-page';
import { RouterLink } from './router-link';
import { HomePage } from './skills/home-page';
import { SkillDetailRoute } from './skills/skill-detail-route';

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
      <Route path="/" element={<HomePage />} />
      <Route path="/roadmap" element={<RoadmapPage />} />
      <Route path="/skills/:skillId" element={<SkillDetailRoute />} />
      <Route path="*" element={<NotFoundPage />} />
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
