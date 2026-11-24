import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SERVICE_CATEGORIES } from '../../../lib/data/services';
import { getServices } from '../../../lib/catalog';
import { Service } from '../../../lib/types';
import { Card } from '../../../components/Card';
import { Chip } from '../../../components/Chip';
import { EmptyState } from '../../../components/EmptyState';
import { Stars } from '../../../components/Stars';
import { colors, radius, shadow } from '../../../lib/theme';

export default function Servicos() {
  const [cat, setCat] = useState<string>('Todas');
  const [servicos, setServicos] = useState<Service[]>([]);

  useFocusEffect(
    useCallback(() => {
      getServices().then(setServicos);
    }, []),
  );

  const lista = useMemo(
    () => (cat === 'Todas' ? servicos : servicos.filter((s) => s.categoria === cat)),
    [cat, servicos],
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={lista}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <View style={styles.chips}>
            {['Todas', ...SERVICE_CATEGORIES].map((c) => (
              <Chip key={c} label={c} selected={cat === c} onPress={() => setCat(c)} />
            ))}
          </View>
        }
        ListEmptyComponent={<EmptyState icon="search" title="Sem resultados" message="Tente outra categoria." />}
        renderItem={({ item }) => (
          <Card onPress={() => router.push(`/servicos/${item.id}`)} style={styles.card}>
            <View style={styles.icon}>
              <Ionicons name={item.icon as never} size={28} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.titulo}>{item.titulo}</Text>
              <Text style={styles.cat}>{item.categoria}</Text>
              {item.disponivel === false ? (
                <View style={styles.indisp}>
                  <Text style={styles.indispText}>Indisponível</Text>
                </View>
              ) : (
                <Stars rating={item.rating} />
              )}
              <Text style={styles.preco} numberOfLines={1}>{item.precoReferencia}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Card>
        )}
      />
      <Pressable style={styles.fab} onPress={() => router.push('/servicos/solicitar')}>
        <Ionicons name="add" size={26} color={colors.white} />
        <Text style={styles.fabText}>Solicitar serviço</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gray },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  icon: { width: 52, height: 52, borderRadius: radius.pill, backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 15, fontWeight: '800', color: colors.text },
  cat: { fontSize: 12, color: colors.teal, fontWeight: '700', marginTop: 1 },
  preco: { fontSize: 12, color: colors.orange, fontWeight: '700', marginTop: 2 },
  indisp: { alignSelf: 'flex-start', backgroundColor: colors.gray, borderRadius: 999, paddingHorizontal: 8, height: 22, justifyContent: 'center', marginTop: 2 },
  indispText: { fontSize: 10, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase' },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.orange,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    height: 48,
    ...shadow.card,
  },
  fabText: { color: colors.white, fontWeight: '800', fontSize: 13 },
});
