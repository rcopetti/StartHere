/**
 * Screen 8: The Stop Screen
 * Shown whenever the API says a scam involves money, gift cards, crypto,
 * bank details, or a verification code.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Navigate, useNavigate } from 'react-router-dom';
import { OctagonX, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { BigButton } from '../components/BigButton';
import { Heading } from '../components/Heading';
import { ROUTES } from '../navigation/routes';

const RECOVERY_STEPS = [
  'Call your bank. Use the phone number on the back of your card, not the number in the message.',
  'Change the password for the account you shared.',
  'Tell someone you trust what happened. You did nothing wrong.',
];

export const ScamStopScreen: React.FC = () => {
  const { activeScamResult, trustedContacts, fontSize, highContrast } = useApp();
  const [showRecovery, setShowRecovery] = useState(false);
  const navigate = useNavigate();

  if (!activeScamResult) {
    return <Navigate to={ROUTES.check} replace />;
  }

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

  const contact =
    trustedContacts.find((person) => person.status === 'active' && person.phone) ||
    trustedContacts.find((person) => person.phone);
  const contactFirstName = contact?.name?.trim().split(/\s+/)[0] || null;
  const isFamilyImpostor = activeScamResult.riskCategories?.includes('family_impostor');
  const isLikelyScam = activeScamResult.verdict === 'likely_scam';

  const steps = [
    {
      title: "Don't reply",
      body: 'Do not answer this message or call the number inside it.',
    },
    {
      title: "Don't send money, gift cards, or codes",
      body: 'No real company or family member needs a gift card or a secret code.',
    },
    {
      title: 'Call someone you trust',
      body: contactFirstName
        ? `${contactFirstName} can help you check this safely.`
        : 'A family member or friend can help you check this safely.',
    },
  ];

  const callTrustedPerson = () => {
    if (contact?.phone) {
      window.location.href = `tel:${contact.phone.replace(/[^\d+]/g, '')}`;
      return;
    }
    navigate(ROUTES.family);
  };

  const callLabel = contact
    ? `Call ${contactFirstName || contact.name}`
    : 'Choose someone to call';

  return (
    <View style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#FAF8F5' }]}>
      <AppHeader title="Stop" showBack onBack={() => navigate(ROUTES.check)} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View
          style={[styles.hero, { backgroundColor: highContrast ? '#7F1D1D' : '#B91C1C' }]}
          role="region"
          aria-label="Stop and stay safe"
        >
          <OctagonX size={52} strokeWidth={2.4} color="#FFFFFF" aria-hidden="true" focusable="false" />
          <Heading level={1} style={styles.heroTitle} color="#FFFFFF">
            Stop
          </Heading>
          <Text style={styles.heroText}>
            {isLikelyScam
              ? 'This is a scam. You are safe because you checked.'
              : 'This one needs care. You are safe because you checked.'}
          </Text>
        </View>

        <View style={styles.steps}>
          {steps.map((step, index) => (
            <View
              key={step.title}
              style={[
                styles.stepCard,
                {
                  backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
                  borderColor: highContrast ? '#FFFFFF' : '#E5E7EB',
                },
              ]}
            >
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.stepTextBlock}>
                <Text
                  style={[
                    styles.stepTitle,
                    { fontSize: getBodySize() + 1, color: highContrast ? '#FFFFFF' : '#111827' },
                  ]}
                >
                  {step.title}
                </Text>
                <Text
                  style={[
                    styles.stepBody,
                    {
                      fontSize: getBodySize() - 1,
                      lineHeight: (getBodySize() - 1) * 1.45,
                      color: highContrast ? '#E2E8F0' : '#374151',
                    },
                  ]}
                >
                  {step.body}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {isFamilyImpostor && (
          <View
            style={[
              styles.safeWord,
              {
                backgroundColor: highContrast ? '#78350F' : '#FEF3C7',
                borderColor: '#F59E0B',
              },
            ]}
          >
            <Text
              style={[
                styles.safeWordText,
                { fontSize: getBodySize() - 1, color: highContrast ? '#FFFFFF' : '#92400E' },
              ]}
            >
              Ask for your family safe word. If the caller cannot say it, it is not your family.
            </Text>
          </View>
        )}

        <BigButton
          label={callLabel}
          variant="danger"
          minHeight={72}
          icon={<Phone size={28} strokeWidth={2.4} color="#FFFFFF" aria-hidden="true" focusable="false" />}
          onPress={callTrustedPerson}
        />

        {!contact && (
          <Text style={[styles.helperText, { color: highContrast ? '#E2E8F0' : '#475569' }]}>
            Add a trusted person in Family Circle so this button can call them.
          </Text>
        )}

        <Pressable
          onPress={() => setShowRecovery((open) => !open)}
          accessibilityRole="button"
          accessibilityLabel="I already replied or paid"
          accessibilityState={{ expanded: showRecovery }}
          style={({ pressed }: { pressed: boolean }) => [
            styles.textLink,
            { opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Text style={[styles.textLinkText, { color: highContrast ? '#FFFFFF' : '#183E2A' }]}>
            {showRecovery ? 'Hide the recovery steps' : 'I already replied or paid'}
          </Text>
        </Pressable>

        {showRecovery && (
          <View
            style={[
              styles.recoveryCard,
              {
                backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
                borderColor: highContrast ? '#FFFFFF' : '#E5E7EB',
              },
            ]}
          >
            <Heading
              level={2}
              style={styles.recoveryTitle}
              color={highContrast ? '#FFFFFF' : '#111827'}
            >
              Do these three things now
            </Heading>
            {RECOVERY_STEPS.map((step, index) => (
              <View key={step} style={styles.recoveryRow}>
                <Text style={styles.recoveryNumber}>{index + 1}.</Text>
                <Text
                  style={[
                    styles.recoveryText,
                    {
                      fontSize: getBodySize() - 1,
                      lineHeight: (getBodySize() - 1) * 1.45,
                      color: highContrast ? '#E2E8F0' : '#374151',
                    },
                  ]}
                >
                  {step}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Pressable
          onPress={() => navigate(ROUTES.checkResult)}
          accessibilityRole="button"
          accessibilityLabel="See the full result"
          style={({ pressed }: { pressed: boolean }) => [
            styles.textLink,
            { opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Text style={[styles.textLinkText, { color: highContrast ? '#FFFFFF' : '#183E2A' }]}>
            See the full result
          </Text>
        </Pressable>

        <Pressable
          onPress={() => navigate(ROUTES.home)}
          accessibilityRole="button"
          accessibilityLabel="Back to home"
          style={({ pressed }: { pressed: boolean }) => [
            styles.textLink,
            { opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Text style={[styles.textLinkText, { color: highContrast ? '#FFFFFF' : '#183E2A' }]}>
            Back to home
          </Text>
        </Pressable>
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
  hero: {
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    marginTop: 6,
    letterSpacing: -0.4,
  },
  heroText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 29,
    marginTop: 6,
  },
  steps: {
    marginBottom: 6,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
  },
  stepNumber: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#B91C1C',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  stepTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  stepTitle: {
    fontWeight: '900',
    marginBottom: 3,
  },
  stepBody: {
    fontWeight: '500',
  },
  safeWord: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  safeWordText: {
    fontWeight: '800',
    lineHeight: 26,
  },
  helperText: {
    fontSize: 18,
    lineHeight: 25,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 6,
  },
  textLink: {
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textLinkText: {
    fontSize: 20,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  recoveryCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 6,
  },
  recoveryTitle: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 10,
  },
  recoveryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recoveryNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#B91C1C',
    marginRight: 8,
    lineHeight: 26,
  },
  recoveryText: {
    flex: 1,
    fontWeight: '500',
  },
});
