import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCalc } from '../../../context/calc';
import { Button } from '../../../components/Button';
import { EmptyState } from '../../../components/EmptyState';
import { deleteProject, getProjects } from '../../../lib/storage';
import { SavedProject } from '../../../lib/types';
import { formatMT, formatNumber } from '../../../lib/format';
import { colors, radius, shadow } from '../../../lib/theme';

export default function CalculadoraHome() {
  const { reset } = useCalc();
  const [projetos, setProjetos] = useState<SavedProject[]>([]);

  useFocusEffect(
    useCallback(() => {
      getProjects().then(setProjetos);
    }, []),
  );

  function novo() {
    reset();
    router.push('/calculadora/tipo');
  }

  function remover(id: string) {
    Alert.alert('Eliminar projeto', 'Quer eliminar este projeto guardado?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteProject(id);
          setProjetos(await getProjects());
        },
      },
    ]);
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={projetos}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListHeaderComponent={
          <View>
            <View style={styles.hero}>
              <Ionicons name="calculator" size={40} color={colors.white} />
              <Text style={styles.heroTitle}>Calculadora inteligente de construção</Text>
              <Text style={styles.heroText}>
                Acompanhe todas as etapas da obra — da preparação do terreno aos acabamentos — com resultados
                progressivos por etapa.
              </Text>
              <Button label="Novo cálculo" variant="orange" onPress={novo} />
              <View style={{ height: 10 }} />
              <Button label="Assistente de obra (IA)" variant="teal" onPress={() => router.push('/assistente')} />
            </View>
            <Text style={styles.section}>Projectos guardados</Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="folder-open-outline"
            title="Sem projectos guardados"
            message="Os cálculos que guardar aparecem aqui, com resultados e orçamento em MT."
          />
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push(`/projeto/${item.id}`)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.nome}</Text>
              <Text style={styles.cardMeta}>
                {item.input.tipo} · {formatNumber(item.resultado.area)} m² ·{' '}
                {new Date(item.criadoEm).toLocaleDateString('pt-MZ')}
              </Text>
              <Text style={styles.cardTotal}>
                {item.orcamento ? formatMT(item.orcamento.total) : `${item.resultado.etapas.length} etapas calculadas`}
              </Text>
            </View>
            <Pressable hitSlop={10} onPress={() => remover(item.id)} style={styles.del}>
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gray },
  hero: {
    backgroundColor: colors.teal,
    borderRadius: radius.xl,
    padding: 20,
    ...shadow.card,
  },
  heroTitle: { color: colors.white, fontSize: 19, fontWeight: '800', marginTop: 10 },
  heroText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 19, marginTop: 6, marginBottom: 16 },
  section: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 20, marginBottom: 8 },
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
  cardTotal: { fontSize: 14, fontWeight: '800', color: colors.orange, marginTop: 4 },
  del: { padding: 8 },
});
