import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useCalc } from '../../context/calc';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Screen } from '../../components/Screen';
import { SetTitle } from '../../components/SetTitle';
import { parseNumber } from '../../lib/format';
import { colors } from '../../lib/theme';

export default function Dados() {
  const { draft, setDraft } = useCalc();

  const num = (key: keyof typeof draft) => (v: string) => setDraft({ [key]: parseNumber(v) } as never);

  const valido = draft.comprimento > 0 && draft.largura > 0 && draft.alturaParedes > 0;

  return (
    <Screen>
      <SetTitle title="Características" />
      <Text style={styles.step}>Passo 2 de 4</Text>
      <Text style={styles.titulo}>Características da construção</Text>
      <Text style={styles.sub}>
        Tipo selecionado: <Text style={{ fontWeight: '800', color: colors.primary }}>{draft.tipo}</Text> · Área: {' '}
        {(draft.comprimento * draft.largura).toFixed(1)} m²
      </Text>
      <Card style={styles.card}>
        <Text style={styles.group}>Dimensões</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Input label="Comprimento (m)" value={String(draft.comprimento)} onChangeText={num('comprimento')} keyboardType="decimal-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Largura (m)" value={String(draft.largura)} onChangeText={num('largura')} keyboardType="decimal-pad" />
          </View>
        </View>
        <Input
          label="Área (m²) — calculada"
          value={`${(draft.comprimento * draft.largura).toFixed(2)} m²`}
          onChangeText={() => {}}
          editable={false}
        />

        <Text style={styles.group}>Compartimentos</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Input label="Quartos" value={String(draft.quartos)} onChangeText={num('quartos')} keyboardType="number-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Casas de banho" value={String(draft.banhos)} onChangeText={num('banhos')} keyboardType="number-pad" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Input label="Salas" value={String(draft.sala)} onChangeText={num('sala')} keyboardType="number-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Cozinhas" value={String(draft.cozinha)} onChangeText={num('cozinha')} keyboardType="number-pad" />
          </View>
        </View>
        <Text style={styles.group}>Paredes e vãos</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Input label="Altura das paredes (m)" value={String(draft.alturaParedes)} onChangeText={num('alturaParedes')} keyboardType="decimal-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="Espessura das paredes (m)" value={String(draft.espessuraParedes)} onChangeText={num('espessuraParedes')} keyboardType="decimal-pad" />
          </View>
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Input label="N.º de portas" value={String(draft.portas)} onChangeText={num('portas')} keyboardType="number-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Input label="N.º de janelas" value={String(draft.janelas)} onChangeText={num('janelas')} keyboardType="number-pad" />
          </View>
        </View>
        <Input label="Número de pisos" value={String(draft.pisos)} onChangeText={num('pisos')} keyboardType="number-pad" />
      </Card>
      <Button
        label="Seguinte: métodos e materiais"
        onPress={() => router.push('/calculadora/metodos')}
        disabled={!valido}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { fontSize: 12, fontWeight: '800', color: colors.orange, textTransform: 'uppercase', letterSpacing: 1 },
  titulo: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 4 },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 12 },
  card: { marginBottom: 16 },
  group: { fontSize: 13, fontWeight: '800', color: colors.teal, marginBottom: 4, marginTop: 6 },
  row: { flexDirection: 'row', gap: 10 },
});
