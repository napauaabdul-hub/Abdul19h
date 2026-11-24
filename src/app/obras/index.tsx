import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { STAGES } from '../../lib/calculator';
import { getObras } from '../../lib/storage';
import { Obra } from '../../lib/types';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { colors, radius, shadow } from '../../lib/theme';

export default function Obras() {
  const [obras, setObras] = useState<Obra[]>([]);

  useFocusEffect(
    useCallback(() => {
      getObras().then(setObras);
    }, []),
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={obras}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View style={styles.hero}>
            <Ionicons name="clipboard" size={32} color={colors.white} />
            <Text style={styles.heroTitle}>Acompanhamento de obras</Text>
            <Text style={styles.heroText}>Registe a sua obra e vá marcando as 16 etapas à medida que avançam.</Text>
            <Button label="Nova obra" variant="orange" onPress={() => router.push('/obras/nova')} />
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="hammer-outline" title="Sem obras" message="Crie a sua primeira obra para acompanhar as etapas." />
        }
        renderItem={({ item }) => {
          const pct = Math.round((item.etapasFeitas.length / STAGES.length) * 100);
          return (
            <Pressable style={styles.card} onPress={() => router.push(`/obras/${item.id}`)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.titulo}>{item.nome}</Text>
                <Text style={styles.sub}>{item.local} · iniciada em {new Date(item.iniciadoEm).toLocaleDateString('pt-MZ')}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.pct}>{item.etapasFeitas.length}/{STAGES.length} etapas · {pct}%</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gray },
  hero: { backgroundColor: colors.primary, borderRadius: radius.xl, padding: 20, marginBottom: 16, ...shadow.card },
  heroTitle: { color: colors.white, fontSize: 19, fontWeight: '800', marginTop: 10 },
  heroText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 18, marginTop: 4, marginBottom: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
    ...shadow.card,
  },
  titulo: { fontSize: 15, fontWeight: '800', color: colors.text },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2, marginBottom: 8 },
  barBg: { height: 8, borderRadius: 4, backgroundColor: colors.gray, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 4 },
  pct: { fontSize: 12, fontWeight: '800', color: colors.primary, marginTop: 5 },
});
