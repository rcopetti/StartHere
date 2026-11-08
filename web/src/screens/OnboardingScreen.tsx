/**
 * Screen 1: Welcome & Onboarding
 * Allows immediate text size selection with live sample preview, then role selection.
 */

import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BigButton } from '../components/BigButton';
import { Heading } from '../components/Heading';
import { ROUTES } from '../navigation/routes';
import type { FontSizePreference } from '../types';

export const OnboardingScreen: React.FC = () => {
  const { fontSize, setFontSize, role, setRole, highContrast } = useApp();
  const navigate = useNavigate();

  const getBodySize = () => {
    switch (fontSize) {
      case 'standard':
        return 20;
      case 'extra_large':
        return 24;
      case 'large':
      default:
        return 22;
    }
  };

  const options: Array<{ id: FontSizePreference; label: string; badge?: string }> = [
    { id: 'standard', label: 'Standard Text (20px)' },
    { id: 'large', label: 'Large Text (22px)', badge: 'Recommended' },
    { id: 'extra_large', label: 'Extra Large Text (24px)' },
  ];

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: highContrast ? '#000000' : '#FAF8F5' },
      ]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.heroSection}>
        <HeartHandshake size={48} strokeWidth={2} color="#1E5E3A" aria-hidden="true" focusable="false" />
        <Heading level={1} style={styles.title} color={highContrast ? '#FFFFFF' : '#0F172A'}>
          Welcome to StartHere
        </Heading>
        <Text
          style={[
            styles.subtitle,
            {
              fontSize: getBodySize(),
              color: highContrast ? '#E2E8F0' : '#475569',
            },
          ]}
        >
          Your patient helper for using your phone with confidence and staying safe from tricky messages.
        </Text>
      </View>

      {/* Text Size Customization */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
            borderColor: highContrast ? '#FFFFFF' : '#E2E8F0',
          },
        ]}
      >
        <Heading level={2} style={styles.sectionHeading} color={highContrast ? '#FFFFFF' : '#1E293B'}>
          Choose your text size
        </Heading>

        <View role="radiogroup" aria-label="Choose your text size">
          {options.map((opt) => {
            const isSelected = fontSize === opt.id;
            return (
              <Pressable
                key={opt.id}
                onPress={() => setFontSize(opt.id)}
                accessibilityRole="radio"
                aria-checked={isSelected}
                style={({ pressed }: { pressed: boolean }) => [
                  styles.optionRow,
                  {
                    backgroundColor: isSelected
                      ? highContrast
                        ? '#334155'
                        : '#EFF6FF'
                      : 'transparent',
                    borderColor: isSelected ? '#2563EB' : '#CBD5E1',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <View style={styles.radioOuter}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <View style={styles.optionTextBlock}>
                  <Text
                    style={[
                      styles.optionLabel,
                      {
                        fontSize: opt.id === 'standard' ? 20 : opt.id === 'large' ? 22 : 24,
                        color: highContrast ? '#FFFFFF' : '#0F172A',
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {opt.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{opt.badge}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.previewBox}>
          <Text style={styles.previewCaption}>Preview</Text>
          <Text
            style={[
              styles.previewText,
              {
                fontSize: getBodySize(),
                color: highContrast ? '#F1F5F9' : '#1E293B',
              },
            ]}
          >
            "This is how your lessons and scam warnings will look on your phone."
          </Text>
        </View>
      </View>

      {/* Role Selection */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
            borderColor: highContrast ? '#FFFFFF' : '#E2E8F0',
          },
        ]}
      >
        <Heading level={2} style={styles.sectionHeading} color={highContrast ? '#FFFFFF' : '#1E293B'}>
          Who is using this phone?
        </Heading>

        <Pressable
          onPress={() => setRole('senior')}
          style={[
            styles.roleCard,
            {
              borderColor: role === 'senior' ? '#2563EB' : '#CBD5E1',
              backgroundColor: role === 'senior' ? (highContrast ? '#334155' : '#EFF6FF') : 'transparent',
            },
          ]}
        >
          <Text style={styles.roleTitle}>I am a senior</Text>
          <Text style={styles.roleDescription}>
            I want help with my phone and protection from scam messages.
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setRole('family')}
          style={[
            styles.roleCard,
            {
              borderColor: role === 'family' ? '#2563EB' : '#CBD5E1',
              backgroundColor: role === 'family' ? (highContrast ? '#334155' : '#EFF6FF') : 'transparent',
            },
          ]}
        >
          <Text style={styles.roleTitle}>I am a family member or carer</Text>
          <Text style={styles.roleDescription}>
            I want to link to a loved one's phone and receive instant scam alerts.
          </Text>
        </Pressable>
      </View>

      {/* Get Started Button */}
      <View style={styles.actionContainer}>
        <BigButton
          label="GET STARTED  ➔"
          variant="primary"
          onPress={() => navigate(role === 'family' ? ROUTES.familyPortal : ROUTES.home)}
          minHeight={58}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginVertical: 18,
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 37,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 8,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 2,
    marginBottom: 10,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563EB',
  },
  optionTextBlock: {
    flex: 1,
  },
  optionLabel: {
    flexShrink: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: '#1E40AF',
    fontSize: 18,
    fontWeight: '700',
  },
  previewBox: {
    marginTop: 10,
    padding: 14,
    backgroundColor: '#FAF8F5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  previewCaption: {
    fontSize: 18,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  previewText: {
    fontStyle: 'italic',
    lineHeight: 26,
  },
  roleCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginBottom: 12,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 18,
    color: '#475569',
    lineHeight: 22,
  },
  actionContainer: {
    marginTop: 8,
  },
});
