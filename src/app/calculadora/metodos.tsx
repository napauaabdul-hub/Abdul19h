import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useCalc } from '../../context/calc';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { Screen } from '../../components/Screen';
import { SetTitle } from '../../components/SetTitle';
import { AlvenariaType, CoberturaType, EstruturaType, PavimentoType } from '../../lib/types';
import { colors } from '../../lib/theme';

const ALVENARIA: { id: AlvenariaType; label: string }[] = [
  { id: 'bloco10', label: 'Blocos de 10' },
  { id: 'bloco15', label: 'Blocos de 15' },
  { id: 'tijolo', label: 'Tijolo' },
];
const ESTRUTURA: { id: EstruturaType; label: string }[] = [
  { id: 'betaoArmado', label: 'Betão armado' },
  { id: 'alvenariaPortante', label: 'Alvenaria portante' },
];
const COBERTURA: { id: CoberturaType; label: string }[] = [
  { id: 'laje', label: 'Laje' },
  { id: 'chapas', label: 'Chapas' },
  { id: 'telhas', label: 'Telhas' },
];
const PAVIMENTO: { id: PavimentoType; label: string }[] = [
  { id: 'cimento', label: 'Cimento' },
  { id: 'ceramica', label: 'Cerâmica' },
];

export default function Metodos() {
  const { draft, setDraft } = useCalc();

  return (
    <Screen>
      <SetTitle title="Métodos e materiais" />
      <Text style={styles.step}>Passo 3 de 4</Text>
      <Text style={styles.titulo}>Métodos e materiais</Text>
      <Text style={styles.sub}>A calculadora adapta as etapas ao sistema construtivo escolhido.</Text>

      <Card style={styles.card}>
        <Text style={styles.group}>Alvenaria</Text>
        <View style={styles.chips}>
          {ALVENARIA.map((a) => (
            <Chip key={a.id} label={a.label} selected={draft.alvenaria === a.id} onPress={() => setDraft({ alvenaria: a.id })} />
          ))}
        </View>
        <Text style={styles.group}>Estrutura</Text>
        <View style={styles.chips}>
          {ESTRUTURA.map((e) => (
            <Chip key={e.id} label={e.label} selected={draft.estrutura === e.id} onPress={() => setDraft({ estrutura: e.id })} />
          ))}
        </View>
        <Text style={styles.group}>Cobertura</Text>
        <View style={styles.chips}>
          {COBERTURA.map((c) => (
            <Chip key={c.id} label={c.label} selected={draft.cobertura === c.id} onPress={() => setDraft({ cobertura: c.id })} />
          ))}
        </View>
        <Text style={styles.group}>Pavimentos</Text>
        <View style={styles.chips}>
          {PAVIMENTO.map((p) => (
            <Chip key={p.id} label={p.label} selected={draft.pavimento === p.id} onPress={() => setDraft({ pavimento: p.id })} />
          ))}
        </View>
      </Card>

      <Button label="Seguinte: etapas da construção" onPress={() => router.push('/calculadora/etapas')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { fontSize: 12, fontWeight: '800', color: colors.orange, textTransform: 'uppercase', letterSpacing: 1 },
  titulo: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 4 },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 12 },
  card: { marginBottom: 16 },
  group: { fontSize: 13, fontWeight: '800', color: colors.teal, marginBottom: 8, marginTop: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
