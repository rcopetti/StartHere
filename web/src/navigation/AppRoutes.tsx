import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppShell } from '../components/AppShell';
import { LoadingView, RequireAuth, RequireOnboarded } from '../auth/AuthGuards';
import { ROUTES } from './routes';
import { SignInScreen } from '../screens/SignInScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LessonCatalogScreen } from '../screens/LessonCatalogScreen';
import { ScenarioLessonScreen } from '../screens/ScenarioLessonScreen';
import { LessonSummaryScreen } from '../screens/LessonSummaryScreen';
import { ScamCheckScreen } from '../screens/ScamCheckScreen';
import { ScamVerdictScreen } from '../screens/ScamVerdictScreen';
import { FamilyCircleScreen } from '../screens/FamilyCircleScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const RootRedirect: React.FC = () => {
  const { authStage } = useApp();

  if (authStage === 'loading') return <LoadingView />;
  if (authStage === 'signed_out') return <Navigate to={ROUTES.signIn} replace />;
  if (authStage === 'needs_onboarding') return <Navigate to={ROUTES.onboarding} replace />;
  return <Navigate to={ROUTES.home} replace />;
};

export const AppRoutes: React.FC = () => (
  <Routes>
    <Route path={ROUTES.signIn} element={<SignInScreen />} />

    <Route element={<RequireAuth />}>
      <Route element={<AppShell />}>
        <Route path={ROUTES.onboarding} element={<OnboardingScreen />} />

        <Route element={<RequireOnboarded />}>
          <Route path={ROUTES.home} element={<HomeScreen />} />
          <Route path={ROUTES.check} element={<ScamCheckScreen />} />
          <Route path={ROUTES.checkResult} element={<ScamVerdictScreen />} />
          <Route path={ROUTES.coach} element={<LessonCatalogScreen />} />
          <Route path="/coach/:lessonId" element={<ScenarioLessonScreen />} />
          <Route path="/coach/:lessonId/complete" element={<LessonSummaryScreen />} />
          <Route path={ROUTES.family} element={<FamilyCircleScreen />} />
          <Route path={ROUTES.settings} element={<SettingsScreen />} />
        </Route>
      </Route>
    </Route>

    <Route path="/" element={<RootRedirect />} />
    <Route path="*" element={<RootRedirect />} />
  </Routes>
);
