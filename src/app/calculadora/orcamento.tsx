import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCalc } from '../../context/calc';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Screen } from '../../components/Screen';
import { SetTitle } from '../../components/SetTitle';
import { BudgetTable } from '../../components/BudgetTable';
import { exportarCsv, exportarPdf, partilharArquivo, partilharWhatsApp } from '../../lib/export';
import { precoDe } from '../../lib/materials';
import { newId, saveProject } from '../../lib/storage';
import { Budget, SavedProject } from '../../lib/types';
import { parseNumber } from '../../lib/format';
import { colors } from '../../lib/theme';

export default function Orcamento() {
  const { draft, resultado } = useCalc();
  const [nome, setNome] = useState(`Casa ${draft.tipo} — ${(draft.comprimento * draft.largura).toFixed(0)} m²`);
  const [precos, setPrecos] = useState<Record<string, number>>(() => {
    const inicial: Record<string, number> = {};
    for (const item of resultado.resumo) {
      inicial[item.material + '|' + item.unidade] = precoDe(item.material, item.unidade);
    }
    return inicial;
  });
  const [transporte, setTransporte] = useState('0');
  const [aExportar, setAExportar] = useState(false);

  const orcamento: Budget = useMemo(() => {
    const linhas = resultado.resumo.map((item) => {
      const precoUnit = precos[item.material + '|' + item.unidade] ?? 0;
      return {
        material: item.material,
        quantidade: item.quantidade,
        unidade: item.unidade,
        precoUnit,
        total: item.quantidade * precoUnit,
      };
    });
    const transp = parseNumber(transporte);
    return { linhas, transporte: transp, total: linhas.reduce((s, l) => s + l.total, 0) + transp };
  }, [resultado, precos, transporte]);

  function projetoAtual(): SavedProject {
    return {
      id: newId(),
      nome: nome.trim() || 'Projeto sem nome',
      criadoEm: Date.now(),
      input: draft,
      resultado,
      orcamento,
    };
  }

  async function guardar() {
    const projeto = projetoAtual();
    await saveProject(projeto);
    Alert.alert('Projeto guardado', 'Resultados e orçamento guardados no separador Calculadora.', [
      { text: 'OK', onPress: () => router.push('/(tabs)/calculadora') },
    ]);
  }

  async function exportar(tipo: 'pdf' | 'csv') {
    setAExportar(true);
    try {
      const uri = tipo === 'pdf' ? await exportarPdf(projetoAtual()) : await exportarCsv(projetoAtual());
      if (uri) await partilharArquivo(uri, tipo === 'pdf' ? 'Relatório PDF' : 'Planilha (Excel/CSV)');
    } catch (e) {
      Alert.alert('Erro ao exportar', String(e));
    } finally {
      setAExportar(false);
    }
  }

  async function whatsapp() {
    try {
      await partilharWhatsApp(projetoAtual());
    } catch (e) {
      Alert.alert('Não foi possível abrir o WhatsApp', String(e));
    }
  }

  return (
    <Screen>
      <SetTitle title="Orçamento em MT" />
      <Text style={styles.titulo}>Orçamento dos materiais</Text>
      <Text style={styles.sub}>
        Preços de referência em Metical (MT), editáveis por si. O administrador pode actualizar os preços de
        referência.
      </Text>
      <Input label="Nome do projeto" value={nome} onChangeText={setNome} placeholder="Ex.: Casa T3 em Matola" />
      <BudgetTable
        resumo={resultado.resumo}
        precos={precos}
        onPreco={(m, u, v) => setPrecos((p) => ({ ...p, [m + '|' + u]: v }))}
        transporte={transporte}
        onTransporte={setTransporte}
        orcamento={orcamento}
        editavel
      />
      <Button label="Guardar projeto com orçamento" onPress={guardar} />
      <View style={{ height: 10 }} />
      <View style={styles.rowBtns}>
        <Button label="Exportar PDF" variant="teal" style={{ flex: 1 }} onPress={() => exportar('pdf')} loading={aExportar} />
        <View style={{ width: 10 }} />
        <Button label="Exportar Excel" variant="teal" style={{ flex: 1 }} onPress={() => exportar('csv')} loading={aExportar} />
      </View>
      <View style={{ height: 10 }} />
      <View style={styles.rowBtns}>
        <Button label="Partilhar no WhatsApp" variant="outline" style={{ flex: 1 }} onPress={whatsapp} />
        <View style={{ width: 10 }} />
        <Button
          label="Orçamento profissional"
          variant="ghost"
          style={{ flex: 1 }}
          onPress={() => router.push('/orcamentos/novo')}
        />
      </View>
      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
        <Text style={styles.noteText}>
          Resultados são estimativas de planeamento. Para execução, solicite um orçamento profissional.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 12, lineHeight: 18 },
  rowBtns: { flexDirection: 'row' },
  note: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginTop: 14 },
  noteText: { flex: 1, fontSize: 11, color: colors.textMuted, lineHeight: 15 },
});
