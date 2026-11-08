/**
 * AppHeader — Accessible Top Navigation Bar
 * Built with React Native components, with generous touch hitboxes.
 * The person control opens an explicit Family Circle / Settings choice panel.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Settings, UserRound, Users, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ROUTES } from '../navigation/routes';

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showSettings?: boolean;
  showPersonMenu?: boolean;
  showClose?: boolean;
  onClose?: () => void;
  rightLabel?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  showSettings = false,
  showPersonMenu = false,
  showClose = false,
  onClose,
  rightLabel,
}) => {
  const { fontSize, highContrast } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

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

  const foreground = highContrast ? '#FFFFFF' : '#17212B';

  const go = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <View
        style={[
          styles.container,
          {
            backgroundColor: highContrast ? '#000000' : '#FFFFFF',
            borderBottomColor: highContrast ? '#FFFFFF' : '#D9DFDA',
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
              <ChevronLeft size={24} strokeWidth={2.4} color={foreground} aria-hidden="true" focusable="false" />
              <Text style={[styles.navButtonText, { color: foreground }]}>Back</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.centerSlot}>
          <Text
            numberOfLines={1}
            style={[
              styles.titleText,
              {
                color: foreground,
                fontSize: getTitleSize(),
                fontWeight: highContrast ? '900' : '800',
              },
            ]}
          >
            {title}
          </Text>
        </View>

        <View style={styles.rightSlot}>
          {showSettings && (
            <Pressable
              onPress={() => navigate(ROUTES.settings)}
              accessibilityRole="button"
              accessibilityLabel="Open settings and text size"
              style={({ pressed }: { pressed: boolean }) => [
                styles.navButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Settings size={20} strokeWidth={2.3} color={foreground} aria-hidden="true" focusable="false" />
              <Text style={[styles.navButtonText, { color: foreground }]}>Aa</Text>
            </Pressable>
          )}

          {showPersonMenu && (
            <Pressable
              onPress={() => setMenuOpen(true)}
              accessibilityRole="button"
              accessibilityLabel="Open family and settings"
              accessibilityState={{ expanded: menuOpen }}
              style={({ pressed }: { pressed: boolean }) => [
                styles.personButton,
                {
                  borderColor: highContrast ? '#FFFFFF' : '#D5DFDA',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <UserRound size={24} strokeWidth={2.3} color={foreground} aria-hidden="true" focusable="false" />
              <Text style={[styles.personLabel, { color: foreground }]}>Family</Text>
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
              <X size={26} strokeWidth={2.4} color={foreground} aria-hidden="true" focusable="false" />
            </Pressable>
          )}

          {rightLabel && (
            <Text style={[styles.rightLabelText, { color: foreground }]}>{rightLabel}</Text>
          )}
        </View>
      </View>

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <View style={styles.backdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setMenuOpen(false)}
            accessibilityRole="button"
            accessibilityLabel="Close family and settings"
          />
          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: highContrast ? '#111111' : '#FFFFFF',
                borderColor: highContrast ? '#FFFFFF' : '#D9DFDA',
              },
            ]}
          >
            <Text style={[styles.menuTitle, { color: foreground }]}>Family and settings</Text>
            <Pressable
              onPress={() => go(ROUTES.family)}
              accessibilityRole="button"
              accessibilityLabel="Open Family Circle from menu"
              style={({ pressed }: { pressed: boolean }) => [
                styles.menuItem,
                { borderColor: highContrast ? '#FFFFFF' : '#D9DFDA', opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <View style={styles.menuIconWrap}>
                <Users size={28} strokeWidth={2.2} color={foreground} aria-hidden="true" focusable="false" />
              </View>
              <View style={styles.menuTextBlock}>
                <Text style={[styles.menuItemTitle, { color: foreground }]}>Family Circle</Text>
                <Text style={styles.menuItemSubtitle}>People you trust</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => go(ROUTES.settings)}
              accessibilityRole="button"
              accessibilityLabel="Open Settings"
              style={({ pressed }: { pressed: boolean }) => [
                styles.menuItem,
                { borderColor: highContrast ? '#FFFFFF' : '#D9DFDA', opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <View style={styles.menuIconWrap}>
                <Settings size={28} strokeWidth={2.2} color={foreground} aria-hidden="true" focusable="false" />
              </View>
              <View style={styles.menuTextBlock}>
                <Text style={[styles.menuItemTitle, { color: foreground }]}>Settings</Text>
                <Text style={styles.menuItemSubtitle}>Text size and contrast</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => setMenuOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Close menu"
              style={({ pressed }: { pressed: boolean }) => [
                styles.menuClose,
                { opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <Text style={[styles.menuCloseText, { color: foreground }]}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  leftSlot: {
    width: 88,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSlot: {
    minWidth: 88,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  navButton: {
    minHeight: 64,
    minWidth: 64,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: '700',
  },
  titleText: {
    textAlign: 'center',
  },
  personButton: {
    minHeight: 64,
    minWidth: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 14,
  },
  personLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  closeButton: {
    minHeight: 64,
    minWidth: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightLabelText: {
    fontSize: 15,
    fontWeight: '700',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 25, 35, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  menuCard: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 2,
    borderRadius: 24,
    padding: 20,
  },
  menuTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 14,
  },
  menuItem: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderRadius: 18,
  },
  menuIconWrap: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextBlock: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  menuItemSubtitle: {
    fontSize: 16,
    color: '#52605F',
    marginTop: 2,
  },
  menuClose: {
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCloseText: {
    fontSize: 18,
    fontWeight: '800',
  },
});
