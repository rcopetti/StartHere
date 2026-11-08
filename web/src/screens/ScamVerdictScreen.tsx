/**
 * Screen 7: Scam Verdict States
 * State 7A (Likely Scam), State 7B (Caution), State 7C (Looks Safe)
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { BigButton } from '../components/BigButton';
import { Heading } from '../components/Heading';
import { VerdictBanner } from '../components/VerdictBanner';
import { ROUTES } from '../navigation/routes';

export const ScamVerdictScreen: React.FC = () => {
  const { activeScamResult, fontSize, highContrast, triggerEmergencyHelp } = useApp();
  const [alertSent, setAlertSent] = useState(false);
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

  const handleNotifyFamily = async () => {
    await triggerEmergencyHelp();
    setAlertSent(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#FAF8F5' }]}>
      <AppHeader
        title="Scam Result"
        showBack
        onBack={() => navigate(ROUTES.check)}
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
              Alert sent to Sarah and Tom. Your family has been notified.
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
          <Heading level={2} style={styles.sectionLabel} color={highContrast ? '#CBD5E1' : '#475569'}>
            What we found
          </Heading>
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
          <Heading level={2} style={[styles.sectionLabel, { marginTop: 14 }]} color={highContrast ? '#CBD5E1' : '#475569'}>
            What this means
          </Heading>
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
          <Heading level={2} style={[styles.sectionLabel, { marginTop: 14 }]} color={highContrast ? '#CBD5E1' : '#475569'}>
            What to do now
          </Heading>
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
            {activeScamResult.action}
          </Text>

          {/* Signals */}
          {activeScamResult.signals && activeScamResult.signals.length > 0 && (
            <View style={{ marginTop: 14 }}>
              <Heading level={2} style={styles.sectionLabel} color={highContrast ? '#CBD5E1' : '#475569'}>
                Warning signs
              </Heading>
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
              {activeScamResult.stopScreenRequired ? (
                <BigButton
                  label="What do I do now?"
                  variant="danger"
                  onPress={() => navigate(ROUTES.checkStop)}
                  minHeight={64}
                />
              ) : (
                <BigButton
                  label="Notify family about this scam"
                  variant="danger"
                  onPress={handleNotifyFamily}
                  minHeight={64}
                />
              )}
              <View style={{ marginTop: 8 }}>
                <BigButton
                  label="I deleted the message — all set"
                  variant="success"
                  onPress={() => navigate(ROUTES.home)}
                  minHeight={64}
                />
              </View>
            </>
          )}

          {activeScamResult.verdict === 'caution' && (
            <>
              <BigButton
                label="Ask family to double-check"
                variant="primary"
                onPress={handleNotifyFamily}
                minHeight={64}
              />
              <View style={{ marginTop: 8 }}>
                <BigButton
                  label="Back to home"
                  variant="outline"
                  onPress={() => navigate(ROUTES.home)}
                  minHeight={64}
                />
              </View>
            </>
          )}

          {activeScamResult.verdict === 'looks_safe' && (
            <BigButton
              label="Back to home"
              variant="primary"
              onPress={() => navigate(ROUTES.home)}
              minHeight={64}
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
    fontSize: 18,
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
    fontSize: 18,
    fontWeight: '800',
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
