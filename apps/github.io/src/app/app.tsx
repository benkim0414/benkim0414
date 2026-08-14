import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import type { ReactElement } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { GlobalNavigationLayout } from './global-navigation-layout';
import { NotFoundPage } from './not-found-page';
import { HomePage } from './skills/home-page';
import { SkillDetailRoute } from './skills/skill-detail-route';
import { SkillsPage } from './skills/skills-page';

export function AppRoutes(): ReactElement {
  return (
    <Routes>
      <Route
        element={
          <Theme theme={neutralTheme}>
            <GlobalNavigationLayout />
          </Theme>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/skills/:skillId" element={<SkillDetailRoute />} />
      </Route>
      <Route
        path="*"
        element={
          <Theme theme={neutralTheme}>
            <NotFoundPage recoveryDestination="home" />
          </Theme>
        }
      />
    </Routes>
  );
}

export function App(): ReactElement {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
