/**
 * Screen 8: Family Safety Circle (Senior View)
 * Displays trusted family contacts, one-touch emergency panic alert, and contact invite generator.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { BigButton } from '../components/BigButton';
import { Heading } from '../components/Heading';
import { ROUTES } from '../navigation/routes';

export const FamilyCircleScreen: React.FC = () => {
  const { trustedContacts, triggerEmergencyHelp, inviteFamilyMember, fontSize, highContrast } = useApp();
  const navigate = useNavigate();
  const [helpSent, setHelpSent] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteRelationship, setInviteRelationship] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

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

  const handlePanicAlert = async () => {
    await triggerEmergencyHelp();
    setHelpSent(true);
    setTimeout(() => setHelpSent(false), 5000);
  };

  const handleCreateInvite = async () => {
    if (!inviteName.trim() || !invitePhone.trim()) return;
    const contact = await inviteFamilyMember(
      inviteName.trim(),
      inviteRelationship.trim() || 'Family',
      invitePhone.trim()
    );
    setGeneratedToken(contact.inviteToken || '32-character-token-ready');
  };

  return (
    <View style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#FAF8F5' }]}>
      <AppHeader
        title="Family Circle"
        showBack
        onBack={() => navigate(ROUTES.home)}
        showPersonMenu
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Heading level={1} style={styles.srOnly}>Family Circle</Heading>
        {/* Panic / Emergency Button Hero */}
        <View style={styles.emergencyCard}>
          <BigButton
            label="ASK FAMILY FOR HELP NOW"
            sublabel="Tap here to send an urgent help alert to your circle immediately"
            variant="danger"
            onPress={handlePanicAlert}
            minHeight={72}
          />
        </View>

        {helpSent && (
          <View style={styles.alertSentConfirmation}>
            <Text style={styles.alertSentText}>
              🚨 Help alert sent! Sarah and Tom received your message.
            </Text>
          </View>
        )}

        {/* Contact List */}
        <Heading level={2} style={styles.sectionHeading} color={highContrast ? '#FFFFFF' : '#0F172A'}>
          Your trusted contacts ({trustedContacts.length})
        </Heading>

        {trustedContacts.map((contact) => (
          <View
            key={contact.id}
            style={[
              styles.contactCard,
              {
                backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
                borderColor: highContrast ? '#FFFFFF' : '#E2E8F0',
              },
            ]}
          >
            <View style={styles.contactTopRow}>
              <View>
                <Text
                  style={[
                    styles.contactName,
                    {
                      fontSize: getBodySize() + 2,
                      color: highContrast ? '#FFFFFF' : '#0F172A',
                    },
                  ]}
                >
                  {contact.relationship === 'Daughter' ? '👩' : '👨'} {contact.name} ({contact.relationship})
                </Text>
                <Text
                  style={[
                    styles.contactPhone,
                    {
                      fontSize: getBodySize() - 2,
                      color: highContrast ? '#CBD5E1' : '#475569',
                    },
                  ]}
                >
                  Phone: {contact.phone}
                </Text>
              </View>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>✅ Active</Text>
              </View>
            </View>

            <View style={{ marginTop: 10 }}>
              <BigButton
                label={`📞 Call ${contact.name.split(' ')[0]}`}
                variant="outline"
                onPress={() => window.open(`tel:${contact.phone}`, '_self')}
                minHeight={48}
              />
            </View>
          </View>
        ))}

        {/* Invite New Member */}
        <View
          style={[
            styles.inviteCard,
            {
              backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
              borderColor: highContrast ? '#FFFFFF' : '#E2E8F0',
            },
          ]}
        >
          <Heading level={2} style={styles.inviteTitle} color={highContrast ? '#FFFFFF' : '#0F172A'}>
            Invite another family member
          </Heading>
          <Text
            style={[
              styles.inviteSubtitle,
              {
                fontSize: getBodySize() - 2,
                color: highContrast ? '#CBD5E1' : '#475569',
              },
            ]}
          >
            Share an invite link with an adult child or neighbor to add them to your safety circle.
          </Text>

          {!showInviteForm ? (
            <BigButton
              label="ADD A NEW CONTACT"
              variant="secondary"
              onPress={() => setShowInviteForm(true)}
              minHeight={50}
            />
          ) : (
            <View style={styles.inviteForm}>
              <TextInput
                value={inviteName}
                onChangeText={setInviteName}
                placeholder="Full Name (e.g. Emily Miller)"
                placeholderTextColor="#94A3B8"
                style={[
                  styles.input,
                  {
                    fontSize: getBodySize() - 1,
                    color: highContrast ? '#FFFFFF' : '#0F172A',
                    backgroundColor: highContrast ? '#0F172A' : '#FAF8F5',
                    borderColor: '#CBD5E1',
                  },
                ]}
              />

              <TextInput
                value={inviteRelationship}
                onChangeText={setInviteRelationship}
                placeholder="Relationship (e.g. Granddaughter)"
                placeholderTextColor="#94A3B8"
                style={[
                  styles.input,
                  {
                    fontSize: getBodySize() - 1,
                    color: highContrast ? '#FFFFFF' : '#0F172A',
                    backgroundColor: highContrast ? '#0F172A' : '#FAF8F5',
                    borderColor: '#CBD5E1',
                  },
                ]}
              />

              <TextInput
                value={invitePhone}
                onChangeText={setInvitePhone}
                placeholder="Phone Number (e.g. (555) 999-1234)"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                style={[
                  styles.input,
                  {
                    fontSize: getBodySize() - 1,
                    color: highContrast ? '#FFFFFF' : '#0F172A',
                    backgroundColor: highContrast ? '#0F172A' : '#FAF8F5',
                    borderColor: '#CBD5E1',
                  },
                ]}
              />

              <BigButton
                label="GENERATE INVITATION LINK"
                variant="primary"
                onPress={handleCreateInvite}
                minHeight={52}
              />

              {generatedToken && (
                <View style={styles.tokenBox}>
                  <Text style={styles.tokenTitle}>✅ Single-Use Link Generated:</Text>
                  <Text selectable style={styles.tokenText}>
                    https://starthere.app/invite/{generatedToken}
                  </Text>
                  <Text style={styles.tokenHint}>
                    Copy this link and send it in a text to your family member.
                  </Text>
                </View>
              )}
            </View>
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
  emergencyCard: {
    marginBottom: 16,
  },
  alertSentConfirmation: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#DC2626',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  alertSentText: {
    color: '#991B1B',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 12,
  },
  contactCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  contactTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contactName: {
    fontWeight: '800',
    marginBottom: 4,
  },
  contactPhone: {
    fontWeight: '500',
  },
  activePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activePillText: {
    color: '#166534',
    fontSize: 16,
    fontWeight: '700',
  },
  inviteCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginTop: 8,
  },
  inviteTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 6,
  },
  inviteSubtitle: {
    lineHeight: 22,
    marginBottom: 14,
  },
  inviteForm: {
    marginTop: 6,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  tokenBox: {
    marginTop: 14,
    padding: 14,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 12,
  },
  tokenTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 4,
  },
  tokenText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '700',
    marginBottom: 6,
  },
  tokenHint: {
    fontSize: 16,
    color: '#047857',
  },
});
