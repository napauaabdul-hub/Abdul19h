import React, { useCallback, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getPrices } from '../../lib/catalog';
import { savePrices } from '../../lib/storage';
import { MaterialPrice } from '../../lib/types';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { parseNumber } from '../../lib/format';
import { colors } from '../../lib/theme';

export default function AdminPrecos() {
  const [lista, setLista] = useState<MaterialPrice[]>([]);
  const [editados, setEditados] = useState<Record<string, string>>({});

  useFocusEffect(
    useCallback(() => {
      getPrices().then((p) => {
        setLista(p);
        setEditados({});
      });
    }, []),
  );

  async function guardar() {
    const next = lista.map((m) => {
      const key = m.nome + '|' + m.unidade;
      const novo = editados[key];
      return novo !== undefined ? { ...m, precoMT: parseNumber(novo) } : m;
    });
    await savePrices(next);
    setLista(next);
    setEditados({});
    Alert.alert('Preços actualizados', 'Os novos preços de referência (MT) aplicam-se no próximo orçamento.');
  }

  return (
    <View style={styles.root}>
      <FlatList
        data={lista}
        keyExtractor={(m) => m.nome + '|' + m.unidade}
        contentContainerStyle={{ padding: 16, paddingBottom: 90 }}
        ListHeaderComponent={<Text style={styles.aviso}>Preços de referência em Metical (MT). Os utilizadores podem editar os preços no próprio orçamento; aqui define o valor base.</Text>}
        ListEmptyComponent={<EmptyState icon="pricetag-outline" title="Sem materiais" message="Sem catálogo de preços." />}
        renderItem={({ item }) => {
          const key = item.nome + '|' + item.unidade;
          const valor = editados[key] ?? String(item.precoMT).replace('.', ',');
          return (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nome}>{item.nome}</Text>
                <Text style={styles.un}>{item.unidade}</Text>
              </View>
              <Text style={styles.mt}>MT</Text>
              <TextInput
                style={styles.input}
                value={valor}
                keyboardType="decimal-pad"
                onChangeText={(v) => setEditados((e) => ({ ...e, [key]: v }))}
              />
            </View>
          );
        }}
      />
      <View style={styles.barra}>
        <Button label="Guardar preços" onPress={guardar} disabled={Object.keys(editados).length === 0} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.gray },
  aviso: { fontSize: 12, color: colors.textMuted, lineHeight: 17, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  nome: { fontSize: 14, fontWeight: '700', color: colors.text },
  un: { fontSize: 11, color: colors.textMuted },
  mt: { fontSize: 12, fontWeight: '800', color: colors.orange },
  input: {
    width: 100,
    height: 38,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 8,
    textAlign: 'right',
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.gray,
  },
  barra: { position: 'absolute', left: 16, right: 16, bottom: 16 },
});
