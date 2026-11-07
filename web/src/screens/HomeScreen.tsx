/**
 * Screen 2: Senior Home Screen (Hub)
 * Emphasizes 3 primary action cards with generous touch spacing and warm color accents.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { BigButton } from '../components/BigButton';

export const HomeScreen: React.FC = () => {
  const { user, setScreen, fontSize, highContrast, triggerEmergencyHelp, trustedContacts } = useApp();
  const [helpSent, setHelpSent] = useState(false);

  const getBodySize = () => {
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

  const handleEmergencyHelp = async () => {
    await triggerEmergencyHelp();
    setHelpSent(true);
    setTimeout(() => setHelpSent(false), 5000);
  };

  const contactNames = trustedContacts.length > 0
    ? trustedContacts.map((c) => `${c.name} (${c.relationship})`).join(', ')
    : 'Sarah (Daughter), Tom (Son)';

  return (
    <View style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#F8FAFC' }]}>
      <AppHeader title="StartHere" showSettings />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Welcome Greeting */}
        <View style={styles.greetingSection}>
          <Text
            style={[
              styles.greetingTitle,
              { color: highContrast ? '#FFFFFF' : '#0F172A' },
            ]}
          >
            Good afternoon, {user?.displayName ? user.displayName.split(' ')[0] : 'Eleanor'}! ☀️
          </Text>
          <Text
            style={[
              styles.greetingSubtitle,
              {
                fontSize: getBodySize(),
                color: highContrast ? '#CBD5E1' : '#475569',
              },
            ]}
          >
            What would you like to do today?
          </Text>
        </View>

        {/* Emergency Confirmation Banner if just pressed */}
        {helpSent && (
          <View style={styles.helpAlertBanner}>
            <Text style={styles.helpAlertText}>
              🚨 Help alert sent to your family circle! Sarah and Tom were notified.
            </Text>
          </View>
        )}

        {/* Action Card 1: Learn Something New */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
              borderColor: highContrast ? '#FFFFFF' : '#E2E8F0',
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardEmoji}>🎓</Text>
            <Text style={[styles.cardTitle, { color: highContrast ? '#FFFFFF' : '#0F172A' }]}>
              LEARN SOMETHING NEW
            </Text>
          </View>

          <Text
            style={[
              styles.cardDescription,
              {
                fontSize: getBodySize(),
                color: highContrast ? '#E2E8F0' : '#334155',
                lineHeight: getBodySize() * 1.45,
              },
            ]}
          >
            Practice spotting fake bank texts, strange bills, and package tricks with friendly, bite-sized scenarios.
          </Text>

          <BigButton
            label="START A LESSON  ➔"
            variant="primary"
            onPress={() => setScreen('catalog')}
            minHeight={56}
          />
        </View>

        {/* Action Card 2: Check a Suspicious Message */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
              borderColor: highContrast ? '#FFFFFF' : '#E2E8F0',
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardEmoji}>🛡️</Text>
            <Text style={[styles.cardTitle, { color: highContrast ? '#FFFFFF' : '#0F172A' }]}>
              CHECK A SUSPICIOUS MESSAGE
            </Text>
          </View>

          <Text
            style={[
              styles.cardDescription,
              {
                fontSize: getBodySize(),
                color: highContrast ? '#E2E8F0' : '#334155',
                lineHeight: getBodySize() * 1.45,
              },
            ]}
          >
            Got a weird text, bill, or popup? Paste it or take a photo to see right away if it is safe or a scam.
          </Text>

          <BigButton
            label="CHECK A MESSAGE NOW  ➔"
            variant="primary"
            onPress={() => setScreen('scam-check')}
            minHeight={56}
          />
        </View>

        {/* Action Card 3: Family Safety Circle */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
              borderColor: highContrast ? '#FFFFFF' : '#E2E8F0',
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardEmoji}>👨‍👩‍👧</Text>
            <Text style={[styles.cardTitle, { color: highContrast ? '#FFFFFF' : '#0F172A' }]}>
              FAMILY SAFETY CIRCLE
            </Text>
          </View>

          <Text
            style={[
              styles.cardDescription,
              {
                fontSize: getBodySize() - 2,
                color: highContrast ? '#CBD5E1' : '#64748B',
                lineHeight: (getBodySize() - 2) * 1.4,
              },
            ]}
          >
            Connected with: {contactNames}
          </Text>

          <BigButton
            label="🚨 ASK FAMILY FOR HELP"
            variant="danger"
            onPress={handleEmergencyHelp}
            minHeight={56}
          />

          <View style={{ marginTop: 8 }}>
            <BigButton
              label="View Trusted Contacts"
              variant="outline"
              onPress={() => setScreen('family')}
              minHeight={48}
            />
          </View>
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
  greetingSection: {
    marginVertical: 14,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  greetingSubtitle: {
    fontWeight: '500',
  },
  helpAlertBanner: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#DC2626',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  helpAlertText: {
    color: '#991B1B',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  card: {
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardEmoji: {
    fontSize: 28,
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  cardDescription: {
    marginBottom: 16,
  },
});
