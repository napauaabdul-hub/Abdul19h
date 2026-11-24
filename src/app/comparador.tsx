import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { getPrices } from '../lib/catalog';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Screen } from '../components/Screen';
import { SetTitle } from '../components/SetTitle';
import { formatMT, parseNumber } from '../lib/format';
import { MaterialPrice } from '../lib/types';
import { colors } from '../lib/theme';

export default function Comparador() {
  const [materiais, setMateriais] = useState<MaterialPrice[]>([]);
  const [sel, setSel] = useState<string>('');
  const [lojas, setLojas] = useState(['', '', '']);

  useEffect(() => {
    getPrices().then((lista) => {
      setMateriais(lista.filter((m) => m.precoMT > 0));
      setSel(lista.find((m) => m.precoMT > 0)?.nome ?? '');
    });
  }, []);

  const material = materiais.find((m) => m.nome === sel);

  const precos = useMemo(
    () =>
      lojas
        .map((p, i) => ({ loja: `Loja ${'ABC'[i]}`, preco: parseNumber(p) }))
        .filter((x) => x.preco > 0)
        .sort((a, b) => a.preco - b.preco),
    [lojas],
  );

  const melhor = precos[0];
  const pior = precos[precos.length - 1];
  const economia = melhor && pior && pior.preco > melhor.preco ? ((pior.preco - melhor.preco) / pior.preco) * 100 : 0;
  const maxPreco = precos.length > 0 ? Math.max(...precos.map((p) => p.preco)) : 1;

  return (
    <Screen>
      <SetTitle title="Comparação de preços" />
      <Text style={styles.desc}>
        Escolha um material e introduza os preços de até três lojas. O comparador mostra o mais barato e a economia.
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
        <View style={styles.chips}>
          {materiais.map((m) => (
            <Chip key={m.nome} label={`${m.nome} (${m.unidade})`} selected={m.nome === sel} onPress={() => setSel(m.nome)} />
          ))}
        </View>
      </ScrollView>
      {material ? (
        <Card style={styles.card}>
          <Text style={styles.matTitle}>{material.nome}</Text>
          <Text style={styles.ref}>Preço de referência NAPAUA BUILD: {formatMT(material.precoMT)}</Text>
          {lojas.map((p, i) => (
            <View key={i} style={styles.lojaRow}>
              <Text style={styles.lojaLabel}>Loja {'ABC'[i]}</Text>
              <Text style={styles.mt}>MT</Text>
              <TextInput
                style={styles.input}
                value={p}
                keyboardType="decimal-pad"
                placeholder="0,00"
                placeholderTextColor={colors.textMuted}
                onChangeText={(t) => setLojas((l) => l.map((x, j) => (j === i ? t : x)))}
              />
              <Text style={styles.un}>/{material.unidade}</Text>
            </View>
          ))}
        </Card>
      ) : null}
      {precos.length > 0 ? (
        <Card style={styles.card}>
          <Text style={styles.resTitle}>Resultado</Text>
          {precos.map((p, i) => (
            <View key={p.loja}>
              <View style={styles.barRow}>
                <Text style={styles.barLabel}>{p.loja}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${(p.preco / maxPreco) * 100}%` }, i === 0 && styles.barBest]} />
                </View>
                <Text style={[styles.barPreco, i === 0 && styles.barPrecoBest]}>{formatMT(p.preco)}</Text>
              </View>
              {i === 0 ? <Text style={styles.bestTag}>Mais barato</Text> : null}
            </View>
          ))}
          {melhor && pior && precos.length > 1 ? (
            <Text style={styles.economia}>
              Escolhendo a {melhor.loja} poupa {formatMT(pior.preco - melhor.preco)} por {material?.unidade} ({economia.toFixed(0)}% menos).
            </Text>
          ) : null}
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  desc: { fontSize: 13, color: colors.textMuted, lineHeight: 18, marginBottom: 12 },
  chips: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  card: { marginBottom: 14 },
  matTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  ref: { fontSize: 12, color: colors.orange, fontWeight: '700', marginTop: 2, marginBottom: 10 },
  lojaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  lojaLabel: { width: 44, fontSize: 13, fontWeight: '700', color: colors.text },
  mt: { fontSize: 12, fontWeight: '800', color: colors.orange },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.gray,
  },
  un: { fontSize: 12, color: colors.textMuted, width: 34 },
  resTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 10 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  barLabel: { width: 44, fontSize: 13, fontWeight: '700', color: colors.text },
  barBg: { flex: 1, height: 14, borderRadius: 7, backgroundColor: colors.gray, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.border, borderRadius: 7 },
  barBest: { backgroundColor: colors.primary },
  barPreco: { width: 92, textAlign: 'right', fontSize: 13, fontWeight: '700', color: colors.text },
  barPrecoBest: { color: colors.primary, fontWeight: '800' },
  bestTag: { fontSize: 11, fontWeight: '800', color: colors.primary, marginBottom: 6, marginLeft: 52 },
  economia: { fontSize: 13, color: colors.orange, fontWeight: '700', marginTop: 8, lineHeight: 18 },
});
