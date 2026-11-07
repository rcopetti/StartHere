/**
 * ScenarioDeviceCard — Simulated Phone Screen Scenario
 * Directly modeled after foundation/starthere-dev-handoff/lesson_step_concept.png
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import type { ScenarioScene } from '../types';

interface ScenarioDeviceCardProps {
  scene: ScenarioScene;
}

export const ScenarioDeviceCard: React.FC<ScenarioDeviceCardProps> = ({ scene }) => {
  const { fontSize, highContrast } = useApp();

  const getBodySize = () => {
    switch (fontSize) {
      case 'standard':
        return 17;
      case 'extra_large':
        return 21;
      case 'large':
      default:
        return 19;
    }
  };

  return (
    <View
      style={[
        styles.deviceCard,
        {
          borderColor: highContrast ? '#000000' : '#E2E8F0',
          borderWidth: highContrast ? 2 : 1,
        },
      ]}
    >
      {/* Top Simulated App Navigation Header */}
      <View style={styles.headerBar}>
        <View style={styles.unreadBadge}>
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.unreadCount}>1049</Text>
        </View>

        <View style={styles.contactCenter}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarIcon}>👤</Text>
          </View>
          <Text numberOfLines={1} style={styles.senderTitle}>
            {scene.sender} ›
          </Text>
        </View>

        <View style={{ width: 44 }} />
      </View>

      {/* Subheader info: Channel & Timestamp */}
      <View style={styles.timestampContainer}>
        <Text style={styles.timestampText}>{scene.senderDetail}</Text>
      </View>

      {/* Simulated Message Bubble */}
      <View style={styles.messageContainer}>
        <View style={styles.speechBubble}>
          <Text
            style={[
              styles.bubbleText,
              {
                fontSize: getBodySize(),
                color: '#0F172A',
                lineHeight: getBodySize() * 1.45,
              },
            ]}
          >
            {scene.content}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  deviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  headerBar: {
    height: 72,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  unreadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  backChevron: {
    color: '#2563EB',
    fontSize: 20,
    fontWeight: '800',
    marginRight: 2,
  },
  unreadCount: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
  },
  contactCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  avatarIcon: {
    fontSize: 18,
  },
  senderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  timestampContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  timestampText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  messageContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 4,
    backgroundColor: '#FFFFFF',
  },
  speechBubble: {
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    maxWidth: '92%',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bubbleText: {
    fontWeight: '500',
  },
});
