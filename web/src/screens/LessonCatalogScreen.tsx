/**
 * Screen 3: Patient Tech Coach — Lesson Catalog
 * Displays curated, bite-sized lessons with clear titles and zero confusing tech terminology.
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { BigButton } from '../components/BigButton';
import type { LessonDocument } from '../types';

export const LessonCatalogScreen: React.FC = () => {
  const { allLessons, startLesson, setScreen, fontSize, highContrast } = useApp();

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

  const getTrackBadge = (track: string) => {
    switch (track) {
      case 'safety':
        return { label: '🛡️ Scam Protection', color: '#DC2626' };
      case 'basics':
        return { label: '💡 Phone Basics', color: '#2563EB' };
      case 'everyday':
      default:
        return { label: '💌 Everyday Tasks', color: '#059669' };
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#F8FAFC' }]}>
      <AppHeader
        title="🎓 Tech Coach"
        showBack
        onBack={() => setScreen('home')}
        showSettings
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.introHeader}>
          <Text
            style={[
              styles.introTitle,
              { color: highContrast ? '#FFFFFF' : '#0F172A' },
            ]}
          >
            Practice at your own pace
          </Text>
          <Text
            style={[
              styles.introSubtitle,
              {
                fontSize: getBodySize(),
                color: highContrast ? '#CBD5E1' : '#475569',
              },
            ]}
          >
            Each lesson has 5 realistic practice scenarios. Tap one to start!
          </Text>
        </View>

        {allLessons.map((lesson: LessonDocument) => {
          const trackInfo = getTrackBadge(lesson.track);

          return (
            <View
              key={lesson.lessonId}
              style={[
                styles.lessonCard,
                {
                  backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
                  borderColor: highContrast ? '#FFFFFF' : '#E2E8F0',
                },
              ]}
            >
              <View style={styles.cardTopRow}>
                <Text style={[styles.trackLabel, { color: trackInfo.color }]}>
                  {trackInfo.label}
                </Text>
                <Text style={styles.timeLabel}>⏱️ {lesson.minutes} mins</Text>
              </View>

              <Text
                style={[
                  styles.lessonTitle,
                  { color: highContrast ? '#FFFFFF' : '#0F172A' },
                ]}
              >
                {lesson.title}
              </Text>

              <Text
                style={[
                  styles.lessonGoal,
                  {
                    fontSize: getBodySize() - 1,
                    color: highContrast ? '#E2E8F0' : '#334155',
                    lineHeight: (getBodySize() - 1) * 1.45,
                  },
                ]}
              >
                {lesson.goal}
              </Text>

              <BigButton
                label="START THIS LESSON  ➔"
                variant="primary"
                onPress={() => startLesson(lesson)}
                minHeight={52}
              />
            </View>
          );
        })}
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
  introHeader: {
    marginVertical: 14,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  introSubtitle: {
    lineHeight: 26,
  },
  lessonCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  timeLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  lessonTitle: {
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  lessonGoal: {
    marginBottom: 16,
  },
});
