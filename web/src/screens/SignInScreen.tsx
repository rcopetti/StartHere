/**
 * Sign-In Screen
 * One headline, one primary action. Google is the only way in, and the copy
 * reassures the senior that no password, card, or number is ever requested.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Navigate, useLocation } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BigButton } from '../components/BigButton';
import { Heading } from '../components/Heading';
import { ROUTES } from '../navigation/routes';

export const SignInScreen: React.FC = () => {
  const { authStage, authError, signInWithGoogle, fontSize, highContrast } = useApp();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const [pending, setPending] = useState(false);

  if (authStage === 'ready') {
    return <Navigate to={from && from !== ROUTES.signIn ? from : ROUTES.home} replace />;
  }

  if (authStage === 'needs_onboarding') {
    return <Navigate to={ROUTES.onboarding} replace />;
  }

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

  const bodySize = getBodySize();
  const foreground = highContrast ? '#FFFFFF' : '#17212B';
  const muted = highContrast ? '#E2E8F0' : '#435159';
  const cardBackground = highContrast ? '#111111' : '#FFFFFF';
  const cardBorder = highContrast ? '#FFFFFF' : '#D9DFDA';

  return (
    <View style={[styles.page, { backgroundColor: highContrast ? '#000000' : '#FAF8F5' }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>S</Text>
          </View>
          <Text style={[styles.brandName, { color: foreground }]}>StartHere</Text>
        </View>

        <Heading level={1} style={styles.headline} color={foreground}>
          Welcome to StartHere
        </Heading>

        <Text style={[styles.intro, { fontSize: bodySize, lineHeight: bodySize * 1.4, color: muted }]}>
          Sign in with your Google account so your lessons, checks, and family circle stay with you.
        </Text>

        {authError && (
          <View role="alert" style={styles.errorBox}>
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        )}

        <BigButton
          label={pending ? 'Opening Google…' : 'Sign in with Google'}
          sublabel="Uses your Google account"
          variant="navy"
          onPress={() => {
            setPending(true);
            void signInWithGoogle().finally(() => setPending(false));
          }}
          disabled={pending || authStage === 'loading'}
          minHeight={68}
        />

        <View style={[styles.reassureCard, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
          <Lock size={24} strokeWidth={2.2} color="#1E5E3A" aria-hidden="true" focusable="false" />
          <Text style={[styles.reassureText, { fontSize: bodySize - 2, color: muted }]}>
            StartHere will never ask for your password, bank card, or Social Security number.
            We only use Google to know it is you.
          </Text>
        </View>

        <View style={styles.footNote}>
          <ShieldCheck size={20} strokeWidth={2.2} color={muted} aria-hidden="true" focusable="false" />
          <Text style={[styles.footNoteText, { color: muted }]}>
            You can sign out at any time in Settings.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    marginBottom: 24,
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1E5E3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  brandName: {
    fontSize: 24,
    fontWeight: '800',
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    marginBottom: 12,
  },
  intro: {
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#B45309',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#78350F',
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '600',
  },
  reassureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
  },
  reassureText: {
    flex: 1,
    lineHeight: 27,
  },
  footNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  footNoteText: {
    fontSize: 18,
  },
});
