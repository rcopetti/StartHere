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
    accessibilityState?: { selected?: boolean; checked?: boolean; pressed?: boolean; expanded?: boolean; disabled?: boolean };
    role?: string;
    'aria-checked'?: boolean;
    'aria-pressed'?: boolean;
    'aria-label'?: string;
    style?: any;
    children?: React.ReactNode | ((state: { pressed: boolean }) => React.ReactNode);
  }
  export const Pressable: React.FC<PressableProps>;

  export interface ViewProps {
    style?: any;
    role?: string;
    'aria-label'?: string;
    'aria-modal'?: boolean;
    accessibilityRole?: string;
    accessibilityLabel?: string;
    accessibilityViewIsModal?: boolean;
    children?: React.ReactNode;
  }
  export const View: React.FC<ViewProps>;

  export interface TextProps {
    style?: any;
    role?: string;
    'aria-level'?: number;
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
    accessibilityLabel?: string;
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
    placeholderTextColor?: string;
    multiline?: boolean;
    numberOfLines?: number;
    keyboardType?: string;
  }
  export const TextInput: React.FC<TextInputProps>;

  export interface ImageProps {
    source?: { uri: string } | number;
    style?: any;
    alt?: string;
    accessibilityLabel?: string;
    resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  }
  export const Image: React.FC<ImageProps>;

  export interface SwitchProps {
    value?: boolean;
    onValueChange?: (val: boolean) => void;
    trackColor?: { false?: string; true?: string };
    accessibilityLabel?: string;
  }
  export const Switch: React.FC<SwitchProps>;

  export interface ActivityIndicatorProps {
    size?: 'small' | 'large' | number;
    color?: string;
  }
  export const ActivityIndicator: React.FC<ActivityIndicatorProps>;

  export interface ModalProps {
    visible?: boolean;
    transparent?: boolean;
    animationType?: 'none' | 'slide' | 'fade';
    onRequestClose?: () => void;
    children?: React.ReactNode;
  }
  export const Modal: React.FC<ModalProps>;

  export interface WindowDimensions {
    width: number;
    height: number;
    scale: number;
    fontScale: number;
  }
  export function useWindowDimensions(): WindowDimensions;

  export const StyleSheet: {
    create<T extends Record<string, any>>(styles: T): T;
    absoluteFill: any;
  };
}
