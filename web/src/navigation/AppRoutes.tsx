import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppShell } from '../components/AppShell';
import { ROUTES } from './routes';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LessonCatalogScreen } from '../screens/LessonCatalogScreen';
import { ScenarioLessonScreen } from '../screens/ScenarioLessonScreen';
import { LessonSummaryScreen } from '../screens/LessonSummaryScreen';
import { ScamCheckScreen } from '../screens/ScamCheckScreen';
import { ScamVerdictScreen } from '../screens/ScamVerdictScreen';
import { FamilyCircleScreen } from '../screens/FamilyCircleScreen';
import { FamilyPortalScreen } from '../screens/FamilyPortalScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const LoadingView: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#1E5E3A" />
    <Text style={styles.loadingText}>Getting things ready…</Text>
  </View>
);

const RootRedirect: React.FC = () => {
  const { user, loading } = useApp();

  if (loading) return <LoadingView />;

  return <Navigate to={user?.displayName ? ROUTES.home : ROUTES.onboarding} replace />;
};

export const AppRoutes: React.FC = () => (
  <Routes>
    <Route element={<AppShell />}>
      <Route path={ROUTES.onboarding} element={<OnboardingScreen />} />
      <Route path={ROUTES.home} element={<HomeScreen />} />
      <Route path={ROUTES.check} element={<ScamCheckScreen />} />
      <Route path={ROUTES.checkResult} element={<ScamVerdictScreen />} />
      <Route path={ROUTES.coach} element={<LessonCatalogScreen />} />
      <Route path="/coach/:lessonId" element={<ScenarioLessonScreen />} />
      <Route path="/coach/:lessonId/complete" element={<LessonSummaryScreen />} />
      <Route path={ROUTES.family} element={<FamilyCircleScreen />} />
      <Route path={ROUTES.familyPortal} element={<FamilyPortalScreen />} />
      <Route path={ROUTES.settings} element={<SettingsScreen />} />
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Route>
  </Routes>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FAF8F5',
  },
  loadingText: {
    marginTop: 12,
    color: '#1A1A1A',
    fontSize: 20,
    fontWeight: '600',
  },
});
