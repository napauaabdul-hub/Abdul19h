import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { STAGES } from '../../lib/calculator';
import { getObras, saveObras, toggleEtapaObra } from '../../lib/storage';
import { Obra, StageId } from '../../lib/types';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { SetTitle } from '../../components/SetTitle';
import { colors } from '../../lib/theme';

export default function ObraDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [obra, setObra] = useState<Obra | null>(null);

  const carregar = useCallback(async () => {
    const all = await getObras();
    setObra(all.find((o) => o.id === id) ?? null);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  if (!obra) {
    return (
      <Screen>
        <SetTitle title="Obra" />
        <Text style={{ color: colors.textMuted }}>A carregar…</Text>
      </Screen>
    );
  }

  const pct = Math.round((obra.etapasFeitas.length / STAGES.length) * 100);
  const o = obra;

  async function alternar(etapa: StageId) {
    await toggleEtapaObra(o.id, etapa);
    carregar();
  }

  async function eliminar() {
    Alert.alert('Eliminar obra', 'Quer apagar esta obra do acompanhamento?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const all = await getObras();
          await saveObras(all.filter((x) => x.id !== o.id));
          router.back();
        },
      },
    ]);
  }

  return (
    <Screen>
      <SetTitle title={obra.nome} />
      <Card style={styles.card}>
        <Text style={styles.nome}>{obra.nome}</Text>
        <Text style={styles.sub}>
          {obra.local} {obra.cliente ? `· ${obra.cliente}` : ''} · iniciada em {new Date(obra.iniciadoEm).toLocaleDateString('pt-MZ')}
        </Text>
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.pct}>{obra.etapasFeitas.length}/{STAGES.length} etapas concluídas · {pct}%</Text>
      </Card>
      {STAGES.map((s, i) => {
        const feito = obra.etapasFeitas.includes(s.id);
        return (
          <Pressable key={s.id} style={[styles.etapa, feito && styles.etapaFeito]} onPress={() => alternar(s.id)}>
            <View style={[styles.box, feito && styles.boxFeito]}>
              {feito ? <Ionicons name="checkmark" size={16} color={colors.white} /> : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.etapaTitulo, feito && styles.etapaTituloFeito]}>
                {i + 1}. {s.titulo}
              </Text>
              <Text style={styles.etapaDesc}>{s.descricao}</Text>
            </View>
          </Pressable>
        );
      })}
      <Button label="Eliminar obra" variant="ghost" onPress={eliminar} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 14 },
  nome: { fontSize: 18, fontWeight: '800', color: colors.text },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  barBg: { height: 10, borderRadius: 5, backgroundColor: colors.gray, overflow: 'hidden', marginTop: 12 },
  barFill: { height: '100%', backgroundColor: colors.accent, borderRadius: 5 },
  pct: { fontSize: 13, fontWeight: '800', color: colors.primary, marginTop: 6 },
  etapa: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  etapaFeito: { backgroundColor: colors.tint },
  box: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  boxFeito: { backgroundColor: colors.primary, borderColor: colors.primary },
  etapaTitulo: { fontSize: 14, fontWeight: '800', color: colors.text },
  etapaTituloFeito: { color: colors.primary, textDecorationLine: 'line-through' },
  etapaDesc: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
});
