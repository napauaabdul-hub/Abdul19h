import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getPlans } from '../../lib/catalog';
import { savePlans } from '../../lib/storage';
import { HousePlan } from '../../lib/types';
import { EmptyState } from '../../components/EmptyState';
import { colors, radius, shadow } from '../../lib/theme';

export default function AdminPlantas() {
  const [lista, setLista] = useState<HousePlan[]>([]);

  useFocusEffect(
    useCallback(() => {
      getPlans().then(setLista);
    }, []),
  );

  function remover(item: HousePlan) {
    Alert.alert('Remover planta', `Remover "${item.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          const next = (await getPlans()).filter((p) => p.id !== item.id);
          await savePlans(next);
          setLista(next);
        },
      },
    ]);
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={lista}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<EmptyState icon="pencil-ruler-outline" title="Sem plantas" message="Publique a primeira planta." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.titulo}>{item.nome}</Text>
              <Text style={styles.sub}>
                {item.categoria} · {item.area} m² · {item.quartos} quartos · {item.banhos} WC · {item.pisos} piso(s)
              </Text>
            </View>
            <Pressable hitSlop={8} style={styles.acao} onPress={() => router.push({ pathname: '/(admin)/planta-form', params: { id: item.id } })}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </Pressable>
            <Pressable hitSlop={8} style={styles.acao} onPress={() => remover(item)}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </Pressable>
          </View>
        )}
      />
      <Pressable style={styles.fab} onPress={() => router.push('/(admin)/planta-form')}>
        <Ionicons name="add" size={24} color={colors.white} />
        <Text style={styles.fabText}>Nova planta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gray },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 12,
    marginBottom: 10,
    ...shadow.card,
  },
  titulo: { fontSize: 14, fontWeight: '800', color: colors.text },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  acao: { padding: 8 },
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
