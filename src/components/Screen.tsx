import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../lib/theme';

export function Screen({
  children,
  scroll = true,
  style,
  pad = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  pad?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const content = (
    <View style={[styles.content, pad && { paddingHorizontal: 16 }, { paddingBottom: insets.bottom + 24 }, style]}>
      {children}
    </View>
  );
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {scroll ? <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{content}</ScrollView> : content}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gray },
  content: { flexGrow: 1 },
});
