/**
 * Guided Home
 * Reassures the senior, makes Check something the one primary action,
 * and keeps a short practice session and trusted contact within reach.
 */

import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { BigButton } from '../components/BigButton';
import { ROUTES } from '../navigation/routes';

export const HomeScreen: React.FC = () => {
  const { user, allLessons, trustedContacts, fontSize, highContrast } = useApp();
  const navigate = useNavigate();

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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.displayName?.trim().split(/\s+/)[0];
  const headline = firstName ? `You have support, ${firstName}.` : 'You have support.';

  const nextLesson =
    allLessons.find((lesson) => lesson.lessonId === 'fake-bank-text') ?? allLessons[0] ?? null;
  const contact = trustedContacts[0] ?? null;

  return (
    <View style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#FAF8F5' }]}>
      <AppHeader title="StartHere" showPersonMenu />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.intro}>
          <Text style={[styles.eyebrow, { color: highContrast ? '#CBD5E1' : '#52605F' }]}>
            {greeting.toUpperCase()}
          </Text>
          <Text style={[styles.headline, { color: highContrast ? '#FFFFFF' : '#17212B' }]}>
            {headline}
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                fontSize: getBodySize(),
                color: highContrast ? '#CBD5E1' : '#435159',
                lineHeight: getBodySize() * 1.35,
              },
            ]}
          >
            Start with what would help most right now.
          </Text>
        </View>

        <BigButton
          label="Check something"
          sublabel="Message, letter, link, or call"
          variant="navy"
          onPress={() => navigate(ROUTES.check)}
          minHeight={68}
        />

        {nextLesson ? (
          <Pressable
            onPress={() => navigate(ROUTES.coach)}
            accessibilityRole="button"
            accessibilityLabel={`Open Coach. Next session: ${nextLesson.title}`}
            style={({ pressed }: { pressed: boolean }) => [
              styles.sessionCard,
              {
                backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
                borderColor: highContrast ? '#FFFFFF' : '#E0E5E1',
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={[styles.kicker, { color: highContrast ? '#CBD5E1' : '#795046' }]}>
              LEARN SOMETHING NEW
            </Text>
            <Text style={[styles.sessionTitle, { color: highContrast ? '#FFFFFF' : '#17212B' }]}>
              {nextLesson.title}
            </Text>
            <Text
              style={[
                styles.sessionGoal,
                {
                  fontSize: getBodySize(),
                  color: highContrast ? '#E2E8F0' : '#435159',
                  lineHeight: (getBodySize() - 1) * 1.35,
                },
              ]}
            >
              {nextLesson.goal}
            </Text>
            <View style={styles.sessionMetaRow}>
              <Text style={[styles.meta, { color: highContrast ? '#CBD5E1' : '#52605F' }]}>
                {nextLesson.minutes} min · {nextLesson.steps.length} questions
              </Text>
              <Text style={[styles.link, { color: highContrast ? '#FFFFFF' : '#183E2A' }]}>
                See all sessions ›
              </Text>
            </View>
          </Pressable>
        ) : (
          <View
            style={[
              styles.sessionCard,
              {
                backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
                borderColor: highContrast ? '#FFFFFF' : '#E0E5E1',
              },
            ]}
          >
            <Text style={[styles.kicker, { color: highContrast ? '#CBD5E1' : '#795046' }]}>
              LEARN SOMETHING NEW
            </Text>
            <Text style={[styles.sessionTitle, { color: highContrast ? '#FFFFFF' : '#17212B' }]}>
              Your sessions are getting ready.
            </Text>
            <Text style={[styles.sessionGoal, { color: highContrast ? '#E2E8F0' : '#435159' }]}>
              You can still check a message whenever you need to.
            </Text>
          </View>
        )}

        <Pressable
          onPress={() => navigate(ROUTES.family)}
          accessibilityRole="button"
          accessibilityLabel="Open Family Circle"
          style={({ pressed }: { pressed: boolean }) => [
            styles.familyCard,
            {
              backgroundColor: highContrast ? '#123A27' : '#E4EEE6',
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <View style={styles.familyIcon}>
            <Text style={styles.familyIconText}>✓</Text>
          </View>
          <View style={styles.familyText}>
            <Text style={[styles.familyTitle, { color: highContrast ? '#FFFFFF' : '#183E2A' }]}>
              {contact ? `${contact.name} is in your circle` : 'Add someone you trust'}
            </Text>
            <Text style={[styles.familySubtitle, { color: highContrast ? '#E2E8F0' : '#2F5741' }]}>
              {contact
                ? 'You can call them whenever you need help.'
                : 'Family Circle keeps a trusted person close.'}
            </Text>
          </View>
          <Text style={[styles.chevron, { color: highContrast ? '#FFFFFF' : '#183E2A' }]}>›</Text>
        </Pressable>

        <View
          style={[
            styles.tipCard,
            {
              backgroundColor: highContrast ? '#1E293B' : '#FFFFFF',
              borderColor: highContrast ? '#FFFFFF' : '#E0E5E1',
            },
          ]}
        >
          <Text style={[styles.tipLabel, { color: highContrast ? '#CBD5E1' : '#795046' }]}>
            A small tip for today
          </Text>
          <Text
            style={[
              styles.tipText,
              {
                fontSize: getBodySize(),
                color: highContrast ? '#E2E8F0' : '#33434B',
                lineHeight: (getBodySize() - 1) * 1.4,
              },
            ]}
          >
            A real bank will never ask you to read a secret code over the phone.
          </Text>
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
    paddingBottom: 32,
  },
  intro: {
    marginTop: 12,
    marginBottom: 18,
  },
  eyebrow: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  headline: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 35,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontWeight: '500',
  },
  sessionCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  kicker: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  sessionTitle: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 5,
  },
  sessionGoal: {
    marginBottom: 12,
  },
  sessionMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  meta: {
    fontSize: 15,
    fontWeight: '700',
  },
  link: {
    fontSize: 16,
    fontWeight: '800',
  },
  familyCard: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    padding: 14,
    marginTop: 16,
  },
  familyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E5E3A',
  },
  familyIconText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  familyText: {
    flex: 1,
  },
  familyTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 2,
  },
  familySubtitle: {
    fontSize: 16,
    lineHeight: 21,
  },
  chevron: {
    fontSize: 30,
    fontWeight: '700',
  },
  tipCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
  },
  tipLabel: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  tipText: {
    fontWeight: '500',
  },
});
