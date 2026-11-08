/**
 * BigButton — Accessible Touch CTA Component
 * Built using React Native Pressable, View, Text
 * Enforces minimum 56px touch target and dynamic text scaling
 */

import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';

interface BigButtonProps {
  label: string;
  sublabel?: string;
  onPress: () => void;
  variant?: 'primary' | 'navy' | 'danger' | 'secondary' | 'success' | 'outline';
  icon?: React.ReactNode;
  disabled?: boolean;
  minHeight?: number;
}

export const BigButton: React.FC<BigButtonProps> = ({
  label,
  sublabel,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  minHeight = 56,
}) => {
  const { fontSize, highContrast } = useApp();

  const getFontSize = () => {
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

  const getBgColor = (pressed: boolean) => {
    if (disabled) return '#94A3B8';
    switch (variant) {
      case 'danger':
        return pressed ? '#991B1B' : '#DC2626';
      case 'success':
        return pressed ? '#047857' : '#059669';
      case 'secondary':
        return pressed ? '#E2E8F0' : '#F1F5F9';
      case 'outline':
        return pressed ? '#F8FAFC' : '#FFFFFF';
      case 'navy':
        return pressed ? '#0F2539' : '#18334D';
      case 'primary':
      default:
        return pressed ? '#1D4ED8' : '#2563EB';
    }
  };

  const getTextColor = () => {
    if (disabled) return '#F8FAFC';
    if (variant === 'secondary' || variant === 'outline') {
      return highContrast ? '#000000' : '#0F172A';
    }
    return '#FFFFFF';
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }: { pressed: boolean }) => [
        styles.container,
        {
          minHeight,
          backgroundColor: getBgColor(pressed),
          borderColor:
            variant === 'outline'
              ? highContrast
                ? '#000000'
                : '#CBD5E1'
              : 'transparent',
          borderWidth: variant === 'outline' ? 2 : 0,
        },
      ]}
    >
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.label,
              {
                fontSize: getFontSize(),
                color: getTextColor(),
                fontWeight: highContrast ? '800' : '700',
              },
            ]}
          >
            {label}
          </Text>
          {sublabel && (
            <Text
              style={[
                styles.sublabel,
                {
                  fontSize: getFontSize() - 4,
                  color: getTextColor(),
                  opacity: 0.9,
                },
              ]}
            >
              {sublabel}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  iconContainer: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  sublabel: {
    textAlign: 'center',
    marginTop: 2,
  },
});
