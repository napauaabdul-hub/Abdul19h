import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../lib/theme';

export function EmptyState({ icon, title, message }: { icon: string; title: string; message: string }) {
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon as never} size={44} color={colors.primary} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 24 },
  title: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 10 },
  message: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
});
