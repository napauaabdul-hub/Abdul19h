import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getQuickCalc, QCResult } from '../../lib/quickcalc';
import { getPrices } from '../../lib/catalog';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Chip } from '../../components/Chip';
import { Input } from '../../components/Input';
import { Screen } from '../../components/Screen';
import { SetTitle } from '../../components/SetTitle';
import { formatMT, formatNumber } from '../../lib/format';
import { colors } from '../../lib/theme';

export default function FerramentaDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const def = getQuickCalc(id);
  const [valores, setValores] = useState<Record<string, string>>(() => {
    const inicial: Record<string, string> = {};
    for (const c of def?.campos ?? []) inicial[c.key] = c.padrao;
    return inicial;
  });
  const [resultado, setResultado] = useState<QCResult | null>(null);
  const [precos, setPrecos] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!def) return;
    getPrices().then((lista) => {
      const mapa: Record<string, number> = {};
      for (const m of lista) mapa[m.nome + '|' + m.unidade] = m.precoMT;
      setPrecos(mapa);
    });
  }, [def]);

  const total = useMemo(() => {
    if (!resultado) return 0;
    return resultado.linhas.reduce((s, l) => s + l.quantidade * (precos[l.material + '|' + l.unidade] ?? 0), 0);
  }, [resultado, precos]);

  if (!def) {
    return (
      <Screen>
        <SetTitle title="Ferramenta" />
        <Text style={{ color: colors.textMuted }}>Ferramenta não encontrada.</Text>
      </Screen>
    );
  }
  const d = def;

  function calcular() {
    setResultado(d.calcular(valores));
  }

  async function partilhar() {
    if (!resultado) return;
    const texto =
      `*NAPAUA BUILD — ${d.titulo}*\n\n` +
      resultado.linhas.map((l) => `• ${l.material}: ${formatNumber(l.quantidade)} ${l.unidade}`).join('\n') +
      (total > 0 ? `\n\nEstimativa: ${formatMT(total)}` : '') +
      `\n\n_Estimativa de planeamento — NAPAUA BUILD_`;
    await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(texto)}`).catch(() =>
      Alert.alert('WhatsApp', 'Não foi possível abrir o WhatsApp neste dispositivo.'),
    );
  }

  return (
    <Screen>
      <SetTitle title={def.titulo} />
      <Text style={styles.desc}>{def.descricao}</Text>
      <Card style={styles.card}>
        {def.campos.map((c) =>
          c.tipo === 'num' ? (
            <Input
              key={c.key}
              label={`${c.label}${c.unidade ? '' : ''}`}
              value={valores[c.key] ?? ''}
              onChangeText={(t) => setValores((v) => ({ ...v, [c.key]: t }))}
              keyboardType="decimal-pad"
              hint={c.unidade ? `Unidade: ${c.unidade}` : c.hint}
            />
          ) : (
            <View key={c.key} style={{ marginBottom: 12 }}>
              <Text style={styles.group}>{c.label}</Text>
              <View style={styles.chips}>
                {c.opcoes?.map((o) => (
                  <Chip
                    key={o.id}
                    label={o.label}
                    selected={(valores[c.key] ?? c.padrao) === o.id}
                    onPress={() => setValores((v) => ({ ...v, [c.key]: o.id }))}
                  />
                ))}
              </View>
            </View>
          ),
        )}
        <Button label="Calcular" onPress={calcular} />
      </Card>
      {resultado ? (
        <Card style={styles.card}>
          <Text style={styles.resTitle}>Resultado</Text>
          {resultado.destaques.map((d) => (
            <View key={d} style={styles.destaque}>
              <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
              <Text style={styles.destaqueText}>{d}</Text>
            </View>
          ))}
          <View style={{ height: 8 }} />
          {resultado.linhas.map((l, i) => (
            <View key={l.material + i} style={styles.linha}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mat}>{l.material}</Text>
                <Text style={styles.obs}>{l.obs}</Text>
              </View>
              <Text style={styles.qtd}>
                {formatNumber(l.quantidade)} {l.unidade}
              </Text>
            </View>
          ))}
          {total > 0 ? (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Estimativa (preços de referência)</Text>
              <Text style={styles.totalValue}>{formatMT(total)}</Text>
            </View>
          ) : null}
          <View style={{ height: 10 }} />
          <Button label="Partilhar no WhatsApp" variant="outline" onPress={partilhar} />
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  desc: { fontSize: 13, color: colors.textMuted, marginBottom: 12, lineHeight: 18 },
  card: { marginBottom: 14 },
  group: { fontSize: 13, fontWeight: '800', color: colors.teal, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  resTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 8 },
  destaque: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 },
  destaqueText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  linha: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.gray },
  mat: { fontSize: 14, fontWeight: '600', color: colors.text },
  obs: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  qtd: { fontSize: 14, fontWeight: '800', color: colors.teal },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 2, borderTopColor: colors.primary, marginTop: 8, paddingTop: 10 },
  totalLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  totalValue: { fontSize: 17, fontWeight: '800', color: colors.orange },
});
