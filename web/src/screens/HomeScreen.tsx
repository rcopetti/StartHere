/**
 * Guided Home
 * Reassures the senior, makes Check something the one primary action,
 * and keeps a short practice session and trusted contact within reach.
 */

import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigate } from 'react-router-dom';
import { Check, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppHeader } from '../components/AppHeader';
import { BigButton } from '../components/BigButton';
import { Heading } from '../components/Heading';
import { ROUTES } from '../navigation/routes';

export const HomeScreen: React.FC = () => {
  const { user, allLessons, trustedContacts, fontSize, highContrast } = useApp();
  const { width } = useWindowDimensions();
  const navigate = useNavigate();
  const isNarrow = width < 300;

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

  const firstName = user?.displayName?.trim().split(/\s+/)[0];
  const headline = firstName ? `You have support, ${firstName}.` : 'You have support.';

  const nextLesson =
    allLessons.find((lesson) => lesson.lessonId === 'fake-bank-text') ?? allLessons[0] ?? null;
  const contact = trustedContacts[0] ?? null;

  return (
    <View style={[styles.container, { backgroundColor: highContrast ? '#000000' : '#FAF8F5' }]}>
      <AppHeader title="StartHere" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.intro}>
          <Heading level={1} style={styles.headline} color={highContrast ? '#FFFFFF' : '#17212B'}>
            {headline}
          </Heading>
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
              Learn something new
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
              Learn something new
            </Text>
            <Heading level={2} style={styles.sessionTitle} color={highContrast ? '#FFFFFF' : '#17212B'}>
              Your sessions are getting ready.
            </Heading>
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
            isNarrow && styles.familyCardNarrow,
            {
              backgroundColor: highContrast ? '#123A27' : '#E4EEE6',
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <View style={[styles.familyIcon, !contact && styles.familyIconAdd]}>
            {contact ? (
              <Check size={24} strokeWidth={2.6} color="#FFFFFF" aria-hidden="true" focusable="false" />
            ) : (
              <UserPlus size={24} strokeWidth={2.4} color="#FFFFFF" aria-hidden="true" focusable="false" />
            )}
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
          {!isNarrow && (
            <Text style={[styles.chevron, { color: highContrast ? '#FFFFFF' : '#183E2A' }]}>›</Text>
          )}
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
          <Heading level={2} style={styles.tipLabel} color={highContrast ? '#CBD5E1' : '#795046'}>
            A small tip for today
          </Heading>
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
  headline: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 37,
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
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 5,
  },
  sessionTitle: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 29,
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
    fontSize: 18,
    fontWeight: '700',
  },
  link: {
    fontSize: 18,
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
  familyCardNarrow: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  familyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E5E3A',
  },
  familyIconAdd: {
    backgroundColor: '#18334D',
  },
  familyText: {
    flex: 1,
  },
  familyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  familySubtitle: {
    fontSize: 18,
    lineHeight: 24,
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
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  tipText: {
    fontWeight: '500',
  },
});
