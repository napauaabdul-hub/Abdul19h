import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { SetTitle } from '../../components/SetTitle';
import { StageResults } from '../../components/StageResults';
import { BudgetTable } from '../../components/BudgetTable';
import { deleteProject, getProjects } from '../../lib/storage';
import { exportarCsv, exportarPdf, partilharArquivo, partilharWhatsApp } from '../../lib/export';
import { SavedProject } from '../../lib/types';
import { colors } from '../../lib/theme';

export default function Projeto() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [projeto, setProjeto] = useState<SavedProject | null>(null);

  useEffect(() => {
    getProjects().then((all) => setProjeto(all.find((p) => p.id === id) ?? null));
  }, [id]);

  if (!projeto) {
    return (
      <Screen>
        <SetTitle title="Projeto" />
        <Text style={{ color: colors.textMuted }}>A carregar…</Text>
      </Screen>
    );
  }
  const proj = projeto;

  async function eliminar() {
    Alert.alert('Eliminar projeto', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteProject(proj.id);
          router.back();
        },
      },
    ]);
  }

  async function exportar(tipo: 'pdf' | 'csv') {
    try {
      const uri = tipo === 'pdf' ? await exportarPdf(proj) : await exportarCsv(proj);
      if (uri) await partilharArquivo(uri, tipo === 'pdf' ? 'Relatório PDF' : 'Planilha (Excel/CSV)');
    } catch (e) {
      Alert.alert('Erro ao exportar', String(e));
    }
  }

  return (
    <Screen>
      <SetTitle title={proj.nome} />
      <View style={styles.head}>
        <Ionicons name="hammer" size={22} color={colors.primary} />
        <Text style={styles.headText}>
          {proj.input.tipo} · {(proj.input.comprimento * proj.input.largura).toFixed(1)} m² ·{' '}
          {new Date(proj.criadoEm).toLocaleDateString('pt-MZ')}
        </Text>
      </View>
      <StageResults resultado={proj.resultado} />
      {proj.orcamento ? (
        <>
          <Text style={styles.sectionTitle}>Orçamento em MT</Text>
          <BudgetTable
            resumo={proj.resultado.resumo}
            precos={{}}
            onPreco={() => {}}
            transporte={String(proj.orcamento.transporte)}
            onTransporte={() => {}}
            orcamento={proj.orcamento}
            editavel={false}
          />
        </>
      ) : null}
      <View style={styles.rowBtns}>
        <Button label="Exportar PDF" variant="teal" style={{ flex: 1 }} onPress={() => exportar('pdf')} />
        <View style={{ width: 10 }} />
        <Button label="Exportar Excel" variant="teal" style={{ flex: 1 }} onPress={() => exportar('csv')} />
      </View>
      <View style={{ height: 10 }} />
      <View style={styles.rowBtns}>
        <Button label="Partilhar no WhatsApp" variant="outline" style={{ flex: 1 }} onPress={() => partilharWhatsApp(proj)} />
        <View style={{ width: 10 }} />
        <Button label="Eliminar" variant="ghost" style={{ flex: 1 }} onPress={eliminar} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  headText: { fontSize: 13, fontWeight: '700', color: colors.textMuted },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 8, marginTop: 4 },
  rowBtns: { flexDirection: 'row' },
});
