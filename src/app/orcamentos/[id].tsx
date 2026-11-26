import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { SetTitle } from '../../components/SetTitle';
import { getBudgetRequests } from '../../lib/storage';
import { BudgetRequest } from '../../lib/types';
import { colors } from '../../lib/theme';

const ESTADOS = ['Recebido', 'Em análise', 'Em preparação', 'Orçamento enviado', 'Aguardando resposta', 'Concluído', 'Cancelado'];

export default function OrcamentoDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pedido, setPedido] = useState<BudgetRequest | null>(null);

  useEffect(() => {
    getBudgetRequests().then((all) => setPedido(all.find((p) => p.id === id) ?? null));
  }, [id]);

  if (!pedido) {
    return (
      <Screen>
        <SetTitle title="Orçamento" />
        <Text style={{ color: colors.textMuted }}>A carregar…</Text>
      </Screen>
    );
  }

  const etapa = ESTADOS.indexOf(pedido.estado);

  return (
    <Screen>
      <SetTitle title="Pedido de orçamento" />
      <Card style={styles.card}>
        <Text style={styles.titulo}>{pedido.tipo}</Text>
        <Text style={styles.meta}>
          {pedido.nome} · {pedido.contacto}
        </Text>
        <Text style={styles.meta}>
          {pedido.localizacao || 'Localização não indicada'} · {pedido.area} m² · {pedido.pisos} piso(s) · cobertura:{' '}
          {pedido.cobertura}
        </Text>
        {pedido.descricao ? <Text style={styles.desc}>{pedido.descricao}</Text> : null}
        <Text style={styles.meta}>Enviado em {new Date(pedido.criadoEm).toLocaleDateString('pt-MZ')}</Text>
      </Card>
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>Estado do pedido</Text>
        {ESTADOS.map((e, i) => (
          <View key={e} style={styles.estadoRow}>
            <Ionicons
              name={i <= etapa ? 'checkmark-circle' : 'ellipse-outline'}
              size={20}
              color={i <= etapa ? colors.primary : colors.border}
            />
            <Text style={[styles.estadoText, i === etapa && styles.estadoAtual]}>{e}</Text>
          </View>
        ))}
      </Card>
      <Button
        label="Contactar pelo WhatsApp"
        variant="teal"
        onPress={() =>
          Linking.openURL(`whatsapp://send?text=${encodeURIComponent(`Olá! Pedido de orçamento ${pedido.tipo} (${pedido.localizacao || '—'}).`)}`)
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 14 },
  titulo: { fontSize: 19, fontWeight: '800', color: colors.text },
  meta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  desc: { fontSize: 14, color: colors.text, marginTop: 8, lineHeight: 20 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 8 },
  estadoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  estadoText: { fontSize: 14, color: colors.textMuted },
  estadoAtual: { fontWeight: '800', color: colors.primary },
});
