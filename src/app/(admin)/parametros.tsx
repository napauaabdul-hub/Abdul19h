import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getParams } from '../../lib/catalog';
import { saveParamsOverride } from '../../lib/storage';
import { DEFAULT_PARAMETERS } from '../../lib/parameters';
import { Button } from '../../components/Button';
import { parseNumber } from '../../lib/format';
import { colors } from '../../lib/theme';

export default function AdminParametros() {
  const [desp, setDesp] = useState<Record<string, string>>({});
  const [num, setNum] = useState<Record<string, string>>({});

  useFocusEffect(
    useCallback(() => {
      getParams().then((p) => {
        const d: Record<string, string> = {};
        for (const [k, v] of Object.entries(p.desperdicio)) d[k] = String(Math.round(v * 100));
        setDesp(d);
        setNum({
          sacos: String(p.betao.sacosCimentoPorM3),
          ferroFund: String(p.betao.ferroKgPorM3Fundacao),
          ferroEst: String(p.betao.ferroKgPorM3Estructura),
          blocos15: String(p.alvenaria.blocosPorM2.bloco15),
          espLaje: String(p.laje.espessura),
          rend: String(p.pintura.rendementM2PorL),
        });
      });
    }, []),
  );

  async function guardar() {
    const desperdicio: Record<string, number> = {};
    for (const [k, v] of Object.entries(desp)) desperdicio[k] = Math.min(50, Math.max(0, parseNumber(v))) / 100;
    await saveParamsOverride({
      desperdicio,
      betao: {
        ...DEFAULT_PARAMETERS.betao,
        sacosCimentoPorM3: parseNumber(num.sacos) || DEFAULT_PARAMETERS.betao.sacosCimentoPorM3,
        ferroKgPorM3Fundacao: parseNumber(num.ferroFund) || DEFAULT_PARAMETERS.betao.ferroKgPorM3Fundacao,
        ferroKgPorM3Estructura: parseNumber(num.ferroEst) || DEFAULT_PARAMETERS.betao.ferroKgPorM3Estructura,
      },
      alvenaria: {
        ...DEFAULT_PARAMETERS.alvenaria,
        blocosPorM2: { ...DEFAULT_PARAMETERS.alvenaria.blocosPorM2, bloco15: parseNumber(num.blocos15) || 12.5 },
      },
      laje: { ...DEFAULT_PARAMETERS.laje, espessura: parseNumber(num.espLaje) || 0.12 },
      pintura: { ...DEFAULT_PARAMETERS.pintura, rendementM2PorL: parseNumber(num.rend) || 12 },
    });
    Alert.alert('Parâmetros guardados', 'Aplicam-se no próximo cálculo (as fórmulas permanecem verificáveis no código).');
  }

  const campo = (key: string, label: string, keyboardType: 'decimal-pad' | 'number-pad' = 'decimal-pad') => (
    <View style={styles.campo} key={key}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={num[key] ?? ''}
        keyboardType={keyboardType}
        onChangeText={(v) => setNum((n) => ({ ...n, [key]: v }))}
      />
    </View>
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <Text style={styles.aviso}>
        Estes parâmetros alimentam as fórmulas verificáveis da calculadora (src/lib/parameters.ts). Alterações aqui
        mudam os resultados; a IA do app nunca inventa quantidades.
      </Text>
      <Text style={styles.group}>Parâmetros técnicos</Text>
      <View style={styles.grid}>
        {campo('sacos', 'Sacos de cimento por m³ de betão')}
        {campo('ferroFund', 'Ferro (kg) por m³ — fundação')}
        {campo('ferroEst', 'Ferro (kg) por m³ — estrutura')}
        {campo('blocos15', 'Blocos por m² (bloco 15)')}
        {campo('espLaje', 'Espessura da laje (m)')}
        {campo('rend', 'Rendimento da tinta (m²/L)')}
      </View>
      <Text style={styles.group}>Desperdício por material (%)</Text>
      <View style={styles.grid}>
        {Object.entries(desp).map(([k, v]) => (
          <View style={styles.campo} key={k}>
            <Text style={styles.label} numberOfLines={1}>{k}</Text>
            <TextInput
              style={styles.input}
              value={v}
              keyboardType="number-pad"
              onChangeText={(t) => setDesp((d) => ({ ...d, [k]: t }))}
            />
          </View>
        ))}
      </View>
      <View style={{ height: 16 }} />
      <Button label="Guardar parâmetros" onPress={guardar} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gray },
  aviso: { fontSize: 12, color: colors.textMuted, lineHeight: 17, marginBottom: 14 },
  group: { fontSize: 14, fontWeight: '800', color: colors.teal, marginBottom: 10, marginTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  campo: { width: '48%', flexGrow: 1, marginBottom: 4 },
  label: { fontSize: 11, color: colors.textMuted, fontWeight: '600', marginBottom: 4 },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 40,
    fontSize: 14,
    color: colors.text,
  },
});
