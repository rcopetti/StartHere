/**
 * VerdictBanner — High Visibility Fraud Status Banner
 * Colors: High-risk Red, Caution Amber, Safe Emerald
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { ScamVerdict } from '../types';
import { useApp } from '../context/AppContext';

interface VerdictBannerProps {
  verdict: ScamVerdict;
  riskScore?: number;
}

export const VerdictBanner: React.FC<VerdictBannerProps> = ({ verdict }) => {
  const { highContrast } = useApp();

  const getDetails = () => {
    switch (verdict) {
      case 'likely_scam':
        return {
          title: '⛔ This is a scam',
          subtext: 'You did the right thing by checking.',
          bgColor: highContrast ? '#7F1D1D' : '#FEE2E2',
          textColor: highContrast ? '#FFFFFF' : '#991B1B',
          borderColor: '#EF4444',
        };
      case 'caution':
        return {
          title: '⚠️ Be careful with this one',
          subtext: 'Let’s check it another way before you reply.',
          bgColor: highContrast ? '#78350F' : '#FEF3C7',
          textColor: highContrast ? '#FFFFFF' : '#92400E',
          borderColor: '#F59E0B',
        };
      case 'looks_safe':
      default:
        return {
          title: '✅ This looks safe',
          subtext: 'No warning signs were found.',
          bgColor: highContrast ? '#064E3B' : '#D1FAE5',
          textColor: highContrast ? '#FFFFFF' : '#065F46',
          borderColor: '#10B981',
        };
    }
  };

  const config = getDetails();

  return (
    <View
      style={[
        styles.bannerContainer,
        {
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
          borderWidth: highContrast ? 3 : 2,
        },
      ]}
    >
      <Text style={[styles.bannerTitle, { color: config.textColor }]}>
        {config.title}
      </Text>
      <Text style={[styles.bannerSubtext, { color: config.textColor }]}>
        {config.subtext}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  bannerSubtext: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
