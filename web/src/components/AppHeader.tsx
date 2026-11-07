/**
 * AppHeader — Accessible Top Navigation Bar
 * Built with React Native components, with generous touch hitboxes
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showSettings?: boolean;
  showClose?: boolean;
  onClose?: () => void;
  rightLabel?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  showSettings = false,
  showClose = false,
  onClose,
  rightLabel,
}) => {
  const { setScreen, fontSize, highContrast } = useApp();

  const getTitleSize = () => {
    switch (fontSize) {
      case 'standard':
        return 18;
      case 'extra_large':
        return 22;
      case 'large':
      default:
        return 20;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: highContrast ? '#000000' : '#0F172A',
          borderBottomColor: highContrast ? '#FFFFFF' : '#1E293B',
        },
      ]}
    >
      <View style={styles.leftSlot}>
        {showBack && onBack && (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }: { pressed: boolean }) => [
              styles.navButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.navButtonText}>‹ Back</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.centerSlot}>
        <Text
          numberOfLines={1}
          style={[
            styles.titleText,
            {
              fontSize: getTitleSize(),
              fontWeight: highContrast ? '900' : '700',
            },
          ]}
        >
          {title}
        </Text>
      </View>

      <View style={styles.rightSlot}>
        {showSettings && (
          <Pressable
            onPress={() => setScreen('settings')}
            accessibilityRole="button"
            accessibilityLabel="Open settings and text size"
            style={({ pressed }: { pressed: boolean }) => [
              styles.navButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.navButtonText}>⚙️ Aa</Text>
          </Pressable>
        )}

        {showClose && onClose && (
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={({ pressed }: { pressed: boolean }) => [
              styles.closeButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        )}

        {rightLabel && (
          <Text style={styles.rightLabelText}>{rightLabel}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  leftSlot: {
    width: 75,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSlot: {
    width: 75,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  navButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  titleText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  rightLabelText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '600',
  },
});
