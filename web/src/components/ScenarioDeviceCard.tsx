/**
 * ScenarioDeviceCard — Simulated Phone Screen Scenario
 * Directly modeled after foundation/starthere-dev-handoff/lesson_step_concept.png
 */

import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { ChevronLeft, UserRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ScenarioScene } from '../types';

interface ScenarioDeviceCardProps {
  scene: ScenarioScene;
}

export const ScenarioDeviceCard: React.FC<ScenarioDeviceCardProps> = ({ scene }) => {
  const { fontSize, highContrast } = useApp();
  const { width } = useWindowDimensions();
  const isNarrow = width < 360;

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
      <View style={[styles.headerBar, isNarrow && styles.headerBarNarrow]}>
        {!isNarrow && (
          <View style={styles.unreadBadge}>
            <ChevronLeft size={18} strokeWidth={2.4} color="#2563EB" aria-hidden="true" focusable="false" />
            <Text style={styles.unreadCount}>1049</Text>
          </View>
        )}

        <View style={styles.contactCenter}>
          <View style={styles.avatarCircle}>
            <UserRound size={20} strokeWidth={2.2} color="#FFFFFF" aria-hidden="true" focusable="false" />
          </View>
          <Text numberOfLines={1} style={styles.senderTitle}>
            {scene.sender} ›
          </Text>
        </View>

        {!isNarrow && <View style={{ width: 44 }} />}
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
    minHeight: 72,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerBarNarrow: {
    justifyContent: 'center',
  },
  unreadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadCount: {
    color: '#2563EB',
    fontSize: 18,
    fontWeight: '700',
  },
  contactCenter: {
    flex: 1,
    minWidth: 0,
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
  senderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
  },
  timestampContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  timestampText: {
    fontSize: 18,
    color: '#475569',
    fontWeight: '600',
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
