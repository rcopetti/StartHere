import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomTabs } from './BottomTabs';
import { shouldShowTabs } from '../navigation/routes';

export const AppShell: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <View style={styles.page}>
      <View style={styles.appColumn}>
        <View style={styles.content}>
          <Outlet />
        </View>
        {shouldShowTabs(pathname) && <BottomTabs />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  appColumn: {
    flex: 1,
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
    backgroundColor: '#FAF8F5',
  },
  content: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
});
