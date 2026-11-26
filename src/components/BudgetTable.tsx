import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Budget, BudgetLine, MaterialItem } from '../lib/types';
import { formatMT, formatNumber, parseNumber } from '../lib/format';
import { Card } from './Card';
import { colors } from '../lib/theme';

export function BudgetTable({
  resumo,
  precos,
  onPreco,
  transporte,
  onTransporte,
  orcamento,
  editavel,
}: {
  resumo: MaterialItem[];
  precos: Record<string, number>;
  onPreco: (material: string, unidade: string, valor: number) => void;
  transporte: string;
  onTransporte: (v: string) => void;
  orcamento: Budget | null;
  editavel: boolean;
}) {
  const linhas: BudgetLine[] =
    orcamento?.linhas ??
    resumo.map((item) => {
      const precoUnit = precos[item.material + '|' + item.unidade] ?? 0;
      return {
        material: item.material,
        quantidade: item.quantidade,
        unidade: item.unidade,
        precoUnit,
        total: item.quantidade * precoUnit,
      };
    });
  const subtotal = linhas.reduce((s, l) => s + l.total, 0);
  const transp = editavel ? parseNumber(transporte) : orcamento?.transporte ?? 0;
  const total = subtotal + transp;

  return (
    <Card style={styles.card}>
      <View style={[styles.row, styles.head]}>
        <Text style={[styles.cMat, styles.headText]}>Material</Text>
        <Text style={[styles.cQtd, styles.headText]}>Qtd.</Text>
        <Text style={[styles.cPreco, styles.headText]}>Preço unit. (MT)</Text>
        <Text style={[styles.cTotal, styles.headText]}>Total (MT)</Text>
      </View>
      {linhas.map((l, i) => (
        <View key={l.material + i} style={styles.row}>
          <View style={styles.cMat}>
            <Text style={styles.mat}>{l.material}</Text>
            <Text style={styles.un}>{l.unidade}</Text>
          </View>
          <Text style={styles.cQtd}>
            {formatNumber(l.quantidade)} {l.unidade}
          </Text>
          {editavel ? (
            <TextInput
              style={styles.precoInput}
              value={String(precos[l.material + '|' + l.unidade] ?? 0).replace('.', ',')}
              keyboardType="decimal-pad"
              onChangeText={(v) => onPreco(l.material, l.unidade, parseNumber(v))}
            />
          ) : (
            <Text style={styles.cPreco}>{formatMT(l.precoUnit)}</Text>
          )}
          <Text style={styles.cTotal}>{formatMT(l.total)}</Text>
        </View>
      ))}
      <View style={styles.rowTot}>
        <Text style={styles.totLabel}>Subtotal de materiais</Text>
        <Text style={styles.totValue}>{formatMT(subtotal)}</Text>
      </View>
      <View style={styles.rowTot}>
        <Text style={styles.totLabel}>Transporte</Text>
        {editavel ? (
          <TextInput
            style={[styles.precoInput, { width: 110 }]}
            value={transporte}
            keyboardType="decimal-pad"
            onChangeText={onTransporte}
          />
        ) : (
          <Text style={styles.totValue}>{formatMT(transp)}</Text>
        )}
      </View>
      <View style={[styles.rowTot, styles.rowGrand]}>
        <Text style={styles.grandLabel}>Total estimado</Text>
        <Text style={styles.grandValue}>{formatMT(total)}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, borderTopWidth: 1, borderTopColor: colors.gray },
  head: { borderTopWidth: 0 },
  headText: { fontSize: 10, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase' },
  cMat: { flex: 1, paddingRight: 6 },
  cQtd: { width: 78, fontSize: 11, fontWeight: '700', color: colors.text },
  cPreco: { width: 82, textAlign: 'right', fontSize: 12, color: colors.text },
  cTotal: { width: 86, textAlign: 'right', fontSize: 12, fontWeight: '800', color: colors.teal },
  mat: { fontSize: 13, fontWeight: '600', color: colors.text },
  un: { fontSize: 11, color: colors.textMuted },
  precoInput: {
    width: 82,
    height: 34,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 6,
    textAlign: 'right',
    fontSize: 12,
    color: colors.text,
    backgroundColor: colors.gray,
  },
  rowTot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  rowGrand: { borderTopWidth: 2, borderTopColor: colors.primary, paddingTop: 10, marginTop: 10 },
  totLabel: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  totValue: { fontSize: 13, fontWeight: '700', color: colors.text },
  grandLabel: { fontSize: 15, fontWeight: '800', color: colors.text },
  grandValue: { fontSize: 17, fontWeight: '800', color: colors.orange },
});
