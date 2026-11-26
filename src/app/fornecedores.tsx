import React, { useMemo, useState } from 'react';
import { FlatList, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FORNECEDORES, FORNECEDOR_TIPOS } from '../lib/data/fornecedores';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { EmptyState } from '../components/EmptyState';
import { Screen } from '../components/Screen';
import { SetTitle } from '../components/SetTitle';
import { Stars } from '../components/Stars';
import { colors } from '../lib/theme';

export default function Fornecedores() {
  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState('Todos');

  const lista = useMemo(() => {
    const t = q.trim().toLowerCase();
    return FORNECEDORES.filter((f) => {
      if (tipo !== 'Todos' && f.tipo !== tipo) return false;
      if (!t) return true;
      return (
        f.nome.toLowerCase().includes(t) ||
        f.bairro.toLowerCase().includes(t) ||
        f.cidade.toLowerCase().includes(t) ||
        f.tipo.toLowerCase().includes(t)
      );
    });
  }, [q, tipo]);

  return (
    <Screen scroll={false} pad={false}>
      <SetTitle title="Fornecedores" />
      <View style={styles.top}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Nome, bairro ou tipo de material..."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
        </View>
        <FlatList
          horizontal
          data={FORNECEDOR_TIPOS}
          keyExtractor={(t) => t}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          renderItem={({ item }) => <Chip label={item} selected={tipo === item} onPress={() => setTipo(item)} />}
        />
      </View>
      <FlatList
        data={lista}
        keyExtractor={(f) => f.id}
        contentContainerStyle={{ padding: 16, paddingTop: 4, flexGrow: 1 }}
        ListEmptyComponent={<EmptyState icon="location-outline" title="Sem resultados" message="Tente outro bairro ou tipo de material." />}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.icon}>
              <Ionicons name="storefront" size={24} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>{item.nome}</Text>
              <Text style={styles.local}>
                <Ionicons name="location-outline" size={12} color={colors.textMuted} /> {item.bairro}, {item.cidade}
              </Text>
              <View style={styles.row}>
                <View style={styles.tipoChip}>
                  <Text style={styles.tipoText}>{item.tipo}</Text>
                </View>
                <Stars rating={item.nota} size={12} />
              </View>
            </View>
            <View style={styles.acoes}>
              <Pressable
                style={styles.acao}
                onPress={() => Linking.openURL(`tel:${item.telefone}`).catch(() => {})}
              >
                <Ionicons name="call" size={20} color={colors.primary} />
              </Pressable>
              <Pressable
                style={styles.acao}
                onPress={() =>
                  Linking.openURL(`whatsapp://send?text=${encodeURIComponent(`Olá ${item.nome}, quero saber preços de ${item.tipo}.`)}`).catch(() => {})
                }
              >
                <Ionicons name="logo-whatsapp" size={20} color={colors.accent} />
              </Pressable>
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { paddingHorizontal: 16, paddingTop: 4 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: 44,
    paddingHorizontal: 12,
  },
  input: { flex: 1, fontSize: 14, color: colors.text },
  chips: { gap: 8, paddingVertical: 10 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  icon: { width: 46, height: 46, borderRadius: 14, backgroundColor: colors.tint, alignItems: 'center', justifyContent: 'center' },
  nome: { fontSize: 14, fontWeight: '800', color: colors.text },
  local: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  tipoChip: { backgroundColor: colors.gray, borderRadius: 999, paddingHorizontal: 8, height: 24, justifyContent: 'center' },
  tipoText: { fontSize: 11, fontWeight: '700', color: colors.teal },
  acoes: { flexDirection: 'row', gap: 4 },
  acao: { width: 38, height: 38, borderRadius: 999, backgroundColor: colors.gray, alignItems: 'center', justifyContent: 'center' },
});
