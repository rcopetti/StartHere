import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES, activeTabForPath, type AppTab } from '../navigation/routes';

interface TabDefinition {
  id: AppTab;
  label: string;
  icon: string;
  path: string;
}

const TABS: TabDefinition[] = [
  { id: 'home', label: 'Home', icon: '⌂', path: ROUTES.home },
  { id: 'check', label: 'Check', icon: '▣', path: ROUTES.check },
  { id: 'coach', label: 'Coach', icon: '▤', path: ROUTES.coach },
];

export const BottomTabs: React.FC = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activeTab = activeTabForPath(pathname);

  return (
    <View style={styles.container} accessibilityRole="tablist">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <Pressable
            key={tab.id}
            onPress={() => navigate(tab.path)}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected: isActive }}
            style={({ pressed }: { pressed: boolean }) => [
              styles.tab,
              isActive && styles.activeTab,
              { opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <View style={[styles.selectedMarker, isActive && styles.selectedMarkerVisible]} />
            <Text style={[styles.icon, isActive && styles.activeText]}>{tab.icon}</Text>
            <Text style={[styles.label, isActive && styles.activeText]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#D9DFDA',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 10,
  },
  tab: {
    flex: 1,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#E4EEE6',
  },
  selectedMarker: {
    width: 26,
    height: 3,
    borderRadius: 3,
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  selectedMarkerVisible: {
    backgroundColor: '#1E5E3A',
  },
  icon: {
    fontSize: 23,
    lineHeight: 26,
    color: '#435159',
  },
  label: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '700',
    color: '#435159',
  },
  activeText: {
    color: '#183E2A',
    fontWeight: '800',
  },
});
