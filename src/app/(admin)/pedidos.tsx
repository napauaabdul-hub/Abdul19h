import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getBudgetRequests,
  getRequests,
  updateBudgetEstado,
  updateRequestEstado,
} from '../../lib/storage';
import { ServiceRequest } from '../../lib/types';
import { EmptyState } from '../../components/EmptyState';
import { colors, radius, shadow } from '../../lib/theme';

const ESTADOS: ServiceRequest['estado'][] = [
  'Recebido',
  'Em análise',
  'Em preparação',
  'Orçamento enviado',
  'Aguardando resposta',
  'Concluído',
  'Cancelado',
];

type Item = { kind: 'servico' | 'orcamento'; id: string; titulo: string; detalhe: string; estado: ServiceRequest['estado']; quando: number };

export default function AdminPedidos() {
  const [itens, setItens] = useState<Item[]>([]);

  const carregar = useCallback(async () => {
    const [reqs, buds] = await Promise.all([getRequests(), getBudgetRequests()]);
    setItens([
      ...reqs.map((r) => ({ kind: 'servico' as const, id: r.id, titulo: r.servicoTitulo, detalhe: `${r.nome} · ${r.contacto} · ${r.localizacao || '—'}`, estado: r.estado, quando: r.criadoEm })),
      ...buds.map((b) => ({ kind: 'orcamento' as const, id: b.id, titulo: `Orçamento: ${b.tipo}`, detalhe: `${b.nome} · ${b.contacto} · ${b.area} m²`, estado: b.estado, quando: b.criadoEm })),
    ]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  function mudarEstado(item: Item) {
    Alert.alert(`Estado — ${item.titulo}`, 'Selecione o novo estado:', [
      ...ESTADOS.map((e) => ({
        text: e,
        onPress: async () => {
          if (item.kind === 'servico') await updateRequestEstado(item.id, e);
          else await updateBudgetEstado(item.id, e);
          carregar();
        },
      })),
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={itens}
        keyExtractor={(i) => i.kind + i.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<EmptyState icon="document-text-outline" title="Sem pedidos" message="Os pedidos de serviços e orçamentos aparecem aqui." />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.icon}>
              <Ionicons name={item.kind === 'servico' ? 'briefcase' : 'calculator'} size={22} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.titulo}>{item.titulo}</Text>
              <Text style={styles.detalhe}>{item.detalhe}</Text>
              <Text style={styles.quando}>{new Date(item.quando).toLocaleDateString('pt-MZ')}</Text>
            </View>
            <Pressable style={styles.estado} onPress={() => mudarEstado(item)}>
              <Text style={styles.estadoText}>{item.estado}</Text>
              <Ionicons name="chevron-down" size={14} color={colors.primary} />
            </Pressable>
          </View>
        )}
      />
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
  icon: { width: 42, height: 42, borderRadius: radius.pill, backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 14, fontWeight: '800', color: colors.text },
  detalhe: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  quando: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  estado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.tint,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    height: 32,
  },
  estadoText: { fontSize: 11, fontWeight: '800', color: colors.primary },
});
