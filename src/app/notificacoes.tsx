import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../components/EmptyState';
import { Screen } from '../components/Screen';
import { SetTitle } from '../components/SetTitle';
import { getBudgetRequests, getRequests } from '../lib/storage';
import { colors } from '../lib/theme';

interface Notificacao {
  id: string;
  icon: string;
  titulo: string;
  texto: string;
  quando: string;
}

export default function Notificacoes() {
  const [lista, setLista] = useState<Notificacao[]>([]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([getRequests(), getBudgetRequests()]).then(([reqs, buds]) => {
        const itens: Notificacao[] = [
          {
            id: 'boasvindas',
            icon: 'hammer',
            titulo: 'Bem-vindo ao NAPAUA BUILD',
            texto: 'Use a calculadora para estimar os materiais da sua casa, etapa a etapa. É 100% gratuito.',
            quando: 'Agora',
          },
          ...reqs.map((r) => ({
            id: r.id,
            icon: 'briefcase',
            titulo: `Serviço: ${r.servicoTitulo}`,
            texto: `O seu pedido está "${r.estado}".`,
            quando: new Date(r.criadoEm).toLocaleDateString('pt-MZ'),
          })),
          ...buds.map((b) => ({
            id: b.id,
            icon: 'document-text',
            titulo: `Orçamento: ${b.tipo}`,
            texto: `O seu pedido de orçamento está "${b.estado}".`,
            quando: new Date(b.criadoEm).toLocaleDateString('pt-MZ'),
          })),
        ];
        setLista(itens);
      });
    }, []),
  );

  return (
    <Screen scroll={false} pad={false}>
      <SetTitle title="Notificações" />
      <FlatList
        data={lista}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={
          <EmptyState icon="notifications-off-outline" title="Sem notificações" message="Quando houver novidades sobre os seus pedidos, aparecem aqui." />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.icon}>
              <Ionicons name={item.icon as never} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.titulo}>{item.titulo}</Text>
              <Text style={styles.texto}>{item.texto}</Text>
              <Text style={styles.quando}>{item.quando}</Text>
            </View>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  icon: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.gray, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 14, fontWeight: '800', color: colors.text },
  texto: { fontSize: 13, color: colors.text, marginTop: 2, lineHeight: 18 },
  quando: { fontSize: 11, color: colors.textMuted, marginTop: 3 },
});
