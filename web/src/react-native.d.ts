/**
 * React Native Module Type Declarations for Universal Web Compilation
 */

declare module 'react-native' {
  import * as React from 'react';

  export interface ViewStyle {
    [key: string]: any;
  }
  export interface TextStyle {
    [key: string]: any;
  }

  export interface PressableProps {
    onPress?: () => void;
    disabled?: boolean;
    accessibilityRole?: string;
    accessibilityLabel?: string;
    accessibilityState?: { selected?: boolean };
    style?: any;
    children?: React.ReactNode | ((state: { pressed: boolean }) => React.ReactNode);
  }
  export const Pressable: React.FC<PressableProps>;

  export interface ViewProps {
    style?: any;
    accessibilityRole?: string;
    accessibilityLabel?: string;
    children?: React.ReactNode;
  }
  export const View: React.FC<ViewProps>;

  export interface TextProps {
    style?: any;
    numberOfLines?: number;
    selectable?: boolean;
    children?: React.ReactNode;
  }
  export const Text: React.FC<TextProps>;

  export interface ScrollViewProps {
    style?: any;
    contentContainerStyle?: any;
    children?: React.ReactNode;
  }
  export const ScrollView: React.FC<ScrollViewProps>;

  export interface TextInputProps {
    style?: any;
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    placeholderTextColor?: string;
    multiline?: boolean;
    numberOfLines?: number;
    keyboardType?: string;
  }
  export const TextInput: React.FC<TextInputProps>;

  export interface SwitchProps {
    value?: boolean;
    onValueChange?: (val: boolean) => void;
    trackColor?: { false?: string; true?: string };
  }
  export const Switch: React.FC<SwitchProps>;

  export interface ActivityIndicatorProps {
    size?: 'small' | 'large' | number;
    color?: string;
  }
  export const ActivityIndicator: React.FC<ActivityIndicatorProps>;

  export const StyleSheet: {
    create<T extends Record<string, any>>(styles: T): T;
  };
}
