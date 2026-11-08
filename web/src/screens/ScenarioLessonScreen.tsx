/**
 * Screen 4: Active Lesson Turn (Interactive Coach — Scenario Case)
 * Modeled after foundation/starthere-dev-handoff/lesson_step_concept.png
 * Features State 4A (Challenge Scene) and State 4B (Instant Coach Explanation & Verdict Feedback)
 */

import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { BigButton } from '../components/BigButton';
import { ScenarioDeviceCard } from '../components/ScenarioDeviceCard';
import { ROUTES } from '../navigation/routes';

export const ScenarioLessonScreen: React.FC = () => {
  const {
    allLessons,
    activeLesson,
    activeStepIndex,
    currentStep,
    isScenarioAnswered,
    latestAnswer,
    answerScenario,
    nextScenario,
    exitLesson,
    startLesson,
    loading,
    fontSize,
    highContrast,
  } = useApp();
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const routeLesson = allLessons.find((lesson) => lesson.lessonId === lessonId);

  useEffect(() => {
    if (!lessonId) return;
    if (!activeLesson || activeLesson.lessonId !== lessonId) {
      if (routeLesson) startLesson(routeLesson);
    }
  }, [lessonId, activeLesson, routeLesson, startLesson]);

  if (!lessonId) {
    return <Navigate to={ROUTES.coach} replace />;
  }

  if (!activeLesson || !currentStep || activeLesson.lessonId !== lessonId) {
    if (!loading && !routeLesson) {
      return <Navigate to={ROUTES.coach} replace />;
    }

    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Getting your session ready…</Text>
      </View>
    );
  }

  const totalSteps = activeLesson.steps.length;
  const currentNum = activeStepIndex + 1;
  const progressPercent = Math.round((currentNum / totalSteps) * 100);

  const getBodySize = () => {
    switch (fontSize) {
      case 'standard':
        return 17;
      case 'extra_large':
        return 22;
      case 'large':
      default:
        return 19;
    }
  };

  const isLastQuestion = currentNum === totalSteps;

  const handleNext = () => {
    const finished = nextScenario();
    if (finished) navigate(ROUTES.coachComplete(activeLesson.lessonId));
  };

  return (
    <View style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#FAF8F5' }]}>
      {/* Top Header */}
      <AppHeader
        title="Practice"
        showClose
        onClose={() => {
          exitLesson();
          navigate(ROUTES.coach);
        }}
        rightLabel={`Q ${currentNum}/${totalSteps}`}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.lessonName, { color: highContrast ? '#CBD5E1' : '#52605F' }]}>
          {activeLesson.title}
        </Text>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text
            style={[
              styles.progressText,
              { color: highContrast ? '#CBD5E1' : '#64748B' },
            ]}
          >
            Question {currentNum} of {totalSteps}
          </Text>
        </View>

        {/* STATE 4A: Challenge Scene */}
        {!isScenarioAnswered && (
          <View>
            {/* Simulated Phone Screen Scenario */}
            <ScenarioDeviceCard scene={currentStep.scene} />

            {/* Question Prompt */}
            <View style={styles.questionPromptBox}>
              <Text
                style={[
                  styles.questionPromptText,
                  {
                    fontSize: getBodySize() + 2,
                    color: highContrast ? '#FFFFFF' : '#0F172A',
                  },
                ]}
              >
                ❓ Does this look safe, or could it be a scam?
              </Text>
            </View>

            {/* Option A: Legit */}
            <View style={styles.choiceRow}>
              <BigButton
                label="Looks safe"
                variant="outline"
                onPress={() => answerScenario('legit')}
                minHeight={58}
              />
            </View>

            {/* Option B: Scam */}
            <View style={styles.choiceRow}>
              <BigButton
                label="This is a scam"
                variant="outline"
                onPress={() => answerScenario('scam')}
                minHeight={58}
              />
            </View>
          </View>
        )}

        {/* STATE 4B: Instant Coach Explanation & Verdict Feedback */}
        {isScenarioAnswered && latestAnswer && (
          <View style={styles.feedbackSection}>
            {/* Feedback Verdict Banner */}
            <View
              style={[
                styles.feedbackBanner,
                {
                  backgroundColor: latestAnswer.isCorrect
                    ? highContrast
                      ? '#064E3B'
                      : '#D1FAE5'
                    : highContrast
                    ? '#78350F'
                    : '#FEF3C7',
                  borderColor: latestAnswer.isCorrect ? '#10B981' : '#F59E0B',
                },
              ]}
            >
              <Text
                style={[
                  styles.feedbackBannerTitle,
                  {
                    color: latestAnswer.isCorrect
                      ? highContrast
                        ? '#FFFFFF'
                        : '#065F46'
                      : highContrast
                      ? '#FFFFFF'
                      : '#92400E',
                  },
                ]}
              >
                {latestAnswer.isCorrect
                  ? latestAnswer.correctAnswer === 'scam'
                    ? '🎉 SPOT ON! THIS IS A SCAM'
                    : '🎉 CORRECT! THIS IS LEGITIMATE'
                  : latestAnswer.correctAnswer === 'scam'
                  ? '⚠️ NOT QUITE — THIS IS ACTUALLY A SCAM'
                  : '⚠️ NOT QUITE — THIS IS ACTUALLY LEGITIMATE'}
              </Text>
            </View>

            {/* Patient Coach Explanation Card */}
            <View
              style={[
                styles.coachExplanationCard,
                {
                  backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
                  borderColor: highContrast ? '#FFFFFF' : '#E2E8F0',
                },
              ]}
            >
              <View style={styles.coachTitleRow}>
                <Text style={styles.coachEmoji}>🤖</Text>
                <Text style={[styles.coachHeading, { color: highContrast ? '#FFFFFF' : '#0F172A' }]}>
                  PATIENT COACH EXPLANATION:
                </Text>
              </View>

              <Text
                style={[
                  styles.coachBody,
                  {
                    fontSize: getBodySize(),
                    color: highContrast ? '#F1F5F9' : '#1E293B',
                    lineHeight: getBodySize() * 1.5,
                  },
                ]}
              >
                "{currentStep.explanation}"
              </Text>
            </View>

            {/* Warning Signs or Trust Markers */}
            <View
              style={[
                styles.signalsCard,
                {
                  backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
                  borderColor: highContrast ? '#FFFFFF' : '#E2E8F0',
                },
              ]}
            >
              <Text style={[styles.signalsHeading, { color: highContrast ? '#CBD5E1' : '#475569' }]}>
                {currentStep.correctAnswer === 'scam'
                  ? '🔍 WARNING SIGNS IN THIS SCENE:'
                  : '✅ WHAT MAKES THIS SAFE:'}
              </Text>

              {currentStep.warningSigns.map((sign, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text
                    style={[
                      styles.bulletText,
                      {
                        fontSize: getBodySize() - 2,
                        color: highContrast ? '#E2E8F0' : '#334155',
                        lineHeight: (getBodySize() - 2) * 1.4,
                      },
                    ]}
                  >
                    {sign}
                  </Text>
                </View>
              ))}

              <View style={styles.actionDivider} />

              <Text style={[styles.safeActionHeading, { color: highContrast ? '#CBD5E1' : '#475569' }]}>
                👉 SAFE NEXT STEP:
              </Text>
              <Text
                style={[
                  styles.safeActionText,
                  {
                    fontSize: getBodySize() - 1,
                    color: highContrast ? '#FFFFFF' : '#0F172A',
                    fontWeight: '700',
                  },
                ]}
              >
                {currentStep.safeAction}
              </Text>
            </View>

            {/* Next Scenario Button */}
            <View style={styles.nextButtonContainer}>
              <BigButton
                label={isLastQuestion ? 'FINISH LESSON & SEE SCORE 🎉' : `NEXT QUESTION ➔ (${currentNum + 1} of ${totalSteps})`}
                variant="primary"
                onPress={handleNext}
                minHeight={58}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#FAF8F5',
  },
  loadingText: {
    color: '#1A1A1A',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  lessonName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1E5E3A',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  questionPromptBox: {
    alignItems: 'center',
    marginVertical: 14,
    paddingHorizontal: 8,
  },
  questionPromptText: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  choiceRow: {
    marginBottom: 4,
  },
  feedbackSection: {
    marginTop: 4,
  },
  feedbackBanner: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  feedbackBannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  coachExplanationCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  coachTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  coachEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  coachHeading: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  coachBody: {
    fontWeight: '500',
  },
  signalsCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  signalsHeading: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bulletDot: {
    color: '#64748B',
    fontSize: 18,
    marginRight: 8,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  safeActionHeading: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  safeActionText: {
    lineHeight: 24,
  },
  nextButtonContainer: {
    marginTop: 6,
  },
});
