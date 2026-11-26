import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../components/Button';
import { EmptyState } from '../../../components/EmptyState';
import { getBudgetRequests } from '../../../lib/storage';
import { BudgetRequest } from '../../../lib/types';
import { colors, radius, shadow } from '../../../lib/theme';

const ESTADO_COR: Record<BudgetRequest['estado'], string> = {
  Recebido: colors.textMuted,
  'Em análise': colors.teal,
  'Em preparação': colors.orange,
  'Orçamento enviado': colors.primary,
  'Aguardando resposta': colors.orange,
  Concluído: colors.success,
  Cancelado: colors.danger,
};

export default function Orcamentos() {
  const [pedidos, setPedidos] = useState<BudgetRequest[]>([]);

  useFocusEffect(
    useCallback(() => {
      getBudgetRequests().then(setPedidos);
    }, []),
  );

  return (
    <View style={styles.root}>
      <FlatList
        data={pedidos}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View style={styles.hero}>
            <Ionicons name="document-text" size={36} color={colors.white} />
            <Text style={styles.heroTitle}>Orçamentos</Text>
            <Text style={styles.heroText}>
              Peça um orçamento para casa completa, fundação, laje, alvenaria, cobertura ou acabamentos. Recebe em
              PDF e Excel.
            </Text>
            <Button label="Novo pedido de orçamento" variant="orange" onPress={() => router.push('/orcamentos/novo')} />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="calculator-outline"
            title="Sem pedidos de orçamento"
            message="Peça um orçamento e acompanhe aqui o estado: recebido, em análise, orçamento enviado, concluído."
          />
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/orcamentos/${item.id}`)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.tipo}</Text>
              <Text style={styles.cardMeta}>
                {item.localizacao || '—'} · {item.area} m² · {new Date(item.criadoEm).toLocaleDateString('pt-MZ')}
              </Text>
              <Text style={[styles.estado, { color: ESTADO_COR[item.estado] }]}>{item.estado}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gray },
  hero: { backgroundColor: colors.primary, borderRadius: radius.xl, padding: 20, marginBottom: 16, ...shadow.card },
  heroTitle: { color: colors.white, fontSize: 19, fontWeight: '800', marginTop: 10 },
  heroText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 19, marginTop: 6, marginBottom: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 14,
    marginBottom: 10,
    ...shadow.card,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  cardMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  estado: { fontSize: 12, fontWeight: '800', marginTop: 4 },
});
