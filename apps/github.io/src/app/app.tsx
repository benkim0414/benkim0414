import { Theme } from '@astryxdesign/core';
import { neutralTheme } from '@astryxdesign/theme-neutral/built';
import type { ReactElement } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppShell } from './app-shell';
import { NotFoundPage } from './not-found-page';
import { SkillDetailRoute } from './skills/skill-detail-route';

export function AppRoutes(): ReactElement {
  return (
    <Routes>
      <Route path="/" element={<AppShell />} />
      <Route
        path="/skills/:skillId"
        element={
          <Theme theme={neutralTheme}>
            <SkillDetailRoute />
          </Theme>
        }
      />
      <Route
        path="*"
        element={
          <Theme theme={neutralTheme}>
            <NotFoundPage />
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
