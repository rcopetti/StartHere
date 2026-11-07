/**
 * Screen 7: Scam Verdict States
 * State 7A (Likely Scam), State 7B (Caution), State 7C (Looks Safe)
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { BigButton } from '../components/BigButton';
import { VerdictBanner } from '../components/VerdictBanner';

export const ScamVerdictScreen: React.FC = () => {
  const { activeScamResult, setScreen, fontSize, highContrast, triggerEmergencyHelp } = useApp();
  const [alertSent, setAlertSent] = useState(false);

  if (!activeScamResult) {
    return null;
  }

  const getBodySize = () => {
    switch (fontSize) {
      case 'standard':
        return 17;
      case 'extra_large':
        return 22;
      case 'large':
      default:
        return 19;
    }
  };

  const handleNotifyFamily = async () => {
    await triggerEmergencyHelp();
    setAlertSent(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#F8FAFC' }]}>
      <AppHeader
        title="🛡️ Scam Result"
        showBack
        onBack={() => setScreen('scam-check')}
        showSettings
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Banner */}
        <VerdictBanner
          verdict={activeScamResult.verdict}
          riskScore={activeScamResult.riskScore}
        />

        {alertSent && (
          <View style={styles.alertSentConfirmation}>
            <Text style={styles.alertSentText}>
              ✅ Alert sent to Sarah and Tom! Your family has been notified.
            </Text>
          </View>
        )}

        {/* Content Details Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
              borderColor: highContrast ? '#FFFFFF' : '#E2E8F0',
            },
          ]}
        >
          {/* Headline */}
          <Text style={[styles.sectionLabel, { color: highContrast ? '#CBD5E1' : '#64748B' }]}>
            HEADLINE:
          </Text>
          <Text
            style={[
              styles.headlineText,
              {
                fontSize: getBodySize() + 3,
                color: highContrast ? '#FFFFFF' : '#0F172A',
              },
            ]}
          >
            {activeScamResult.headline}
          </Text>

          {/* Explanation */}
          <Text style={[styles.sectionLabel, { color: highContrast ? '#CBD5E1' : '#64748B', marginTop: 14 }]}>
            WHAT THIS MEANS:
          </Text>
          <Text
            style={[
              styles.bodyText,
              {
                fontSize: getBodySize(),
                color: highContrast ? '#F1F5F9' : '#1E293B',
                lineHeight: getBodySize() * 1.5,
              },
            ]}
          >
            {activeScamResult.explanation}
          </Text>

          {/* Action */}
          <Text style={[styles.sectionLabel, { color: highContrast ? '#CBD5E1' : '#64748B', marginTop: 14 }]}>
            RECOMMENDED ACTION:
          </Text>
          <Text
            style={[
              styles.actionText,
              {
                fontSize: getBodySize(),
                color: activeScamResult.verdict === 'likely_scam' ? '#DC2626' : highContrast ? '#FFFFFF' : '#0F172A',
                lineHeight: getBodySize() * 1.45,
              },
            ]}
          >
            👉 {activeScamResult.action}
          </Text>

          {/* Signals */}
          {activeScamResult.signals && activeScamResult.signals.length > 0 && (
            <View style={{ marginTop: 14 }}>
              <Text style={[styles.sectionLabel, { color: highContrast ? '#CBD5E1' : '#64748B' }]}>
                WARNING SIGNS FOUND:
              </Text>
              {activeScamResult.signals.map((sig, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text
                    style={[
                      styles.bulletText,
                      {
                        fontSize: getBodySize() - 2,
                        color: highContrast ? '#CBD5E1' : '#475569',
                      },
                    ]}
                  >
                    {sig}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonStack}>
          {activeScamResult.verdict === 'likely_scam' && (
            <>
              <BigButton
                label="🚨 NOTIFY FAMILY ABOUT THIS SCAM"
                variant="danger"
                onPress={handleNotifyFamily}
                minHeight={56}
              />
              <View style={{ marginTop: 8 }}>
                <BigButton
                  label="🗑️ I DELETED THE MESSAGE — ALL SET"
                  variant="success"
                  onPress={() => setScreen('home')}
                  minHeight={52}
                />
              </View>
            </>
          )}

          {activeScamResult.verdict === 'caution' && (
            <>
              <BigButton
                label="👨‍👩‍👧 ASK FAMILY TO DOUBLE-CHECK"
                variant="primary"
                onPress={handleNotifyFamily}
                minHeight={56}
              />
              <View style={{ marginTop: 8 }}>
                <BigButton
                  label="BACK TO HOME SCREEN"
                  variant="outline"
                  onPress={() => setScreen('home')}
                  minHeight={52}
                />
              </View>
            </>
          )}

          {activeScamResult.verdict === 'looks_safe' && (
            <BigButton
              label="BACK TO HOME SCREEN"
              variant="primary"
              onPress={() => setScreen('home')}
              minHeight={56}
            />
          )}
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
  alertSentConfirmation: {
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  alertSentText: {
    color: '#065F46',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headlineText: {
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  bodyText: {
    fontWeight: '500',
  },
  actionText: {
    fontWeight: '800',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  bulletDot: {
    color: '#DC2626',
    fontSize: 18,
    marginRight: 8,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    lineHeight: 22,
  },
  buttonStack: {
    marginTop: 4,
  },
});
