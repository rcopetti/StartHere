/**
 * Screen 5: Lesson Completed (Summary Card)
 * Celebrates progress, reinforces key takeaways, and displays score.
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Navigate, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { BigButton } from '../components/BigButton';
import { ROUTES } from '../navigation/routes';

export const LessonSummaryScreen: React.FC = () => {
  const { user, activeLesson, scenarioAnswers, fontSize, highContrast } = useApp();
  const navigate = useNavigate();

  if (!activeLesson) {
    return <Navigate to={ROUTES.coach} replace />;
  }

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

  const total = scenarioAnswers.length || 5;
  const correctCount = scenarioAnswers.filter((a) => a.isCorrect).length;
  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Eleanor';

  return (
    <View style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#FAF8F5' }]}>
      <AppHeader title="Lesson Completed!" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.celebrateHeader}>
          <Text style={styles.celebrateEmoji}>🎉</Text>
          <Text
            style={[
              styles.celebrateTitle,
              { color: highContrast ? '#FFFFFF' : '#0F172A' },
            ]}
          >
            Great Job, {firstName}!
          </Text>
          <Text
            style={[
              styles.lessonFinishedName,
              {
                fontSize: getBodySize(),
                color: highContrast ? '#CBD5E1' : '#475569',
              },
            ]}
          >
            You finished: "{activeLesson?.title || 'Safety Practice'}"
          </Text>
        </View>

        {/* Score Card */}
        <View
          style={[
            styles.scoreCard,
            {
              backgroundColor: correctCount === total ? '#ECFDF5' : '#EFF6FF',
              borderColor: correctCount === total ? '#10B981' : '#3B82F6',
            },
          ]}
        >
          <Text
            style={[
              styles.scoreBig,
              { color: correctCount === total ? '#047857' : '#1D4ED8' },
            ]}
          >
            🌟 {correctCount} of {total} Correct!
          </Text>
          <Text
            style={[
              styles.scoreSubtitle,
              { color: correctCount === total ? '#065F46' : '#1E40AF' },
            ]}
          >
            {correctCount === total
              ? 'Perfect score! You are getting sharper at spotting scams every day.'
              : 'Wonderful effort! You caught the tricky warning signs.'}
          </Text>
        </View>

        {/* Takeaways Card */}
        <View
          style={[
            styles.takeawaysCard,
            {
              backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
              borderColor: highContrast ? '#FFFFFF' : '#E2E8F0',
            },
          ]}
        >
          <Text
            style={[
              styles.takeawaysTitle,
              { color: highContrast ? '#FFFFFF' : '#0F172A' },
            ]}
          >
            WHAT YOU LEARNED TODAY:
          </Text>

          <Text
            style={[
              styles.takeawaysBody,
              {
                fontSize: getBodySize() - 1,
                color: highContrast ? '#E2E8F0' : '#334155',
                lineHeight: (getBodySize() - 1) * 1.5,
              },
            ]}
          >
            {activeLesson?.finishTemplate ||
              '1. Real companies never ask for verification codes or passwords.\n2. Small fee links are tricks to steal cards.\n3. When unsure, call the number on your bank card or ask family.'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <BigButton
            label="PRACTICE ANOTHER TOPIC  ➔"
            variant="primary"
            onPress={() => navigate(ROUTES.coach)}
            minHeight={56}
          />

          <View style={{ marginTop: 10 }}>
            <BigButton
              label="RETURN TO HOME SCREEN"
              variant="outline"
              onPress={() => navigate(ROUTES.home)}
              minHeight={52}
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
    padding: 20,
    paddingBottom: 40,
  },
  celebrateHeader: {
    alignItems: 'center',
    marginVertical: 14,
  },
  celebrateEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  celebrateTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  lessonFinishedName: {
    fontWeight: '600',
    textAlign: 'center',
  },
  scoreCard: {
    borderRadius: 18,
    borderWidth: 2,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  scoreBig: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  scoreSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  takeawaysCard: {
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
  takeawaysTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 12,
  },
  takeawaysBody: {
    fontWeight: '500',
  },
  actionSection: {
    marginTop: 6,
  },
});
