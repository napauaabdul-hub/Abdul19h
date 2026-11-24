import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCalc } from '../../context/calc';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { SetTitle } from '../../components/SetTitle';
import { StageResults } from '../../components/StageResults';
import { newId, saveProject } from '../../lib/storage';
import { colors } from '../../lib/theme';

export default function Resultados() {
  const { draft, resultado, reset } = useCalc();
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    setGuardando(true);
    await saveProject({
      id: newId(),
      nome: `Casa ${draft.tipo} — ${(draft.comprimento * draft.largura).toFixed(0)} m²`,
      criadoEm: Date.now(),
      input: draft,
      resultado,
      orcamento: null,
    });
    setGuardando(false);
    Alert.alert('Projeto guardado', 'Pode consultá-lo no separador Calculadora.', [
      { text: 'OK', onPress: () => router.push('/(tabs)/calculadora') },
    ]);
  }

  return (
    <Screen>
      <SetTitle title="Resultados por etapa" />
      <View style={styles.head}>
        <View style={styles.badge}>
          <Ionicons name="checkmark-done" size={18} color={colors.white} />
          <Text style={styles.badgeText}>Cálculo concluído — Casa {draft.tipo}</Text>
        </View>
        <Text style={styles.aviso}>
          Estimativas de planeamento por fórmulas verificáveis — não substituem o dimensionamento de profissionais
          habilitados.
        </Text>
      </View>
      <StageResults resultado={resultado} />
      <Button label="Orçamento em MT" variant="orange" onPress={() => router.push('/calculadora/orcamento')} />
      <View style={{ height: 10 }} />
      <Button label="Guardar projeto" variant="outline" onPress={guardar} loading={guardando} />
      <View style={{ height: 10 }} />
      <Button
        label="Novo cálculo"
        variant="ghost"
        onPress={() => {
          reset();
          router.push('/calculadora/tipo');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { marginBottom: 12 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 999,
  },
  badgeText: { color: colors.white, fontWeight: '800', fontSize: 13 },
  aviso: { fontSize: 11, color: colors.textMuted, marginTop: 8, lineHeight: 15 },
});
