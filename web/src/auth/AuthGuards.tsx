import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ROUTES } from '../navigation/routes';

export const LoadingView: React.FC = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#1E5E3A" />
    <Text style={styles.loadingText}>Getting things ready…</Text>
  </View>
);

export const RequireAuth: React.FC = () => {
  const { authStage } = useApp();
  const location = useLocation();

  if (authStage === 'loading') return <LoadingView />;
  if (authStage === 'signed_out') {
    return <Navigate to={ROUTES.signIn} state={{ from: location.pathname }} replace />;
  }
  return <Outlet />;
};

export const RequireOnboarded: React.FC = () => {
  const { authStage } = useApp();

  if (authStage === 'needs_onboarding') {
    return <Navigate to={ROUTES.onboarding} replace />;
  }
  return <Outlet />;
};

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
