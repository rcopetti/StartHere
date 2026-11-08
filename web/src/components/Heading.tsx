import React from 'react';
import { Text } from 'react-native';

interface HeadingProps {
  level: 1 | 2 | 3;
  children: React.ReactNode;
  style?: any;
  color?: string;
}

export const Heading: React.FC<HeadingProps> = ({ level, children, style, color }) => (
  <Text role="heading" aria-level={level} style={[style, color ? { color } : null]}>
    {children}
  </Text>
);
