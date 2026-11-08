/**
 * Screen 9: Family Member / Carer View (Mobile Portal)
 * Real-time companion portal displaying high-priority alerts with "I've got it" acknowledgment.
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { CircleCheck, UserRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { BigButton } from '../components/BigButton';
import { Heading } from '../components/Heading';
import { ROUTES } from '../navigation/routes';

export const FamilyPortalScreen: React.FC = () => {
  const { alerts, acknowledgeFamilyAlert, setRole, highContrast } = useApp();
  const navigate = useNavigate();

  return (
    <View style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#FAF8F5' }]}>
      <AppHeader
        title="Family Portal"
        showBack
        onBack={() => navigate(ROUTES.home)}
        showPersonMenu
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Heading level={1} style={styles.srOnly}>Family Portal</Heading>
        {/* Protected Senior Profile Card */}
        <View
          style={[
            styles.seniorHeaderCard,
            {
              backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
              borderColor: highContrast ? '#FFFFFF' : '#E2E8F0',
            },
          ]}
        >
          <View style={styles.seniorAvatarCircle}>
            <UserRound size={28} strokeWidth={2.2} color="#18334D" aria-hidden="true" focusable="false" />
          </View>
          <View style={styles.seniorInfo}>
            <Text style={[styles.seniorName, { color: highContrast ? '#FFFFFF' : '#0F172A' }]}>
              Protected Senior: Eleanor Miller
            </Text>
            <Text style={styles.seniorPhone}>Phone: (555) 345-6789</Text>
            <Text style={styles.seniorStatus}>Safety monitoring: active</Text>
          </View>
        </View>

        {/* Incoming Alerts Header */}
        <Heading level={2} style={styles.sectionHeading} color={highContrast ? '#FFFFFF' : '#0F172A'}>
          Safety alerts and notifications ({alerts.length})
        </Heading>

        {alerts.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
                borderColor: highContrast ? '#FFFFFF' : '#E2E8F0',
              },
            ]}
          >
            <CircleCheck size={40} strokeWidth={2.2} color="#059669" aria-hidden="true" focusable="false" style={{ marginBottom: 8 }} />
            <Heading level={2} style={styles.emptyTitle} color={highContrast ? '#FFFFFF' : '#0F172A'}>
              All is calm
            </Heading>
            <Text style={styles.emptySubtitle}>
              Eleanor has not sent any emergency requests or encountered high-risk scams today.
            </Text>
          </View>
        ) : (
          alerts.map((alert) => {
            const isAcked = !!alert.ackAt;
            const isScam = alert.type === 'scam_detected';

            return (
              <View
                key={alert.id}
                style={[
                  styles.alertCard,
                  {
                    backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
                    borderColor: isScam ? '#DC2626' : '#E11D48',
                  },
                ]}
              >
                {/* Alert Top Badge */}
                <View style={[styles.alertBadge, { backgroundColor: isScam ? '#FEE2E2' : '#FFE4E6' }]}>
                  <Text style={[styles.alertBadgeText, { color: isScam ? '#991B1B' : '#9F1239' }]}>
                    {isScam ? '🚨 HIGH-RISK SCAM DETECTED' : '🚨 EMERGENCY HELP REQUEST'}
                  </Text>
                </View>

                <Text style={styles.alertTimestamp}>
                  Received: {new Date(alert.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>

                <Text style={[styles.alertHeadline, { color: highContrast ? '#FFFFFF' : '#0F172A' }]}>
                  {alert.headline}
                </Text>

                <Text style={styles.alertSummary}>{alert.summary}</Text>

                <View style={styles.alertStatusBox}>
                  <Text style={styles.statusLabel}>Status:</Text>
                  <Text style={[styles.statusValue, { color: isAcked ? '#059669' : '#D97706' }]}>
                    {isAcked
                      ? `✅ Handled by ${alert.acknowledgedBy || 'Sarah'}`
                      : '🟡 Awaiting acknowledgment'}
                  </Text>
                </View>

                {/* Response Actions */}
                <View style={styles.actionRow}>
                  {!isAcked && (
                    <BigButton
                      label="✅ I'VE GOT IT — HANDLING NOW"
                      variant="success"
                      onPress={() => acknowledgeFamilyAlert(alert.id)}
                      minHeight={52}
                    />
                  )}

                  <View style={{ marginTop: isAcked ? 0 : 8 }}>
                    <BigButton
                      label="📞 CALL ELEANOR (MOM)"
                      variant="primary"
                      onPress={() => window.open(`tel:${alert.seniorPhone || '5553456789'}`, '_self')}
                      minHeight={50}
                    />
                  </View>
                </View>
              </View>
            );
          })
        )}

        {/* Switch Role shortcut */}
        <View style={styles.switchRoleCard}>
          <Heading level={2} style={styles.switchRoleTitle} color={highContrast ? '#FFFFFF' : '#0F172A'}>
            Switch to senior phone view
          </Heading>
          <Text style={styles.switchRoleSubtitle}>
            Want to see how StartHere looks on Eleanor's phone?
          </Text>
          <BigButton
            label="SWITCH TO SENIOR VIEW"
            variant="outline"
            onPress={() => {
              setRole('senior');
              navigate(ROUTES.home);
            }}
            minHeight={48}
          />
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
  seniorHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  seniorAvatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  seniorInfo: {
    flex: 1,
  },
  seniorName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  seniorPhone: {
    fontSize: 18,
    color: '#475569',
    marginBottom: 2,
  },
  seniorStatus: {
    fontSize: 18,
    color: '#065F46',
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  emptyCard: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 18,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
  },
  alertCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  alertBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 8,
  },
  alertBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  alertTimestamp: {
    fontSize: 18,
    color: '#475569',
    marginBottom: 6,
    fontWeight: '500',
  },
  alertHeadline: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  alertSummary: {
    fontSize: 18,
    color: '#334155',
    lineHeight: 24,
    marginBottom: 12,
  },
  alertStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  statusLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#475569',
    marginRight: 8,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  actionRow: {
    marginTop: 4,
  },
  switchRoleCard: {
    marginTop: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  switchRoleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  switchRoleSubtitle: {
    fontSize: 18,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 12,
  },
});
