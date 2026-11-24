import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCalc } from '../../context/calc';
import { HOUSE_PLANS, HOUSE_TYPES } from '../../lib/data/plans';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { FloorPlan } from '../../components/FloorPlan';
import { Screen } from '../../components/Screen';
import { SetTitle } from '../../components/SetTitle';
import { HouseType } from '../../lib/types';
import { colors, radius } from '../../lib/theme';

export default function Tipo() {
  const { draft, setDraft } = useCalc();

  function escolher(tipo: HouseType) {
    const plano = HOUSE_PLANS.find((p) => p.id === tipo);
    setDraft({
      tipo,
      ...(plano
        ? {
            comprimento: plano.comprimento,
            largura: plano.largura,
            quartos: plano.quartos,
            banhos: plano.banhos,
            pisos: plano.pisos,
          }
        : {}),
    });
  }

  return (
    <Screen>
      <SetTitle title="Tipo de construção" />
      <Text style={styles.step}>Passo 1 de 4</Text>
      <Text style={styles.titulo}>Escolha o tipo de construção</Text>
      <Text style={styles.sub}>Cada modelo T1–T4 tem uma planta ilustrativa e dimensões sugeridas que pode alterar.</Text>
      <View style={styles.list}>
        {HOUSE_TYPES.map((t) => {
          const ativo = draft.tipo === t.id;
          const plano = HOUSE_PLANS.find((p) => p.id === t.id);
          return (
            <Card key={t.id} onPress={() => escolher(t.id)} style={[styles.card, ativo ? styles.cardAtivo : null]}>
              <View style={styles.cardRow}>
                <View style={[styles.radio, ativo && styles.radioAtivo]}>
                  {ativo ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardNome}>{t.nome}</Text>
                  <Text style={styles.cardDesc}>{t.descricao}</Text>
                </View>
              </View>
              {ativo && plano ? (
                <View style={{ marginTop: 12 }}>
                  <FloorPlan rooms={plano.quartosSpec} comprimento={plano.comprimento} largura={plano.largura} height={130} />
                </View>
              ) : null}
            </Card>
          );
        })}
      </View>
      <Button label="Seguinte: características" onPress={() => router.push('/calculadora/dados')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { fontSize: 12, fontWeight: '800', color: colors.orange, textTransform: 'uppercase', letterSpacing: 1 },
  titulo: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 4 },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 14, lineHeight: 18 },
  list: { gap: 10, marginBottom: 16 },
  card: { borderWidth: 2, borderColor: 'transparent' },
  cardAtivo: { borderColor: colors.primary },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioAtivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  cardNome: { fontSize: 16, fontWeight: '800', color: colors.text },
  cardDesc: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
