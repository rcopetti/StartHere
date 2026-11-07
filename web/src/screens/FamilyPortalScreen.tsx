/**
 * Screen 9: Family Member / Carer View (Mobile Portal)
 * Real-time companion portal displaying high-priority alerts with "I've got it" acknowledgment.
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { BigButton } from '../components/BigButton';

export const FamilyPortalScreen: React.FC = () => {
  const { alerts, acknowledgeFamilyAlert, setRole, setScreen, highContrast } = useApp();

  return (
    <View style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#F8FAFC' }]}>
      <AppHeader
        title="Family Portal"
        rightLabel="Sarah (Daughter)"
        showSettings
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
            <Text style={{ fontSize: 28 }}>👵</Text>
          </View>
          <View style={styles.seniorInfo}>
            <Text style={[styles.seniorName, { color: highContrast ? '#FFFFFF' : '#0F172A' }]}>
              Protected Senior: Eleanor Miller
            </Text>
            <Text style={styles.seniorPhone}>Phone: (555) 345-6789</Text>
            <Text style={styles.seniorStatus}>🟢 Safety Monitoring: Active</Text>
          </View>
        </View>

        {/* Incoming Alerts Header */}
        <Text style={[styles.sectionHeading, { color: highContrast ? '#FFFFFF' : '#0F172A' }]}>
          SAFETY ALERTS & NOTIFICATIONS ({alerts.length}):
        </Text>

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
            <Text style={{ fontSize: 32, marginBottom: 8 }}>✅</Text>
            <Text style={[styles.emptyTitle, { color: highContrast ? '#FFFFFF' : '#0F172A' }]}>
              All is calm
            </Text>
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
                  <Text style={styles.statusLabel}>STATUS:</Text>
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
          <Text style={styles.switchRoleTitle}>Switch to Senior Phone View</Text>
          <Text style={styles.switchRoleSubtitle}>
            Want to see how StartHere looks on Eleanor's phone?
          </Text>
          <BigButton
            label="SWITCH TO SENIOR VIEW"
            variant="outline"
            onPress={() => {
              setRole('senior');
              setScreen('home');
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
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  seniorStatus: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
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
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
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
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  alertTimestamp: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 6,
    fontWeight: '500',
  },
  alertHeadline: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  alertSummary: {
    fontSize: 16,
    color: '#334155',
    lineHeight: 24,
    marginBottom: 12,
  },
  alertStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginRight: 8,
  },
  statusValue: {
    fontSize: 14,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  switchRoleSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 12,
  },
});
