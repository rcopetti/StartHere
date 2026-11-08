import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomTabs } from './BottomTabs';
import { shouldShowTabs } from '../navigation/routes';

export const AppShell: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <View style={styles.page}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <View style={styles.appColumn}>
        <main id="main-content" className="app-main">
          <Outlet />
        </main>
        {shouldShowTabs(pathname) && <BottomTabs />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FAF8F5',
    paddingTop: 'var(--safe-area-top)',
    paddingRight: 'var(--safe-area-right)',
    paddingBottom: 'var(--safe-area-bottom)',
    paddingLeft: 'var(--safe-area-left)',
  },
  appColumn: {
    flex: 1,
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
    backgroundColor: '#FAF8F5',
  },
});
