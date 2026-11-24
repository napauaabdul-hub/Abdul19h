import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SERVICES } from '../lib/data/services';
import { HOUSE_PLANS } from '../lib/data/plans';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { Screen } from '../components/Screen';
import { SetTitle } from '../components/SetTitle';
import { colors } from '../lib/theme';

interface Resultado {
  tipo: 'Serviço' | 'Planta' | 'Funcionalidade';
  titulo: string;
  sub: string;
  icon: string;
  rota: string;
}

const FUNCIONALIDADES: Resultado[] = [
  { tipo: 'Funcionalidade', titulo: 'Calculadora de materiais', sub: '16 etapas da construção', icon: 'calculator', rota: '/(tabs)/calculadora' },
  { tipo: 'Funcionalidade', titulo: 'Solicitar orçamento', sub: 'PDF e Excel em MT', icon: 'document-text', rota: '/orcamentos/novo' },
  { tipo: 'Funcionalidade', titulo: 'Galeria de plantas', sub: 'T1 a T4 e modelos', icon: 'pencil-ruler', rota: '/plantas' },
  { tipo: 'Funcionalidade', titulo: 'Serviços profissionais', sub: 'Construção, blocos, vigotas', icon: 'briefcase', rota: '/(tabs)/servicos' },
];

export default function Busca() {
  const params = useLocalSearchParams<{ q?: string }>();
  const [q, setQ] = useState(params.q ?? '');

  const resultados = useMemo(() => {
    const termo = q.trim().toLowerCase();
    if (!termo) return FUNCIONALIDADES;
    const servicos: Resultado[] = SERVICES.filter(
      (s) => s.titulo.toLowerCase().includes(termo) || s.descricao.toLowerCase().includes(termo) || s.categoria.toLowerCase().includes(termo),
    ).map((s) => ({ tipo: 'Serviço', titulo: s.titulo, sub: s.categoria, icon: s.icon, rota: `/servicos/${s.id}` }));
    const plantas: Resultado[] = HOUSE_PLANS.filter(
      (p) => p.nome.toLowerCase().includes(termo) || p.categoria.toLowerCase().includes(termo) || p.descricao.toLowerCase().includes(termo),
    ).map((p) => ({ tipo: 'Planta', titulo: p.nome, sub: `${p.area} m² · ${p.quartos} quartos`, icon: 'home', rota: `/plantas/${p.id}` }));
    const funcs = FUNCIONALIDADES.filter((f) => f.titulo.toLowerCase().includes(termo) || f.sub.toLowerCase().includes(termo));
    return [...funcs, ...servicos, ...plantas];
  }, [q]);

  return (
    <Screen>
      <SetTitle title="Pesquisar" />
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          autoFocus
          value={q}
          onChangeText={setQ}
          placeholder="Serviços, materiais, plantas, orçamentos..."
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        {q ? (
          <Pressable onPress={() => setQ('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      <FlatList
        data={resultados}
        keyExtractor={(r) => r.tipo + r.titulo}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <EmptyState icon="search" title="Sem resultados" message={`Nada encontrado para "${q}".`} />
        }
        renderItem={({ item }) => (
          <Card onPress={() => router.push(item.rota as never)} style={styles.card}>
            <View style={styles.icon}>
              <Ionicons name={item.icon as never} size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.titulo}>{item.titulo}</Text>
              <Text style={styles.sub}>
                {item.tipo} · {item.sub}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Card>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: 46,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  input: { flex: 1, fontSize: 14, color: colors.text },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  icon: { width: 42, height: 42, borderRadius: 12, backgroundColor: colors.gray, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 14, fontWeight: '800', color: colors.text },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
});
