/**
 * Screen 10: Settings & Accessibility
 * Allows easy customization of text size, high contrast mode, and automatic family alerting.
 */

import React from 'react';
import { View, Text, ScrollView, Pressable, Switch, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { BigButton } from '../components/BigButton';
import type { FontSizePreference } from '../types';

export const SettingsScreen: React.FC = () => {
  const {
    user,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    toggleAutoAlert,
    role,
    setRole,
    setScreen,
  } = useApp();

  const fontOptions: Array<{ id: FontSizePreference; label: string }> = [
    { id: 'standard', label: 'Standard Text (18px)' },
    { id: 'large', label: 'Large Text (20px) [Recommended]' },
    { id: 'extra_large', label: 'Extra Large Text (24px)' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#F8FAFC' }]}>
      <AppHeader
        title="⚙️ Settings"
        showBack
        onBack={() => setScreen(role === 'family' ? 'family-portal' : 'home')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
          <Text style={[styles.cardTitle, { color: highContrast ? '#FFFFFF' : '#0F172A' }]}>
            TEXT DISPLAY SIZE:
          </Text>
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
              <Text style={[styles.cardTitle, { color: highContrast ? '#FFFFFF' : '#0F172A' }]}>
                High Contrast Mode
              </Text>
              <Text style={styles.cardSubtitle}>
                Extra bold black and white surfaces for sunlight legibility.
              </Text>
            </View>
            <Switch
              value={highContrast}
              onValueChange={setHighContrast}
              trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
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
              <Text style={[styles.cardTitle, { color: highContrast ? '#FFFFFF' : '#0F172A' }]}>
                Auto-Alert Family on Scams
              </Text>
              <Text style={styles.cardSubtitle}>
                Automatically sends an alert to Sarah and Tom whenever a high-risk scam is detected.
              </Text>
            </View>
            <Switch
              value={user?.autoAlertOnScam ?? true}
              onValueChange={toggleAutoAlert}
              trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
            />
          </View>
        </View>

        {/* Switch Role */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
              borderColor: highContrast ? '#FFFFFF' : '#E2E8F0',
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: highContrast ? '#FFFFFF' : '#0F172A' }]}>
            ACTIVE VIEW / ROLE:
          </Text>
          <Text style={styles.cardSubtitle}>
            Currently viewing as: <Text style={{ fontWeight: '700' }}>{role === 'family' ? 'Family Member / Carer' : 'Senior User (Eleanor)'}</Text>
          </Text>

          <BigButton
            label={role === 'family' ? 'SWITCH TO SENIOR PHONE VIEW' : 'SWITCH TO FAMILY COMPANION PORTAL'}
            variant="outline"
            onPress={() => setRole(role === 'family' ? 'senior' : 'family')}
            minHeight={50}
          />
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
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
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
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 4,
    textAlign: 'center',
  },
});
