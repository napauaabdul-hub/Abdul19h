import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getPlanById } from '../../lib/catalog';
import { HousePlan } from '../../lib/types';
import { useCalc } from '../../context/calc';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FloorPlan } from '../../components/FloorPlan';
import { Screen } from '../../components/Screen';
import { SetTitle } from '../../components/SetTitle';
import { getSavedPlans, toggleSavedPlan } from '../../lib/storage';
import { formatNumber } from '../../lib/format';
import { colors } from '../../lib/theme';

export default function PlantaDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [planta, setPlanta] = useState<HousePlan | undefined>(undefined);
  const [carregado, setCarregado] = useState(false);
  const { setDraft } = useCalc();
  const [guardada, setGuardada] = useState(false);

  useEffect(() => {
    getPlanById(id).then((p) => {
      setPlanta(p);
      setCarregado(true);
    });
    getSavedPlans().then((ids) => setGuardada(ids.includes(id)));
  }, [id]);

  if (!carregado || !planta) {
    return (
      <Screen>
        <SetTitle title="Planta" />
        <Text style={{ color: colors.textMuted }}>{carregado ? 'Planta não encontrada.' : 'A carregar…'}</Text>
      </Screen>
    );
  }
  const pl = planta;

  async function guardar() {
    const next = await toggleSavedPlan(pl.id);
    setGuardada(next.includes(pl.id));
  }

  async function solicitar() {
    await Linking.openURL(
      `whatsapp://send?text=${encodeURIComponent(`Olá! Quero solicitar o projeto da planta ${pl.nome} (${pl.area} m²).`)}`,
    );
  }

  return (
    <Screen>
      <SetTitle title={pl.nome} />
      <Card style={styles.card}>
        <FloorPlan rooms={pl.quartosSpec} comprimento={pl.comprimento} largura={pl.largura} height={190} />
      </Card>
      <Text style={styles.nome}>{pl.nome}</Text>
      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaNum}>{pl.quartos}</Text>
          <Text style={styles.metaLabel}>Quartos</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaNum}>{pl.banhos}</Text>
          <Text style={styles.metaLabel}>Casas de banho</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaNum}>{pl.area} m²</Text>
          <Text style={styles.metaLabel}>Área</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaNum}>{formatNumber(pl.comprimento)}x{formatNumber(pl.largura)} m</Text>
          <Text style={styles.metaLabel}>Dimensões</Text>
        </View>
      </View>
      <Text style={styles.desc}>{pl.descricao}</Text>
      <Text style={styles.aviso}>
        As plantas são verificadas e adaptadas às condições do terreno e às exigências técnicas e legais aplicáveis.
      </Text>
      <Button label="Solicitar projeto" onPress={solicitar} />
      <View style={{ height: 10 }} />
      <Button
        label={guardada ? 'Remover das guardadas' : 'Guardar planta'}
        variant={guardada ? 'outline' : 'teal'}
        onPress={guardar}
      />
      <View style={{ height: 10 }} />
      <Button
        label="Calcular materiais desta casa"
        variant="orange"
        onPress={() => {
          setDraft({
            tipo: pl.id as never,
            comprimento: pl.comprimento,
            largura: pl.largura,
            quartos: pl.quartos,
            banhos: pl.banhos,
            pisos: pl.pisos,
          });
          router.push('/calculadora/dados');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 14, padding: 10 },
  nome: { fontSize: 22, fontWeight: '800', color: colors.text },
  meta: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.white, borderRadius: 14, padding: 12, marginTop: 10 },
  metaItem: { alignItems: 'center', flex: 1 },
  metaNum: { fontSize: 14, fontWeight: '800', color: colors.primary },
  metaLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  desc: { fontSize: 14, color: colors.text, lineHeight: 21, marginTop: 14 },
  aviso: { fontSize: 11, color: colors.textMuted, lineHeight: 15, marginTop: 10, marginBottom: 16 },
});
