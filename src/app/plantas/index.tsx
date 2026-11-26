import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PLAN_CATEGORIES } from '../../lib/data/plans';
import { getPlans } from '../../lib/catalog';
import { HousePlan } from '../../lib/types';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { FloorPlan } from '../../components/FloorPlan';
import { colors } from '../../lib/theme';

export default function Plantas() {
  const [cat, setCat] = useState<string>('Todas');
  const [planos, setPlanos] = useState<HousePlan[]>([]);

  useFocusEffect(
    useCallback(() => {
      getPlans().then(setPlanos);
    }, []),
  );

  const lista = useMemo(
    () => (cat === 'Todas' ? planos : planos.filter((p) => p.categoria === cat)),
    [cat, planos],
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={lista}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <View style={styles.chips}>
            {['Todas', ...PLAN_CATEGORIES].map((c) => (
              <Chip key={c} label={c} selected={cat === c} onPress={() => setCat(c)} />
            ))}
          </View>
        }
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/plantas/${item.id}`)} style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={styles.nome}>{item.nome}</Text>
              <View style={styles.catChip}>
                <Text style={styles.catText}>{item.categoria}</Text>
              </View>
            </View>
            <FloorPlan rooms={item.quartosSpec} comprimento={item.comprimento} largura={item.largura} height={120} />
            <View style={styles.meta}>
              <Text style={styles.metaText}>
                <Ionicons name="bed-outline" size={13} color={colors.textMuted} /> {item.quartos} quartos
              </Text>
              <Text style={styles.metaText}>
                <Ionicons name="water-outline" size={13} color={colors.textMuted} /> {item.banhos} WC
              </Text>
              <Text style={styles.metaText}>
                <Ionicons name="resize-outline" size={13} color={colors.textMuted} /> {item.area} m²
              </Text>
              <Text style={styles.metaText}>
                <Ionicons name="layers-outline" size={13} color={colors.textMuted} /> {item.pisos} piso(s)
              </Text>
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gray },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  card: { marginBottom: 14 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  nome: { fontSize: 17, fontWeight: '800', color: colors.text },
  catChip: { backgroundColor: colors.gray, paddingHorizontal: 10, height: 26, borderRadius: 999, justifyContent: 'center' },
  catText: { fontSize: 11, fontWeight: '700', color: colors.teal },
  meta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  metaText: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
});
