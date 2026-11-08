/**
 * Screen 10: Settings & Accessibility
 * Allows easy customization of text size, high contrast mode, and automatic family alerting.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, StyleSheet } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { BigButton } from '../components/BigButton';
import { Heading } from '../components/Heading';
import { ROUTES } from '../navigation/routes';
import type { FontSizePreference } from '../types';

export const SettingsScreen: React.FC = () => {
  const {
    user,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    toggleAutoAlert,
    signOutUser,
  } = useApp();
  const navigate = useNavigate();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const fontOptions: Array<{ id: FontSizePreference; label: string }> = [
    { id: 'standard', label: 'Standard Text (20px)' },
    { id: 'large', label: 'Large Text (22px) [Recommended]' },
    { id: 'extra_large', label: 'Extra Large Text (24px)' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#FAF8F5' }]}>
      <AppHeader
        title="Settings"
        showBack
        onBack={() => navigate(ROUTES.home)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Heading level={1} style={styles.srOnly}>Settings</Heading>
        {/* Text Display Size */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
              borderColor: highContrast ? '#FFFFFF' : '#E2E8F0',
            },
          ]}
        >
          <Heading level={2} style={styles.cardTitle} color={highContrast ? '#FFFFFF' : '#0F172A'}>
            Text display size
          </Heading>
          <Text style={styles.cardSubtitle}>
            Choose the size that feels most comfortable for your eyes:
          </Text>

          {fontOptions.map((opt) => {
            const isSelected = fontSize === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setFontSize(opt.id)}
                style={[
                  styles.optionRow,
                  {
                    backgroundColor: isSelected
                      ? highContrast
                        ? '#334155'
                        : '#EFF6FF'
                      : 'transparent',
                    borderColor: isSelected ? '#2563EB' : '#CBD5E1',
                  },
                ]}
              >
                <View style={styles.radioOuter}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text
                  style={[
                    styles.optionLabel,
                    {
                      fontSize: opt.id === 'standard' ? 18 : opt.id === 'large' ? 20 : 22,
                      color: highContrast ? '#FFFFFF' : '#0F172A',
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Contrast & Colors */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
              borderColor: highContrast ? '#FFFFFF' : '#E2E8F0',
            },
          ]}
        >
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Heading level={2} style={styles.cardTitle} color={highContrast ? '#FFFFFF' : '#0F172A'}>
                High contrast mode
              </Heading>
              <Text style={styles.cardSubtitle}>
                Extra bold black and white surfaces for sunlight legibility.
              </Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
              accessibilityLabel="High contrast mode"
            />
          </View>
        </View>

        {/* Automatic Safety Alerts */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
              borderColor: highContrast ? '#FFFFFF' : '#E2E8F0',
            },
          ]}
        >
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Heading level={2} style={styles.cardTitle} color={highContrast ? '#FFFFFF' : '#0F172A'}>
                Auto-alert family on scams
              </Heading>
              <Text style={styles.cardSubtitle}>
                Automatically sends an alert to Sarah and Tom whenever a high-risk scam is detected.
              </Text>
            </View>
            <Switch
              value={user?.autoAlertOnScam ?? true}
              onValueChange={toggleAutoAlert}
              trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
              accessibilityLabel="Auto-alert family on scams"
            />
          </View>
        </View>

        {/* Account */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
              borderColor: highContrast ? '#FFFFFF' : '#E2E8F0',
            },
          ]}
        >
          <Heading level={2} style={styles.cardTitle} color={highContrast ? '#FFFFFF' : '#0F172A'}>
            Your account
          </Heading>
          <Text style={styles.cardSubtitle}>
            Signed in as <Text style={{ fontWeight: '700' }}>{user?.displayName || 'Friend'}</Text>
            {user?.email ? ` (${user.email})` : ''}
          </Text>

          {!confirmSignOut ? (
            <BigButton
              label="SIGN OUT"
              variant="outline"
              onPress={() => setConfirmSignOut(true)}
              minHeight={56}
            />
          ) : (
            <View>
              <Text style={styles.cardSubtitle}>
                Sign out of StartHere? Your lessons and checks stay saved.
              </Text>
              <BigButton
                label="YES, SIGN OUT"
                variant="danger"
                onPress={() => {
                  void signOutUser();
                }}
                minHeight={56}
              />
              <BigButton
                label="NO, STAY SIGNED IN"
                variant="outline"
                onPress={() => setConfirmSignOut(false)}
                minHeight={56}
              />
            </View>
          )}
        </View>

        {/* About & Security */}
        <View style={styles.aboutBox}>
          <Text style={styles.aboutText}>• StartHere Version 1.0 (MVP)</Text>
          <Text style={styles.aboutText}>• Firebase Project: starthere-3e5dc</Text>
          <Text style={styles.aboutText}>• AI Engine: Gemini 3.8 Flash</Text>
          <Text style={styles.aboutText}>• Your personal PINs, cards, and passwords are never stored.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 18,
    color: '#475569',
    lineHeight: 25,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 2,
    marginBottom: 8,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  optionLabel: {
    flex: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aboutBox: {
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  aboutText: {
    fontSize: 18,
    color: '#94A3B8',
    marginBottom: 4,
    textAlign: 'center',
  },
});
