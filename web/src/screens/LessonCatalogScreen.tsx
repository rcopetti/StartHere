/**
 * Coach — Session Catalog
 * A short, filterable list of practice sessions. Each session opens the existing quiz flow.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { BigButton } from '../components/BigButton';
import { Heading } from '../components/Heading';
import { ROUTES } from '../navigation/routes';
import type { LessonDocument, LessonTrack } from '../types';

type FilterId = 'all' | LessonTrack;

const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: 'all', label: 'All sessions' },
  { id: 'basics', label: 'Phone basics' },
  { id: 'everyday', label: 'Everyday tasks' },
  { id: 'safety', label: 'Safety' },
];

const TRACK_LABELS: Record<LessonTrack, string> = {
  basics: 'Phone basics',
  everyday: 'Everyday tasks',
  safety: 'Safety',
};

export const LessonCatalogScreen: React.FC = () => {
  const { allLessons, startLesson, loading, fontSize, highContrast } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterId>('all');

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

  const filteredLessons =
    filter === 'all' ? allLessons : allLessons.filter((lesson) => lesson.track === filter);

  const openLesson = (lesson: LessonDocument) => {
    startLesson(lesson);
    navigate(ROUTES.coachLesson(lesson.lessonId));
  };

  return (
    <View style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#FAF8F5' }]}>
      <AppHeader
        title="Tech Coach"
        showBack
        onBack={() => navigate(ROUTES.home)}
        showPersonMenu
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.intro}>
          <Heading level={1} style={styles.title} color={highContrast ? '#FFFFFF' : '#17212B'}>
            Choose a short practice.
          </Heading>
          <Text
            style={[
              styles.subtitle,
              {
                fontSize: getBodySize(),
                color: highContrast ? '#CBD5E1' : '#435159',
                lineHeight: getBodySize() * 1.4,
              },
            ]}
          >
            Each session has five questions. Take them one at a time, at your own pace.
          </Text>
        </View>

        <View style={styles.filters}>
          {FILTERS.map((item) => {
            const isSelected = filter === item.id;
            return (
              <Pressable
                key={item.id}
                onPress={() => setFilter(item.id)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                aria-pressed={isSelected}
                style={({ pressed }: { pressed: boolean }) => [
                  styles.chip,
                  {
                    backgroundColor: isSelected
                      ? highContrast
                        ? '#334155'
                        : '#E4EEE6'
                      : highContrast
                      ? '#1E293B'
                      : '#FFFFFF',
                    borderColor: isSelected ? '#1E5E3A' : highContrast ? '#FFFFFF' : '#CDD8D2',
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isSelected ? '#183E2A' : highContrast ? '#FFFFFF' : '#31434B',
                      fontWeight: isSelected ? '800' : '700',
                    },
                  ]}
                >
                  {isSelected ? `✓ ${item.label}` : item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {loading && allLessons.length === 0 && (
          <View style={styles.emptyCard}>
            <Heading level={2} style={styles.emptyTitle} color={highContrast ? '#FFFFFF' : '#17212B'}>
              Getting your sessions ready…
            </Heading>
            <Text style={styles.emptySubtitle}>This will only take a moment.</Text>
          </View>
        )}

        {!loading && filteredLessons.length === 0 && (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
                borderColor: highContrast ? '#FFFFFF' : '#E0E5E1',
              },
            ]}
          >
            <Heading level={2} style={styles.emptyTitle} color={highContrast ? '#FFFFFF' : '#17212B'}>
              Nothing to practice here yet.
            </Heading>
            <Text style={styles.emptySubtitle}>
              You can still check a message if something seems off.
            </Text>
            <View style={styles.emptyAction}>
              <BigButton
                label="Check a message"
                variant="navy"
                onPress={() => navigate(ROUTES.check)}
                minHeight={64}
              />
            </View>
          </View>
        )}

        {filteredLessons.map((lesson) => (
          <Pressable
            key={lesson.lessonId}
            onPress={() => openLesson(lesson)}
            accessibilityRole="button"
            accessibilityLabel={`Start session: ${lesson.title}`}
            style={({ pressed }: { pressed: boolean }) => [
              styles.sessionCard,
              {
                backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
                borderColor: highContrast ? '#FFFFFF' : '#E0E5E1',
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <View style={styles.sessionTop}>
              <Text style={[styles.trackLabel, { color: highContrast ? '#CBD5E1' : '#52605F' }]}>
                {TRACK_LABELS[lesson.track]}
              </Text>
              <Text style={[styles.metaLabel, { color: highContrast ? '#CBD5E1' : '#52605F' }]}>
                {lesson.minutes} min · {lesson.steps.length} questions
              </Text>
            </View>

            <Text style={[styles.sessionTitle, { color: highContrast ? '#FFFFFF' : '#17212B' }]}>
              {lesson.title}
            </Text>
            <Text
              style={[
                styles.sessionGoal,
                {
                  fontSize: getBodySize(),
                  color: highContrast ? '#E2E8F0' : '#435159',
                  lineHeight: getBodySize() * 1.35,
                },
              ]}
            >
              {lesson.goal}
            </Text>
            <Text style={[styles.sessionLink, { color: highContrast ? '#FFFFFF' : '#183E2A' }]}>
              Start session ›
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
  },
  intro: {
    marginBottom: 18,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 37,
    marginBottom: 8,
  },
  subtitle: {
    fontWeight: '500',
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  chip: {
    minHeight: 64,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderWidth: 2,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 18,
  },
  sessionCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  sessionTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  trackLabel: {
    fontSize: 18,
    fontWeight: '800',
  },
  metaLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  sessionTitle: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 29,
    marginBottom: 6,
  },
  sessionGoal: {
    marginBottom: 10,
  },
  sessionLink: {
    fontSize: 19,
    fontWeight: '800',
    paddingVertical: 8,
  },
  emptyCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E0E5E1',
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 20,
    color: '#475569',
    lineHeight: 27,
  },
  emptyAction: {
    marginTop: 14,
  },
});
