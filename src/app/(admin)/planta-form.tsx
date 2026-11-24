import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getPlans } from '../../lib/catalog';
import { newId, savePlans } from '../../lib/storage';
import { HousePlan, RoomSpec } from '../../lib/types';
import { PLAN_CATEGORIES } from '../../lib/data/plans';
import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { Input } from '../../components/Input';
import { Screen } from '../../components/Screen';
import { parseNumber } from '../../lib/format';
import { colors } from '../../lib/theme';

function gerarQuartos(quartos: number): RoomSpec[] {
  const nomes = ['Sala', 'Cozinha', 'WC', 'Varanda'];
  for (let i = 1; i <= quartos; i++) nomes.push(i === 1 ? 'Quarto 1' : `Quarto ${i}`);
  const specs: RoomSpec[] = nomes.slice(0, 6).map((nome, i) => ({
    nome,
    x: (i % 2) * 0.5,
    y: Math.floor(i / 2) * 0.5,
    w: 0.5,
    h: 0.5,
  }));
  return specs;
}

export default function PlantaForm() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [form, setForm] = useState({
    nome: '',
    categoria: PLAN_CATEGORIES[0],
    descricao: '',
    area: '',
    comprimento: '',
    largura: '',
    quartos: '2',
    banhos: '1',
    pisos: '1',
  });
  const [carregado, setCarregado] = useState(!id);

  useEffect(() => {
    if (!id) return;
    getPlans().then((all) => {
      const p = all.find((x) => x.id === id);
      if (p) {
        setForm({
          nome: p.nome,
          categoria: p.categoria,
          descricao: p.descricao,
          area: String(p.area),
          comprimento: String(p.comprimento),
          largura: String(p.largura),
          quartos: String(p.quartos),
          banhos: String(p.banhos),
          pisos: String(p.pisos),
        });
      }
      setCarregado(true);
    });
  }, [id]);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function guardar() {
    if (!form.nome.trim()) {
      Alert.alert('Dados em falta', 'Indique o nome da planta.');
      return;
    }
    const quartos = Math.max(1, Math.round(parseNumber(form.quartos)));
    const comp = parseNumber(form.comprimento);
    const larg = parseNumber(form.largura);
    const planta: HousePlan = {
      id: id ?? newId(),
      nome: form.nome.trim(),
      categoria: form.categoria,
      descricao: form.descricao.trim(),
      area: parseNumber(form.area) || Math.round(comp * larg),
      comprimento: comp || 9,
      largura: larg || 6,
      quartos,
      banhos: Math.max(1, Math.round(parseNumber(form.banhos))),
      pisos: Math.max(1, Math.round(parseNumber(form.pisos))),
      quartosSpec: gerarQuartos(quartos),
    };
    const all = await getPlans();
    const next = id ? all.map((p) => (p.id === id ? planta : p)) : [...all, planta];
    await savePlans(next);
    router.back();
  }

  if (!carregado) return null;

  return (
    <Screen>
      <Text style={styles.titulo}>{id ? 'Editar planta' : 'Nova planta'}</Text>
      <Input label="Nome" value={form.nome} onChangeText={set('nome')} placeholder="Ex.: Casa T5" />
      <Text style={styles.group}>Categoria</Text>
      <View style={styles.chips}>
        {PLAN_CATEGORIES.map((c) => (
          <Chip key={c} label={c} selected={form.categoria === c} onPress={() => setForm((f) => ({ ...f, categoria: c }))} />
        ))}
      </View>
      <Input label="Descrição" value={form.descricao} onChangeText={set('descricao')} multiline />
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Input label="Área (m²)" value={form.area} onChangeText={set('area')} keyboardType="decimal-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="Comprimento (m)" value={form.comprimento} onChangeText={set('comprimento')} keyboardType="decimal-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="Largura (m)" value={form.largura} onChangeText={set('largura')} keyboardType="decimal-pad" />
        </View>
      </View>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Input label="Quartos" value={form.quartos} onChangeText={set('quartos')} keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="Casas de banho" value={form.banhos} onChangeText={set('banhos')} keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="Pisos" value={form.pisos} onChangeText={set('pisos')} keyboardType="number-pad" />
        </View>
      </View>
      <Button label="Guardar planta" onPress={guardar} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  titulo: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 12 },
  group: { fontSize: 13, fontWeight: '800', color: colors.teal, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  row: { flexDirection: 'row', gap: 10 },
});
