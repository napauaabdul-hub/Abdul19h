import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalcResult, StageResult } from '../lib/types';
import { formatNumber } from '../lib/format';
import { Card } from './Card';
import { colors, radius } from '../lib/theme';

function StageCard({ etapa, index,aberto, onToggle }: { etapa: StageResult; index: number; aberto: boolean; onToggle: () => void }) {
  return (
    <Card style={styles.card}>
      <Pressable style={styles.head} onPress={onToggle}>
        <View style={styles.num}>
          <Text style={styles.numText}>{index + 1}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.tit}>{etapa.titulo}</Text>
          <Text style={styles.desc}>{etapa.descricao}</Text>
        </View>
        <Ionicons name={aberto ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
      </Pressable>
      {aberto ? (
        <View style={styles.itens}>
          <View style={[styles.row, styles.rowHead]}>
            <Text style={[styles.cMat, styles.headText]}>Material</Text>
            <Text style={[styles.cQtd, styles.headText]}>Qtd.</Text>
            <Text style={[styles.cUn, styles.headText]}>Un.</Text>
            <Text style={[styles.cDesp, styles.headText]}>Desp.</Text>
          </View>
          {etapa.itens.map((item, i) => (
            <View key={item.material + i} style={styles.row}>
              <View style={styles.cMat}>
                <Text style={styles.mat}>{item.material}</Text>
                {item.observacao ? <Text style={styles.obs}>{item.observacao}</Text> : null}
              </View>
              <Text style={styles.cQtd}>{formatNumber(item.quantidade)}</Text>
              <Text style={styles.cUn}>{item.unidade}</Text>
              <Text style={styles.cDesp}>{Math.round(item.desperdicio * 100)}%</Text>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

export function StageResults({ resultado }: { resultado: CalcResult }) {
  const [abertos, setAbertos] = useState<Set<string>>(new Set(resultado.etapas.slice(0, 3).map((e) => e.id)));
  const [mostrarResumo, setMostrarResumo] = useState(false);

  const toggle = (id: string) =>
    setAbertos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <View>
      <Card style={styles.resumo}>
        <View style={styles.resumoRow}>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoNum}>{formatNumber(resultado.area)}</Text>
            <Text style={styles.resumoLabel}>m² de área</Text>
          </View>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoNum}>{formatNumber(resultado.perimetro)}</Text>
            <Text style={styles.resumoLabel}>m de perímetro</Text>
          </View>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoNum}>{formatNumber(resultado.areaParedes)}</Text>
            <Text style={styles.resumoLabel}>m² de paredes</Text>
          </View>
          <View style={styles.resumoItem}>
            <Text style={styles.resumoNum}>{resultado.etapas.length}</Text>
            <Text style={styles.resumoLabel}>etapas</Text>
          </View>
        </View>
        <Pressable style={styles.resumoBtn} onPress={() => setMostrarResumo((v) => !v)}>
          <Text style={styles.resumoBtnText}>{mostrarResumo ? 'Ocultar resumo geral' : 'Ver resumo geral de materiais'}</Text>
          <Ionicons name={mostrarResumo ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} />
        </Pressable>
        {mostrarResumo ? (
          <View style={{ marginTop: 8 }}>
            {resultado.resumo.map((item, i) => (
              <View key={item.material + i} style={styles.resumoLinha}>
                <Text style={styles.resumoMat}>{item.material}</Text>
                <Text style={styles.resumoQtd}>
                  {formatNumber(item.quantidade)} {item.unidade}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Card>
      {resultado.etapas.map((etapa, i) => (
        <StageCard key={etapa.id} etapa={etapa} index={i} aberto={abertos.has(etapa.id)} onToggle={() => toggle(etapa.id)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  resumo: { marginBottom: 12 },
  resumoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  resumoItem: { alignItems: 'center' },
  resumoNum: { fontSize: 17, fontWeight: '800', color: colors.primary },
  resumoLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  resumoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, paddingVertical: 8 },
  resumoBtnText: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  resumoLinha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resumoMat: { flex: 1, fontSize: 13, color: colors.text, paddingRight: 8 },
  resumoQtd: { fontSize: 13, fontWeight: '800', color: colors.teal },
  card: { marginBottom: 10, paddingVertical: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  num: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: { color: colors.white, fontWeight: '800', fontSize: 13 },
  tit: { fontSize: 14, fontWeight: '800', color: colors.text },
  desc: { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  itens: { marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.gray },
  rowHead: { borderTopWidth: 0, paddingBottom: 2 },
  headText: { fontSize: 11, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase' },
  cMat: { flex: 1, paddingRight: 6 },
  cQtd: { width: 52, textAlign: 'right', fontSize: 13, fontWeight: '700', color: colors.text },
  cUn: { width: 36, fontSize: 12, color: colors.textMuted },
  cDesp: { width: 40, textAlign: 'right', fontSize: 12, color: colors.orange, fontWeight: '700' },
  mat: { fontSize: 13, color: colors.text, fontWeight: '600' },
  obs: { fontSize: 11, color: colors.textMuted, marginTop: 1, lineHeight: 14 },
});
