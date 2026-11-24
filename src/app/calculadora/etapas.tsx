import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCalc } from '../../context/calc';
import { STAGES, stageAplicavel } from '../../lib/calculator';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Screen } from '../../components/Screen';
import { SetTitle } from '../../components/SetTitle';
import { StageId } from '../../lib/types';
import { colors } from '../../lib/theme';

export default function Etapas() {
  const { draft, toggleEtapa } = useCalc();
  const alguma = draft.etapas.length > 0;

  return (
    <Screen>
      <SetTitle title="Etapas da construção" />
      <Text style={styles.step}>Passo 4 de 4</Text>
      <Text style={styles.titulo}>Etapas da construção</Text>
      <Text style={styles.sub}>
        Selecione as etapas incluídas no cálculo. A etapa de lajes só aparece quando aplicável ao projeto.
      </Text>
      {STAGES.map((s, i) => {
        const aplicavel = stageAplicavel(s.id, draft);
        const marcado = draft.etapas.includes(s.id as StageId);
        return (
          <Card key={s.id} style={[styles.card, !aplicavel ? styles.cardOff : null]}>
            <Pressable
              style={styles.row}
              disabled={!aplicavel}
              onPress={() => toggleEtapa(s.id as StageId)}
            >
              <View style={[styles.box, marcado ? styles.boxOn : null, !aplicavel ? styles.boxOff : null]}>
                {marcado ? <Ionicons name="checkmark" size={16} color={colors.white} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tit, !aplicavel ? styles.off : null]}>
                  {i + 1}. {s.titulo}
                </Text>
                <Text style={styles.desc}>{aplicavel ? s.descricao : 'Não aplicável a este projeto (ver cobertura/pisos).'}</Text>
              </View>
            </Pressable>
          </Card>
        );
      })}
      <Button
        label={`Calcular resultados (${draft.etapas.length} etapas)`}
        onPress={() => router.push('/calculadora/resultados')}
        disabled={!alguma}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { fontSize: 12, fontWeight: '800', color: colors.orange, textTransform: 'uppercase', letterSpacing: 1 },
  titulo: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 4 },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 12, lineHeight: 18 },
  card: { marginBottom: 8, paddingVertical: 10 },
  cardOff: { opacity: 0.55 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  box: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  boxOff: { borderColor: colors.border },
  tit: { fontSize: 14, fontWeight: '800', color: colors.text },
  desc: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  off: { color: colors.textMuted },
});
