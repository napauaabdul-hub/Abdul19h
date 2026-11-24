import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getServices } from '../../lib/catalog';
import { saveServices } from '../../lib/storage';
import { Service } from '../../lib/types';
import { EmptyState } from '../../components/EmptyState';
import { colors, radius, shadow } from '../../lib/theme';

export default function AdminServicos() {
  const [lista, setLista] = useState<Service[]>([]);

  useFocusEffect(
    useCallback(() => {
      getServices().then(setLista);
    }, []),
  );

  function remover(item: Service) {
    Alert.alert('Remover serviço', `Remover "${item.titulo}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          const next = (await getServices()).filter((s) => s.id !== item.id);
          await saveServices(next);
          setLista(next);
        },
      },
    ]);
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={lista}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<EmptyState icon="briefcase-outline" title="Sem serviços" message="Adicione o primeiro serviço." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.icon}>
              <Ionicons name={item.icon as never} size={24} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.titulo}>{item.titulo}</Text>
              <Text style={styles.sub}>{item.categoria} · ⭐ {item.rating} ({item.avaliacoes})</Text>
              <Text style={styles.preco} numberOfLines={1}>{item.precoReferencia}</Text>
            </View>
            <Pressable hitSlop={8} style={styles.acao} onPress={() => router.push({ pathname: '/(admin)/servico-form', params: { id: item.id } })}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </Pressable>
            <Pressable hitSlop={8} style={styles.acao} onPress={() => remover(item)}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </Pressable>
          </View>
        )}
      />
      <Pressable style={styles.fab} onPress={() => router.push('/(admin)/servico-form')}>
        <Ionicons name="add" size={24} color={colors.white} />
        <Text style={styles.fabText}>Novo serviço</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gray },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 12,
    marginBottom: 10,
    ...shadow.card,
  },
  icon: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 14, fontWeight: '800', color: colors.text },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  preco: { fontSize: 12, color: colors.orange, fontWeight: '700', marginTop: 1 },
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
