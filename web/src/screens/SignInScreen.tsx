/**
 * Sign-In Screen
 * One headline, one primary action. Google is the only way in, and the copy
 * reassures the senior that no password, card, or number is ever requested.
 */

import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Navigate, useLocation } from 'react-router-dom';
import { Lock, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Heading } from '../components/Heading';
import { ROUTES } from '../navigation/routes';

const GoogleMark: React.FC = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

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
  const signInDisabled = pending || authStage === 'loading';

  const handleSignIn = () => {
    if (signInDisabled) return;
    setPending(true);
    void signInWithGoogle().finally(() => setPending(false));
  };

  return (
    <View style={[styles.page, { backgroundColor: highContrast ? '#000000' : '#FAF8F5' }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandRow}>
          <Image source={{ uri: '/icons/icon-192.png' }} alt="" style={styles.brandMark} />
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

        <Pressable
          onPress={handleSignIn}
          disabled={signInDisabled}
          accessibilityRole="button"
          accessibilityLabel="Sign in with Google"
          accessibilityState={{ disabled: signInDisabled }}
          style={({ pressed }: { pressed: boolean }) => [
            styles.googleButton,
            {
              backgroundColor: '#FFFFFF',
              borderColor: highContrast ? '#000000' : '#DADCE0',
              borderWidth: highContrast ? 3 : 1,
              opacity: signInDisabled ? 0.6 : pressed ? 0.85 : 1,
            },
          ]}
        >
          <View style={styles.googleMarkWrap}>
            <GoogleMark />
          </View>
          <Text style={[styles.googleButtonText, { fontSize: bodySize }]}>
            {pending ? 'Opening Google…' : 'Sign in with Google'}
          </Text>
        </Pressable>

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
  googleButton: {
    width: '100%',
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  googleMarkWrap: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#1F1F1F',
    fontWeight: '600',
    letterSpacing: 0.2,
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
