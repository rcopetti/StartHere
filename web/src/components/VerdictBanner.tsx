/**
 * VerdictBanner — High Visibility Fraud Status Banner
 * Colors: High-risk Red, Caution Amber, Safe Emerald
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CircleCheck, OctagonX, TriangleAlert, type LucideIcon } from 'lucide-react';
import type { ScamVerdict } from '../types';
import { useApp } from '../context/AppContext';
import { Heading } from './Heading';

interface VerdictBannerProps {
  verdict: ScamVerdict;
  riskScore?: number;
}

interface VerdictDetails {
  title: string;
  subtext: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: LucideIcon;
}

export const VerdictBanner: React.FC<VerdictBannerProps> = ({ verdict }) => {
  const { highContrast } = useApp();

  const getDetails = (): VerdictDetails => {
    switch (verdict) {
      case 'likely_scam':
        return {
          title: 'This is a scam',
          subtext: 'You did the right thing by checking.',
          bgColor: highContrast ? '#7F1D1D' : '#FEE2E2',
          textColor: highContrast ? '#FFFFFF' : '#991B1B',
          borderColor: '#EF4444',
          icon: OctagonX,
        };
      case 'caution':
        return {
          title: 'Be careful with this one',
          subtext: 'Let’s check it another way before you reply.',
          bgColor: highContrast ? '#78350F' : '#FEF3C7',
          textColor: highContrast ? '#FFFFFF' : '#92400E',
          borderColor: '#F59E0B',
          icon: TriangleAlert,
        };
      case 'looks_safe':
      default:
        return {
          title: 'This looks safe',
          subtext: 'No warning signs were found.',
          bgColor: highContrast ? '#064E3B' : '#D1FAE5',
          textColor: highContrast ? '#FFFFFF' : '#065F46',
          borderColor: '#10B981',
          icon: CircleCheck,
        };
    }
  };

  const config = getDetails();
  const Icon = config.icon;

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
      <View style={styles.titleRow}>
        <Icon size={30} strokeWidth={2.4} color={config.textColor} aria-hidden="true" focusable="false" />
        <Heading level={1} style={styles.bannerTitle} color={config.textColor}>
          {config.title}
        </Heading>
      </View>
      <Text style={[styles.bannerSubtext, { color: config.textColor }]}>{config.subtext}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  bannerSubtext: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
