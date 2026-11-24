import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../lib/theme';

export function Logo({ size = 40, light = false }: { size?: number; light?: boolean }) {
  return (
    <View style={styles.row}>
      <Image source={require('../../assets/icon.png')} style={{ width: size, height: size, borderRadius: size / 4 }} />
      <Text style={[styles.nome, { color: light ? colors.white : colors.primary }, { fontSize: size * 0.42 }]}>
        NAPAUA <Text style={{ color: colors.orange }}>BUILD</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nome: { fontWeight: '800' },
});
